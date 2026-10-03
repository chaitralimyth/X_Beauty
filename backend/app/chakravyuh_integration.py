"""
Chakravyuh Sentinel Security Integration Layer for X Beauty Backend

Connects X Beauty request traffic directly to the Chakravyuh Sentinel
unified security pipeline:
1. Pre-checks client IP against active blocks and rate limits.
2. Forwards request telemetry to Chakravyuh Sentinel /api/ingest-traffic.
3. Enforces real synchronous decisions (BLOCK -> 403, RATE_LIMIT -> 429).
4. Strictly sanitizes query parameters to prevent leakage of credentials or tokens.
5. Fails open gracefully if Chakravyuh Sentinel is temporarily unreachable.
"""

import os
import time
import urllib.parse
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Set

import httpx
from fastapi import Request
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Configuration via environment variables
CHAKRAVYUH_API_BASE_URL = os.getenv("CHAKRAVYUH_API_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
CHAKRAVYUH_TIMEOUT_SECONDS = float(os.getenv("CHAKRAVYUH_TIMEOUT_SECONDS", "2.5"))
CHAKRAVYUH_FAIL_OPEN = os.getenv("CHAKRAVYUH_FAIL_OPEN", "true").lower() in ("true", "1", "yes")

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
        except Exception as e:
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
        and receive the security evaluation result.
        """
        url = f"{self.base_url}/api/ingest-traffic"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                return res.json()
            return {
                "success": False,
                "status_code": res.status_code,
                "message": f"Chakravyuh Sentinel returned HTTP {res.status_code}",
            }


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
    4. Telemetry is ingested into Chakravyuh /api/ingest-traffic.
       This records the request and consumes ONE rate limit slot authoritatively.
    5. Adaptive decision returned from Chakravyuh is enforced and attached to headers.
    6. Fails open gracefully if Chakravyuh is temporarily offline.
    """

    async def dispatch(self, request: Request, call_next):
        client_ip = get_client_ip(request)
        request_path = request.url.path

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
                    return JSONResponse(
                        status_code=429,
                        content={
                            "detail": "Too Many Requests: Rate limit exceeded by Chakravyuh Sentinel",
                            "security_action": "RATE_LIMIT",
                            "ip": client_ip,
                        },
                        headers={"X-Sentinel-Action": "RATE_LIMIT"},
                    )
            except Exception as err:
                if not CHAKRAVYUH_FAIL_OPEN:
                    return JSONResponse(
                        status_code=503,
                        content={"detail": "Security verification temporarily unavailable"},
                    )
                # Fail open safely during transient errors

        if is_blocked:
            # Report the blocked attempt telemetry to Sentinel
            try:
                await _client.ingest_traffic({
                    "ip": client_ip,
                    "method": request.method,
                    "endpoint": request_path,
                    "status_code": 403,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "request_size": int(request.headers.get("content-length") or 0),
                    "response_size": 80,
                    "response_time_ms": 1.0,
                    "query_length": len(request.url.query or ""),
                    "query_data": sanitize_query_string(request.url.query or ""),
                })
            except Exception:
                pass

            return JSONResponse(
                status_code=403,
                content={
                    "detail": "Forbidden: IP blocked by Chakravyuh Sentinel security policy",
                    "security_action": "BLOCK",
                    "ip": client_ip,
                },
                headers={"X-Sentinel-Action": "BLOCK"},
            )

        # -------------------------------------------------------------
        # STEP 2: Execute normal X Beauty route handler
        # -------------------------------------------------------------
        start_time = time.perf_counter()
        query_string = request.url.query or ""
        sanitized_query = sanitize_query_string(query_string)

        content_length = request.headers.get("content-length")
        request_size = int(content_length) if content_length and content_length.isdigit() else 0

        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000.0

        # Read and re-emit response body to determine size and permit decision overrides
        response_body = b""
        async for chunk in response.body_iterator:
            response_body += chunk

        new_response = Response(
            content=response_body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type,
            background=response.background,
        )

        # -------------------------------------------------------------
        # STEP 3: Security Telemetry Ingestion & Decision Enforcement
        # -------------------------------------------------------------
        telemetry_payload = {
            "ip": client_ip,
            "method": request.method,
            "endpoint": request_path,
            "status_code": response.status_code,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_size": request_size,
            "response_size": len(response_body),
            "response_time_ms": round(duration_ms, 2),
            "query_length": len(sanitized_query),
            "query_data": sanitized_query[:2000],
        }

        try:
            eval_result = await _client.ingest_traffic(telemetry_payload)

            action = eval_result.get("action", "ALLOW")
            session_id = eval_result.get("session_id")
            risk_score = eval_result.get("risk_score")
            severity = eval_result.get("severity")
            is_now_blocked = eval_result.get("blocked", False)

            if session_id:
                new_response.headers["X-Sentinel-Session-Id"] = str(session_id)
            if action:
                new_response.headers["X-Sentinel-Action"] = str(action)

            # Active Enforcement: if Sentinel decided BLOCK or marked IP blocked
            if action == "BLOCK" or is_now_blocked:
                _BLOCKED_IPS_CACHE.add(client_ip)
                return JSONResponse(
                    status_code=403,
                    content={
                        "detail": "Forbidden: IP blocked by Chakravyuh Sentinel security policy",
                        "security_action": "BLOCK",
                        "risk_score": risk_score,
                        "severity": severity,
                        "ip": client_ip,
                    },
                    headers={
                        "X-Sentinel-Action": "BLOCK",
                        "X-Sentinel-Risk-Score": str(risk_score or "100"),
                        "X-Sentinel-Severity": str(severity or "CRITICAL"),
                    },
                )

            # Active Enforcement: if Sentinel decided RATE_LIMIT
            if action == "RATE_LIMIT":
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Too Many Requests: Rate limit exceeded by Chakravyuh Sentinel",
                        "security_action": "RATE_LIMIT",
                        "risk_score": risk_score,
                        "severity": severity,
                        "ip": client_ip,
                    },
                    headers={
                        "X-Sentinel-Action": "RATE_LIMIT",
                        "X-Sentinel-Risk-Score": str(risk_score or ""),
                        "X-Sentinel-Severity": str(severity or "HIGH"),
                    },
                )

        except Exception as ingest_err:
            # Graceful failure handling without leaking internals or credentials
            # When fail-open is configured, X Beauty traffic continues safely
            pass

        return new_response
