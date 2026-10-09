import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  ShieldCheck,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Loader2,
  RefreshCw,
  UserX,
  UserCheck,
  Trash2,
  Lock,
  FileText,
  RotateCcw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const Admin = () => {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [logs, setLogs] = useState([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, listingsRes, logsRes] = await Promise.all([
        api.getAdminStats(currentUser.id),
        api.listUsers(currentUser.id),
        api.listDonations({ status: 'All' }),
        api.getAuditLogs(currentUser.id).catch(() => [])
      ]);
      setStats(statsRes);
      setUsers(usersRes || []);
      setListings(listingsRes || []);
      setLogs(logsRes || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
      setError(err.message || 'Failed to retrieve administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [currentUser.id]);

  const handleToggleUserStatus = async (userId, userName) => {
    setActionLoading(true);
    setError(null);
    try {
      await api.toggleUserStatus(currentUser.id, userId);
      setActionSuccess(`Successfully updated user status for "${userName}".`);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to toggle user status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteListing = async (listingId, title) => {
    if (!window.confirm(`Are you sure you want to delete listing "${title}"?`)) return;
    setActionLoading(true);
    setError(null);
    try {
      await api.deleteDonation(currentUser.id, listingId);
      setActionSuccess(`Successfully deleted listing "${title}".`);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDemoData = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await api.resetDemoData(currentUser.id);
      setActionSuccess("Prototype database successfully reset to baseline demo dataset!");
      setResetConfirmOpen(false);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to reset prototype dataset.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Admin Console Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrative Privileges Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Admin Console</h1>
          <p className="text-sm text-slate-500">Platform operations, audit logging, user access controls, and database administration.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Console</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-bold shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-slate-600">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Users"
          value={loading ? '...' : stats?.totalUsers || users.length}
          unit="users"
          icon={Users}
          color="emerald"
          description={`${stats?.adminCount || 1} Admins, ${stats?.userCount || 0} Users`}
        />
        <StatCard
          title="Total Rescued Food"
          value={loading ? '...' : stats?.totalKgRescued || 0}
          unit="kg"
          icon={ShoppingBag}
          color="lime"
          description={`Yielding ~${stats?.totalMealsRescued || 0} meals`}
        />
        <StatCard
          title="Active Surplus Listings"
          value={loading ? '...' : stats?.activeListings || 0}
          unit="active"
          icon={ShoppingBag}
          color="blue"
          description={`From ${stats?.totalListings || 0} total listings`}
        />
        <StatCard
          title="CO2e Emissions Saved"
          value={loading ? '...' : stats?.co2eSavedTonnes || '0.0'}
          unit="Tonnes"
          icon={TrendingUp}
          color="amber"
          description="Environmental waste reduction"
        />
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-xs font-bold">Fetching admin console records...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* User Management Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">User Account Administration</h3>
                <p className="text-xs text-slate-500">Manage registered accounts and permission status.</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                {users.length} Registered Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="px-4 py-3">User Profile</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                          <div>
                            <p className="font-extrabold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.organization || 'Individual Donor'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{u.joined_date}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.name)}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Donation Listings Management Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Donation Listings Moderation</h3>
                <p className="text-xs text-slate-500">Monitor and delete reported or flagged listings.</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                {listings.length} Listings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="px-4 py-3">Listing Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Donor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-extrabold text-slate-900">{l.title}</td>
                      <td className="px-4 py-3 text-slate-600">{l.category}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{l.quantity} {l.quantity_unit}</td>
                      <td className="px-4 py-3 text-slate-700">{l.donor_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-800 uppercase">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteListing(l.id, l.title)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 hover:bg-rose-100 transition-all inline-flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Table */}
          {logs.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>Security Audit Logs</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                    <tr>
                      <th className="px-4 py-2.5">Action</th>
                      <th className="px-4 py-2.5">Details</th>
                      <th className="px-4 py-2.5">User</th>
                      <th className="px-4 py-2.5">Severity</th>
                      <th className="px-4 py-2.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-900">{log.action}</td>
                        <td className="px-4 py-2.5 text-slate-600">{log.details}</td>
                        <td className="px-4 py-2.5 text-slate-800">{log.user}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            log.severity === 'success' ? 'bg-emerald-100 text-emerald-800' :
                            log.severity === 'warn' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Confirmation Modal for Reset Demo */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Reset Prototype Dataset?</h3>
              <p className="text-xs text-slate-500">
                This command drops and recreates SQLite tables, re-seeding the baseline prototype data.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDemoData}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                {actionLoading ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
