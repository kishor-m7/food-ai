import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  TrendingUp,
  Leaf,
  Utensils,
  Award,
  BarChart2,
  PieChart,
  Info,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const Analytics = () => {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [statsRes, donationsRes] = await Promise.all([
          api.getAdminStats(currentUser.id),
          api.listDonations({ status: 'All' })
        ]);
        setStats(statsRes);
        setDonations(donationsRes || []);
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [currentUser.id]);

  const totalKg = donations.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalMeals = donations.reduce((acc, curr) => acc + (curr.meals_yield || 0), 0);
  const co2eSaved = (totalKg * 2.5).toFixed(1);

  // Category breakdown calculation
  const categoryMap = {};
  donations.forEach(d => {
    const cat = d.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + d.quantity;
  });

  const categoryList = Object.keys(categoryMap).map(cat => ({
    name: cat,
    quantity: categoryMap[cat],
    percentage: totalKg > 0 ? Math.round((categoryMap[cat] / totalKg) * 100) : 0
  })).sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Environmental & Social Metrics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Impact Analytics</h1>
          <p className="text-sm text-slate-500">Quantitative audit of food surplus rescued, meals provable, and carbon offset.</p>
        </div>
      </div>

      {/* Main Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Food Rescued"
          value={loading ? '...' : totalKg.toFixed(1)}
          unit="kg"
          icon={Leaf}
          color="emerald"
          description="Surplus diverted from landfills"
        />
        <StatCard
          title="Total Meals Provided"
          value={loading ? '...' : totalMeals}
          unit="meals"
          icon={Utensils}
          color="lime"
          description="Nutritional yield estimate"
        />
        <StatCard
          title="Carbon Footprint Saved"
          value={loading ? '...' : co2eSaved}
          unit="kg CO2e"
          icon={TrendingUp}
          color="amber"
          description="GHG emission prevention"
        />
        <StatCard
          title="Redistribution Rate"
          value={loading ? '...' : `${Math.round((donations.filter(d => d.status === 'completed' || d.status === 'claimed').length / (donations.length || 1)) * 100)}%`}
          unit="fulfilled"
          icon={Award}
          color="blue"
          description="Completed claim requests"
        />
      </div>

      {/* Calculation Methodology Explanation Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-lime-400">
          <Info className="w-5 h-5" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider">Methodology & Impact Calculations</h3>
        </div>
        <p className="text-xs text-emerald-100 leading-relaxed max-w-3xl">
          FoodLoop AI uses standard EPA WARM guidelines and FAO environmental matrices for food-waste metrics:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10">
            <span className="font-bold text-lime-300 block mb-1">1. Meal Equivalent Conversion</span>
            <span>1 kg of rescued edible produce/food surplus is evaluated as approximately <strong>1.25 to 2.2 nutritional meals</strong> for community distribution.</span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10">
            <span className="font-bold text-lime-300 block mb-1">2. Carbon Footprint Offset</span>
            <span>Preventing 1 kg of food surplus from decomposing anaerobically in landfills offsets <strong>2.5 kg CO2 equivalent</strong> GHG emissions.</span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10">
            <span className="font-bold text-lime-300 block mb-1">3. Freshness Score Tiering</span>
            <span>Deep learning vision models evaluate visual surface cues to classify items into 3 operational shelf-life tiers (Tier 1-3).</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown Table/Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Food Category Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of rescued surplus by food type.</p>
            </div>
            <PieChart className="w-5 h-5 text-emerald-700" />
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {categoryList.map((item, idx) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{item.name}</span>
                    <span className="text-emerald-800">{item.quantity} kg ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-emerald-700' : idx === 1 ? 'bg-lime-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impact Milestones & Community Badges */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>Community Impact Milestones</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center space-x-3 text-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-lime-400 flex items-center justify-center font-bold text-lg shrink-0">
                🌱
              </div>
              <div>
                <p className="font-extrabold text-slate-900">Zero-Waste Champion Tier</p>
                <p className="text-slate-600 mt-0.5">Your organization has prevented over 50kg of food waste from landfill decomposition.</p>
              </div>
            </div>

            <div className="p-4 bg-lime-50 rounded-2xl border border-lime-200 flex items-center space-x-3 text-xs">
              <div className="w-10 h-10 rounded-xl bg-lime-500 text-emerald-950 flex items-center justify-center font-bold text-lg shrink-0">
                🍲
              </div>
              <div>
                <p className="font-extrabold text-slate-900">Community Meal Supplier</p>
                <p className="text-slate-600 mt-0.5">Active claim responses have supplied nutritious meals to over 100 individuals.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
