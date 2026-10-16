# X-Beauty Frontend & Backend Integration

Production frontend deployed on Vercel:
`https://x-beauty-41w61egzi-chaitralikaustubhmithbawkar-2222.vercel.app`

Production backend deployed on Render:
`https://x-beauty-backend.onrender.com`

---

## 1. Environment Variable Configuration

The frontend uses Vite and reads the backend base URL via:

```env
VITE_API_BASE_URL=https://x-beauty-backend.onrender.com
```

### Environment Files
- `.env.example`: Template for environment variables.
- `.env.production`: Production defaults used by `npm run build` pointing directly to the deployed Render backend.
- `.env.development`: (Optional) Can point to local development server `http://127.0.0.1:8001`.

### Production Deployment on Vercel
In the Vercel Project Dashboard (`Settings` -> `Environment Variables`):
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://x-beauty-backend.onrender.com`
- **Environments**: Production, Preview, Development

> **Security Note**: Never expose backend secrets, database passwords, or JWT keys in client-side environment variables. Only the public API base URL is exposed to the browser.

---

## 2. Centralized API Client

All frontend network requests are centralized in [`src/lib/api.ts`](src/lib/api.ts).
Features include:
- Automatic Bearer token authentication header injection.
- Pydantic/FastAPI request sanitization (e.g. converting empty optional email/notes to `null` to prevent 422 errors).
- Render cold-start detection and user notifications.
- Request deduplication for concurrent GET requests.
- Graceful fallbacks for public showcase data if backend is temporarily offline.

---

## 3. Integrated Endpoints

| Resource | HTTP Method | Endpoint | Auth Required |
| :--- | :--- | :--- | :--- |
| Health Check | `GET` | `/api/health` | No |
| Staff Login | `POST` | `/api/auth/login` | No |
| Current User Profile | `GET` | `/api/auth/me` | Bearer Token |
| Create Booking Request | `POST` | `/api/bookings` | No |
| List All Bookings | `GET` | `/api/bookings` | Bearer Token |
| Get Booking Details | `GET` | `/api/bookings/{id}` | Bearer Token |
| Update Booking Status | `PATCH` | `/api/bookings/{id}/status` | Bearer Token |
| Delete Booking | `DELETE` | `/api/bookings/{id}` | Bearer Token |
| Submit Contact Message | `POST` | `/api/messages` | No |
| List Contact Messages | `GET` | `/api/messages` | Bearer Token |
| Mark Message as Read | `PATCH` | `/api/messages/{id}/read` | Bearer Token |
| List Active Services | `GET` | `/api/services` | No |
| List Active Stylists | `GET` | `/api/stylists` | No |
| List Active Offers | `GET` | `/api/offers` | No |
| Dashboard Overview KPI | `GET` | `/api/dashboard/overview` | Bearer Token |
| Dashboard Activity KPI | `GET` | `/api/dashboard/activity` | Bearer Token |

---

## 4. Backend CORS Configuration on Render

The backend FastAPI service uses `CORSMiddleware`.

To ensure browser requests from the Vercel deployment are permitted, configure the environment variable in the Render Dashboard (`x-beauty-backend` -> `Environment`):

```env
CORS_ORIGINS=https://x-beauty-41w61egzi-chaitralikaustubhmithbawkar-2222.vercel.app,http://localhost:5173,http://localhost:3000
```

Additionally, `vercel.json` provides a reverse proxy rewrite `/api/:path*` to `https://x-beauty-backend.onrender.com/api/:path*` for seamless fallback routing without CORS restrictions.

---

## 5. Development and Build Commands

```bash
# Install dependencies
npm install

# Run TypeScript type check
npm run typecheck

# Run ESLint
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```
