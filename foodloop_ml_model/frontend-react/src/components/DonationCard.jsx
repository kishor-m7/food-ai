import React from 'react';
import { MapPin, Clock, Utensils, ShieldCheck, Heart, UserCheck, AlertTriangle } from 'lucide-react';

export const DonationCard = ({ listing, currentUserId, onRequest, onViewDetails }) => {
  const isMine = listing.donor_id === currentUserId;
  const isAvailable = listing.status === 'active';

  // Category fallback images
  const getCategoryFallbackImage = (cat, foodName) => {
    const fn = (foodName || '').toLowerCase();
    if (fn.includes('apple')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80';
    if (fn.includes('banana')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80';
    if (fn.includes('bread') || fn.includes('bakery')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80';
    if (fn.includes('soup') || fn.includes('stew')) return 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80';
    if (fn.includes('salad') || fn.includes('vegetable')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80';
    
    switch (cat) {
      case 'Fresh Produce': return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80';
      case 'Bakery': return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80';
      case 'Dairy': return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80';
      case 'Prepared Meals': return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
      case 'Canned Goods': return 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80';
      default: return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80';
    }
  };

  const imageUrl = listing.image_url || getCategoryFallbackImage(listing.category, listing.food_name);

  // Freshness score styling
  const getFreshnessBadge = (score, tier) => {
    if (score >= 90) return { label: tier || 'Tier 1 - Optimal', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (score >= 80) return { label: tier || 'Tier 2 - Good', cls: 'bg-lime-100 text-lime-800 border-lime-200' };
    return { label: tier || 'Tier 3 - Immediate Rescue', cls: 'bg-amber-100 text-amber-800 border-amber-200' };
  };

  const freshness = getFreshnessBadge(listing.freshness_score, listing.freshness_tier);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 group">
      
      {/* Image Container with Badges */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = getCategoryFallbackImage(listing.category, listing.food_name);
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border shadow-xs backdrop-blur-md uppercase tracking-wider ${
            listing.status === 'active'
              ? 'bg-emerald-800/90 text-lime-300 border-emerald-600'
              : listing.status === 'claim_requested'
              ? 'bg-amber-500/90 text-white border-amber-400'
              : listing.status === 'claimed' || listing.status === 'completed'
              ? 'bg-blue-600/90 text-white border-blue-400'
              : 'bg-slate-700/90 text-slate-200 border-slate-600'
          }`}>
            {listing.status.replace('_', ' ')}
          </span>
        </div>

        {/* Distance / Yield Badge */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs">
          <Utensils className="w-3.5 h-3.5 text-lime-400" />
          <span>{listing.meals_yield} meals</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Freshness row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {listing.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${freshness.cls}`}>
              {listing.freshness_score}% Freshness
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
            {listing.title}
          </h3>

          <p className="text-sm font-semibold text-slate-700 mt-1">
            {listing.quantity} {listing.quantity_unit} <span className="text-slate-400 font-normal">({listing.food_name})</span>
          </p>

          {listing.notes && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {listing.notes}
            </p>
          )}
        </div>

        {/* Donor & Location Metadata */}
        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 text-slate-700">
            <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold truncate">{listing.donor_name}</span>
            {listing.donor_org && <span className="text-slate-400 truncate">({listing.donor_org})</span>}
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center space-x-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{listing.pickup_address}</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 shrink-0">{listing.distance_km} km away</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Pickup: {listing.pickup_window}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(listing)}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Details
          </button>

          {isMine ? (
            <span className="px-3 py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl cursor-default text-center">
              Your Listing
            </span>
          ) : (
            <button
              onClick={() => onRequest(listing)}
              disabled={!isAvailable}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1 ${
                isAvailable
                  ? 'bg-emerald-800 hover:bg-emerald-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-lime-400" />
              <span>{isAvailable ? 'Claim Food' : listing.status.replace('_', ' ')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
