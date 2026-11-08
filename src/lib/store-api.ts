export interface StoreUser {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}

export interface StoreOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
}

export type CheckoutResult = StoreOrder | {
  orderId: string;
  txRef: string;
  paymentUrl: string;
};

const TOKEN_KEY = 'wende_store_token';
type AuthListener = (state: { user: StoreUser | null; isLoading: boolean }) => void;
const authListeners = new Set<AuthListener>();

function getToken() {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
}

function setSession(token: string | null, user: StoreUser | null) {
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  }
  authListeners.forEach((listener) => listener({ user, isLoading: false }));
}

export async function apiRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new Error('Could not reach the store server. Make sure the API is running and try again.');
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'The request could not be completed.') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return data as T;
}

const resourceNames = [
  'collections',
  'products',
  'productVariants',
  'cartItems',
  'wishlist',
  'orders',
  'orderItems',
  'returns',
] as const;

const db = Object.fromEntries(resourceNames.map((resource) => [
  resource,
  {
    list: ({ where, limit, orderBy }: { where?: Record<string, unknown>; limit?: number; orderBy?: Record<string, string> } = {}) => {
      const params = new URLSearchParams();
      if (where) params.set('where', JSON.stringify(where));
      if (limit) params.set('limit', String(limit));
      if (orderBy) params.set('orderBy', JSON.stringify(orderBy));
      const query = params.size ? `?${params}` : '';
      return apiRequest<any[]>(`/api/${resource}${query}`);
    },
    create: (input: Record<string, unknown>) => apiRequest<any>(`/api/${resource}`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
    update: (id: string, input: Record<string, unknown>) => apiRequest<any>(`/api/${resource}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
    delete: (id: string) => apiRequest<void>(`/api/${resource}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  },
])) as Record<typeof resourceNames[number], any>;

export const storeApi = {
  db,
  api: {
    createOrder: (shippingAddress: Record<string, string>, paymentMethod: 'cash_on_delivery' | 'chapa' = 'cash_on_delivery') => apiRequest<CheckoutResult>('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod }),
    }),
    getChapaStatus: () => apiRequest<{ available: boolean }>('/api/payments/chapa/status'),
    verifyChapaPayment: (txRef: string) => apiRequest<StoreOrder>(`/api/payments/chapa/verify/${encodeURIComponent(txRef)}`),
  },
  auth: {
    onAuthStateChanged(listener: AuthListener) {
      authListeners.add(listener);
      return () => {
        authListeners.delete(listener);
      };
    },
    async getCurrentUser() {
      if (!getToken()) return null;
      try {
        const { user } = await apiRequest<{ user: StoreUser }>('/api/auth/me');
        return user;
      } catch (error) {
        if ((error as Error & { status?: number }).status === 401) {
          setSession(null, null);
          return null;
        }
        throw error;
      }
    },
    async signUp(data: { email: string; password: string; displayName: string }) {
      const result = await apiRequest<{ user: StoreUser; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setSession(result.token, result.user);
      return result.user;
    },
    async signInWithEmail(email: string, password: string) {
      const result = await apiRequest<{ user: StoreUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession(result.token, result.user);
      return result.user;
    },
    signOut() {
      setSession(null, null);
    },
    login(returnTo?: string) {
      if (typeof window === 'undefined') return;
      const requestedPath = returnTo ? new URL(returnTo, window.location.origin) : null;
      const redirectTo = requestedPath?.origin === window.location.origin
        ? `${requestedPath.pathname}${requestedPath.search}${requestedPath.hash}`
        : '/account';
      window.location.assign(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    },
  },
};
