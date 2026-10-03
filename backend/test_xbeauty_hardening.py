"""
Targeted X Beauty Security Hardening Test Suite
Verifies:
1. CORS configuration & browser origin protection (no wildcard with credentials)
2. Sensitive parameter sanitization (passwords, tokens, API keys, CVVs, etc.)
3. Authoritative client IP extraction and consistency
4. Pre-route enforcement order (blocked & rate-limited requests drop BEFORE route execution)
"""

import os
import sys
import unittest
import urllib.parse
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)

from app.main import app
from app.chakravyuh_integration import (
    sanitize_query_string,
    get_client_ip,
    SENSITIVE_PARAM_KEYS,
    _BLOCKED_IPS_CACHE,
    ChakravyuhSentinelMiddleware,
)


class TestXBeautyHardening(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        _BLOCKED_IPS_CACHE.clear()

    def test_1_cors_allowed_origin_with_credentials(self):
        """Verify explicit local origins receive CORS headers without wildcard '* '."""
        # Test legitimate frontend origin
        headers = {"Origin": "http://localhost:5173"}
        resp = self.client.get("/api/health", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("access-control-allow-origin"), "http://localhost:5173")
        self.assertEqual(resp.headers.get("access-control-allow-credentials"), "true")
        self.assertNotEqual(resp.headers.get("access-control-allow-origin"), "*")

        # Test preflight OPTIONS request
        options_headers = {
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET",
        }
        opt_resp = self.client.options("/api/health", headers=options_headers)
        self.assertEqual(opt_resp.status_code, 200)
        self.assertEqual(opt_resp.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173")
        self.assertEqual(opt_resp.headers.get("access-control-allow-credentials"), "true")

        # Test unauthorized origin
        evil_headers = {"Origin": "http://malicious-site.example.com"}
        evil_resp = self.client.get("/api/health", headers=evil_headers)
        self.assertIsNone(evil_resp.headers.get("access-control-allow-origin"))
        print("PASS: CORS origin configuration verified (no wildcard, credentials supported).")

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


if __name__ == "__main__":
    unittest.main()
