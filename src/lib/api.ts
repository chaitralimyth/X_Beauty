const API_BASE_URL = 'http://127.0.0.1:8000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || 'Something went wrong'
    );
  }

  return data;
}

export type AppointmentData = {
  fullName: string;
  phone: string;
  email: string;
  service: string;
  stylist: string;
  date: string;
  time: string;
  notes: string;
  consent: boolean;
};

export type MessageData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export const api = {
  createBooking: (data: AppointmentData) =>
    request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createMessage: (data: MessageData) =>
    request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<{
      access_token: string;
      token_type: string;
      user: {
        id: number;
        name: string;
        email: string;
        role: string;
      };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    }),
};