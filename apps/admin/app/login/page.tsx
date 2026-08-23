'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, session, loading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace('/');
    }
  }, [loading, router, session]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <img
          src="/brand/BiteMate-logo.png"
          srcSet="/brand/lockup-320.png 320w, /brand/lockup-512.png 512w, /brand/lockup-1024.png 1024w"
          sizes="180px"
          alt="BiteMate — Meet. Eat. Enjoy Together."
          className="mx-auto mb-4 w-44"
        />
        <p className="text-center text-xs uppercase tracking-[0.25em] text-brand">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Role-based access for platform staff only.</p>

        <label className="mt-6 block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand"
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand"
        />

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-brand py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
