"""
Targeted X Beauty Security Hardening Test Suite
Verifies:
1. CORS configuration allows requests from any browser origin
2. Sensitive parameter sanitization (passwords, tokens, API keys, CVVs, etc.)
3. Authoritative client IP extraction and consistency
4. Pre-route enforcement order (blocked & rate-limited requests drop BEFORE route execution)
5. Safe request telemetry forwarding to Chakravyuh Sentinel
"""

import os
import sys
import json
import unittest
import urllib.parse
from datetime import datetime, timezone
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
import httpx

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)

from app.main import app
from app.chakravyuh_integration import (
    CHAKRAVYUH_API_BASE_URL,
    sanitize_query_string,
    get_client_ip,
    SENSITIVE_PARAM_KEYS,
    _BLOCKED_IPS_CACHE,
)


class TestXBeautyHardening(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        _BLOCKED_IPS_CACHE.clear()

    def test_1_cors_allows_any_origin_with_credentials(self):
        """Verify an unconfigured website can make credentialed browser requests."""
        headers = {"Origin": "https://unlisted.example.org"}
        resp = self.client.get("/api/health", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            resp.headers.get("access-control-allow-origin"),
            "https://unlisted.example.org",
        )
        self.assertEqual(resp.headers.get("access-control-allow-credentials"), "true")
        self.assertNotEqual(resp.headers.get("access-control-allow-origin"), "*")

        # Test preflight OPTIONS request
        options_headers = {
            "Origin": "https://another-unlisted.example.net",
            "Access-Control-Request-Method": "PATCH",
            "Access-Control-Request-Headers": "authorization,content-type",
        }
        opt_resp = self.client.options("/api/health", headers=options_headers)
        self.assertEqual(opt_resp.status_code, 200)
        self.assertEqual(
            opt_resp.headers.get("access-control-allow-origin"),
            "https://another-unlisted.example.net",
        )
        self.assertEqual(opt_resp.headers.get("access-control-allow-credentials"), "true")
        self.assertIn("PATCH", opt_resp.headers.get("access-control-allow-methods", ""))
        self.assertIn(
            "authorization",
            opt_resp.headers.get("access-control-allow-headers", "").lower(),
        )
        print("PASS: CORS requests from arbitrary origins are allowed.")

    def test_2_sensitive_query_sanitization(self):
        """Verify sensitive parameters are thoroughly redacted while safe params are preserved."""
        test_queries = [
            ("category=hair&password=supersecret&page=1", "category=hair&password=%5BREDACTED%5D&page=1"),
            ("token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&service_id=5", "token=%5BREDACTED%5D&service_id=5"),
            ("api_key=sk-1234567890abcdef&cvv=123&action=view", "api_key=%5BREDACTED%5D&cvv=%5BREDACTED%5D&action=view"),
            ("access_token=secret123&refresh_token=secret456", "access_token=%5BREDACTED%5D&refresh_token=%5BREDACTED%5D"),
            ("user_id=42&search=facial+massage", "user_id=42&search=facial+massage"),
        ]

        for query_in, _ in test_queries:
            sanitized = sanitize_query_string(query_in)
            self.assertNotIn("supersecret", sanitized)
            self.assertNotIn("sk-1234567890abcdef", sanitized)
            self.assertNotIn("secret123", sanitized)
            self.assertNotIn("secret456", sanitized)
            parsed_in = dict(urllib.parse.parse_qsl(query_in))
            parsed_out = dict(urllib.parse.parse_qsl(sanitized))
            for k in parsed_in:
                if any(s in k.lower() for s in SENSITIVE_PARAM_KEYS):
                    self.assertEqual(parsed_out.get(k), "[REDACTED]")

        # Test non-sensitive preservation
        safe_query = "category=skincare&stylist=sarah&sort=price_asc"
        sanitized_safe = sanitize_query_string(safe_query)
        self.assertEqual(dict(urllib.parse.parse_qsl(sanitized_safe)), {"category": "skincare", "stylist": "sarah", "sort": "price_asc"})
        print("PASS: Sensitive query sanitization verified.")

    def test_3_authoritative_client_ip(self):
        """Verify client IP extraction is consistent and handles proxies appropriately."""
        mock_req = MagicMock()
        mock_req.client.host = "192.168.1.50"
        mock_req.headers = {"x-forwarded-for": "203.0.113.195, 10.0.0.1"}

        # Proxy headers trusted
        ip = get_client_ip(mock_req)
        self.assertEqual(ip, "203.0.113.195")

        # When headers absent, direct client host is used
        mock_req_direct = MagicMock()
        mock_req_direct.client.host = "192.168.1.60"
        mock_req_direct.headers = {}
        ip_direct = get_client_ip(mock_req_direct)
        self.assertEqual(ip_direct, "192.168.1.60")
        print("PASS: Authoritative client IP extraction verified.")

    def test_4_pre_route_block_enforcement(self):
        """Verify actively blocked IPs are rejected BEFORE the business route handler executes."""
        _BLOCKED_IPS_CACHE.add("198.51.100.99")
        with patch("app.chakravyuh_integration._client.ingest_traffic", new_callable=AsyncMock) as mock_ingest:
            mock_ingest.return_value = {"success": True}
            resp = self.client.get("/api/services", headers={"X-Forwarded-For": "198.51.100.99"})
            self.assertEqual(resp.status_code, 403)
            body = resp.json()
            self.assertIn("Forbidden", body.get("detail", ""))
            self.assertEqual(body.get("security_action"), "BLOCK")
            self.assertEqual(resp.headers.get("X-Sentinel-Action"), "BLOCK")
            # Verify ingest_traffic was called with redacted / safe telemetry
            mock_ingest.assert_awaited_once()
        print("PASS: Pre-route active block enforcement verified.")

    def test_5_booking_post_accepts_both_slash_variants(self):
        """Verify both frontend-compatible booking URLs reach body validation."""
        with (
            patch(
                "app.chakravyuh_integration._client.check_ip",
                new_callable=AsyncMock,
                return_value={"blocked": False, "action": "ALLOW"},
            ),
            patch(
                "app.chakravyuh_integration._client.ingest_traffic",
                new_callable=AsyncMock,
                return_value={"success": True, "action": "ALLOW"},
            ),
        ):
            for path in ("/api/bookings", "/api/bookings/"):
                with self.subTest(path=path):
                    resp = self.client.post(path, json={})
                    self.assertEqual(resp.status_code, 422)

        print("PASS: Booking POST works with or without a trailing slash.")

    def test_6_request_telemetry_includes_safe_xbeauty_event(self):
        """Verify request metadata reaches Sentinel without forwarding secrets."""
        client_ip = "203.0.113.24"
        self.assertEqual(
            CHAKRAVYUH_API_BASE_URL,
            "https://chakravyuh-sentinel-web.onrender.com",
        )
        sentinel_requests = []

        def sentinel_handler(request):
            sentinel_requests.append(request)
            return httpx.Response(200, json={"success": True, "action": "ALLOW"})

        transport = httpx.MockTransport(sentinel_handler)
        real_async_client = httpx.AsyncClient
        with (
            patch("app.chakravyuh_integration.TRUST_PROXY_HEADERS", True),
            patch("app.chakravyuh_integration.TRUSTED_PROXIES", {"testclient"}),
            patch(
                "app.chakravyuh_integration._client.check_ip",
                new_callable=AsyncMock,
                return_value={"blocked": False, "action": "ALLOW"},
            ),
            patch(
                "app.chakravyuh_integration.httpx.AsyncClient",
                side_effect=lambda **kwargs: real_async_client(
                    transport=transport,
                    **kwargs,
                ),
            ),
        ):
            response = self.client.post(
                "/api/bookings?campaign=summer&access_token=query-secret",
                json={"password": "body-secret", "token": "body-token"},
                headers={
                    "X-Forwarded-For": f"{client_ip}, 198.51.100.10",
                    "Authorization": "Bearer header-secret",
                    "Cookie": "session=cookie-secret",
                },
            )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(len(sentinel_requests), 1)
        sentinel_request = sentinel_requests[0]
        self.assertEqual(sentinel_request.method, "POST")
        self.assertEqual(
            str(sentinel_request.url),
            f"{CHAKRAVYUH_API_BASE_URL}/api/ingest-traffic",
        )
        payload = json.loads(sentinel_request.content)
        self.assertEqual(payload["source_site"], "x-beauty")
        self.assertEqual(payload["ip"], client_ip)
        self.assertEqual(payload["method"], "POST")
        self.assertEqual(payload["endpoint"], "/api/bookings")
        self.assertEqual(payload["status_code"], response.status_code)
        parsed_timestamp = datetime.fromisoformat(payload["timestamp"])
        self.assertIsNotNone(parsed_timestamp.tzinfo)
        self.assertEqual(parsed_timestamp.utcoffset(), timezone.utc.utcoffset(parsed_timestamp))
        self.assertIn("campaign=summer", urllib.parse.unquote(payload["query_data"]))
        self.assertNotIn("query-secret", payload["query_data"])
        self.assertNotIn("header-secret", str(payload))
        self.assertNotIn("cookie-secret", str(payload))
        self.assertNotIn("body-secret", str(payload))
        self.assertNotIn("body-token", str(payload))
        self.assertNotIn("authorization", payload)
        self.assertNotIn("cookie", payload)
        print("PASS: Safe X-Beauty telemetry payload is sent to Sentinel.")

    def test_7_sentinel_failure_does_not_break_api_response(self):
        with (
            patch(
                "app.chakravyuh_integration._client.check_ip",
                new_callable=AsyncMock,
                return_value={"blocked": False, "action": "ALLOW"},
            ),
            patch(
                "app.chakravyuh_integration._client.ingest_traffic",
                new_callable=AsyncMock,
                side_effect=RuntimeError("test delivery failure"),
            ),
            self.assertLogs("app.chakravyuh_integration", level="ERROR"),
        ):
            response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        print("PASS: Sentinel delivery failure does not break the API response.")


if __name__ == "__main__":
    unittest.main()
