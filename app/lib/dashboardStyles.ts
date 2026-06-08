// Shared dashboard component styles for consistency

export const dashboardStyles = {
  // Buttons
  button: {
    primary: 'bg-[#1E8E5A] hover:bg-[#177349] text-white font-medium py-2 px-4 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm border border-gray-300 transition',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition',
    small: 'py-1.5 px-3 text-xs',
    medium: 'py-2 px-4 text-sm',
    large: 'py-2.5 px-5 text-base'
  },

  // Cards
  card: {
    base: 'bg-white rounded-lg shadow',
    stat: 'bg-white p-4 rounded-lg shadow',
    header: 'p-4 border-b',
    body: 'p-4',
    footer: 'p-4 border-t bg-gray-50'
  },

  // Stats Grid
  statsGrid: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6',
  statCard: {
    container: 'bg-white p-4 rounded-lg shadow',
    label: 'text-gray-600 text-sm mb-1',
    value: 'text-2xl font-bold text-gray-900',
    valueGreen: 'text-2xl font-bold text-[#1E8E5A]'
  },

  // Tables
  table: {
    container: 'overflow-x-auto',
    table: 'w-full',
    thead: 'bg-gray-50',
    th: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    tbody: 'divide-y divide-gray-200',
    tr: 'hover:bg-gray-50',
    td: 'px-4 py-3 text-sm text-gray-900',
    tdSmall: 'px-4 py-2 text-sm text-gray-900'
  },

  // Navigation
  nav: {
    container: 'bg-white border-b',
    inner: 'max-w-7xl mx-auto px-4 py-3 flex justify-between items-center',
    title: 'text-xl font-bold text-gray-900',
    link: 'text-gray-600 hover:text-gray-900 text-sm transition',
    linkActive: 'text-[#1E8E5A] font-medium text-sm'
  },

  // Badges
  badge: {
    green: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    yellow: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    red: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    gray: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    blue: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
  },

  // Modals
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    container: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto',
    header: 'p-6 border-b',
    title: 'text-xl font-bold text-gray-900',
    body: 'p-6 space-y-4',
    footer: 'p-6 border-t bg-gray-50 flex justify-end gap-3'
  },

  // Forms
  form: {
    label: 'block text-sm font-medium text-gray-700 mb-1',
    input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent',
    textarea: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent resize-none',
    select: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent'
  },

  // Layout
  container: 'max-w-7xl mx-auto p-4',
  page: 'min-h-screen bg-gray-50',

  // Status colors
  status: {
    active: 'text-green-600 font-semibold',
    inactive: 'text-gray-600 font-semibold',
    pending: 'text-yellow-600 font-semibold',
    error: 'text-red-600 font-semibold'
  }
}

// Helper functions
export const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'activated':
      return dashboardStyles.badge.green
    case 'inactive':
    case 'paused':
      return dashboardStyles.badge.gray
    case 'pending':
    case 'assigned':
      return dashboardStyles.badge.yellow
    case 'invited':
      return dashboardStyles.badge.blue
    default:
      return dashboardStyles.badge.gray
  }
}

export const getRoleBadge = (role: string) => {
  switch (role) {
    case 'MASTER_ADMIN':
      return 'bg-purple-100 text-purple-800'
    case 'MAIN_ADMIN':
      return 'bg-blue-100 text-blue-800'
    case 'TEAM_ADMIN':
      return 'bg-indigo-100 text-indigo-800'
    case 'ORG_ADMIN':
      return 'bg-teal-100 text-teal-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
