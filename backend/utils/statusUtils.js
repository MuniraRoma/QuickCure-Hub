// utils/statusUtils.js

/**
 * Normalize status between frontend and backend
 * Frontend uses lowercase, backend uses Capitalized
 */
export const normalizeStatus = {
  // Frontend → Backend
  toBackend: (status) => {
    const map = {
      'pending': 'Pending',
      'confirmed': 'Approved',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'active': 'Active'
    };
    return map[status?.toLowerCase()] || status;
  },
  
  // Backend → Frontend
  toFrontend: (status) => {
    const map = {
      'Pending': 'pending',
      'Approved': 'confirmed',
      'Rejected': 'rejected',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    };
    return map[status] || status?.toLowerCase();
  }
};

/**
 * Get CSS class for status badge
 */
export const getStatusBadgeClass = (status) => {
  const normalized = status?.toLowerCase();
  const classes = {
    'pending': 'status-badge pending',
    'confirmed': 'status-badge confirmed',
    'approved': 'status-badge confirmed',
    'rejected': 'status-badge rejected',
    'completed': 'status-badge completed',
    'cancelled': 'status-badge cancelled'
  };
  return classes[normalized] || 'status-badge';
};

/**
 * Get display text for status
 */
export const getStatusDisplayText = (status, lang = 'en') => {
  const normalized = status?.toLowerCase();
  const displayMap = {
    en: {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'approved': 'Confirmed',
      'rejected': 'Rejected',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    },
    bn: {
      'pending': 'বিচারাধীন',
      'confirmed': 'নিশ্চিত',
      'approved': 'নিশ্চিত',
      'rejected': 'বাতিল',
      'completed': 'সম্পন্ন',
      'cancelled': 'বাতিল'
    }
  };
  return displayMap[lang]?.[normalized] || normalized || 'Unknown';
};