// Application configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 10000,
  },

  // File Upload Configuration
  upload: {
    imgbb: {
      apiKey: process.env.NEXT_PUBLIC_IMGBB_API_KEY,
      uploadUrl: 'https://api.imgbb.com/1/upload',
    },
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(','),
    maxProfileImageSize: 2097152, // 2MB for profile images
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
  },

  // Application URLs
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'ThesisTrack',
    description: 'Project Proposal & Review System',
  },

  // Email Configuration (for future use)
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@thesistrack.com',
  },

  // Database Configuration (for future backend)
  database: {
    url: process.env.DATABASE_URL,
  },

  // Feature Flags
  features: {
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false', // default true
    enableRealTimeUpdates: process.env.ENABLE_REALTIME_UPDATES === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false', // default true
  },

  // UI Configuration
  ui: {
    itemsPerPage: parseInt(process.env.ITEMS_PER_PAGE) || 10,
    theme: process.env.DEFAULT_THEME || 'light',
    sidebarCollapsed: process.env.SIDEBAR_COLLAPSED === 'true',
  },

  // Validation Rules
  validation: {
    password: {
      minLength: 6,
      requireUppercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    },
    proposal: {
      titleMaxLength: 200,
      abstractMinLength: 500,
      abstractMaxLength: 1000,
    },
    user: {
      nameMaxLength: 100,
      bioMaxLength: 500,
    },
  },

  // Academic Configuration
  academic: {
    departments: [
      'Computer Science',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Business Administration',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
    ],
    proposalTypes: [
      'Thesis',
      'Capstone',
      'Research Project',
    ],
    userRoles: [
      'STUDENT',
      'TEACHER', 
      'ADMIN',
    ],
    proposalStatuses: [
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'PENDING',
      'APPROVED',
      'REJECTED',
      'REVISION_REQUIRED',
    ],
  },
}

// Helper functions
export const isDevelopment = () => process.env.NODE_ENV === 'development'
export const isProduction = () => process.env.NODE_ENV === 'production'

// Validation functions
export const validateEnvironment = () => {
  const requiredEnvVars = []
  
  if (config.features.enableFileUpload && !config.upload.imgbb.apiKey) {
    requiredEnvVars.push('NEXT_PUBLIC_IMGBB_API_KEY')
  }

  if (requiredEnvVars.length > 0) {
    console.warn('Missing environment variables:', requiredEnvVars)
    if (isProduction()) {
      throw new Error(`Missing required environment variables: ${requiredEnvVars.join(', ')}`)
    }
  }

  return true
}

// Initialize configuration validation
if (typeof window === 'undefined') {
  // Only validate on server side
  validateEnvironment()
}