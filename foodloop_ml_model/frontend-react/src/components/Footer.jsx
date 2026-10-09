import React from 'react';
import { Leaf, Cpu, Heart, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-lime-400">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">FoodLoop AI</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-900 text-lime-400 border border-emerald-700 rounded-md">
                FastAPI + ResNet-50
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              AI-driven food surplus management platform powered by PyTorch vision models, FastAPI backend, and real-time donation request matching to reduce food waste and support communities.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/dashboard" className="hover:text-lime-400 transition-colors">Overview Dashboard</a></li>
              <li><a href="/scanner" className="hover:text-lime-400 transition-colors">AI Food Scanner</a></li>
              <li><a href="/donate" className="hover:text-lime-400 transition-colors">Donate Surplus Food</a></li>
              <li><a href="/marketplace" className="hover:text-lime-400 transition-colors">Surplus Marketplace</a></li>
              <li><a href="/analytics" className="hover:text-lime-400 transition-colors">Impact Analytics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Technology Stack</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>PyTorch ResNet-50 Fine-Tuned</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>FastAPI REST Server (Async)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>SQLite Persistent Database</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FoodLoop AI — Production Hackathon Edition. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="hover:text-slate-400">Forest Green & Fresh Lime System</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Vite + React 19</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
