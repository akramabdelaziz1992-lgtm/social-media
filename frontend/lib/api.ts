const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function api<T = any>(path: string, options?: ApiOptions): Promise<T> {
  const { token, ...opts } = options || {};
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (opts.headers) {
    Object.assign(headers, opts.headers);
  }

  // Get token from localStorage if not provided
  if (typeof window !== 'undefined') {
    const storedToken = token || localStorage.getItem('accessToken');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    api('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

// Users APIs
export const usersApi = {
  getMe: () => api('/users/me'),
  getAll: () => api('/users'),
  getOne: (id: string) => api(`/users/${id}`),
};

// Channels APIs
export const channelsApi = {
  getAll: () => api('/channels'),
  getOne: (id: string) => api(`/channels/${id}`),
  create: (data: any) => api('/channels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    api(`/channels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/channels/${id}`, { method: 'DELETE' }),
  connect: (id: string) => api(`/channels/${id}/connect`, { method: 'POST' }),
  disconnect: (id: string) => api(`/channels/${id}/disconnect`, { method: 'POST' }),
};

// Conversations APIs
export const conversationsApi = {
  getAll: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api(`/conversations${query}`);
  },
  getOne: (id: string) => api(`/conversations/${id}`),
  assign: (conversationId: string, userId: string) =>
    api('/conversations/assign', {
      method: 'POST',
      body: JSON.stringify({ conversationId, userId }),
    }),
  transfer: (conversationId: string, toUserId: string, toDepartment?: string) =>
    api('/conversations/transfer', {
      method: 'POST',
      body: JSON.stringify({ conversationId, toUserId, toDepartment }),
    }),
};

// Messages APIs
export const messagesApi = {
  getAll: (conversationId: string) => api(`/messages?conversationId=${conversationId}`),
  send: (data: any) => api('/messages', { method: 'POST', body: JSON.stringify(data) }),
};

// Templates APIs
export const templatesApi = {
  getAll: () => api('/templates'),
  getOne: (id: string) => api(`/templates/${id}`),
  create: (data: any) => api('/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    api(`/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/templates/${id}`, { method: 'DELETE' }),
};

// Auto Reply APIs
export const autoReplyApi = {
  getRules: () => api('/auto-reply/rules'),
  getOne: (id: string) => api(`/auto-reply/rules/${id}`),
  create: (data: any) => api('/auto-reply/rules', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    api(`/auto-reply/rules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/auto-reply/rules/${id}`, { method: 'DELETE' }),
};
