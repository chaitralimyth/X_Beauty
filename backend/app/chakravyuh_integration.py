"""
Chakravyuh Sentinel Security Integration Layer for X Beauty Backend

Connects X Beauty request traffic directly to the Chakravyuh Sentinel
unified security pipeline:
1. Pre-checks client IP against active blocks and rate limits.
2. Forwards request telemetry asynchronously to Sentinel /api/ingest-traffic.
3. Enforces pre-route block and rate-limit decisions.
4. Strictly sanitizes query parameters to prevent leakage of credentials or tokens.
5. Fails open gracefully if Chakravyuh Sentinel is temporarily unreachable.
"""

import asyncio
import logging
import os
import time
import urllib.parse
from datetime import datetime, timezone
from typing import Any, Dict, Set

import httpx
from fastapi import Request
from fastapi.responses import JSONResponse, Response
from starlette.background import BackgroundTasks
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# Configuration via environment variables
CHAKRAVYUH_API_BASE_URL = "https://chakravyuh-sentinel-web.onrender.com"
CHAKRAVYUH_TIMEOUT_SECONDS = float(os.getenv("CHAKRAVYUH_TIMEOUT_SECONDS", "2.5"))
CHAKRAVYUH_FAIL_OPEN = os.getenv("CHAKRAVYUH_FAIL_OPEN", "true").lower() in ("true", "1", "yes")
SENTINEL_INGEST_MAX_ATTEMPTS = 3
SENTINEL_INGEST_RETRY_DELAY_SECONDS = 0.2

# In-memory fast cache of actively blocked IPs to prevent redundant upstream checks
_BLOCKED_IPS_CACHE: Set[str] = set()

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
        return urllib.parse.urlencode(sanitized_pairs)
    except Exception:
        return "[SANITIZED_QUERY]"


# Proxy configuration:
# When TRUST_PROXY_HEADERS is True (default for local dev and behind trusted reverse proxies),
# X-Forwarded-For and X-Real-IP are evaluated.
# For production behind reverse proxies (Vercel, Render, Cloudflare, AWS ALB),
# TRUSTED_PROXIES can specify the trusted proxy IP list.
TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "true").lower() in ("true", "1", "yes")
TRUSTED_PROXIES_STR = os.getenv("TRUSTED_PROXIES", "")
TRUSTED_PROXIES: Set[str] = (
    {ip.strip() for ip in TRUSTED_PROXIES_STR.split(",") if ip.strip()}
    if TRUSTED_PROXIES_STR.strip()
    else set()
)


def get_client_ip(request: Request) -> str:
    """
    Extract authoritative client IP address.

    Security & consistency guarantees:
    - If TRUST_PROXY_HEADERS is False, always uses request.client.host (immune to spoofing).
    - If TRUSTED_PROXIES is configured, only trusts X-Forwarded-For if client is in TRUSTED_PROXIES.
    - If TRUST_PROXY_HEADERS is True (default for local dev & serverless), extracts client IP from
      the first entry in X-Forwarded-For or X-Real-IP, falling back to connection host.
    - The returned IP is used consistently across:
      1) pre-route block check
      2) pre-route rate limit check
      3) telemetry ingestion
      4) session tracking
      5) dynamic risk scoring & enforcement
    """
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
            # Fallback to /blocked-ips if /api/check-ip endpoint is unavailable
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
                logger.warning(
                    "Sentinel traffic ingestion returned HTTP %s; retrying (%s/%s)",
                    res.status_code,
                    attempt,
                    SENTINEL_INGEST_MAX_ATTEMPTS,
                )
            except httpx.RequestError as error:
                if attempt == SENTINEL_INGEST_MAX_ATTEMPTS:
                    logger.error(
                        "Sentinel traffic ingestion failed after %s attempt(s) (%s)",
                        attempt,
                        type(error).__name__,
                    )
                    return {"success": False}
                logger.warning(
                    "Sentinel traffic ingestion request failed (%s); retrying (%s/%s)",
                    type(error).__name__,
                    attempt,
                    SENTINEL_INGEST_MAX_ATTEMPTS,
                )

            await asyncio.sleep(SENTINEL_INGEST_RETRY_DELAY_SECONDS * attempt)

        return {"success": False}


_client = ChakravyuhClient()


class ChakravyuhSentinelMiddleware(BaseHTTPMiddleware):
    """
    FastAPI Middleware connecting X Beauty real traffic directly to Chakravyuh Sentinel.

    Enforcement order:
    1. Pre-check client IP against active blocks -> if blocked, returns 403 immediately.
       Business route NEVER executes.
    2. Pre-check client IP rate limit -> if exceeded, returns 429 immediately.
       Business route NEVER executes (protects state-changing endpoints like bookings/login/messages).
    3. Normal X Beauty route executes.
    4. Telemetry is queued after the response is sent so Sentinel latency does
       not delay the client.
    5. Fails open gracefully if Chakravyuh Sentinel is temporarily offline.
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
        # STEP 1: Pre-check IP Block & Rate-limit status (PRE-ROUTE)
        # -------------------------------------------------------------
        is_blocked = False

        if client_ip in _BLOCKED_IPS_CACHE:
            is_blocked = True
        else:
            try:
                ip_status = await _client.check_ip(client_ip)
                if ip_status.get("blocked"):
                    _BLOCKED_IPS_CACHE.add(client_ip)
                    is_blocked = True
                elif ip_status.get("rate_limited") or ip_status.get("action") == "RATE_LIMIT":
                    # Pre-route rate limit enforcement:
                    # Business route MUST NOT execute (protecting bookings, auth, messages)
                    response = JSONResponse(
                        status_code=429,
                        content={
                            "detail": "Too Many Requests: Rate limit exceeded by Chakravyuh Sentinel",
                            "security_action": "RATE_LIMIT",
                            "ip": client_ip,
                        },
                        headers={"X-Sentinel-Action": "RATE_LIMIT"},
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
                # Fail open safely during transient errors

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

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000.0

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
