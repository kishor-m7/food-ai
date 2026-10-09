/**
 * FoodLoop AI - Centralized API Service Layer
 * Interacts directly with FastAPI backend services.
 */

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '';
};

// Helper to construct headers with X-User-Id authentication header
const getHeaders = (userId, extraHeaders = {}) => {
  const headers = {
    'Accept': 'application/json',
    ...extraHeaders
  };
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
};

// Handle response checks
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        if (typeof errJson.detail === 'string') {
          errorMessage = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorMessage = errJson.detail.map(d => d.msg || JSON.stringify(d)).join(', ');
        }
      }
    } catch {
      // Fallback if response is non-JSON
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const api = {
  // 1. Health & Status
  getHealth: async () => {
    const res = await fetch(`${getApiBaseUrl()}/api/health`);
    return handleResponse(res);
  },

  // 2. ML Classifier & Food Recognition
  getClasses: async () => {
    const res = await fetch(`${getApiBaseUrl()}/api/classes`);
    return handleResponse(res);
  },

  predictFood: async (fileOrB64, topK = 5) => {
    const baseUrl = getApiBaseUrl();
    if (fileOrB64 instanceof File || fileOrB64 instanceof Blob) {
      const formData = new FormData();
      formData.append('file', fileOrB64);
      formData.append('top_k', topK);
      const res = await fetch(`${baseUrl}/api/food/predict`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse(res);
    } else {
      const formData = new FormData();
      formData.append('image_b64', fileOrB64);
      formData.append('top_k', topK);
      const res = await fetch(`${baseUrl}/api/food/predict`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse(res);
    }
  },

  getScans: async (userId) => {
    const res = await fetch(`${getApiBaseUrl()}/api/scans`, {
      headers: getHeaders(userId),
    });
    return handleResponse(res);
  },

  saveScan: async (userId, scanData) => {
    const res = await fetch(`${getApiBaseUrl()}/api/scans`, {
      method: 'POST',
      headers: getHeaders(userId, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(scanData),
    });
    return handleResponse(res);
  },

  // 3. Donation Listings Marketplace
  listDonations: async (params = {}) => {
    const url = new URL(`${getApiBaseUrl()}/api/donations`, window.location.origin);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  getDonation: async (id) => {
    const res = await fetch(`${getApiBaseUrl()}/api/donations/${id}`);
    return handleResponse(res);
  },

  createDonation: async (userId, donationData) => {
    const res = await fetch(`${getApiBaseUrl()}/api/donations`, {
      method: 'POST',
      headers: getHeaders(userId, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(donationData),
    });
    return handleResponse(res);
  },

  updateDonation: async (userId, id, updates) => {
    const res = await fetch(`${getApiBaseUrl()}/api/donations/${id}`, {
      method: 'PATCH',
      headers: getHeaders(userId, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  deleteDonation: async (userId, id) => {
    const res = await fetch(`${getApiBaseUrl()}/api/donations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(userId),
    });
    return handleResponse(res);
  },

  // 4. Claim Requests
  requestDonation: async (userId, listingId, requestData) => {
    const res = await fetch(`${getApiBaseUrl()}/api/donations/${listingId}/requests`, {
      method: 'POST',
      headers: getHeaders(userId, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(requestData),
    });
    return handleResponse(res);
  },

  listRequests: async (userId, params = {}) => {
    const url = new URL(`${getApiBaseUrl()}/api/requests`, window.location.origin);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    const res = await fetch(url.toString(), {
      headers: getHeaders(userId),
    });
    return handleResponse(res);
  },

  reviewRequest: async (userId, requestId, action) => {
    const res = await fetch(`${getApiBaseUrl()}/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: getHeaders(userId, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action }),
    });
    return handleResponse(res);
  },

  // 5. Users & Auth
  getProfile: async (userId) => {
    const res = await fetch(`${getApiBaseUrl()}/api/users/me`, {
      headers: getHeaders(userId),
    });
    return handleResponse(res);
  },

  listUsers: async (userId) => {
    const res = await fetch(`${getApiBaseUrl()}/api/users`, {
      headers: getHeaders(userId),
    });
    return handleResponse(res);
  },

  createUser: async (userData) => {
    const res = await fetch(`${getApiBaseUrl()}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  toggleUserStatus: async (adminUserId, userId) => {
    const res = await fetch(`${getApiBaseUrl()}/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: getHeaders(adminUserId),
    });
    return handleResponse(res);
  },

  // 6. Admin Analytics & System Logs
  getAdminStats: async (userId) => {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/stats`, {
      headers: getHeaders(userId),
    });
    return handleResponse(res);
  },

  getAuditLogs: async (adminUserId) => {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/logs`, {
      headers: getHeaders(adminUserId),
    });
    return handleResponse(res);
  },

  resetDemoData: async (adminUserId) => {
    const res = await fetch(`${getApiBaseUrl()}/api/admin/reset-demo`, {
      method: 'POST',
      headers: getHeaders(adminUserId),
    });
    return handleResponse(res);
  }
};
