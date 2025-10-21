/**
 * API Utility for GGDS Benevolent Fund
 * Centralized API calls to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint (without /api prefix)
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {};

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle validation errors (422)
      let errorMessage = 'An error occurred';

      if (response.status === 422 && Array.isArray(data.detail)) {
        // Format validation errors
        errorMessage = data.detail.map(err => err.msg || err.message).join(', ');
      } else if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      }

      throw {
        status: response.status,
        message: errorMessage,
        data
      };
    }

    return data;
  } catch (error) {
    // Network errors or parsing errors
    if (error.status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error. Please check your connection.',
      data: null
    };
  }
}

// Authentication API
export const authAPI = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      }),
    });

    // Store tokens
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * Register new user account
   * @param {object} userData - {email, password, full_name}
   */
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens if provided
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  /**
   * Create member profile (called after registration)
   * @param {object} memberData - Complete member profile data
   */
  createMemberProfile: async (memberData) => {
    return apiRequest('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }
};

// Members API
export const membersAPI = {
  /**
   * Get all members (admin only)
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiRequest(`/members${query ? '?' + query : ''}`);
  },

  /**
   * Get member by ID
   */
  getById: async (id) => {
    return apiRequest(`/members/${id}`);
  },

  /**
   * Get current user's member profile
   */
  getMyProfile: async () => {
    return apiRequest('/members/me/profile');
  },

  /**
   * Update member
   */
  update: async (id, data) => {
    return apiRequest(`/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Cases API
export const casesAPI = {
  /**
   * Get all cases for current user
   * @param {object} params - {skip, limit, status, case_type, urgency}
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.case_type) queryParams.append('case_type', params.case_type);
    if (params.urgency) queryParams.append('urgency', params.urgency);

    const query = queryParams.toString();
    return apiRequest(`/cases${query ? '?' + query : ''}`);
  },

  /**
   * Get case by ID
   */
  getById: async (id) => {
    return apiRequest(`/cases/${id}`);
  },

  /**
   * Create new case
   * @param {object} caseData - Complete case data with verification contacts
   */
  create: async (caseData) => {
    return apiRequest('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  /**
   * Update case
   */
  update: async (id, caseData) => {
    return apiRequest(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(caseData),
    });
  },

  /**
   * Update case status (admin only)
   */
  updateStatus: async (id, status, reviewerNotes = null) => {
    return apiRequest(`/cases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewer_notes: reviewerNotes }),
    });
  },

  /**
   * Delete case
   */
  delete: async (id) => {
    return apiRequest(`/cases/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    return apiRequest('/dashboard/stats');
  },

  /**
   * Get current user's member profile
   */
  getProfile: async () => {
    return apiRequest('/dashboard/profile');
  },

  /**
   * Get all cases for current user
   */
  getCases: async () => {
    return apiRequest('/dashboard/cases');
  },
};

// Upload API
export const uploadAPI = {
  /**
   * Upload file
   */
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest('/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  },
};

// Contributions API
export const contributionsAPI = {
  /**
   * Record new contribution (admin only)
   */
  create: async (contributionData) => {
    return apiRequest('/contributions', {
      method: 'POST',
      body: JSON.stringify(contributionData),
    });
  },

  /**
   * Get all contributions with filters (admin only)
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.member_id) queryParams.append('member_id', params.member_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return apiRequest(`/contributions${query ? '?' + query : ''}`);
  },

  /**
   * Get contribution history for a member
   */
  getMemberContributions: async (memberId) => {
    return apiRequest(`/contributions/member/${memberId}`);
  },

  /**
   * Get contribution summary for a member
   */
  getMemberSummary: async (memberId) => {
    return apiRequest(`/contributions/member/${memberId}/summary`);
  },

  /**
   * Get contribution statistics (admin only)
   */
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return apiRequest(`/contributions/stats${query ? '?' + query : ''}`);
  },

  /**
   * Verify or reject contribution (admin only)
   */
  verify: async (contributionId, status, notes = null) => {
    return apiRequest(`/contributions/${contributionId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  /**
   * Update contribution (admin only)
   */
  update: async (contributionId, data) => {
    return apiRequest(`/contributions/${contributionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete contribution (admin only)
   */
  delete: async (contributionId) => {
    return apiRequest(`/contributions/${contributionId}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminAPI = {
  /**
   * Get admin statistics
   */
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  /**
   * Get all cases (admin only)
   */
  getCases: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.case_type) queryParams.append('case_type', params.case_type);
    if (params.urgency) queryParams.append('urgency', params.urgency);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.order) queryParams.append('order', params.order);

    const query = queryParams.toString();
    return apiRequest(`/admin/cases${query ? '?' + query : ''}`);
  },

  /**
   * Get all members (admin only)
   */
  getMembers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiRequest(`/admin/members${query ? '?' + query : ''}`);
  },

  /**
   * Approve case (admin only)
   */
  approveCase: async (caseId, notes = null) => {
    return apiRequest(`/admin/cases/${caseId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  },

  /**
   * Reject case (admin only)
   */
  rejectCase: async (caseId, reason) => {
    return apiRequest(`/admin/cases/${caseId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Activate member (admin only)
   */
  activateMember: async (memberId) => {
    return apiRequest(`/admin/members/${memberId}/activate`, {
      method: 'PATCH',
    });
  },

  /**
   * Suspend member (admin only)
   */
  suspendMember: async (memberId) => {
    return apiRequest(`/admin/members/${memberId}/suspend`, {
      method: 'PATCH',
    });
  },

  /**
   * Generate cases report (admin only)
   */
  generateCasesReport: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return apiRequest(`/admin/reports/cases${query ? '?' + query : ''}`);
  },
};

// Reports API
export const reportsAPI = {
  /**
   * Get member reports
   */
  getMembers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return apiRequest(`/admin/reports/members${query ? '?' + query : ''}`);
  },

  /**
   * Get case reports
   */
  getCases: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return apiRequest(`/admin/reports/cases${query ? '?' + query : ''}`);
  },

  /**
   * Get financial reports
   */
  getFinancial: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return apiRequest(`/admin/reports/financial${query ? '?' + query : ''}`);
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return await response.json();
  } catch (error) {
    throw new Error('Backend is not available');
  }
};

export default {
  authAPI,
  membersAPI,
  casesAPI,
  dashboardAPI,
  uploadAPI,
  contributionsAPI,
  adminAPI,
  reportsAPI,
  healthCheck,
};
