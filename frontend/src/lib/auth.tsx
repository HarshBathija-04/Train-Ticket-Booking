import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, tokenStore } from './api';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [token, setToken] = useState(tokenStore.get);
  const me = useQuery({
    queryKey: ['me', token],
    queryFn: async () => {
      try {
        return (await api<{ user: User }>('/api/auth/me')).user;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          tokenStore.set(null);
          setToken(null);
          return null;
        }
        throw err;
      }
    },
    enabled: !!token,
    staleTime: Infinity,
  });

  const signIn = useCallback(
    (t: string, user: User) => {
      tokenStore.set(t);
      qc.setQueryData(['me', t], user);
      setToken(t);
    },
    [qc],
  );
  const signOut = useCallback(() => {
    tokenStore.set(null);
    setToken(null);
    qc.removeQueries({ queryKey: ['bookings'] });
    qc.removeQueries({ queryKey: ['booking'] });
    qc.removeQueries({ queryKey: ['admin'] });
  }, [qc]);

  const value = useMemo(
    () => ({ user: token ? (me.data ?? null) : null, loading: !!token && me.isPending, signIn, signOut }),
    [token, me.data, me.isPending, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
