import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Field } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { User } from '../lib/types';

const DEMO = { email: 'demo@raildesk.dev', password: 'Demo@1234' };

type Mode = 'login' | 'register';

export default function AuthPage({ mode }: { mode: Mode }) {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const m = useMutation({
    mutationFn: (body: object) => api<{ token: string; user: User }>(`/api/auth/${mode}`, { method: 'POST', body }),
    onSuccess: ({ token, user }) => {
      signIn(token, user);
      toast.success(mode === 'login' ? `Welcome back, ${user.name.split(' ')[0]}` : 'Account created');
      navigate(from, { replace: true });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.details) {
        setFieldErrors(Object.fromEntries(err.details.map((d) => [d.path, d.message])));
      }
    },
  });

  if (user) return <Navigate to={from} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    m.mutate(mode === 'login' ? { email: form.email, password: form.password } : form);
  };
  const field = (k: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <Field
      id={k}
      name={k}
      label={label}
      value={form[k]}
      error={fieldErrors[k]}
      onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
      {...props}
    />
  );

  const formError = m.error && !(m.error instanceof ApiError && m.error.details) ? m.error : null;

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {mode === 'login' ? 'Sign in' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === 'login' ? 'Sign in to book seats and manage your tickets.' : 'It takes less than a minute.'}
        </p>

        {mode === 'login' && (
          <div className="mt-5 rounded-md border border-marigold-500/40 bg-marigold-100 p-3 text-sm">
            <p className="font-semibold">Just exploring?</p>
            <p className="text-marigold-700">
              Use the demo account <span className="font-mono">{DEMO.email}</span>
            </p>
            <button
              type="button"
              className="mt-2 font-semibold text-navy-700 underline underline-offset-4"
              onClick={() => setForm((f) => ({ ...f, ...DEMO }))}
            >
              Fill in demo credentials
            </button>
          </div>
        )}

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {mode === 'register' && field('name', 'Full name', { autoComplete: 'name', required: true })}
          {field('email', 'Email', { type: 'email', autoComplete: 'email', required: true })}
          {field('password', 'Password', {
            type: 'password',
            autoComplete: mode === 'login' ? 'current-password' : 'new-password',
            required: true,
            minLength: mode === 'register' ? 8 : undefined,
          })}
          {mode === 'register' && field('phone', 'Mobile (optional)', { type: 'tel', autoComplete: 'tel' })}
          {formError && (
            <p role="alert" className="rounded-md bg-stop-50 px-3 py-2 text-sm font-semibold text-stop-700">
              {formError instanceof ApiError ? formError.message : 'Something went wrong'}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={m.isPending}>
            {m.isPending
              ? mode === 'login'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === 'login' ? 'New to RailDesk? ' : 'Already have an account? '}
          <Link
            to={mode === 'login' ? '/register' : '/login'}
            state={{ from }}
            className="font-semibold text-navy-700 underline-offset-4 hover:underline"
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
