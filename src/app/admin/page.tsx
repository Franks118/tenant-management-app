'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  UserPlus,
  Users,
  Trash2,
  RefreshCw,
  X,
  LogOut,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Key,
  Mail,
  User,
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  tenantId?: string | null;
  tenant?: { id: string; name: string; email: string } | null;
  createdAt: string;
}

interface TenantOption {
  id: string;
  name: string;
  email: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export default function AdminPanel() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    tenantId: '',
  });

  // Verify auth session
  const verifyAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!data.user || data.user.role !== 'ADMIN') {
        setError('Access denied: Admin credentials required.');
        setLoading(false);
        return;
      }
      setCurrentUser(data.user);
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Load all user records and tenant options
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, tenantsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/tenants'),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
    loadData();
  }, [verifyAuth, loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          tenantId: form.tenantId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user account');
      }

      setSuccess(`Account created successfully for ${data.name} (${data.email})`);
      setForm({ name: '', email: '', password: '', role: 'USER', tenantId: '' });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the account for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      setSuccess(`Account for ${name} deleted.`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (!loading && (!currentUser || currentUser.role !== 'ADMIN')) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-4">
          <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full">
            <Shield size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-sm text-gray-500">
            This administration panel requires an account with Administrator privileges.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const userCount = users.filter((u) => u.role === 'USER').length;

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Admin Panel — User Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  Admin Scope
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Create and manage user accounts and assign system roles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              <ArrowLeft size={16} />
              Rental Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <CheckCircle size={18} className="shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Accounts
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{users.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administrators
            </div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{adminCount}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Standard Users
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{userCount}</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-xs"
          >
            {showForm ? <X size={16} /> : <UserPlus size={16} />}
            {showForm ? 'Cancel Form' : 'Create User Account'}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Create User Form Panel */}
        {showForm && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Register New User Account
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Generate account credentials and configure access permissions.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="e.g. jane@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Initial password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="USER">User (Standard Access)</option>
                  <option value="ADMIN">Admin (Full Administrative Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link to Existing Tenant (Optional)
                </label>
                <select
                  value={form.tenantId}
                  onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">No Linked Tenant Profile</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Save Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* User Accounts Table */}
        <section className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Registered User Accounts
              </h2>
              <p className="text-xs text-gray-500">
                Accounts authorized to authenticate into the system
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Linked Tenant</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No user accounts found. Click &quot;Create User Account&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name.slice(0, 2)}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] text-indigo-600 font-medium">
                              (You)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-xs">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-xs">
                        {u.tenant ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                            <Users size={12} />
                            {u.tenant.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="p-4">
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="Delete user"
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
