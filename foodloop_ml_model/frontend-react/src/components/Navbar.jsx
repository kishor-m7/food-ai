import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import {
  Leaf,
  LayoutDashboard,
  Scan,
  PlusCircle,
  ShoppingBag,
  History,
  TrendingUp,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Cpu,
  ShieldAlert
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, switchUser, setRole, isAdmin, logout, systemHealth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = isAdmin
    ? [
        { path: '/admin', label: 'Admin Console', icon: ShieldCheck },
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
        { path: '/analytics', label: 'Impact Analytics', icon: TrendingUp },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/scanner', label: 'AI Food Scanner', icon: Scan, badge: 'AI' },
        { path: '/donate', label: 'Donate Food', icon: PlusCircle },
        { path: '/marketplace', label: 'Find Surplus', icon: ShoppingBag },
        { path: '/history', label: 'Donation History', icon: History },
        { path: '/analytics', label: 'Impact', icon: TrendingUp },
      ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-lime-400 shadow-md group-hover:scale-105 transition-transform duration-200">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">FoodLoop</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-lime-400/20 text-lime-700 border border-lime-400/30 rounded-md">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium tracking-wide">Surplus Food & Resnet ML</span>
              </div>
            </Link>

            {/* Live Model Badge */}
            {systemHealth && (
              <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Cpu className="w-3.5 h-3.5" />
                <span>ResNet-50 {systemHealth.model_loaded ? 'Live' : 'Standby'}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-lime-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-lime-400 text-emerald-950">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Persona & Role Selector */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Quick Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setRole('user')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  !isAdmin
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                User
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-all ${
                  isAdmin
                    ? 'bg-emerald-800 text-lime-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-3 h-3 inline" />
                <span>Admin</span>
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-600/30"
                />
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{currentUser.role} persona</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Persona</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isAdmin ? 'System Administrator' : 'Food Donor / Volunteer'}
                    </span>
                  </div>

                  <div className="px-2 py-1.5 border-b border-slate-100">
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">Switch Demo Account</p>
                    {DEMO_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          currentUser.id === user.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{user.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{user.role}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out / Exit Demo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {/* Persona Switcher Mobile */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mb-2">
            <div className="flex items-center space-x-2">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{currentUser.role} Mode</p>
              </div>
            </div>
            <div className="flex bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => { setRole('user'); setMobileMenuOpen(false); }}
                className={`px-2 py-0.5 text-[11px] font-bold rounded ${!isAdmin ? 'bg-emerald-800 text-white' : 'text-slate-500'}`}
              >
                User
              </button>
              <button
                onClick={() => { setRole('admin'); setMobileMenuOpen(false); }}
                className={`px-2 py-0.5 text-[11px] font-bold rounded ${isAdmin ? 'bg-emerald-800 text-lime-400' : 'text-slate-500'}`}
              >
                Admin
              </button>
            </div>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  active ? 'bg-emerald-800 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-lime-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <User className="w-5 h-5 text-slate-400" />
              <span>Profile & Settings</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
