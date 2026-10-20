# X Beauty Backend

FastAPI backend for the X Beauty demo website.

## Technologies

- FastAPI
- SQLite
- SQLAlchemy
- JWT Authentication
- Python

## Run

Activate virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

## Render deployment

The integration sends telemetry to
`https://chakravyuh-sentinel-web.onrender.com/api/ingest-traffic`, the deployed
Sentinel API endpoint. The base URL is pinned in backend configuration to
prevent a stale Render environment override from directing telemetry to a
different service.

Telemetry is sent after the X-Beauty response through a background task, with up
to three attempts for transient failures. If Sentinel is unreachable or rejects
an event, X-Beauty requests continue and the backend logs the failure. Only
request metadata and sanitized query values are sent; request/response bodies,
authorization headers, cookies, and credentials are not included.

Configure `TRUST_PROXY_HEADERS` and `TRUSTED_PROXIES` on Render for the actual
proxy setup. When `TRUSTED_PROXIES` is non-empty, forwarded client IP headers
are trusted only if the direct peer address is in that list; otherwise the
direct peer address is used. If the list is empty, behavior is controlled by
`TRUST_PROXY_HEADERS`.