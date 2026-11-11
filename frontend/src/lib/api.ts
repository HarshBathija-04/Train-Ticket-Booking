const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:5130').replace(/\/$/, '');
const TOKEN_KEY = 'raildesk.token';
const SLOW_AFTER_MS = 3500;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string | null) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage blocked: session lasts for this tab only */
    }
  },
};

// Render's free tier sleeps when idle; tell the UI when a request is taking cold-start long.
let slowCount = 0;
const slowListeners = new Set<(slow: boolean) => void>();
const emitSlow = () => slowListeners.forEach((fn) => fn(slowCount > 0));
export function subscribeSlow(fn: (slow: boolean) => void) {
  slowListeners.add(fn);
  return () => void slowListeners.delete(fn);
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = tokenStore.get();
  let flagged = false;
  const timer = setTimeout(() => {
    flagged = true;
    slowCount++;
    emitSlow();
  }, SLOW_AFTER_MS);
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method: init.method ?? 'GET',
      headers: {
        ...(init.body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Could not reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
    if (flagged) {
      slowCount--;
      emitSlow();
    }
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error;
    throw new ApiError(
      res.status,
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? `Request failed (${res.status})`,
      err?.details,
    );
  }
  return data as T;
}
