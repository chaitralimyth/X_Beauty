/**
 * X-Beauty Centralized API Client
 *
 * Configured for the deployed Render backend (https://x-beauty-backend.onrender.com)
 * with robust error handling, Render cold-start resilience, token auth,
 * and input sanitization matching backend contracts.
 */

const RAW_API_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (
  RAW_API_URL && RAW_API_URL.trim() !== ''
    ? RAW_API_URL.trim()
    : import.meta.env.PROD
    ? 'https://x-beauty-backend.onrender.com'
    : 'http://127.0.0.1:8001'
).replace(/\/+$/, '');

const TOKEN_KEY = 'x_beauty_token';
const USER_KEY = 'x_beauty_user';

export class ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
  isColdStart?: boolean;

  constructor(
    message: string,
    status?: number,
    statusText?: string,
    data?: unknown,
    isColdStart?: boolean
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.isColdStart = isColdStart;
  }
}

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, user: UserData): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Unable to store auth session:', err);
  }
};

export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.warn('Unable to clear auth session:', err);
  }
};

export const getStoredUser = (): UserData | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function formatFastApiError(data: unknown, fallbackMessage: string): string {
  if (!data || typeof data !== 'object') {
    return fallbackMessage;
  }
  const errObj = data as { detail?: unknown; message?: unknown };
  if (typeof errObj.detail === 'string' && errObj.detail.trim()) {
    return errObj.detail;
  }
  if (Array.isArray(errObj.detail)) {
    const messages = errObj.detail.map((item: { loc?: unknown[]; msg?: string }) => {
      const field = Array.isArray(item.loc)
        ? item.loc.filter((p) => p !== 'body').join('.')
        : '';
      const msg = item.msg || 'Invalid field';
      return field ? `${field}: ${msg}` : msg;
    });
    if (messages.length > 0) return messages.join('; ');
  }
  if (typeof errObj.message === 'string' && errObj.message.trim()) {
    return errObj.message;
  }
  return fallbackMessage;
}

// In-flight GET request deduplication to prevent duplicate concurrent network calls
const inFlightRequests = new Map<string, Promise<unknown>>();

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const url = `${API_BASE_URL}${endpoint}`;

  if (isGet && inFlightRequests.has(url)) {
    return inFlightRequests.get(url) as Promise<T>;
  }

  const execRequest = async (): Promise<T> => {
    const timeoutMs = options.timeoutMs ?? (options.method ? 40000 : 30000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers = new Headers(options.headers || {});

    // Attach Bearer token if not explicitly skipped
    if (!options.skipAuth && !headers.has('Authorization')) {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Set JSON content-type if body is not FormData
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (!isFormData && options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-JSON or empty responses
      const contentType = response.headers.get('content-type') || '';
      let data: unknown;
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const message = formatFastApiError(
          data,
          `HTTP ${response.status}: ${response.statusText || 'Request failed'}`
        );

        if (response.status === 401) {
          clearAuthSession();
        }

        throw new ApiError(message, response.status, response.statusText, data);
      }

      return data as T;
    } catch (err) {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      const isAbort = err instanceof DOMException && err.name === 'AbortError';

      if (err instanceof ApiError) {
        throw err;
      }

      if (isAbort) {
        throw new ApiError(
          'Request timed out. The backend on Render may be completing a cold start. Please try again.',
          408,
          'Request Timeout',
          null,
          true
        );
      }

      const isNetworkFailure = err instanceof TypeError && err.message.toLowerCase().includes('fetch');
      if (isNetworkFailure) {
        const coldStartHint = elapsed > 4000
          ? ' The server may be waking up after inactivity on Render.'
          : '';
        throw new ApiError(
          `Unable to connect to the X-Beauty server.${coldStartHint} Please verify backend connectivity.`,
          0,
          'Network Error',
          null,
          elapsed > 4000
        );
      }

      throw new ApiError(
        err instanceof Error ? err.message : 'An unexpected error occurred while contacting the server.'
      );
    }
  };

  if (isGet) {
    const promise = execRequest().finally(() => {
      inFlightRequests.delete(url);
    });
    inFlightRequests.set(url, promise);
    return promise;
  }

  return execRequest();
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type UserData = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type AppointmentData = {
  fullName: string;
  phone: string;
  email?: string | null;
  service: string;
  stylist?: string | null;
  date: string; // YYYY-MM-DD
  time: string;
  notes?: string | null;
  consent: boolean;
};

export type AppointmentResponse = {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  service: string;
  stylist: string | null;
  date: string;
  time: string;
  notes: string | null;
  consent: boolean;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
  created_at: string;
};

export type MessageData = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
};

export type MessageResponse = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type ServiceResponse = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  duration: string | null;
  price: string;
  is_active: boolean;
  created_at: string;
};

export type StylistResponse = {
  id: number;
  name: string;
  specialty: string;
  experience: string | null;
  bio: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
};

export type OfferResponse = {
  id: number;
  title: string;
  description: string | null;
  price: string;
  badge: string | null;
  features: string | null;
  is_active: boolean;
  created_at: string;
};

export type DashboardOverview = {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  unreadMessages: number;
  activeServices: number;
  activeStylists: number;
  activeOffers: number;
};

export type DashboardActivity = {
  bookingsThisWeek: number;
  messagesThisWeek: number;
  recentBookings: Array<{
    id: number;
    name: string;
    service: string;
    date: string;
    time: string;
    status: string;
  }>;
};

// ==========================================
// CENTRALIZED API EXPORTS
// ==========================================

export const api = {
  // Health
  checkHealth: () => request<{ status: string; message: string }>('/api/health'),

  // Auth
  login: (email: string, password: string) =>
    request<{
      access_token: string;
      token_type: string;
      user: UserData;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
      skipAuth: true,
    }),

  getMe: () => request<UserData>('/api/auth/me'),

  logout: () => {
    clearAuthSession();
  },

  // Bookings
  createBooking: (data: AppointmentData) => {
    // Sanitize payload to match FastAPI / Pydantic contract (EmailStr fails on "")
    const sanitized = {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email && data.email.trim() ? data.email.trim() : null,
      service: data.service.trim(),
      stylist: data.stylist && data.stylist.trim() ? data.stylist.trim() : null,
      date: data.date,
      time: data.time.trim(),
      notes: data.notes && data.notes.trim() ? data.notes.trim() : null,
      consent: Boolean(data.consent),
    };
    return request<AppointmentResponse>('/api/bookings/', {
      method: 'POST',
      body: JSON.stringify(sanitized),
    });
  },

  getBookings: () => request<AppointmentResponse[]>('/api/bookings'),

  getBooking: (id: number) => request<AppointmentResponse>(`/api/bookings/${id}`),

  updateBookingStatus: (
    id: number,
    status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed'
  ) =>
    request<AppointmentResponse>(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteBooking: (id: number) =>
    request<{ message: string }>(`/api/bookings/${id}`, {
      method: 'DELETE',
    }),

  // Messages
  createMessage: (data: MessageData) => {
    const sanitized = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone && data.phone.trim() ? data.phone.trim() : null,
      message: data.message.trim(),
    };
    return request<MessageResponse>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(sanitized),
    });
  },

  getMessages: () => request<MessageResponse[]>('/api/messages'),

  markMessageRead: (id: number) =>
    request<MessageResponse>(`/api/messages/${id}/read`, {
      method: 'PATCH',
    }),

  // Services
  getServices: () => request<ServiceResponse[]>('/api/services'),

  getAdminServices: () => request<ServiceResponse[]>('/api/services/admin'),

  // Stylists
  getStylists: () => request<StylistResponse[]>('/api/stylists'),

  getAdminStylists: () => request<StylistResponse[]>('/api/stylists/admin'),

  // Offers
  getOffers: () => request<OfferResponse[]>('/api/offers'),

  getAdminOffers: () => request<OfferResponse[]>('/api/offers/admin'),

  // Dashboard
  getDashboardOverview: () => request<DashboardOverview>('/api/dashboard/overview'),

  getDashboardActivity: () => request<DashboardActivity>('/api/dashboard/activity'),
};