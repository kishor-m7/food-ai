import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DonationCard } from '../components/DonationCard';
import { RequestModal } from '../components/RequestModal';
import { DonationDetailModal } from '../components/DonationDetailModal';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const Marketplace = () => {
  const { currentUser } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('active');

  // Modals
  const [selectedListing, setSelectedListing] = useState(null);
  const [requestModalListing, setRequestModalListing] = useState(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listDonations({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        search: searchQuery || undefined
      });
      setListings(data || []);
    } catch (err) {
      console.error("Marketplace fetch error:", err);
      setError(err.message || 'Failed to load surplus food marketplace from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleRequestSubmit = async (requestData) => {
    if (!requestModalListing) return;
    setRequestSubmitting(true);
    setRequestError(null);
    try {
      await api.requestDonation(currentUser.id, requestModalListing.id, requestData);
      setRequestSuccess(`Successfully requested claim for "${requestModalListing.title}"!`);
      setRequestModalListing(null);
      fetchListings();
    } catch (err) {
      setRequestError(err.message || 'Failed to submit claim request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const categories = ['All', 'Fresh Produce', 'Bakery', 'Dairy', 'Prepared Meals', 'Canned Goods', 'Packaged'];
  const statuses = [
    { label: 'Available Active', value: 'active' },
    { label: 'Claim Requested', value: 'claim_requested' },
    { label: 'Claimed / Completed', value: 'claimed' },
    { label: 'All Statuses', value: 'All' }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Community Surplus Marketplace</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find Food Surplus</h1>
          <p className="text-sm text-slate-500">Browse available surplus food listings across local donors and kitchens.</p>
        </div>

        <button
          onClick={fetchListings}
          className="self-start md:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Listings</span>
        </button>
      </div>

      {/* Global Alerts */}
      {requestSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-bold shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{requestSuccess}</span>
          </div>
          <button onClick={() => setRequestSuccess(null)} className="text-slate-400 hover:text-slate-600 text-xs">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name, category, or location..."
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Status:</span>
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setSelectedStatus(st.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                selectedStatus === st.value
                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-xs font-bold">Querying surplus food listings from FastAPI backend...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">No Surplus Listings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No items matched your search criteria. Try selecting a different category or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <DonationCard
              key={listing.id}
              listing={listing}
              currentUserId={currentUser.id}
              onViewDetails={setSelectedListing}
              onRequest={setRequestModalListing}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DonationDetailModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onRequest={setRequestModalListing}
        currentUserId={currentUser.id}
      />

      <RequestModal
        listing={requestModalListing}
        isOpen={!!requestModalListing}
        onClose={() => setRequestModalListing(null)}
        onSubmit={handleRequestSubmit}
        submitting={requestSubmitting}
        error={requestError}
      />

    </div>
  );
};
