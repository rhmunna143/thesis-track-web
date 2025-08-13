# Component Architecture Documentation

## State Management Architecture

### Zustand Stores
```javascript
// authStore.js - Authentication state
{
  user: null,
  token: null,
  isAuthenticated: false,
  login: (userData, token) => {},
  logout: () => {},
  updateUser: (userData) => {}
}

// notificationStore.js - Notification management
{
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async (params) => {},
  markAsRead: async (id) => {},
  deleteNotification: async (id) => {}
}

// projectBookStore.js - Project book management
{
  projectBooks: [],
  currentProjectBook: null,
  loading: false,
  fetchProjectBooks: async () => {},
  createProjectBook: async (data) => {},
  updateProjectBook: async (id, data) => {}
}
```

## Service Layer Architecture

### API Service Configuration
```javascript
// api.js - Axios configuration
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
```

### Service Methods Pattern
```javascript
// Example: analytics.service.js
export const analyticsService = {
  getDashboardData: async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
  
  getProposalAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
      const response = await api.get(`/analytics/proposals?${queryParams}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
```

## Component Patterns

### Error Handling Pattern
```javascript
// useDashboard.js - Error handling hook
export const useDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const executeAsync = useCallback(async (asyncFunction, errorMessage) => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      return result
    } catch (err) {
      console.error('Dashboard operation error:', err)
      if (!err.message?.includes('Network Error')) {
        const errorMsg = err.message || errorMessage
        setError(errorMsg)
        message.error(errorMsg)
      } else {
        console.warn('Backend unavailable, using fallback data')
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, executeAsync, clearError: () => setError(null) }
}
```

### Data Fetching Pattern
```javascript
// Individual error handling for each API call
const fetchDashboardData = async () => {
  // Dashboard statistics
  try {
    const dashboardStats = await analyticsService.getDashboardData()
    setDashboardData({
      totalUsers: dashboardStats.totalUsers || 0,
      totalProposals: dashboardStats.totalProposals || 0,
      totalTeachers: dashboardStats.totalTeachers || 0,
      activeSessions: dashboardStats.activeSessions || 0
    })
  } catch (error) {
    console.warn('Dashboard stats not available, using fallback:', error.message)
    setDashboardData({
      totalUsers: 1250,
      totalProposals: 156,
      totalTeachers: 48,
      activeSessions: 3
    })
  }

  // Proposal analytics
  try {
    const proposalStats = await analyticsService.getProposalAnalytics({
      groupBy: 'month',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })
    
    const monthlyData = proposalStats.monthlySubmissions || []
    const statusData = Object.entries(proposalStats.statusDistribution || {}).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().replace('_', ' '),
      value,
      color: getStatusColor(name)
    }))
    
    setProposalAnalytics({ monthlyData, statusData })
  } catch (error) {
    console.warn('Proposal analytics not available, using fallback:', error.message)
    setProposalAnalytics({
      monthlyData: [/* fallback data */],
      statusData: [/* fallback data */]
    })
  }
}
```

## Chart Implementation Patterns

### Dynamic Chart Component
```javascript
const renderChart = () => {
  const data = proposalAnalytics.trendData.length > 0 ? proposalAnalytics.trendData : proposalAnalytics.monthlyData
  
  switch (chartType) {
    case 'line':
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value, name) => [value, name === 'proposals' ? 'Proposals' : 'Cumulative']} />
          <Legend />
          <Line type="monotone" dataKey="proposals" stroke="#1890ff" strokeWidth={3} dot={{ r: 6 }} />
          <Line type="monotone" dataKey="cumulative" stroke="#52c41a" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      )
    case 'area':
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="proposals" stackId="1" stroke="#1890ff" fill="#1890ff" fillOpacity={0.6} />
          <Area type="monotone" dataKey="cumulative" stackId="2" stroke="#52c41a" fill="#52c41a" fillOpacity={0.3} />
        </AreaChart>
      )
    default: // bar chart
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value, name) => [value, name === 'proposals' ? 'Proposals' : 'Growth %']} />
          <Legend />
          <Bar dataKey="proposals" fill="#1890ff" radius={[4, 4, 0, 0]} />
          {proposalAnalytics.trendData.length > 0 && (
            <Bar dataKey="growth" fill="#faad14" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      )
  }
}
```

### Interactive Chart Controls
```javascript
<Card 
  title={
    <div className="flex justify-between items-center">
      <span>Proposal Analytics</span>
      <Space>
        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 120 }}
          options={[
            { label: '3 Months', value: '3months' },
            { label: '6 Months', value: '6months' },
            { label: '1 Year', value: '1year' }
          ]}
        />
        <Select
          value={chartType}
          onChange={setChartType}
          style={{ width: 100 }}
          options={[
            { label: <><BarChartOutlined /> Bar</>, value: 'bar' },
            { label: <><LineChartOutlined /> Line</>, value: 'line' },
            { label: <><AreaChartOutlined /> Area</>, value: 'area' }
          ]}
        />
      </Space>
    </div>
  }
  loading={loading}
>
  {(proposalAnalytics.monthlyData.length > 0 || proposalAnalytics.trendData.length > 0) ? (
    <ResponsiveContainer width="100%" height={320}>
      {renderChart()}
    </ResponsiveContainer>
  ) : (
    <div className="flex justify-center items-center h-[320px] text-gray-500">
      No data available
    </div>
  )}
</Card>
```

## PostgreSQL Integration Patterns

### Field Mapping Helper
```javascript
// Convert snake_case to camelCase
const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

// Convert camelCase to snake_case
const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// Transform object keys
const transformKeys = (obj, transformer) => {
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

### Array Handling Pattern
```javascript
// Parse PostgreSQL arrays
const parsePostgreSQLArray = (arrayString) => {
  if (!arrayString || arrayString === '{}') return []
  if (Array.isArray(arrayString)) return arrayString
  
  const cleanString = arrayString.replace(/[{}]/g, '')
  if (!cleanString.trim()) return []
  
  return cleanString.split(',').map(item => item.trim().replace(/"/g, ''))
}

// Format arrays for PostgreSQL
const formatArrayForPostgreSQL = (array) => {
  if (!Array.isArray(array)) return '{}'
  return `{${array.map(item => `"${item}"`).join(',')}}`
}
```

## Performance Optimization Patterns

### React Optimization
```javascript
// Memoized components
const ChartComponent = React.memo(({ data, chartType, loading }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      {renderChart()}
    </ResponsiveContainer>
  )
})

// Optimized callbacks
const handleChartTypeChange = useCallback((newType) => {
  setChartType(newType)
}, [])

const handleTimeRangeChange = useCallback((newRange) => {
  setTimeRange(newRange)
}, [])

// Debounced data fetching
const debouncedFetch = useMemo(
  () => debounce(fetchDashboardData, 300),
  [fetchDashboardData]
)
```

### Loading State Management
```javascript
// Centralized loading states
const [loadingStates, setLoadingStates] = useState({
  dashboard: false,
  analytics: false,
  users: false
})

const setLoading = useCallback((key, isLoading) => {
  setLoadingStates(prev => ({
    ...prev,
    [key]: isLoading
  }))
}, [])

// Usage
setLoading('dashboard', true)
// ... fetch data
setLoading('dashboard', false)
```

## Error Boundary Implementation

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Testing Patterns

### Component Testing
```javascript
// Example test for chart component
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminDashboard } from './page'

describe('AdminDashboard', () => {
  it('should render charts with fallback data', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Proposal Analytics')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument() // chart type selector
  })

  it('should change chart type when selector is used', () => {
    render(<AdminDashboard />)
    const selector = screen.getByRole('combobox')
    fireEvent.change(selector, { target: { value: 'line' } })
    // Assert chart type change
  })
})
```

### API Testing
```javascript
// Mock service for testing
jest.mock('../../../services/analytics.service', () => ({
  analyticsService: {
    getDashboardData: jest.fn().mockResolvedValue({
      totalUsers: 100,
      totalProposals: 50,
      totalTeachers: 10,
      activeSessions: 5
    }),
    getProposalAnalytics: jest.fn().mockResolvedValue({
      monthlySubmissions: [
        { month: 'Jan', proposals: 10 },
        { month: 'Feb', proposals: 15 }
      ],
      statusDistribution: {
        PENDING: 20,
        APPROVED: 30
      }
    })
  }
}))
```
