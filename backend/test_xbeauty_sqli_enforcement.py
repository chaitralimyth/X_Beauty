import unittest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.chakravyuh_integration import _BLOCKED_IPS_CACHE

class TestXBeautySQLiEnforcement(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        _BLOCKED_IPS_CACHE.clear()

    @patch("app.chakravyuh_integration._client.ingest_traffic", new_callable=AsyncMock)
    @patch("app.chakravyuh_integration._client.check_ip", new_callable=AsyncMock)
    def test_sqli_in_post_search_blocked_pre_route(self, mock_check, mock_ingest):
        """Verify SQL injection in POST search body is blocked with HTTP 403 before route execution."""
        mock_check.return_value = {"blocked": False, "action": "ALLOW"}
        mock_ingest.return_value = {"success": True}

        attacker_ip = "198.51.100.88"
        headers = {"X-Forwarded-For": attacker_ip}
        sqli_payload = {"stylist": "' OR '1'='1"}

        resp = self.client.post("/api/bookings/search", json=sqli_payload, headers=headers)
        self.assertEqual(resp.status_code, 403)
        data = resp.json()
        self.assertIn("Forbidden", data.get("detail", ""))
        self.assertEqual(data.get("security_action"), "BLOCK")
        self.assertEqual(resp.headers.get("X-Sentinel-Action"), "BLOCK")

        # Verify attacker IP is persistently blocked in cache
        self.assertIn(attacker_ip, _BLOCKED_IPS_CACHE)

        # Subsequent legitimate request from same client is STILL blocked
        subsequent_resp = self.client.get("/api/services", headers=headers)
        self.assertEqual(subsequent_resp.status_code, 403)

    @patch("app.chakravyuh_integration._client.ingest_traffic", new_callable=AsyncMock)
    @patch("app.chakravyuh_integration._client.check_ip", new_callable=AsyncMock)
    def test_sqli_in_path_parameter_blocked_pre_route(self, mock_check, mock_ingest):
        """Verify SQL injection in GET booking path parameter is blocked with HTTP 403."""
        mock_check.return_value = {"blocked": False, "action": "ALLOW"}
        mock_ingest.return_value = {"success": True}

        attacker_ip = "198.51.100.89"
        headers = {"X-Forwarded-For": attacker_ip}

        resp = self.client.get("/api/bookings/1%20OR%201=1", headers=headers)
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.json().get("security_action"), "BLOCK")

    @patch("app.chakravyuh_integration._client.ingest_traffic", new_callable=AsyncMock)
    @patch("app.chakravyuh_integration._client.check_ip", new_callable=AsyncMock)
    def test_legitimate_search_and_services_succeed(self, mock_check, mock_ingest):
        """Verify normal search and booking requests succeed and are not blocked."""
        mock_check.return_value = {"blocked": False, "action": "ALLOW"}
        mock_ingest.return_value = {"success": True}

        normal_ip = "192.168.1.155"
        headers = {"X-Forwarded-For": normal_ip}

        resp = self.client.get("/api/services", headers=headers)
        self.assertEqual(resp.status_code, 200)

        # Normal search query
        search_resp = self.client.post("/api/bookings/search", json={"stylist": "Sarah"}, headers=headers)
        self.assertEqual(search_resp.status_code, 200)
