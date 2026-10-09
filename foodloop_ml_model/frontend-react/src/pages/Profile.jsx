import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  ShieldCheck,
  Mail,
  Building,
  Phone,
  MapPin,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Cpu
} from 'lucide-react';

export const Profile = () => {
  const { currentUser, switchUser, setRole, logout, isAdmin } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.getProfile(currentUser.id);
        setProfileData(res);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || 'Failed to load user profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser.id]);

  const stats = profileData?.stats || {
    donationsListed: 0,
    claimsRequested: 0,
    totalKgDonated: 0,
    totalMealsProvided: 0,
    co2eSavedKg: '0'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <User className="w-3.5 h-3.5" />
          <span>User Context & Account Profile</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile & Preferences</h1>
        <p className="text-sm text-slate-500">Manage account information, role permissions, and system settings.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-600/30 shadow-md"
          />
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900">{currentUser.name}</h2>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isAdmin ? 'System Administrator' : 'Food Donor / Recipient'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <p className="text-xs font-semibold text-emerald-700">{currentUser.organization || 'Green Harvest Partner'}</p>
          </div>
        </div>

        {/* User Stats Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Donations</span>
            <span className="text-lg font-extrabold text-slate-900">{stats.donationsListed}</span>
          </div>
          <div className="text-center border-x border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Claims</span>
            <span className="text-lg font-extrabold text-slate-900">{stats.claimsRequested}</span>
          </div>
          <div className="text-center border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kg Donated</span>
            <span className="text-lg font-extrabold text-emerald-700">{stats.totalKgDonated} kg</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Meals Provided</span>
            <span className="text-lg font-extrabold text-lime-600">{stats.totalMealsProvided}</span>
          </div>
        </div>

        {/* Detailed User Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider block mb-2">Contact Metadata</span>
            <div className="space-y-2 text-slate-600">
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{currentUser.email}</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{currentUser.phone || '+1 (555) 234-5678'}</span>
              </p>
              <p className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{currentUser.location || 'San Francisco, CA'}</span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider block mb-2">Role & Permissions</span>
            <div className="space-y-1.5 text-slate-600">
              <p><strong className="text-slate-800">Current Role:</strong> {currentUser.role}</p>
              <p><strong className="text-slate-800">User ID Header:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono">{currentUser.id}</code></p>
              <p><strong className="text-slate-800">API Endpoint:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}</code></p>
            </div>
          </div>
        </div>

        {/* Persona Switcher Section */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Switch Demo Persona</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  setRole(user.role);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  currentUser.id === user.id
                    ? 'border-emerald-600 bg-emerald-50/60 font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{user.role}</p>
                  </div>
                </div>
                {currentUser.id === user.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={logout}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors flex items-center space-x-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>

      </div>

    </div>
  );
};
