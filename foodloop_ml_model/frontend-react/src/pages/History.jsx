import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  History as HistoryIcon,
  Heart,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Ban
} from 'lucide-react';

export const History = () => {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('donations'); // 'donations' | 'requests'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [myDonations, setMyDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [reviewingId, setReviewingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        api.listDonations({ donor_id: currentUser.id }),
        api.listRequests(currentUser.id)
      ]);
      setMyDonations(donationsRes || []);
      setMyRequests(requestsRes || []);
    } catch (err) {
      console.error("History fetch error:", err);
      setError(err.message || 'Failed to load donation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const handleReviewAction = async (requestId, action) => {
    setReviewingId(requestId);
    setError(null);
    try {
      await api.reviewRequest(currentUser.id, requestId, action);
      fetchData();
    } catch (err) {
      setError(err.message || `Failed to perform action '${action}' on request.`);
    } finally {
      setReviewingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
      case 'pending': return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>;
      case 'completed': return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-800 border border-blue-200">Completed</span>;
      case 'rejected': return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      case 'cancelled': return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 border border-slate-200">Cancelled</span>;
      default: return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Donation & Request History</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity Log</h1>
          <p className="text-sm text-slate-500">Track listings created and claim requests submitted across your account.</p>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 max-w-md">
        <button
          onClick={() => setActiveTab('donations')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'donations'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Created Donations ({myDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'requests'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Claim Requests ({myRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-xs font-bold">Retrieving records from FastAPI backend...</p>
        </div>
      ) : activeTab === 'donations' ? (
        /* Created Donations Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          {myDonations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No donations listed by your account yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="px-6 py-4">Title & Item</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Freshness</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Active Claimant</th>
                    <th className="px-6 py-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">{d.title}</div>
                        <div className="text-[11px] text-slate-400">{d.category}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {d.quantity} {d.quantity_unit} (~{d.meals_yield} meals)
                      </td>
                      <td className="px-6 py-4 text-emerald-700 font-bold">
                        {d.freshness_score}% Score
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(d.status)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {d.active_claimant_name ? (
                          <span className="font-bold text-emerald-800">{d.active_claimant_name}</span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {new Date(d.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Claim Requests List / Table */
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No claim requests recorded.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const isDonor = req.donor_id === currentUser.id;
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';

                return (
                  <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-extrabold text-slate-900">{req.listing_title}</h4>
                        {getStatusBadge(req.status)}
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p><strong className="text-slate-800">Purpose:</strong> {req.purpose}</p>
                        <p><strong className="text-slate-800">Proposed Pickup:</strong> {req.pickup_time}</p>
                        <p className="text-slate-400 text-[11px]">
                          Donor: {req.donor_name} | Recipient: {req.claimant_name} ({req.claimant_org || 'Individual'})
                        </p>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      
                      {/* Donor Approve / Reject Controls */}
                      {isDonor && isPending && (
                        <>
                          <button
                            onClick={() => handleReviewAction(req.id, 'approve')}
                            disabled={reviewingId === req.id}
                            className="px-3.5 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-900 flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                            <span>Approve Request</span>
                          </button>

                          <button
                            onClick={() => handleReviewAction(req.id, 'reject')}
                            disabled={reviewingId === req.id}
                            className="px-3 py-2 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 hover:bg-rose-100 flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {/* Complete / Cancel Controls */}
                      {(isApproved || isPending) && (
                        <button
                          onClick={() => handleReviewAction(req.id, isApproved ? 'complete' : 'cancel')}
                          disabled={reviewingId === req.id}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center space-x-1 ${
                            isApproved
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isApproved ? 'Mark Complete' : 'Cancel Request'}</span>
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
