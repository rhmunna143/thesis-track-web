// Mock data for session management when backend is unavailable

export const mockSessionsData = [
  {
    id: 1,
    name: 'Spring 2025',
    isActive: true,
    isArchived: false,
    proposalCount: 45,
    studentCount: 120,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-02-01T15:30:00Z'
  },
  {
    id: 2,
    name: 'Fall 2024',
    isActive: false,
    isArchived: false,
    proposalCount: 38,
    studentCount: 95,
    createdAt: '2024-08-20T09:00:00Z',
    updatedAt: '2024-12-20T16:45:00Z'
  },
  {
    id: 3,
    name: 'Spring 2024',
    isActive: false,
    isArchived: true,
    proposalCount: 42,
    studentCount: 110,
    createdAt: '2024-01-10T08:30:00Z',
    updatedAt: '2024-05-25T14:20:00Z'
  },
  {
    id: 4,
    name: 'Fall 2023',
    isActive: false,
    isArchived: true,
    proposalCount: 35,
    studentCount: 88,
    createdAt: '2023-08-15T08:00:00Z',
    updatedAt: '2023-12-15T17:00:00Z'
  },
  {
    id: 5,
    name: 'Spring 2023',
    isActive: false,
    isArchived: true,
    proposalCount: 39,
    studentCount: 102,
    createdAt: '2023-01-10T09:30:00Z',
    updatedAt: '2023-05-20T16:15:00Z'
  }
]

export const mockActiveSession = {
  id: 1,
  name: 'Spring 2025',
  isActive: true,
  createdAt: '2025-01-15T10:00:00Z'
}

export const mockSessionAnalytics = (session) => ({
  totalProposals: session.proposalCount || 0,
  approvedProposals: Math.floor((session.proposalCount || 0) * 0.65),
  pendingProposals: Math.floor((session.proposalCount || 0) * 0.25),
  rejectedProposals: Math.floor((session.proposalCount || 0) * 0.10),
  revisionRequiredProposals: Math.floor((session.proposalCount || 0) * 0.15),
  departmentBreakdown: [
    {
      department: 'Computer Science',
      proposals: Math.floor((session.proposalCount || 0) * 0.35)
    },
    {
      department: 'Electrical Engineering',
      proposals: Math.floor((session.proposalCount || 0) * 0.25)
    },
    {
      department: 'Mechanical Engineering',
      proposals: Math.floor((session.proposalCount || 0) * 0.20)
    },
    {
      department: 'Civil Engineering',
      proposals: Math.floor((session.proposalCount || 0) * 0.20)
    }
  ],
  submissionTrend: [
    { month: 'Jan', submissions: Math.floor((session.proposalCount || 0) * 0.15) },
    { month: 'Feb', submissions: Math.floor((session.proposalCount || 0) * 0.25) },
    { month: 'Mar', submissions: Math.floor((session.proposalCount || 0) * 0.35) },
    { month: 'Apr', submissions: Math.floor((session.proposalCount || 0) * 0.25) }
  ]
})

export const calculateSessionStats = (sessions) => {
  const totalSessions = sessions.length
  const activeSessions = sessions.filter(s => s.isActive).length
  const completedSessions = sessions.filter(s => !s.isActive && !s.isArchived).length
  const archivedSessions = sessions.filter(s => s.isArchived).length
  const totalProposals = sessions.reduce((sum, s) => sum + (s.proposalCount || 0), 0)
  const avgProposalsPerSession = totalSessions > 0 ? Math.round(totalProposals / totalSessions) : 0

  return {
    totalSessions,
    activeSessions,
    completedSessions,
    archivedSessions,
    totalProposals,
    avgProposalsPerSession
  }
}
