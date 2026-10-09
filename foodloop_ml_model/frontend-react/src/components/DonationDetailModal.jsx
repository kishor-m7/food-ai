import React from 'react';
import { X, MapPin, Clock, Utensils, ShieldCheck, Heart, User, Sparkles, Tag, AlertCircle } from 'lucide-react';

export const DonationDetailModal = ({ listing, isOpen, onClose, onRequest, currentUserId }) => {
  if (!isOpen || !listing) return null;

  const isMine = listing.donor_id === currentUserId;
  const isAvailable = listing.status === 'active';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Image */}
        <div className="relative h-64 bg-slate-900">
          <img
            src={listing.image_url || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1000&auto=format&fit=crop&q=80'}
            alt={listing.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase bg-lime-400 text-emerald-950 rounded-md">
                {listing.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-emerald-800/80 text-white border border-emerald-600 rounded-md">
                {listing.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">{listing.title}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Key Metric Pills */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quantity</span>
              <span className="text-base font-extrabold text-slate-900">{listing.quantity} {listing.quantity_unit}</span>
            </div>
            <div className="text-center border-x border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Yield Estimate</span>
              <span className="text-base font-extrabold text-emerald-700">~{listing.meals_yield} meals</span>
            </div>
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Freshness Score</span>
              <span className="text-base font-extrabold text-lime-600">{listing.freshness_score}% Score</span>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-4 h-4 text-emerald-700" />
                <span>Donor & Location</span>
              </h4>
              <div className="space-y-1.5 text-slate-600">
                <p><strong className="text-slate-900">Donor Name:</strong> {listing.donor_name}</p>
                {listing.donor_org && <p><strong className="text-slate-900">Organization:</strong> {listing.donor_org}</p>}
                <p className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{listing.pickup_address}</span>
                </p>
                <p className="text-emerald-700 font-semibold">{listing.distance_km} km away</p>
              </div>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Pickup & Storage</span>
              </h4>
              <div className="space-y-1.5 text-slate-600">
                <p><strong className="text-slate-900">Pickup Window:</strong> {listing.pickup_window}</p>
                <p><strong className="text-slate-900">Storage Condition:</strong> {listing.storage_condition || 'Standard Refrigeration'}</p>
                <p><strong className="text-slate-900">Freshness Tier:</strong> {listing.freshness_tier || 'Tier 1 - Optimal'}</p>
              </div>
            </div>
          </div>

          {/* Notes & Description */}
          {listing.notes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Donor Notes & Instructions</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                {listing.notes}
              </p>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Created: {new Date(listing.created_at).toLocaleDateString()}</span>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
              
              {!isMine && (
                <button
                  onClick={() => {
                    onClose();
                    onRequest(listing);
                  }}
                  disabled={!isAvailable}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 ${
                    isAvailable
                      ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <Heart className="w-4 h-4 text-lime-400" />
                  <span>{isAvailable ? 'Request This Surplus' : listing.status.replace('_', ' ')}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
