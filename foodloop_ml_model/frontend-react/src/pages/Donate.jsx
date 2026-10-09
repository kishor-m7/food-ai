import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DonationCard } from '../components/DonationCard';
import {
  PlusCircle,
  Leaf,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MapPin,
  Clock,
  Utensils,
  Eye,
  ArrowRight
} from 'lucide-react';

export const Donate = () => {
  const { currentUser, scannedFoodData, clearTransferredScan } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Fresh Produce');
  const [quantity, setQuantity] = useState(10);
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [freshnessScore, setFreshnessScore] = useState(92);
  const [storageCondition, setStorageCondition] = useState('Refrigerated (3-5°C)');
  const [pickupAddress, setPickupAddress] = useState('Community Kitchen, 142 Market St, San Francisco');
  const [pickupWindow, setPickupWindow] = useState('Today, 2:00 PM - 6:00 PM');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdListing, setCreatedListing] = useState(null);

  useEffect(() => {
    if (scannedFoodData) {
      setFoodName(scannedFoodData.food_name || '');
      setTitle(`Surplus ${scannedFoodData.food_name || 'Food'}`);
      if (scannedFoodData.category) setCategory(scannedFoodData.category);
      if (scannedFoodData.freshness_score) setFreshnessScore(scannedFoodData.freshness_score);
      if (scannedFoodData.image_url) setImageUrl(scannedFoodData.image_url);
    }
  }, [scannedFoodData]);

  const calculateMealsYield = (qty, unit) => {
    let kg = qty;
    if (unit === 'lbs') kg = qty * 0.453;
    if (unit === 'items') kg = qty * 0.2;
    if (unit === 'boxes') kg = qty * 5;
    return Math.max(1, Math.round(kg * 2.2));
  };

  const mealsYield = calculateMealsYield(quantity, quantityUnit);

  const getFreshnessTier = (score) => {
    if (score >= 90) return 'Tier 1 - Optimal (4-6 days)';
    if (score >= 80) return 'Tier 2 - Good (2-3 days)';
    return 'Tier 3 - Immediate Rescue (< 24h)';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError('Food name is required.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: title || `Surplus ${foodName}`,
      category,
      food_name: foodName,
      quantity: parseFloat(quantity),
      quantity_unit: quantityUnit,
      meals_yield: mealsYield,
      freshness_score: parseInt(freshnessScore),
      freshness_tier: getFreshnessTier(freshnessScore),
      storage_condition: storageCondition,
      pickup_address: pickupAddress,
      pickup_window: pickupWindow,
      image_url: imageUrl || undefined,
      notes: notes || undefined,
      tags: [category, foodName.toLowerCase()]
    };

    try {
      const created = await api.createDonation(currentUser.id, payload);
      setCreatedListing(created);
      clearTransferredScan();
    } catch (err) {
      console.error("Donation creation error:", err);
      setError(err.message || 'Failed to create donation listing on FastAPI backend.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview mock listing object
  const previewListing = {
    id: 'preview-1',
    title: title || `Surplus ${foodName || 'Food Item'}`,
    category,
    food_name: foodName || 'Fresh Food',
    quantity: parseFloat(quantity) || 10,
    quantity_unit: quantityUnit,
    meals_yield: mealsYield,
    freshness_score: parseInt(freshnessScore),
    freshness_tier: getFreshnessTier(freshnessScore),
    storage_condition: storageCondition,
    pickup_address: pickupAddress || '123 Community Way',
    pickup_window: pickupWindow || 'Today',
    status: 'active',
    donor_id: currentUser.id,
    donor_name: currentUser.name,
    donor_org: currentUser.organization,
    image_url: imageUrl || null,
    notes: notes || 'Fresh surplus food available for community distribution.',
    distance_km: 1.2
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Surplus Redistribution Form</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Donate Surplus Food</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          List surplus food items to connect directly with local shelters, food banks, and community kitchens.
        </p>
      </div>

      {scannedFoodData && (
        <div className="p-4 bg-lime-50 border border-lime-300 rounded-2xl flex items-center justify-between text-lime-900 text-xs font-semibold shadow-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-lime-600 shrink-0" />
            <span>Transferred from AI Scanner: Auto-populated <strong>{scannedFoodData.food_name}</strong> data.</span>
          </div>
          <button onClick={clearTransferredScan} className="text-lime-700 hover:underline">Clear</button>
        </div>
      )}

      {createdListing ? (
        /* Success State View */
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Donation Listing Created!</h2>
            <p className="text-xs text-slate-500 mt-1">Your food surplus has been posted to the live marketplace.</p>
          </div>

          <div className="max-w-sm mx-auto">
            <DonationCard
              listing={createdListing}
              currentUserId={currentUser.id}
              onViewDetails={() => {}}
              onRequest={() => {}}
            />
          </div>

          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={() => {
                setCreatedListing(null);
                setFoodName('');
                setTitle('');
              }}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
            >
              Donate Another Item
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-6 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-900"
            >
              Go to Marketplace
            </button>
          </div>
        </div>
      ) : (
        /* Form & Preview Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form (2 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Food Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => {
                    setFoodName(e.target.value);
                    if (!title) setTitle(`Surplus ${e.target.value}`);
                  }}
                  placeholder="e.g. Fresh Red Apples"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Listing Display Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Organic Surplus Red Apples Box"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Prepared Meals">Prepared Meals</option>
                  <option value="Canned Goods">Canned Goods</option>
                  <option value="Packaged">Packaged Items</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="items">Items / Pieces</option>
                  <option value="boxes">Boxes / Crates</option>
                  <option value="meals">Prepared Meals</option>
                </select>
              </div>
            </div>

            {/* Freshness Score Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Freshness Rating Score</label>
                <span className="text-xs font-extrabold text-emerald-800">{freshnessScore}% ({getFreshnessTier(freshnessScore)})</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={freshnessScore}
                onChange={(e) => setFreshnessScore(e.target.value)}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Storage Condition</label>
                <input
                  type="text"
                  value={storageCondition}
                  onChange={(e) => setStorageCondition(e.target.value)}
                  placeholder="e.g. Refrigerated (3-5°C)"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Window</label>
                <input
                  type="text"
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  placeholder="e.g. Today 2:00 PM - 6:00 PM"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Location Address</label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="e.g. 142 Market St, San Francisco, CA"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Donor Notes & Instructions</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special storage or handling instructions..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                  <span>Publishing Listing to FastAPI...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-lime-400" />
                  <span>Publish Surplus Food Listing</span>
                </>
              )}
            </button>

          </form>

          {/* Live Preview Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Live Marketplace Preview</span>
            </div>

            <DonationCard
              listing={previewListing}
              currentUserId={currentUser.id}
              onViewDetails={() => {}}
              onRequest={() => {}}
            />

            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-900 block">Automatic Impact Calculation</span>
              <p>This surplus listing yields an estimated <strong className="text-emerald-800">{mealsYield} meals</strong> for distribution and prevents <strong className="text-emerald-800">{(quantity * 2.5).toFixed(1)} kg CO2e</strong> emissions.</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
