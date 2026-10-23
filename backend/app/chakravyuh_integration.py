from .sqli_defense import check_sqli_attack
"""
Chakravyuh Sentinel Security Integration Layer for X Beauty Backend

Connects X Beauty request traffic directly to the Chakravyuh Sentinel
unified security pipeline:
1. Pre-checks client IP against active blocks and rate limits.
2. Local thread-safe server-side sliding-window rate limiting (5 req / 60s per client IP).
3. Forwards request telemetry asynchronously to Sentinel /api/ingest-traffic.
4. Enforces pre-route block and rate-limit decisions (403 / 429).
5. Strictly sanitizes query parameters to prevent leakage of credentials or tokens.
6. Fails open gracefully if Chakravyuh Sentinel is temporarily unreachable while maintaining local rate limiting.
"""

import asyncio
import logging
import os
import time
import urllib.parse
from collections import defaultdict, deque
from datetime import datetime, timezone
import threading
from typing import Any, Dict, Set, Tuple, Optional

import httpx
from fastapi import Request
from fastapi.responses import JSONResponse, Response
from starlette.background import BackgroundTasks
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# Configuration via environment variables
CHAKRAVYUH_API_BASE_URL = os.getenv("CHAKRAVYUH_API_BASE_URL", "http://127.0.0.1:8000")
CHAKRAVYUH_TIMEOUT_SECONDS = float(os.getenv("CHAKRAVYUH_TIMEOUT_SECONDS", "2.5"))
CHAKRAVYUH_FAIL_OPEN = os.getenv("CHAKRAVYUH_FAIL_OPEN", "true").lower() in ("true", "1", "yes")
SENTINEL_INGEST_MAX_ATTEMPTS = 3
SENTINEL_INGEST_RETRY_DELAY_SECONDS = 0.2

# Rate limiting configuration (default: 5 requests per 60 seconds per client IP)
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "5"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_EXEMPT_PATHS = {
    "/",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/health",
    "/favicon.ico",
}

# In-memory fast cache of actively blocked IPs to prevent redundant upstream checks
class BlockedIpsCache(dict):
    def add(self, ip: str):
        self[ip] = time.time()

_BLOCKED_IPS_CACHE = BlockedIpsCache()
_CACHE_TTL_SECONDS = 30.0

def is_cached_blocked(ip: str) -> bool:
    if ip in _BLOCKED_IPS_CACHE:
        if time.time() - _BLOCKED_IPS_CACHE[ip] < _CACHE_TTL_SECONDS:
            return True
        del _BLOCKED_IPS_CACHE[ip]
    return False

def cache_blocked_ip(ip: str):
    _BLOCKED_IPS_CACHE[ip] = time.time()


# -------------------------------------------------------------
# LOCAL THREAD-SAFE SLIDING-WINDOW RATE LIMITER
# -------------------------------------------------------------
class XBeautyRateLimiter:
    """
    Thread-safe sliding-window server-side rate limiter for X-Beauty.
    Guarantees strict per-client IP enforcement (5 requests per 60-second window).
    Runs pre-route so that protected routes (bookings, auth, messages, etc.) never execute for dropped requests.
    """

    def __init__(self, max_requests: int = RATE_LIMIT_MAX_REQUESTS, window_seconds: int = RATE_LIMIT_WINDOW_SECONDS):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self.request_history: Dict[str, deque] = defaultdict(deque)

    def is_allowed(self, ip: str) -> Tuple[bool, int, Dict[str, Any]]:
        with self._lock:
            now = time.time()
            history = self.request_history[ip]
            cutoff = now - self.window_seconds
            while history and history[0] <= cutoff:
                history.popleft()

            current_count = len(history)
            if current_count < self.max_requests:
                history.append(now)
                remaining = self.max_requests - current_count - 1
                reset_time = int((history[0] if history else now) + self.window_seconds)
                return True, 0, {
                    "limit": self.max_requests,
                    "remaining": max(0, remaining),
                    "window": self.window_seconds,
                    "reset": reset_time,
                    "current": current_count + 1,
                }
            else:
                oldest = history[0]
                retry_after = max(1, int(oldest + self.window_seconds - now))
                reset_time = int(oldest + self.window_seconds)
                return False, retry_after, {
                    "limit": self.max_requests,
                    "remaining": 0,
                    "window": self.window_seconds,
                    "reset": reset_time,
                    "current": current_count,
                    "retry_after": retry_after,
                }

    def reset_ip(self, ip: str):
        with self._lock:
            if ip in self.request_history:
                del self.request_history[ip]

    def reset_all(self):
        with self._lock:
            self.request_history.clear()


_local_rate_limiter = XBeautyRateLimiter()

def get_xbeauty_rate_limiter() -> XBeautyRateLimiter:
    return _local_rate_limiter


# Sensitive query parameter keys that MUST NEVER be forwarded to security telemetry
SENSITIVE_PARAM_KEYS = {
    "password",
    "pass",
    "pwd",
    "token",
    "access_token",
    "refresh_token",
    "id_token",
    "secret",
    "api_key",
    "apikey",
    "key",
    "auth",
    "authorization",
    "bearer",
    "session",
    "session_id",
    "cookie",
    "credit_card",
    "card",
    "card_number",
    "cvv",
    "cvc",
    "ssn",
    "pin",
    "account_number",
    "private_key",
}


def sanitize_query_string(query_string: str) -> str:
    """
    Sanitize URL query string to strip sensitive values (passwords, tokens, keys)
    before sending security telemetry to Chakravyuh Sentinel.
    """
    if not query_string:
        return ""

    try:
        parsed = urllib.parse.parse_qsl(query_string, keep_blank_values=True)
        sanitized_pairs = []
        for key, value in parsed:
            key_lower = key.lower()
            if any(sensitive in key_lower for sensitive in SENSITIVE_PARAM_KEYS):
                sanitized_pairs.append((key, "[REDACTED]"))
            else:
                sanitized_pairs.append((key, value[:200]))  # bounded length
        return urllib.parse.unquote(urllib.parse.urlencode(sanitized_pairs))
    except Exception:
        return "[SANITIZED_QUERY]"


# Proxy configuration
TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "true").lower() in ("true", "1", "yes")
TRUSTED_PROXIES_STR = os.getenv("TRUSTED_PROXIES", "")
TRUSTED_PROXIES: Set[str] = (
    {ip.strip() for ip in TRUSTED_PROXIES_STR.split(",") if ip.strip()}
    if TRUSTED_PROXIES_STR.strip()
    else set()
)


def get_client_ip(request: Request) -> str:
    direct_ip = request.client.host if request.client and request.client.host else "127.0.0.1"

    if not TRUST_PROXY_HEADERS:
        return direct_ip

    if TRUSTED_PROXIES and direct_ip not in TRUSTED_PROXIES:
        return direct_ip

    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        candidate = x_forwarded_for.split(",")[0].strip()
        if candidate:
            return candidate

    x_real_ip = request.headers.get("x-real-ip")
    if x_real_ip:
        candidate = x_real_ip.strip()
        if candidate:
            return candidate

    return direct_ip


class ChakravyuhClient:
    """Synchronous & async client for interacting with Chakravyuh Sentinel APIs."""

    def __init__(self, base_url: str = CHAKRAVYUH_API_BASE_URL, timeout: float = CHAKRAVYUH_TIMEOUT_SECONDS):
        self.base_url = base_url
        self.timeout = timeout

    async def check_ip(self, ip: str) -> Dict[str, Any]:
        """Query Chakravyuh Sentinel to check if an IP is blocked or rate-limited."""
        url = f"{self.base_url}/api/check-ip/{urllib.parse.quote(ip)}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    return res.json()
        except Exception:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    b_res = await client.get(f"{self.base_url}/blocked-ips?active_only=true")
                    if b_res.status_code == 200:
                        blocks = b_res.json()
                        is_blocked = any(b.get("ip") == ip for b in blocks if isinstance(b, dict))
                        return {
                            "ip": ip,
                            "blocked": is_blocked,
                            "action": "BLOCK" if is_blocked else "ALLOW",
                        }
            except Exception:
                pass
        return {"ip": ip, "blocked": False, "action": "ALLOW"}

    async def ingest_traffic(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send completed HTTP request telemetry to Chakravyuh Sentinel /api/ingest-traffic
        with bounded retries for transient upstream failures.
        """
        url = f"{self.base_url}/api/ingest-traffic"
        for attempt in range(1, SENTINEL_INGEST_MAX_ATTEMPTS + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    res = await client.post(url, json=payload)
                if res.is_success:
                    try:
                        result = res.json()
                    except ValueError:
                        logger.error("Sentinel ingestion returned invalid JSON")
                        return {"success": False, "status_code": res.status_code}
                    return result if isinstance(result, dict) else {"success": True}

                retryable = res.status_code == 429 or res.status_code >= 500
                if not retryable or attempt == SENTINEL_INGEST_MAX_ATTEMPTS:
                    logger.error(
                        "Sentinel traffic ingestion failed with HTTP %s after %s attempt(s)",
                        res.status_code,
                        attempt,
                    )
                    return {"success": False, "status_code": res.status_code}
            except httpx.RequestError as error:
                if attempt == SENTINEL_INGEST_MAX_ATTEMPTS:
                    logger.error(
                        "Sentinel traffic ingestion failed after %s attempt(s) (%s)",
                        attempt,
                        type(error).__name__,
                    )
                    return {"success": False}

            await asyncio.sleep(SENTINEL_INGEST_RETRY_DELAY_SECONDS * attempt)

        return {"success": False}


_client = ChakravyuhClient()


class ChakravyuhSentinelMiddleware(BaseHTTPMiddleware):
    """
    FastAPI Middleware connecting X Beauty real traffic directly to Chakravyuh Sentinel.

    Enforcement order:
    1. Pre-check client IP against active blocks -> if blocked, returns 403 immediately.
       Business route NEVER executes.
    2. Pre-check client IP rate limit -> if exceeded (either locally or via Sentinel policy), returns 429 immediately.
       Business route NEVER executes (protecting bookings, auth, messages).
       Includes clear Retry-After header and rate limit parameters.
    3. Normal X Beauty route executes.
    4. Telemetry is queued after response to update Sentinel pipeline and dashboard.
    5. Fails open gracefully if Sentinel is offline while maintaining local rate-limit protection.
    """

    @staticmethod
    def _content_length(headers) -> int:
        value = headers.get("content-length", "")
        return int(value) if value.isdigit() else 0

    @staticmethod
    def _telemetry_payload(
        *,
        ip: str,
        method: str,
        endpoint: str,
        status_code: int,
        request_size: int,
        response_size: int,
        response_time_ms: float,
        query_string: str,
    ) -> Dict[str, Any]:
        safe_query = sanitize_query_string(query_string)
        return {
            "source_site": "x-beauty",
            "ip": ip,
            "method": method,
            "endpoint": endpoint,
            "status_code": status_code,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_size": request_size,
            "response_size": response_size,
            "response_time_ms": round(response_time_ms, 2),
            "query_length": len(safe_query),
            "query_data": safe_query[:2000],
        }

    @staticmethod
    async def _deliver_telemetry(payload: Dict[str, Any]) -> None:
        try:
            result = await _client.ingest_traffic(payload)
            if not result.get("success", True):
                logger.error(
                    "Sentinel did not accept X-Beauty telemetry (HTTP %s)",
                    result.get("status_code", "unknown"),
                )
        except Exception as error:
            logger.error(
                "Sentinel telemetry delivery failed unexpectedly (%s)",
                type(error).__name__,
            )

    @classmethod
    def _attach_telemetry(cls, response: Response, payload: Dict[str, Any]) -> Response:
        background = BackgroundTasks()
        background.add_task(cls._deliver_telemetry, payload)
        if response.background is not None:
            background.add_task(response.background)
        response.background = background
        return response

    async def dispatch(self, request: Request, call_next):
        client_ip = get_client_ip(request)
        request_path = request.url.path
        request_size = self._content_length(request.headers)
        query_string = request.url.query or ""

        # -------------------------------------------------------------
        # STEP 0: Pre-Route SQL Injection Attack Interception
        # -------------------------------------------------------------
        sqli_pattern = check_sqli_attack(query_string) or check_sqli_attack(request_path)
        if not sqli_pattern and request.method in ("POST", "PUT", "PATCH"):
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    body_bytes = await request.body()
                    if body_bytes:
                        import json
                        body_data = json.loads(body_bytes.decode("utf-8", errors="ignore"))
                        sqli_pattern = check_sqli_attack(body_data)
                except Exception:
                    pass

        if sqli_pattern:
            cache_blocked_ip(client_ip)
            response = JSONResponse(
                status_code=403,
                content={
                    "detail": "Forbidden: SQL injection payload detected and rejected by Sentinel policy",
                    "security_action": "BLOCK",
                    "ip": client_ip,
                    "matched_pattern": sqli_pattern,
                },
                headers={"X-Sentinel-Action": "BLOCK"},
            )
            payload = self._telemetry_payload(
                ip=client_ip,
                method=request.method,
                endpoint=request_path,
                status_code=response.status_code,
                request_size=request_size,
                response_size=self._content_length(response.headers),
                response_time_ms=0,
                query_string=query_string,
            )
            return self._attach_telemetry(response, payload)

        # -------------------------------------------------------------
        # STEP 1: Pre-check IP Block status (PRE-ROUTE)
        # -------------------------------------------------------------
        is_blocked = False

        if is_cached_blocked(client_ip):
            is_blocked = True
        else:
            try:
                ip_status = await _client.check_ip(client_ip)
                if ip_status.get("blocked"):
                    cache_blocked_ip(client_ip)
                    is_blocked = True
                elif ip_status.get("rate_limited") or ip_status.get("action") == "RATE_LIMIT":
                    # Upstream Sentinel rate limit exceeded
                    rate_meta = ip_status.get("rate_limit_info", {})
                    reset_time = rate_meta.get("reset", int(time.time() + 60))
                    retry_after = max(1, reset_time - int(time.time()))
                    response = JSONResponse(
                        status_code=429,
                        content={
                            "detail": f"Too Many Requests: Rate limit exceeded by Chakravyuh Sentinel policy. Please retry after {retry_after} seconds.",
                            "security_action": "RATE_LIMIT",
                            "ip": client_ip,
                            "limit": rate_meta.get("limit", RATE_LIMIT_MAX_REQUESTS),
                            "window_seconds": rate_meta.get("window", RATE_LIMIT_WINDOW_SECONDS),
                            "retry_after": retry_after,
                        },
                        headers={
                            "X-Sentinel-Action": "RATE_LIMIT",
                            "Retry-After": str(retry_after),
                            "X-RateLimit-Limit": str(rate_meta.get("limit", RATE_LIMIT_MAX_REQUESTS)),
                            "X-RateLimit-Remaining": "0",
                            "X-RateLimit-Reset": str(reset_time),
                        },
                    )
                    payload = self._telemetry_payload(
                        ip=client_ip,
                        method=request.method,
                        endpoint=request_path,
                        status_code=response.status_code,
                        request_size=request_size,
                        response_size=self._content_length(response.headers),
                        response_time_ms=0,
                        query_string=query_string,
                    )
                    return self._attach_telemetry(response, payload)
            except Exception:
                if not CHAKRAVYUH_FAIL_OPEN:
                    response = JSONResponse(
                        status_code=503,
                        content={"detail": "Security verification temporarily unavailable"},
                    )
                    payload = self._telemetry_payload(
                        ip=client_ip,
                        method=request.method,
                        endpoint=request_path,
                        status_code=response.status_code,
                        request_size=request_size,
                        response_size=self._content_length(response.headers),
                        response_time_ms=0,
                        query_string=query_string,
                    )
                    return self._attach_telemetry(response, payload)

        if is_blocked:
            response = JSONResponse(
                status_code=403,
                content={
                    "detail": "Forbidden: IP blocked by Chakravyuh Sentinel security policy",
                    "security_action": "BLOCK",
                    "ip": client_ip,
                },
                headers={"X-Sentinel-Action": "BLOCK"},
            )
            payload = self._telemetry_payload(
                ip=client_ip,
                method=request.method,
                endpoint=request_path,
                status_code=response.status_code,
                request_size=request_size,
                response_size=self._content_length(response.headers),
                response_time_ms=0,
                query_string=query_string,
            )
            return self._attach_telemetry(response, payload)

        # -------------------------------------------------------------
        # STEP 2: Local Server-Side Rate Limiter Check (PRE-ROUTE)
        # -------------------------------------------------------------
        is_exempt = request_path in RATE_LIMIT_EXEMPT_PATHS or request.method == "OPTIONS"
        rate_meta = {}

        if not is_exempt:
            allowed, retry_after, rate_meta = _local_rate_limiter.is_allowed(client_ip)
            if not allowed:
                # Reject request BEFORE route execution
                response = JSONResponse(
                    status_code=429,
                    content={
                        "detail": f"Too Many Requests: Rate limit of {_local_rate_limiter.max_requests} requests per {_local_rate_limiter.window_seconds} seconds exceeded. Please wait before trying again.",
                        "security_action": "RATE_LIMIT",
                        "ip": client_ip,
                        "limit": _local_rate_limiter.max_requests,
                        "window_seconds": _local_rate_limiter.window_seconds,
                        "retry_after": retry_after,
                    },
                    headers={
                        "X-Sentinel-Action": "RATE_LIMIT",
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(_local_rate_limiter.max_requests),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(rate_meta.get("reset", int(time.time() + retry_after))),
                    },
                )
                payload = self._telemetry_payload(
                    ip=client_ip,
                    method=request.method,
                    endpoint=request_path,
                    status_code=429,
                    request_size=request_size,
                    response_size=self._content_length(response.headers),
                    response_time_ms=0,
                    query_string=query_string,
                )
                return self._attach_telemetry(response, payload)

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000.0

        if rate_meta:
            response.headers["X-RateLimit-Limit"] = str(rate_meta.get("limit", RATE_LIMIT_MAX_REQUESTS))
            response.headers["X-RateLimit-Remaining"] = str(rate_meta.get("remaining", 0))
            response.headers["X-RateLimit-Reset"] = str(rate_meta.get("reset", int(time.time() + RATE_LIMIT_WINDOW_SECONDS)))

        telemetry_payload = self._telemetry_payload(
            ip=client_ip,
            method=request.method,
            endpoint=request_path,
            status_code=response.status_code,
            request_size=request_size,
            response_size=self._content_length(response.headers),
            response_time_ms=duration_ms,
            query_string=query_string,
        )
        return self._attach_telemetry(response, telemetry_payload)
