'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Lock, Mail, AlertCircle, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      // Redirect based on role or home
      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-md text-white mb-2">
            <Home size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tenant Management System
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to access your tenant dashboard or admin panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-gray-100 bg-gray-50 -mx-8 -mb-8 p-4 rounded-b-2xl text-xs text-gray-600">
            <div className="font-semibold text-gray-800 mb-1">Default Initial Credentials:</div>
            <div className="font-mono text-gray-600">Admin: admin@rental.com</div>
            <div className="font-mono text-gray-600">Password: admin123</div>
            <p className="mt-1.5 text-gray-400">
              New user accounts can be generated inside the Admin Panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
