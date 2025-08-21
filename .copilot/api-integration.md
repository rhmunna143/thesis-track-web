# API Documentation & Integration Guide

## Backend API Endpoints

### Authentication Endpoints
```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

### User Management
```
GET    /users                    # Get all users with pagination
GET    /users/:id                # Get user by ID
POST   /users                    # Create new user
PUT    /users/:id                # Update user
DELETE /users/:id                # Delete user
PUT    /users/:id/profile        # Update user profile
```

### Analytics Endpoints
```
GET /analytics/dashboard         # Dashboard statistics
GET /analytics/proposals         # Proposal analytics
GET /analytics/users            # User analytics
GET /analytics/departments      # Department statistics
```

### Notification Endpoints
```
GET    /notifications            # Get user notifications
GET    /notifications/unread     # Get unread notifications
POST   /notifications/mark-read  # Mark notification as read
DELETE /notifications/:id        # Delete notification
```

### Proposal Management
```
GET    /proposals               # Get proposals with filters
GET    /proposals/:id           # Get proposal by ID
POST   /proposals               # Create new proposal
PUT    /proposals/:id           # Update proposal
DELETE /proposals/:id           # Delete proposal
```

## API Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

### API Client Configuration
```javascript
// src/services/api.js
import axios from 'axios'
import useAuthStore from '../store/authStore'
import { config } from '../lib/config'

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

## Service Layer Implementation

### Analytics Service
```javascript
// src/services/analytics.service.js
import api from './api'

export const analyticsService = {
  // Get role-based dashboard data
  getDashboardData: async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get proposal analytics with filtering
  getProposalAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.groupBy) queryParams.append('groupBy', params.groupBy)
      if (params.department) queryParams.append('department', params.department)
      if (params.supervisorId) queryParams.append('supervisorId', params.supervisorId)

      const response = await api.get(`/analytics/proposals?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get user analytics (Admin only)
  getUserAnalytics: async () => {
    try {
      const response = await api.get('/analytics/users')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
```

### User Service
```javascript
// src/services/user.service.js
import api from './api'

export const userService = {
  // Get all users with pagination and filtering
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.search) queryParams.append('search', params.search)
      if (params.role) queryParams.append('role', params.role)
      if (params.department) queryParams.append('department', params.department)
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

      const response = await api.get(`/users?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update user profile
  updateUserProfile: async (userId, profileData) => {
    try {
      const response = await api.put(`/users/${userId}/profile`, profileData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
```

## Data Transformation Utilities

### PostgreSQL Array Handling
```javascript
// src/utils/postgres.js

/**
 * Parse PostgreSQL array string to JavaScript array
 * Handles format: {item1,item2,item3} or {"item1","item2","item3"}
 */
export const parsePostgreSQLArray = (arrayString) => {
  if (!arrayString || arrayString === '{}') return []
  if (Array.isArray(arrayString)) return arrayString
  
  // Remove curly braces and split by comma
  const cleanString = arrayString.replace(/[{}]/g, '')
  if (!cleanString.trim()) return []
  
  return cleanString.split(',').map(item => item.trim().replace(/"/g, ''))
}

/**
 * Format JavaScript array for PostgreSQL
 * Converts to format: {"item1","item2","item3"}
 */
export const formatArrayForPostgreSQL = (array) => {
  if (!Array.isArray(array)) return '{}'
  if (array.length === 0) return '{}'
  
  const formattedItems = array.map(item => `"${item}"`)
  return `{${formattedItems.join(',')}}`
}

/**
 * Convert snake_case to camelCase
 */
export const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

/**
 * Convert camelCase to snake_case
 */
export const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Transform object keys recursively
 */
export const transformKeys = (obj, transformer) => {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer))
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      result[transformer(key)] = transformKeys(obj[key], transformer)
      return result
    }, {})
  }
  
  return obj
}
```

### Field Mapping Examples
```javascript
// Convert database response to frontend format
const userFromDatabase = {
  user_id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email_address: 'john@example.com',
  research_interests: '{AI,ML,NLP}',
  created_at: '2025-08-01T10:00:00Z'
}

// Transform to frontend format
const userForFrontend = {
  userId: 1,
  firstName: 'John',
  lastName: 'Doe',
  emailAddress: 'john@example.com',
  researchInterests: ['AI', 'ML', 'NLP'],
  createdAt: '2025-08-01T10:00:00Z'
}

// Usage in component
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const userData = await userService.getUserById(userId)
      
      // Transform database fields to frontend format
      const transformedData = transformKeys(userData, toCamelCase)
      
      // Parse PostgreSQL arrays
      if (transformedData.researchInterests) {
        transformedData.researchInterests = parsePostgreSQLArray(transformedData.researchInterests)
      }
      
      setUserData(transformedData)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }
  
  fetchUserProfile()
}, [userId])
```

## Error Handling Patterns

### Service Layer Error Handling
```javascript
// Standard error handling in services
export const serviceMethod = async (params) => {
  try {
    const response = await api.get('/endpoint', { params })
    return response.data
  } catch (error) {
    // Log error for debugging
    console.error('Service error:', error)
    
    // Re-throw with consistent format
    throw error.response?.data || {
      message: error.message,
      status: error.response?.status || 500
    }
  }
}
```

### Component Error Handling
```javascript
// Individual API call error handling
const fetchData = async () => {
  // Dashboard statistics
  try {
    const stats = await analyticsService.getDashboardData()
    setDashboardData(stats)
  } catch (error) {
    console.warn('Dashboard stats unavailable, using fallback:', error.message)
    setDashboardData(fallbackDashboardData)
  }
  
  // User data
  try {
    const users = await userService.getAllUsers({ limit: 5 })
    setRecentUsers(users.data || [])
  } catch (error) {
    console.warn('User data unavailable, using fallback:', error.message)
    setRecentUsers(fallbackUserData)
  }
}
```

## Mock Data for Development

### Dashboard Mock Data
```javascript
// src/data/mockData.js
export const mockDashboardData = {
  totalUsers: 1250,
  totalProposals: 156,
  totalTeachers: 48,
  activeSessions: 3
}

export const mockProposalAnalytics = {
  monthlyData: [
    { month: 'Jan', proposals: 65 },
    { month: 'Feb', proposals: 59 },
    { month: 'Mar', proposals: 80 },
    { month: 'Apr', proposals: 81 },
    { month: 'May', proposals: 56 },
    { month: 'Jun', proposals: 75 }
  ],
  statusData: [
    { name: 'Approved', value: 45, color: '#52c41a' },
    { name: 'Pending', value: 35, color: '#1890ff' },
    { name: 'Under Review', value: 25, color: '#faad14' },
    { name: 'Rejected', value: 15, color: '#ff4d4f' }
  ],
  departmentData: [
    { department: 'Computer Science', proposals: 45, color: '#1890ff' },
    { department: 'Electrical Engineering', proposals: 32, color: '#52c41a' },
    { department: 'Mechanical Engineering', proposals: 28, color: '#faad14' },
    { department: 'Civil Engineering', proposals: 22, color: '#f5222d' },
    { department: 'Chemical Engineering', proposals: 18, color: '#722ed1' }
  ]
}

export const mockUserData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@university.edu',
    role: 'STUDENT',
    department: 'Computer Science',
    created_at: '2025-08-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@university.edu',
    role: 'STUDENT',
    department: 'Electrical Engineering',
    created_at: '2025-08-02T10:00:00Z'
  },
  {
    id: '3',
    name: 'Dr. Wilson',
    email: 'wilson@university.edu',
    role: 'TEACHER',
    department: 'Computer Science',
    created_at: '2025-08-03T10:00:00Z'
  }
]
```

## Testing API Integration

### Service Testing
```javascript
// __tests__/services/analytics.service.test.js
import { analyticsService } from '../src/services/analytics.service'
import api from '../src/services/api'

jest.mock('../src/services/api')

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch dashboard data successfully', async () => {
    const mockData = { totalUsers: 100, totalProposals: 50 }
    api.get.mockResolvedValue({ data: mockData })

    const result = await analyticsService.getDashboardData()

    expect(api.get).toHaveBeenCalledWith('/analytics/dashboard')
    expect(result).toEqual(mockData)
  })

  it('should handle API errors gracefully', async () => {
    const mockError = { response: { data: { message: 'Server error' } } }
    api.get.mockRejectedValue(mockError)

    await expect(analyticsService.getDashboardData()).rejects.toEqual({
      message: 'Server error'
    })
  })
})
```

### Component Integration Testing
```javascript
// __tests__/components/AdminDashboard.test.js
import { render, screen, waitFor } from '@testing-library/react'
import AdminDashboard from '../src/app/(dashboard)/admin/page'
import { analyticsService } from '../src/services/analytics.service'

jest.mock('../src/services/analytics.service')

describe('Admin Dashboard', () => {
  it('should display fallback data when API fails', async () => {
    analyticsService.getDashboardData.mockRejectedValue(new Error('Network error'))

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('1250')).toBeInTheDocument() // fallback total users
    })
  })

  it('should display real data when API succeeds', async () => {
    const mockData = { totalUsers: 500, totalProposals: 100 }
    analyticsService.getDashboardData.mockResolvedValue(mockData)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })
})
```

## Performance Considerations

### API Request Optimization
```javascript
// Debounced API calls
import { debounce } from 'lodash'

const debouncedSearch = useMemo(
  () => debounce(async (searchTerm) => {
    try {
      const results = await userService.getAllUsers({ search: searchTerm })
      setSearchResults(results.data)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }, 300),
  []
)

// Cleanup debounce on unmount
useEffect(() => {
  return () => {
    debouncedSearch.cancel()
  }
}, [debouncedSearch])
```

### Caching Strategy
```javascript
// Simple cache implementation
const apiCache = new Map()

const cachedApiCall = async (endpoint, params = {}) => {
  const cacheKey = `${endpoint}?${JSON.stringify(params)}`
  
  if (apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey)
    if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached.data
    }
  }
  
  try {
    const response = await api.get(endpoint, { params })
    apiCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    })
    return response.data
  } catch (error) {
    throw error
  }
}
```

---

**API Integration Best Practices:**
1. Always implement error handling with fallbacks
2. Use consistent data transformation patterns
3. Provide mock data for development and testing
4. Implement proper caching strategies
5. Test both success and error scenarios
6. Document all API endpoints and data formats
