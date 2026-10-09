import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  {
    id: 'usr-1',
    name: ' user',
    email: 'user@harvestcommunity.org',
    role: 'user',
    organization: 'Green Harvest Community Kitchen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    location: 'Downtown Hub, San Francisco, CA'
  },
  {
    id: 'usr-2',
    name: '(Admin)',
    email: 'admin@foodloop.ai',
    role: 'admin',
    organization: 'FoodLoop Operational Team',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 987-6543',
    location: 'Headquarters, San Jose, CA'
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('foodloop_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_USERS[0];
  });

  const [scannedFoodData, setScannedFoodData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    localStorage.setItem('foodloop_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    // Check backend health status on mount
    api.getHealth()
      .then(data => setSystemHealth(data))
      .catch(err => console.warn("Backend health check warning:", err));
  }, []);

  const switchUser = (userId) => {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    } else {
      // Fallback
      setCurrentUser({
        id: userId,
        name: 'Custom User',
        email: 'user@foodloop.ai',
        role: 'user'
      });
    }
  };

  const setRole = (role) => {
    if (role === 'admin') {
      setCurrentUser(DEMO_USERS[1]);
    } else {
      setCurrentUser(DEMO_USERS[0]);
    }
  };

  const loginCustom = (email, password, role = 'user') => {
    // Simple authentication shim with backend user check
    const newUser = {
      id: `usr-${Date.now() % 10000}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: role,
      organization: 'Community Partner',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('foodloop_user');
    setCurrentUser(DEMO_USERS[0]);
  };

  const transferScanToDonation = (scanData) => {
    setScannedFoodData(scanData);
  };

  const clearTransferredScan = () => {
    setScannedFoodData(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchUser,
      setRole,
      loginCustom,
      logout,
      isAdmin: currentUser?.role === 'admin',
      scannedFoodData,
      transferScanToDonation,
      clearTransferredScan,
      systemHealth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
