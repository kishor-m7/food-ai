import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { DonationCard } from '../components/DonationCard';
import { RequestModal } from '../components/RequestModal';
import { DonationDetailModal } from '../components/DonationDetailModal';
import {
  Scan,
  PlusCircle,
  ShoppingBag,
  TrendingUp,
  Leaf,
  Utensils,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [scans, setScans] = useState([]);

  // Modal states
  const [selectedListing, setSelectedListing] = useState(null);
  const [requestModalListing, setRequestModalListing] = useState(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, donationsRes, scansRes] = await Promise.all([
        api.getAdminStats(currentUser.id),
        api.listDonations(),
        api.getScans(currentUser.id).catch(() => [])
      ]);
      setStats(statsRes);
      setDonations(donationsRes || []);
      setScans(scansRes || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || 'Failed to load dashboard data from FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const handleRequestSubmit = async (requestData) => {
    if (!requestModalListing) return;
    setRequestSubmitting(true);
    setRequestError(null);
    try {
      await api.requestDonation(currentUser.id, requestModalListing.id, requestData);
      setRequestSuccess(`Successfully requested claim for "${requestModalListing.title}"!`);
      setRequestModalListing(null);
      fetchData(); // Refresh dataset
    } catch (err) {
      setRequestError(err.message || 'Failed to submit claim request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const activeDonations = donations.filter(d => d.status === 'active');
  const totalKg = donations.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalMeals = donations.reduce((acc, curr) => acc + (curr.meals_yield || 0), 0);
  const co2eSaved = (totalKg * 2.5).toFixed(1);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Surplus Food Management</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            Organizing food surplus redistribution, preventing food waste, and powering AI vision food scans across the local network.
          </p>

          {/* Quick Actions */}
          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              to="/scanner"
              className="px-4 py-2.5 bg-lime-400 hover:bg-lime-500 text-emerald-950 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center space-x-2"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Food with AI</span>
            </Link>
            <Link
              to="/donate"
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-lime-400" />
              <span>Donate Surplus</span>
            </Link>
            <Link
              to="/marketplace"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Decorative Leaf Glow */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Leaf className="w-96 h-96 text-lime-400" />
        </div>
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
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="AI Food Scans"
          value={loading ? '...' : (scans.length || stats?.totalScans || 0)}
          unit="scans"
          icon={Scan}
          color="emerald"
          description="Verified PyTorch predictions"
        />
        <StatCard
          title="Available Surplus"
          value={loading ? '...' : activeDonations.length}
          unit="listings"
          icon={ShoppingBag}
          color="lime"
          description="Active surplus food on marketplace"
        />
        <StatCard
          title="Meals Provider Yield"
          value={loading ? '...' : totalMeals}
          unit="meals"
          icon={Utensils}
          color="blue"
          description="Rescued produce meal yield"
        />
        <StatCard
          title="CO2e Emissions Prevented"
          value={loading ? '...' : co2eSaved}
          unit="kg CO2e"
          icon={TrendingUp}
          color="amber"
          description="Calculated waste reduction"
        />
      </div>

      {/* Available Surplus Marketplace Preview & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Marketplace Food Cards (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Active Food Surplus Listings</h2>
              <p className="text-xs text-slate-500">Real-time surplus food available from local donors</p>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center space-x-1"
            >
              <span>View All ({activeDonations.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center space-x-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
              <span className="text-xs font-bold">Loading surplus listings from backend...</span>
            </div>
          ) : activeDonations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No active surplus listings found</p>
              <p className="text-xs text-slate-400">Be the first to create a food surplus donation!</p>
              <Link
                to="/donate"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Donation</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {activeDonations.slice(0, 4).map((listing) => (
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
        </div>

        {/* Recent Activity & AI Scans Column */}
        <div className="space-y-6">
          
          {/* Quick AI Scanner Feature Card */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-6 text-white space-y-4 shadow-lg border border-emerald-900">
            <div className="flex items-center space-x-2 text-lime-400">
              <Scan className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase tracking-wider">AI Food Vision</span>
            </div>
            <h3 className="text-base font-extrabold">Instant Food Recognition</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload an image of produce or meals to automatically identify class, confidence score, freshness tier, and pre-fill donation listings.
            </p>
            <Link
              to="/scanner"
              className="w-full py-2.5 bg-lime-400 hover:bg-lime-500 text-emerald-950 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Open Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recent Scans History Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Recent AI Scans</span>
            </h3>

            {scans.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No food scans recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {scans.slice(0, 4).map((scan) => (
                  <div key={scan.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 capitalize">{scan.display_name || scan.food_name}</p>
                      <span className="text-[10px] text-slate-400">{new Date(scan.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-700">{scan.confidence}%</span>
                      <span className="block text-[10px] font-medium text-slate-500">{scan.freshness_score}% Fresh</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

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
