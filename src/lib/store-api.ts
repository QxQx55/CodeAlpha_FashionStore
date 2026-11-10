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
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? '';
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
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not reach the store server. Make sure the API is running and try again.');
  }

  if (response.status === 204) return undefined as T;
  if (!response.headers.get('content-type')?.toLowerCase().includes('json')) {
    throw new Error(response.ok
      ? 'The store API returned a webpage instead of data. Check the Vercel API URL configuration.'
      : `The store API is unavailable (HTTP ${response.status}). Check the API deployment.`);
  }
  const data = await response.json();
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
      return apiRequest<unknown>(`/api/${resource}${query}`).then((data) => {
        if (!Array.isArray(data)) throw new Error(`The store API returned an invalid ${resource} list.`);
        return data;
      });
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
    uploadProductImage: (file: File) => apiRequest<{ imageUrl: string }>('/api/admin/product-images', {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    }),
    createOrder: (
      shippingAddress: Record<string, string>,
      paymentMethod: 'cash_on_delivery' | 'chapa' | 'demo' = 'cash_on_delivery',
      demoChannel?: 'telebirr' | 'cbe_birr' | 'card',
    ) => apiRequest<CheckoutResult>('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod, demoChannel }),
    }),
    getChapaStatus: () => apiRequest<{
      available: boolean;
      sandbox: boolean;
      checkoutAvailable: boolean;
      demoCheckoutAvailable: boolean;
      storeMode: 'preview' | 'live';
      previewMode: boolean;
    }>('/api/payments/chapa/status'),
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
