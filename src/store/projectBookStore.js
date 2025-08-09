import { create } from 'zustand'
import { projectBookService } from '../services/projectBook.service'

const useProjectBookStore = create((set, get) => ({
  projectBooks: [],
  selectedProjectBook: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    status: 'all',
    search: '',
    supervisorId: null,
    studentId: null,
  },
  loading: false,
  error: null,

  // Setters
  setProjectBooks: (projectBooks) => set({ projectBooks }),
  setSelectedProjectBook: (projectBook) => set({ selectedProjectBook: projectBook }),
  setPagination: (pagination) => set({ pagination }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch project books with filtering and pagination
  fetchProjectBooks: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const { filters, pagination } = get()
      
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...filters,
        ...params
      }
      
      // Remove 'all' values and null values
      if (queryParams.status === 'all') delete queryParams.status
      if (!queryParams.search) delete queryParams.search
      if (!queryParams.supervisorId) delete queryParams.supervisorId
      if (!queryParams.studentId) delete queryParams.studentId
      
      const response = await projectBookService.getProjectBooks(queryParams)
      
      set({ 
        projectBooks: response.data || response,
        pagination: response.pagination || pagination,
        loading: false,
        error: null
      })
      
      return response
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch project books' 
      })
      throw error
    }
  },

  // Get project book by ID
  fetchProjectBookById: async (projectBookId) => {
    set({ loading: true, error: null })
    try {
      const projectBook = await projectBookService.getProjectBookById(projectBookId)
      
      set({ 
        selectedProjectBook: projectBook,
        loading: false,
        error: null
      })
      
      return projectBook
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch project book' 
      })
      throw error
    }
  },

  // Submit new project book
  submitProjectBook: async (projectBookData) => {
    set({ loading: true, error: null })
    try {
      const newProjectBook = await projectBookService.submitProjectBook(projectBookData)
      
      set((state) => ({ 
        projectBooks: [newProjectBook, ...state.projectBooks],
        loading: false,
        error: null
      }))
      
      return newProjectBook
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to submit project book' 
      })
      throw error
    }
  },

  // Update project book
  updateProjectBook: async (projectBookId, updates) => {
    set({ loading: true, error: null })
    try {
      const updatedProjectBook = await projectBookService.updateProjectBook(projectBookId, updates)
      
      set((state) => ({
        projectBooks: state.projectBooks.map(book =>
          book.id === projectBookId ? { ...book, ...updatedProjectBook } : book
        ),
        selectedProjectBook: state.selectedProjectBook?.id === projectBookId 
          ? { ...state.selectedProjectBook, ...updatedProjectBook } 
          : state.selectedProjectBook,
        loading: false,
        error: null
      }))
      
      return updatedProjectBook
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to update project book' 
      })
      throw error
    }
  },

  // Review project book (Teachers/Admins)
  reviewProjectBook: async (projectBookId, reviewData) => {
    set({ loading: true, error: null })
    try {
      const reviewedProjectBook = await projectBookService.reviewProjectBook(projectBookId, reviewData)
      
      set((state) => ({
        projectBooks: state.projectBooks.map(book =>
          book.id === projectBookId ? { ...book, ...reviewedProjectBook } : book
        ),
        selectedProjectBook: state.selectedProjectBook?.id === projectBookId 
          ? { ...state.selectedProjectBook, ...reviewedProjectBook } 
          : state.selectedProjectBook,
        loading: false,
        error: null
      }))
      
      return reviewedProjectBook
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to review project book' 
      })
      throw error
    }
  },

  // Update project book status (Admin)
  updateStatus: async (projectBookId, status) => {
    set({ loading: true, error: null })
    try {
      const updatedProjectBook = await projectBookService.updateStatus(projectBookId, status)
      
      set((state) => ({
        projectBooks: state.projectBooks.map(book =>
          book.id === projectBookId ? { ...book, status } : book
        ),
        selectedProjectBook: state.selectedProjectBook?.id === projectBookId 
          ? { ...state.selectedProjectBook, status } 
          : state.selectedProjectBook,
        loading: false,
        error: null
      }))
      
      return updatedProjectBook
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to update project book status' 
      })
      throw error
    }
  },

  // Grade project book (Teachers/Admins)
  gradeProjectBook: async (projectBookId, gradeData) => {
    set({ loading: true, error: null })
    try {
      const gradedProjectBook = await projectBookService.gradeProjectBook(projectBookId, gradeData)
      
      set((state) => ({
        projectBooks: state.projectBooks.map(book =>
          book.id === projectBookId ? { ...book, ...gradedProjectBook } : book
        ),
        selectedProjectBook: state.selectedProjectBook?.id === projectBookId 
          ? { ...state.selectedProjectBook, ...gradedProjectBook } 
          : state.selectedProjectBook,
        loading: false,
        error: null
      }))
      
      return gradedProjectBook
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to grade project book' 
      })
      throw error
    }
  },

  // Delete project book
  deleteProjectBook: async (projectBookId) => {
    set({ loading: true, error: null })
    try {
      await projectBookService.deleteProjectBook(projectBookId)
      
      set((state) => ({
        projectBooks: state.projectBooks.filter(book => book.id !== projectBookId),
        selectedProjectBook: state.selectedProjectBook?.id === projectBookId 
          ? null : state.selectedProjectBook,
        loading: false,
        error: null
      }))
      
      return true
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to delete project book' 
      })
      throw error
    }
  },

  // Submit for review
  submitForReview: async (projectBookId) => {
    set({ loading: true, error: null })
    try {
      const submittedProjectBook = await projectBookService.submitForReview(projectBookId)
      
      set((state) => ({
        projectBooks: state.projectBooks.map(book =>
          book.id === projectBookId 
            ? { ...book, status: 'SUBMITTED', submitted_at: new Date().toISOString() }
            : book
        ),
        selectedProjectBook: state.selectedProjectBook?.id === projectBookId 
          ? { 
              ...state.selectedProjectBook, 
              status: 'SUBMITTED', 
              submitted_at: new Date().toISOString() 
            } 
          : state.selectedProjectBook,
        loading: false,
        error: null
      }))
      
      return submittedProjectBook
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to submit project book for review' 
      })
      throw error
    }
  },

  // Download project book document
  downloadDocument: async (projectBookId) => {
    set({ loading: true, error: null })
    try {
      const blob = await projectBookService.downloadDocument(projectBookId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `project-book-${projectBookId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      set({ loading: false, error: null })
      return true
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to download project book document' 
      })
      throw error
    }
  },

  // Download presentation
  downloadPresentation: async (projectBookId) => {
    set({ loading: true, error: null })
    try {
      const blob = await projectBookService.downloadPresentation(projectBookId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `presentation-${projectBookId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      set({ loading: false, error: null })
      return true
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to download presentation' 
      })
      throw error
    }
  },

  // Get project books by status
  getProjectBooksByStatus: (status) => {
    const { projectBooks } = get()
    return projectBooks.filter(book => book.status === status)
  },

  // Get pending project books
  getPendingProjectBooks: () => {
    return get().getProjectBooksByStatus('PENDING')
  },

  // Get approved project books
  getApprovedProjectBooks: () => {
    return get().getProjectBooksByStatus('APPROVED')
  },

  // Get my project books (for students)
  getMyProjectBooks: () => {
    const { projectBooks } = get()
    return projectBooks // API should filter by current user
  },

  // Get assigned project books (for teachers)
  getAssignedProjectBooks: () => {
    const { projectBooks } = get()
    return projectBooks // API should filter by current teacher
  },

  // Search project books
  searchProjectBooks: async (query, params = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await projectBookService.searchProjectBooks(query, params)
      
      set({ 
        projectBooks: response.data || response,
        pagination: response.pagination || get().pagination,
        loading: false,
        error: null
      })
      
      return response
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to search project books' 
      })
      throw error
    }
  },

  // Get filtered project books (client-side filtering)
  getFilteredProjectBooks: () => {
    const { projectBooks, filters } = get()
    return projectBooks.filter(book => {
      if (filters.status !== 'all' && book.status !== filters.status) {
        return false
      }
      if (filters.search && !book.title?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.supervisorId && book.supervisorId !== filters.supervisorId) {
        return false
      }
      if (filters.studentId && book.studentId !== filters.studentId) {
        return false
      }
      return true
    })
  },

  // Get project book statistics
  fetchProjectBookStats: async () => {
    set({ loading: true, error: null })
    try {
      const stats = await projectBookService.getProjectBookStats()
      
      set({ loading: false, error: null })
      return stats
    } catch (error) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch project book statistics' 
      })
      throw error
    }
  },

  // Reset store
  reset: () => set({
    projectBooks: [],
    selectedProjectBook: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    filters: {
      status: 'all',
      search: '',
      supervisorId: null,
      studentId: null,
    },
    loading: false,
    error: null
  })
}))

export default useProjectBookStore