import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { Leaf, ShieldCheck, UserCheck, ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const { switchUser, setRole, loginCustom, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'custom'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [error, setError] = useState('');

  const handleDemoSelect = (userId, role) => {
    switchUser(userId);
    setRole(role);
    navigate('/dashboard');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    loginCustom(email, password, selectedRole);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-900 to-emerald-700 flex items-center justify-center text-lime-400 mx-auto shadow-lg">
            <Leaf className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">FoodLoop AI Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">AI-Powered Surplus Food Management Platform</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'demo' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Quick Demo Personas
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'custom' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In / Custom Account
          </button>
        </div>

        {activeTab === 'demo' ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
              <span className="font-bold">Hackathon Demo Mode:</span> Select an active role below to instantly enter the application with pre-configured backend permissions.
            </div>

            {DEMO_USERS.map((user) => {
              const isAdmin = user.role === 'admin';
              const isSelected = currentUser.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => handleDemoSelect(user.id, user.role)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-600/30" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-extrabold text-slate-900">{user.name}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isAdmin ? 'Admin' : 'User'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{user.organization}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@foodloop.ai"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select System Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    selectedRole === 'user'
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Standard User
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    selectedRole === 'admin'
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Administrator
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4 text-lime-400" />
              <span>Enter Application</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Connected to FastAPI Backend API at <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">http://127.0.0.1:8000</code>
          </p>
        </div>

      </div>
    </div>
  );
};
