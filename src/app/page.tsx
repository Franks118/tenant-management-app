'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Building2,
  FileText,
  Wrench,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Home,
  AlertCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  leases?: Lease[];
  _count?: { maintenance: number };
}

interface Property {
  id: string;
  name: string;
  address: string;
  units: Unit[];
  createdAt: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  propertyId: string;
  property?: Property;
  _count?: { leases: number };
}

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
  tenantId: string;
  tenant?: Tenant;
  unitId: string;
  unit?: Unit & { property?: Property };
}

interface Maintenance {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tenantId: string;
  tenant?: Tenant;
  createdAt: string;
}

type TabKey = 'tenants' | 'properties' | 'leases' | 'maintenance';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
  TERMINATED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

function Badge({ text, colorMap }: { text: string; colorMap: Record<string, string> }) {
  return (
    <span
      className={`px-2.5 py-1 text-xs rounded-full font-semibold ${colorMap[text] || 'bg-gray-100 text-gray-600'}`}
    >
      {text}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('tenants');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (tab: TabKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/${tab}`);
      if (!res.ok) throw new Error(`Failed to fetch ${tab}`);
      const data = await res.json();
      switch (tab) {
        case 'tenants':
          setTenants(data);
          break;
        case 'properties':
          setProperties(data);
          break;
        case 'leases':
          setLeases(data);
          break;
        case 'maintenance':
          setMaintenance(data);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleDelete = async (tab: TabKey, id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`/api/${tab}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchData(tab);
    } catch {
      setError('Failed to delete record');
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'tenants', label: 'Tenants', icon: <Users size={18} />, count: tenants.length },
    { key: 'properties', label: 'Properties', icon: <Building2 size={18} />, count: properties.length },
    { key: 'leases', label: 'Leases', icon: <FileText size={18} />, count: leases.length },
    { key: 'maintenance', label: 'Maintenance', icon: <Wrench size={18} />, count: maintenance.length },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Home size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Tenant Management Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Manage tenant records, properties, leases, and maintenance requests.
              </p>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setShowForm(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : `Add ${tabs.find((t) => t.key === activeTab)?.label.slice(0, -1)}`}
          </button>
          <button
            onClick={() => fetchData(activeTab)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <FormPanel
            tab={activeTab}
            tenants={tenants}
            properties={properties}
            onSuccess={() => {
              setShowForm(false);
              fetchData(activeTab);
            }}
            onError={setError}
          />
        )}

        {/* Data Tables */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-gray-400">
              <RefreshCw size={24} className="animate-spin mr-3" />
              Loading...
            </div>
          ) : (
            <>
              {activeTab === 'tenants' && (
                <TenantsTable tenants={tenants} onDelete={(id) => handleDelete('tenants', id)} />
              )}
              {activeTab === 'properties' && (
                <PropertiesTable
                  properties={properties}
                  onDelete={(id) => handleDelete('properties', id)}
                />
              )}
              {activeTab === 'leases' && (
                <LeasesTable leases={leases} onDelete={(id) => handleDelete('leases', id)} />
              )}
              {activeTab === 'maintenance' && (
                <MaintenanceTable
                  tickets={maintenance}
                  onDelete={(id) => handleDelete('maintenance', id)}
                  onStatusChange={(id, status) => handleStatusUpdate(id, status, fetchData)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// ─── Form Panel ──────────────────────────────────────────────────────────────

function FormPanel({
  tab,
  tenants,
  properties,
  onSuccess,
  onError,
}: {
  tab: TabKey;
  tenants: Tenant[];
  properties: Property[];
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    // For properties, parse units
    let payload: Record<string, unknown> = body;
    if (tab === 'properties' && body.units) {
      const unitNumbers = body.units
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);
      payload = { ...body, units: unitNumbers.map((u) => ({ unitNumber: u })) };
    }

    try {
      const res = await fetch(`/api/${tab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create record');
      }
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const selectClass =
    'border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white';

  const allUnits = properties.flatMap((p) =>
    p.units.map((u) => ({ ...u, propertyName: p.name }))
  );

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Add New {tab.charAt(0).toUpperCase() + tab.slice(1, -1)}
        {tab === 'maintenance' ? ' Ticket' : ''}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tab === 'tenants' && (
          <>
            <input name="name" placeholder="Full Name" required className={inputClass} />
            <input name="email" type="email" placeholder="Email Address" required className={inputClass} />
            <input name="phone" placeholder="Phone Number" required className={inputClass} />
          </>
        )}
        {tab === 'properties' && (
          <>
            <input name="name" placeholder="Property Name" required className={inputClass} />
            <input name="address" placeholder="Full Address" required className={inputClass} />
            <input
              name="units"
              placeholder="Unit Numbers (comma-separated: 1A, 1B, 2A)"
              className={inputClass}
            />
          </>
        )}
        {tab === 'leases' && (
          <>
            <select name="tenantId" required className={selectClass}>
              <option value="">Select Tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select name="unitId" required className={selectClass}>
              <option value="">Select Unit</option>
              {allUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.propertyName} — Unit {u.unitNumber}
                </option>
              ))}
            </select>
            <input
              name="rentAmount"
              type="number"
              step="0.01"
              placeholder="Monthly Rent ($)"
              required
              className={inputClass}
            />
            <input name="startDate" type="date" required className={inputClass} />
            <input name="endDate" type="date" required className={inputClass} />
          </>
        )}
        {tab === 'maintenance' && (
          <>
            <select name="tenantId" required className={selectClass}>
              <option value="">Select Tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input name="title" placeholder="Issue Title" required className={inputClass} />
            <select name="priority" className={selectClass} defaultValue="MEDIUM">
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent</option>
            </select>
            <textarea
              name="description"
              placeholder="Describe the issue in detail..."
              required
              rows={3}
              className={`${inputClass} md:col-span-3`}
            />
          </>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white font-medium p-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus size={16} />
              Save
            </>
          )}
        </button>
      </form>
    </section>
  );
}

// ─── Status Update Helper ────────────────────────────────────────────────────

async function handleStatusUpdate(
  id: string,
  status: string,
  refetch: (tab: TabKey) => Promise<void>
) {
  try {
    const res = await fetch(`/api/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    refetch('maintenance');
  } catch {
    console.error('Failed to update maintenance status');
  }
}

// ─── Tables ──────────────────────────────────────────────────────────────────

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="p-8 text-center text-gray-400">
        {message}
      </td>
    </tr>
  );
}

function TenantsTable({
  tenants,
  onDelete,
}: {
  tenants: Tenant[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Phone</th>
            <th className="p-4">Leases</th>
            <th className="p-4">Tickets</th>
            <th className="p-4">Joined</th>
            <th className="p-4 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {tenants.length === 0 ? (
            <EmptyRow cols={7} message="No tenants registered yet. Click 'Add Tenant' to get started." />
          ) : (
            tenants.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{t.name}</td>
                <td className="p-4 text-gray-600">{t.email}</td>
                <td className="p-4 text-gray-600">{t.phone}</td>
                <td className="p-4 text-gray-600">{t.leases?.length || 0}</td>
                <td className="p-4 text-gray-600">{t._count?.maintenance || 0}</td>
                <td className="p-4 text-gray-500">{formatDate(t.createdAt)}</td>
                <td className="p-4">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function PropertiesTable({
  properties,
  onDelete,
}: {
  properties: Property[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <th className="p-4">Property</th>
            <th className="p-4">Address</th>
            <th className="p-4">Units</th>
            <th className="p-4">Created</th>
            <th className="p-4 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {properties.length === 0 ? (
            <EmptyRow cols={5} message="No properties added yet." />
          ) : (
            properties.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{p.name}</td>
                <td className="p-4 text-gray-600">{p.address}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {p.units.map((u) => (
                      <span
                        key={u.id}
                        className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600"
                      >
                        {u.unitNumber}
                      </span>
                    ))}
                    {p.units.length === 0 && (
                      <span className="text-gray-400 text-xs">No units</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-500">{formatDate(p.createdAt)}</td>
                <td className="p-4">
                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LeasesTable({
  leases,
  onDelete,
}: {
  leases: Lease[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <th className="p-4">Tenant</th>
            <th className="p-4">Property / Unit</th>
            <th className="p-4">Rent</th>
            <th className="p-4">Period</th>
            <th className="p-4">Status</th>
            <th className="p-4 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {leases.length === 0 ? (
            <EmptyRow cols={6} message="No leases found. Add a property and tenant first." />
          ) : (
            leases.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{l.tenant?.name || '—'}</td>
                <td className="p-4 text-gray-600">
                  {l.unit?.property?.name || '—'} — Unit {l.unit?.unitNumber || '?'}
                </td>
                <td className="p-4 text-gray-600">{formatCurrency(l.rentAmount)}/mo</td>
                <td className="p-4 text-gray-500">
                  {formatDate(l.startDate)} → {formatDate(l.endDate)}
                </td>
                <td className="p-4">
                  <Badge text={l.status} colorMap={statusColors} />
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onDelete(l.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MaintenanceTable({
  tickets,
  onDelete,
  onStatusChange,
}: {
  tickets: Maintenance[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <th className="p-4">Title</th>
            <th className="p-4">Tenant</th>
            <th className="p-4">Priority</th>
            <th className="p-4">Status</th>
            <th className="p-4">Submitted</th>
            <th className="p-4 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {tickets.length === 0 ? (
            <EmptyRow cols={6} message="No maintenance tickets yet." />
          ) : (
            tickets.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{m.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                    {m.description}
                  </div>
                </td>
                <td className="p-4 text-gray-600">{m.tenant?.name || '—'}</td>
                <td className="p-4">
                  <Badge text={m.priority} colorMap={priorityColors} />
                </td>
                <td className="p-4">
                  <select
                    value={m.status}
                    onChange={(e) => onStatusChange(m.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </td>
                <td className="p-4 text-gray-500">{formatDate(m.createdAt)}</td>
                <td className="p-4">
                  <button
                    onClick={() => onDelete(m.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
