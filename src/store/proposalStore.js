import { create } from 'zustand'
import { proposalService } from '../services/proposal.service'
import { commentService } from '../services/comment.service'

const useProposalStore = create((set, get) => ({
  proposals: [],
  selectedProposal: null,
  comments: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    status: 'all',
    department: 'all',
    search: '',
    dateRange: null,
  },
  loading: false,
  error: null,
  
  setProposals: (proposals) => set({ proposals }),
  
  setPagination: (pagination) => set({ pagination }),
  
  setSelectedProposal: (proposal) => set({ selectedProposal: proposal }),
  
  setComments: (comments) => set({ comments }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Fetch proposals with filtering and pagination
  fetchProposals: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const { filters, pagination } = get()
      
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...filters,
        ...params
      }
      
      // Remove 'all' values
      if (queryParams.status === 'all') delete queryParams.status
      if (queryParams.department === 'all') delete queryParams.department
      if (!queryParams.search) delete queryParams.search
      
      const response = await proposalService.getProposals(queryParams)
      
      set({ 
        proposals: response.data || response,
        pagination: response.pagination || pagination,
        loading: false,
        error: null
      })
      
      return response
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch proposals' 
      })
      throw error
    }
  },

  // Get proposal by ID
  fetchProposalById: async (proposalId) => {
    set({ loading: true, error: null })
    try {
      const proposal = await proposalService.getProposalById(proposalId)
      
      set({ 
        selectedProposal: proposal,
        loading: false,
        error: null
      })
      
      return proposal
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch proposal' 
      })
      throw error
    }
  },
  
  // Create new proposal
  createProposal: async (proposalData) => {
    set({ loading: true, error: null })
    try {
      const newProposal = await proposalService.submitProposal(proposalData)
      
      set((state) => ({ 
        proposals: [newProposal, ...state.proposals],
        loading: false,
        error: null
      }))
      
      return newProposal
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to create proposal' 
      })
      throw error
    }
  },
  
  // Update proposal
  updateProposal: async (proposalId, updates) => {
    set({ loading: true, error: null })
    try {
      const updatedProposal = await proposalService.updateProposal(proposalId, updates)
      
      set((state) => ({
        proposals: state.proposals.map(proposal =>
          proposal.id === proposalId ? { ...proposal, ...updatedProposal } : proposal
        ),
        selectedProposal: state.selectedProposal?.id === proposalId 
          ? { ...state.selectedProposal, ...updatedProposal } 
          : state.selectedProposal,
        loading: false,
        error: null
      }))
      
      return updatedProposal
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to update proposal' 
      })
      throw error
    }
  },

  // Update proposal status (for teachers)
  updateProposalStatus: async (proposalId, status) => {
    set({ loading: true, error: null })
    try {
      const updatedProposal = await proposalService.updateProposalStatus(proposalId, status)
      
      set((state) => ({
        proposals: state.proposals.map(proposal =>
          proposal.id === proposalId ? { ...proposal, status } : proposal
        ),
        selectedProposal: state.selectedProposal?.id === proposalId 
          ? { ...state.selectedProposal, status } 
          : state.selectedProposal,
        loading: false,
        error: null
      }))
      
      return updatedProposal
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to update proposal status' 
      })
      throw error
    }
  },

  // Assign supervisor (for admins)
  assignSupervisor: async (proposalId, supervisorId) => {
    set({ loading: true, error: null })
    try {
      const updatedProposal = await proposalService.assignSupervisor(proposalId, supervisorId)
      
      set((state) => ({
        proposals: state.proposals.map(proposal =>
          proposal.id === proposalId ? { ...proposal, supervisorId } : proposal
        ),
        selectedProposal: state.selectedProposal?.id === proposalId 
          ? { ...state.selectedProposal, supervisorId } 
          : state.selectedProposal,
        loading: false,
        error: null
      }))
      
      return updatedProposal
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to assign supervisor' 
      })
      throw error
    }
  },
  
  // Delete proposal
  deleteProposal: async (proposalId) => {
    set({ loading: true, error: null })
    try {
      await proposalService.deleteProposal(proposalId)
      
      set((state) => ({
        proposals: state.proposals.filter(proposal => proposal.id !== proposalId),
        selectedProposal: state.selectedProposal?.id === proposalId ? null : state.selectedProposal,
        loading: false,
        error: null
      }))
      
      return true
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to delete proposal' 
      })
      throw error
    }
  },

  // Fetch comments for a proposal
  fetchComments: async (proposalId) => {
    set({ loading: true, error: null })
    try {
      const comments = await commentService.getCommentsByProposal(proposalId)
      
      set({ 
        comments: comments,
        loading: false,
        error: null
      })
      
      return comments
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch comments' 
      })
      throw error
    }
  },

  // Add comment to proposal
  addComment: async (proposalId, content) => {
    set({ loading: true, error: null })
    try {
      const newComment = await commentService.addComment(proposalId, content)
      
      set((state) => ({
        comments: [...state.comments, newComment],
        loading: false,
        error: null
      }))
      
      return newComment
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to add comment' 
      })
      throw error
    }
  },
  
  // Get filtered proposals (client-side filtering for already loaded data)
  getFilteredProposals: () => {
    const { proposals, filters } = get()
    return proposals.filter(proposal => {
      if (filters.status !== 'all' && proposal.status !== filters.status) {
        return false
      }
      if (filters.department !== 'all' && proposal.department !== filters.department) {
        return false
      }
      if (filters.search && !proposal.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      return true
    })
  },

  // Get proposals by status
  getProposalsByStatus: (status) => {
    const { proposals } = get()
    return proposals.filter(proposal => proposal.status === status)
  },

  // Search proposals
  searchProposals: async (query, params = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await proposalService.searchProposals(query, params)
      
      set({ 
        proposals: response.data || response,
        pagination: response.pagination || get().pagination,
        loading: false,
        error: null
      })
      
      return response
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to search proposals' 
      })
      throw error
    }
  },

  // Reset store
  reset: () => set({
    proposals: [],
    selectedProposal: null,
    comments: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    filters: {
      status: 'all',
      department: 'all',
      search: '',
      dateRange: null,
    },
    loading: false,
    error: null
  })
}))

export default useProposalStore