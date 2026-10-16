"""
Unit test suite for FastAPI CORS configuration and preflight requests on backend branch.
"""

import os
import sys
import unittest
from fastapi.testclient import TestClient

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)

from app.main import app


class TestBackendCors(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_production_vercel_origin_services(self):
        """Verify the exact deployed Vercel origin receives CORS headers on /api/services."""
        origin = "https://x-beauty-41w61egzi-chaitralikaustubhmithbawkar-2222.vercel.app"
        resp = self.client.get("/api/services", headers={"Origin": origin})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("access-control-allow-origin"), origin)
        self.assertEqual(resp.headers.get("access-control-allow-credentials"), "true")
        self.assertNotEqual(resp.headers.get("access-control-allow-origin"), "*")

    def test_production_vercel_origin_stylists(self):
        """Verify the exact deployed Vercel origin receives CORS headers on /api/stylists."""
        origin = "https://x-beauty-41w61egzi-chaitralikaustubhmithbawkar-2222.vercel.app"
        resp = self.client.get("/api/stylists", headers={"Origin": origin})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("access-control-allow-origin"), origin)
        self.assertEqual(resp.headers.get("access-control-allow-credentials"), "true")

    def test_vercel_preview_regex_match(self):
        """Verify any standard preview deployment on *.vercel.app matches via regex."""
        origin = "https://x-beauty-git-feat-test-org.vercel.app"
        resp = self.client.get("/api/services", headers={"Origin": origin})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("access-control-allow-origin"), origin)
        self.assertEqual(resp.headers.get("access-control-allow-credentials"), "true")

    def test_options_preflight_booking(self):
        """Verify preflight OPTIONS requests for booking submissions."""
        origin = "https://x-beauty-41w61egzi-chaitralikaustubhmithbawkar-2222.vercel.app"
        headers = {
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        }
        resp = self.client.options("/api/bookings", headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("access-control-allow-origin"), origin)
        self.assertEqual(resp.headers.get("access-control-allow-credentials"), "true")
        allowed_methods = resp.headers.get("access-control-allow-methods", "")
        self.assertIn("POST", allowed_methods)
        self.assertIn("OPTIONS", allowed_methods)

    def test_localhost_origin_still_allowed(self):
        """Verify local development origins remain functional."""
        origin = "http://localhost:5173"
        resp = self.client.get("/api/health", headers={"Origin": origin})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("access-control-allow-origin"), origin)

    def test_unauthorized_origin_rejected(self):
        """Verify unauthorized origins do not receive CORS allow headers."""
        origin = "http://malicious-origin.attacker.com"
        resp = self.client.get("/api/health", headers={"Origin": origin})
        self.assertIsNone(resp.headers.get("access-control-allow-origin"))


if __name__ == "__main__":
    unittest.main()
