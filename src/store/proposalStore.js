import { create } from 'zustand'

const useProposalStore = create((set, get) => ({
  proposals: [],
  selectedProposal: null,
  filters: {
    status: 'all',
    department: 'all',
    dateRange: null,
  },
  loading: false,
  
  setProposals: (proposals) => set({ proposals }),
  
  setSelectedProposal: (proposal) => set({ selectedProposal: proposal }),
  
  addProposal: (proposal) => set((state) => ({
    proposals: [...state.proposals, { ...proposal, id: Date.now() }]
  })),
  
  updateProposal: (id, updates) => set((state) => ({
    proposals: state.proposals.map(proposal =>
      proposal.id === id ? { ...proposal, ...updates } : proposal
    )
  })),
  
  deleteProposal: (id) => set((state) => ({
    proposals: state.proposals.filter(proposal => proposal.id !== id)
  })),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  getFilteredProposals: () => {
    const { proposals, filters } = get()
    return proposals.filter(proposal => {
      if (filters.status !== 'all' && proposal.status !== filters.status) {
        return false
      }
      if (filters.department !== 'all' && proposal.department !== filters.department) {
        return false
      }
      return true
    })
  },
  
  setLoading: (loading) => set({ loading }),
  
  fetchProposals: async () => {
    set({ loading: true })
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProposals = [
        {
          id: 1,
          title: 'AI-Based Student Performance Prediction System',
          abstract: 'This project aims to develop a machine learning system that can predict student performance based on various academic and behavioral factors.',
          status: 'PENDING',
          type: 'Thesis',
          keywords: ['AI', 'Machine Learning', 'Education', 'Prediction'],
          submittedAt: '2024-01-15',
          supervisor: 'Dr. Smith',
          department: 'Computer Science',
          studentName: 'John Doe',
        },
        {
          id: 2,
          title: 'Blockchain-Based Academic Credential Verification',
          abstract: 'A decentralized system for verifying academic credentials using blockchain technology to prevent fraud and ensure authenticity.',
          status: 'APPROVED',
          type: 'Capstone',
          keywords: ['Blockchain', 'Security', 'Verification', 'Academic'],
          submittedAt: '2024-01-10',
          supervisor: 'Dr. Johnson',
          department: 'Computer Science',
          studentName: 'Jane Smith',
        },
      ]
      
      set({ proposals: mockProposals, loading: false })
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
      set({ loading: false })
    }
  },
  
  createProposal: async (proposalData) => {
    set({ loading: true })
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newProposal = {
        ...proposalData,
        id: Date.now(),
        status: 'PENDING',
        submittedAt: new Date().toISOString().split('T')[0],
      }
      
      get().addProposal(newProposal)
      set({ loading: false })
      return newProposal
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
}))

export default useProposalStore