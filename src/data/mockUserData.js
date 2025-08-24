// Mock data for user management testing

export const mockUserStats = {
  totalUsers: 156,
  activeUsers: 148,
  totalStudents: 120,
  totalTeachers: 32,
  totalAdmins: 4
}

export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@university.edu',
    role: 'STUDENT',
    department: 'Computer Science',
    isActive: true,
    profilePicture: null,
    createdAt: '2025-01-15T10:00:00Z',
    lastLogin: '2025-08-20T14:30:00Z',
    bio: 'Final year CS student interested in machine learning and AI.'
  },
  {
    id: 2,
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@university.edu',
    role: 'TEACHER',
    department: 'Computer Science',
    isActive: true,
    profilePicture: null,
    createdAt: '2025-01-10T09:00:00Z',
    lastLogin: '2025-08-22T08:15:00Z',
    bio: 'Associate Professor specializing in Software Engineering and Database Systems.'
  },
  {
    id: 3,
    name: 'Prof. Michael Brown',
    email: 'michael.brown@university.edu',
    role: 'TEACHER',
    department: 'Electrical Engineering',
    isActive: true,
    profilePicture: null,
    createdAt: '2025-01-08T11:00:00Z',
    lastLogin: '2025-08-21T16:45:00Z',
    bio: 'Professor of Electrical Engineering with expertise in Power Systems.'
  },
  {
    id: 4,
    name: 'Emily Johnson',
    email: 'emily.johnson@university.edu',
    role: 'STUDENT',
    department: 'Computer Science',
    isActive: true,
    profilePicture: null,
    createdAt: '2025-02-01T14:20:00Z',
    lastLogin: '2025-08-19T10:45:00Z',
    bio: 'Third year student focusing on web development and mobile applications.'
  },
  {
    id: 5,
    name: 'Dr. Robert Chen',
    email: 'robert.chen@university.edu',
    role: 'TEACHER',
    department: 'Mechanical Engineering',
    isActive: true,
    profilePicture: null,
    createdAt: '2025-01-05T16:30:00Z',
    lastLogin: '2025-08-22T09:20:00Z',
    bio: 'Assistant Professor in Mechanical Engineering, research in Robotics.'
  },
  {
    id: 6,
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'ADMIN',
    department: 'Administration',
    isActive: true,
    profilePicture: null,
    createdAt: '2024-12-01T08:00:00Z',
    lastLogin: '2025-08-22T07:00:00Z',
    bio: 'System administrator managing the thesis tracking platform.'
  },
  {
    id: 7,
    name: 'David Martinez',
    email: 'david.martinez@university.edu',
    role: 'STUDENT',
    department: 'Electrical Engineering',
    isActive: true,
    profilePicture: null,
    createdAt: '2025-01-20T12:15:00Z',
    lastLogin: '2025-08-18T15:30:00Z',
    bio: 'Graduate student working on renewable energy systems.'
  },
  {
    id: 8,
    name: 'Dr. Lisa Wang',
    email: 'lisa.wang@university.edu',
    role: 'TEACHER',
    department: 'Civil Engineering',
    isActive: true,
    profilePicture: null,
    createdAt: '2025-01-12T10:45:00Z',
    lastLogin: '2025-08-21T13:20:00Z',
    bio: 'Professor specializing in Structural Engineering and Construction Management.'
  },
  {
    id: 9,
    name: 'Alex Thompson',
    email: 'alex.thompson@university.edu',
    role: 'STUDENT',
    department: 'Mechanical Engineering',
    isActive: false,
    profilePicture: null,
    createdAt: '2024-12-15T09:30:00Z',
    lastLogin: '2025-07-30T16:20:00Z',
    bio: 'Student on academic leave, specializing in automotive engineering.'
  },
  {
    id: 10,
    name: 'Dr. Jennifer Lee',
    email: 'jennifer.lee@university.edu',
    role: 'TEACHER',
    department: 'Computer Science',
    isActive: true,
    profilePicture: null,
    createdAt: '2024-11-20T14:00:00Z',
    lastLogin: '2025-08-22T11:10:00Z',
    bio: 'Research Professor in Artificial Intelligence and Machine Learning.'
  }
]

export const mockDepartments = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Industrial Engineering',
  'Information Technology',
  'Mathematics',
  'Physics',
  'Administration'
]

export const mockRoles = [
  { value: 'STUDENT', label: 'Student', color: 'green' },
  { value: 'TEACHER', label: 'Teacher', color: 'blue' },
  { value: 'ADMIN', label: 'Admin', color: 'purple' }
]

// Simulate API response format
export const mockApiResponse = {
  data: mockUsers,
  total: mockUsers.length,
  page: 1,
  limit: 10,
  stats: mockUserStats
}

// Helper function to filter users based on criteria
export const filterUsers = (users, filters) => {
  return users.filter(user => {
    let matches = true
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      matches = matches && (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.role) {
      matches = matches && user.role === filters.role
    }
    
    if (filters.department) {
      matches = matches && user.department === filters.department
    }
    
    return matches
  })
}

// Helper function to paginate results
export const paginateUsers = (users, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    data: users.slice(startIndex, endIndex),
    total: users.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(users.length / limit)
  }
}

// Simulate user creation
export const createMockUser = (userData) => {
  const newUser = {
    id: Math.max(...mockUsers.map(u => u.id)) + 1,
    ...userData,
    isActive: true,
    profilePicture: null,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    bio: userData.bio || ''
  }
  
  mockUsers.push(newUser)
  
  // Update stats
  mockUserStats.totalUsers++
  mockUserStats.activeUsers++
  
  if (userData.role === 'STUDENT') mockUserStats.totalStudents++
  else if (userData.role === 'TEACHER') mockUserStats.totalTeachers++
  else if (userData.role === 'ADMIN') mockUserStats.totalAdmins++
  
  return newUser
}

// Simulate user update
export const updateMockUser = (userId, updateData) => {
  const userIndex = mockUsers.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updateData }
    return mockUsers[userIndex]
  }
  return null
}

// Simulate user deletion
export const deleteMockUser = (userId) => {
  const userIndex = mockUsers.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    const deletedUser = mockUsers[userIndex]
    mockUsers.splice(userIndex, 1)
    
    // Update stats
    mockUserStats.totalUsers--
    if (deletedUser.isActive) mockUserStats.activeUsers--
    
    if (deletedUser.role === 'STUDENT') mockUserStats.totalStudents--
    else if (deletedUser.role === 'TEACHER') mockUserStats.totalTeachers--
    else if (deletedUser.role === 'ADMIN') mockUserStats.totalAdmins--
    
    return true
  }
  return false
}

// CSV template for bulk import
export const csvTemplate = `name,email,role,department
John Smith,john.smith@university.edu,STUDENT,Computer Science
Jane Doe,jane.doe@university.edu,TEACHER,Electrical Engineering
Bob Johnson,bob.johnson@university.edu,STUDENT,Mechanical Engineering`

// Helper to parse CSV content
export const parseCsvContent = (csvContent) => {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  const users = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const user = {}
    
    headers.forEach((header, index) => {
      user[header] = values[index] || ''
    })
    
    // Add default values
    user.password = 'temp123456'
    user.isActive = true
    
    users.push(user)
  }
  
  return users
}
