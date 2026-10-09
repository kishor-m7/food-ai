import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Scan,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Save
} from 'lucide-react';

export const Scanner = () => {
  const { currentUser, transferScanToDonation, systemHealth } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  
  const [scanSaved, setScanSaved] = useState(false);
  const [savingScan, setSavingScan] = useState(false);

  // File validation
  const validateFile = (file) => {
    if (!file) return false;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Invalid file format. Please upload a JPEG, PNG, or WebP image.');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit. Please upload a smaller image.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setPrediction(null);
    setScanSaved(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setPrediction(null);
    setError(null);
    setScanSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !imagePreview) return;
    setAnalyzing(true);
    setError(null);
    setPrediction(null);
    setScanSaved(false);

    try {
      const res = await api.predictFood(selectedFile || imagePreview);
      setPrediction(res);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message || 'Failed to analyze food image with ML backend.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveScan = async () => {
    if (!prediction) return;
    setSavingScan(true);
    try {
      await api.saveScan(currentUser.id, {
        food_name: prediction.predicted_label,
        display_name: prediction.predicted_label.charAt(0).toUpperCase() + prediction.predicted_label.slice(1),
        confidence: prediction.confidence,
        freshness_score: prediction.freshness_score,
        category: getCategoryFromLabel(prediction.predicted_label)
      });
      setScanSaved(true);
    } catch (err) {
      console.error("Save scan error:", err);
    } finally {
      setSavingScan(false);
    }
  };

  const handleTransferToDonation = () => {
    if (!prediction) return;
    transferScanToDonation({
      food_name: prediction.predicted_label.charAt(0).toUpperCase() + prediction.predicted_label.slice(1),
      category: getCategoryFromLabel(prediction.predicted_label),
      freshness_score: prediction.freshness_score,
      image_url: imagePreview
    });
    navigate('/donate');
  };

  const getCategoryFromLabel = (label = '') => {
    const l = label.toLowerCase();
    if (l.includes('apple') || l.includes('banana') || l.includes('orange') || l.includes('mango') || l.includes('spinach')) return 'Fresh Produce';
    if (l.includes('bread') || l.includes('pastry') || l.includes('cake')) return 'Bakery';
    if (l.includes('milk') || l.includes('cheese') || l.includes('yogurt')) return 'Dairy';
    if (l.includes('soup') || l.includes('rice') || l.includes('curry') || l.includes('meal')) return 'Prepared Meals';
    return 'Fresh Produce';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Cpu className="w-3.5 h-3.5" />
          <span>PyTorch ResNet-50 Neural Network</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Vision Food Scanner</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Upload an image of produce or food surplus. Our deep learning classifier automatically detects the item and computes freshness score heuristics.
        </p>
      </div>

      {/* Model Status Warning if offline */}
      {systemHealth && !systemHealth.model_loaded && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-800 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">PyTorch Model Weights Unloaded</p>
            <p className="text-amber-700 mt-0.5">The backend ML service is operating in fallback mode or weights file is missing. The scanner will return error feedback.</p>
          </div>
        </div>
      )}

      {/* Main Upload Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">Dismiss</button>
          </div>
        )}

        {/* Drag and Drop Zone */}
        {!imagePreview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-4 ${
              dragOver
                ? 'border-emerald-600 bg-emerald-50/60 scale-[1.01]'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">Drag & drop your food image here</p>
              <p className="text-xs text-slate-400 mt-1">Supports JPEG, PNG, or WebP (Max 10 MB)</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-900 transition-colors"
            >
              Browse Image File
            </button>
          </div>
        ) : (
          /* Image Preview & Replacement Section */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 max-h-80 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Selected Food Preview"
                className="max-h-80 object-contain w-auto mx-auto"
              />
              
              <button
                onClick={handleClearImage}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-colors shadow-lg"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-semibold">
                {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Uploaded Image'}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleClearImage}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace Image</span>
              </button>

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                    <span>Running Neural Forward Pass...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 text-lime-400" />
                    <span>Analyze Food with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Prediction Results Display */}
      {prediction && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-extrabold text-slate-900">ResNet-50 Classification Results</h2>
            </div>
            <span className="px-2.5 py-1 text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-lg">
              {prediction.model_architecture || 'ResNet-50'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Primary Identified Class Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-6 rounded-2xl space-y-3 shadow-md">
              <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">Detected Food Item</span>
              <h3 className="text-2xl font-extrabold capitalize text-lime-300">{prediction.predicted_label}</h3>
              
              <div className="pt-2 border-t border-emerald-700/60 space-y-1.5 text-xs text-emerald-100">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-extrabold text-white">{prediction.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Freshness Score:</span>
                  <span className="font-extrabold text-lime-300">{prediction.freshness_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Freshness Tier:</span>
                  <span className="font-semibold text-emerald-200">{prediction.freshness_tier}</span>
                </div>
              </div>
            </div>

            {/* Top-5 Class Probability Distribution */}
            <div className="md:col-span-2 space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Top Model Probability Distribution
              </span>
              
              <div className="space-y-2.5">
                {prediction.top_k?.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span className="capitalize">{item.label}</span>
                      <span className="text-emerald-800">{item.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            
            <button
              onClick={handleSaveScan}
              disabled={scanSaved || savingScan}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                scanSaved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
              }`}
            >
              {savingScan ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              ) : scanSaved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Save className="w-4 h-4 text-slate-500" />
              )}
              <span>{scanSaved ? 'Scan Saved to History' : 'Save Scan Log'}</span>
            </button>

            {/* Transfer to Donation Form Button */}
            <button
              onClick={handleTransferToDonation}
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-lime-400" />
              <span>Transfer to Donation Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      )}

    </div>
  );
};
