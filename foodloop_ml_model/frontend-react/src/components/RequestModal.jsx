import React, { useState } from 'react';
import { X, Heart, ShieldAlert, CheckCircle, Clock, MapPin, Loader2 } from 'lucide-react';

export const RequestModal = ({ listing, isOpen, onClose, onSubmit, submitting, error }) => {
  const [purpose, setPurpose] = useState('Community kitchen distribution & emergency relief');
  const [pickupTime, setPickupTime] = useState('Today during scheduled pickup window');
  const [contact, setContact] = useState('');

  if (!isOpen || !listing) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      purpose,
      pickup_time: pickupTime,
      contact: contact || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-emerald-950 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-emerald-950" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Request Surplus Food Claim</h3>
              <p className="text-xs text-emerald-200">Requesting: {listing.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Quick Overview */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Quantity: {listing.quantity} {listing.quantity_unit}</span>
              <span className="text-emerald-700">Yield: ~{listing.meals_yield} meals</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Pickup: {listing.pickup_address}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Window: {listing.pickup_window}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Distribution Purpose / Intended Use <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Community kitchen meals, food bank distribution..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proposed Pickup Time / Window
            </label>
            <input
              type="text"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              placeholder="e.g. Today at 4:30 PM"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone / Coordinator Notes (Optional)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. +1 (555) 019-2831"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-lime-400" />
                  <span>Confirm Request</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
