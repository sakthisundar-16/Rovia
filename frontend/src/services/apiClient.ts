/**
 * Authenticated HTTP client for the ROVIA FastAPI backend.
 * Stores / retrieves JWT tokens from localStorage.
 * All API calls go through this client so auth is automatic.
 */

const API_BASE = ((import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'rovia_access_token';
const REFRESH_KEY = 'rovia_refresh_token';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = (): string | null => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setTokens = (access: string, refresh: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  } catch {}
};
export const clearTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
};

// ─── Category mapping: frontend string → backend enum ─────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  'Camera & Cinema': 'CAMERA',
  'Cameras & Cinema': 'CAMERA',
  'Heavy Machinery': 'HEAVY_MACHINERY',
  'Designer Fashion': 'DESIGNER_FASHION',
  'Vehicles & Mobility': 'VEHICLES',
  'Electronics': 'ELECTRONICS',
  'Laptops': 'LAPTOP',
  'Projectors': 'PROJECTOR',
  'Audio': 'AUDIO',
  'Generators': 'GENERATOR',
  'Event Supplies': 'EVENT_SUPPLIES',
  'Medical Equipment': 'MEDICAL_EQUIPMENT',
  'Outdoor & Camping': 'OUTDOOR_CAMPING',
};

export const toBackendCategory = (cat: string): string => {
  return CATEGORY_MAP[cat] ?? cat.toUpperCase().replace(/[^A-Z0-9]/g, '_');
};

export const fromBackendCategory = (cat: string): string => {
  const inverse: Record<string, string> = Object.fromEntries(
    Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
  );
  return inverse[cat] ?? cat;
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  /** Login with email/password → returns { access_token, refresh_token } or null */
  login: async (email: string, password: string): Promise<{ access_token: string; refresh_token: string } | null> => {
    try {
      // Backend uses OAuth2PasswordRequestForm — needs form-encoded body
      const body = new URLSearchParams({ username: email, password });
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data.access_token, data.refresh_token);
        return data;
      }
    } catch {}
    return null;
  },

  /** Get current user info from backend */
  me: async (): Promise<any | null> => {
    try {
      const res = await apiFetch('/auth/me');
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  /** Register a new user + organization */
  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    organization_name: string;
    organization_slug: string;
  }): Promise<any | null> => {
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },
};

export { API_BASE };
