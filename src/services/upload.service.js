import api from './api'
import axios from 'axios'
import { config } from '../lib/config'

export const uploadService = {
  // Upload PDF document to backend
  uploadDocument: async (file) => {
    const validation = uploadService.validateFile(file, false)
    if (!validation.isValid) {
      throw new Error(validation.errors[0])
    }

    const formData = new FormData()
    formData.append('document', file)

    try {
      const response = await api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Upload image to backend
  uploadImage: async (file) => {
    const validation = uploadService.validateFile(file, true)
    if (!validation.isValid) {
      throw new Error(validation.errors[0])
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Upload profile picture (automatically updates user profile)
  uploadProfilePicture: async (file) => {
    const validation = uploadService.validateFile(file, true)
    if (!validation.isValid) {
      throw new Error(validation.errors[0])
    }

    const formData = new FormData()
    formData.append('profile', file)

    try {
      const response = await api.post('/upload/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete uploaded file
  deleteFile: async (filename, type = 'document') => {
    try {
      const response = await api.delete(`/upload/${filename}?type=${type}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Fallback to Imgbb for external image hosting if needed
  uploadToImgbb: async (file) => {
    if (!config.upload.imgbb.apiKey) {
      throw new Error('Imgbb API key is not configured')
    }

    const formData = new FormData()
    formData.append('key', config.upload.imgbb.apiKey)
    formData.append('image', file)

    try {
      const response = await axios.post(config.upload.imgbb.uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        return {
          url: response.data.data.url,
          displayUrl: response.data.data.display_url,
          deleteUrl: response.data.data.delete_url,
          size: response.data.data.size,
          filename: response.data.data.title,
        }
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'Upload failed')
    }
  },

  // Universal upload function - automatically chooses backend endpoint
  uploadFile: async (file, isProfileImage = false) => {
    const validation = uploadService.validateFile(file, isProfileImage)
    if (!validation.isValid) {
      throw new Error(validation.errors[0])
    }

    const fileExtension = file.name.split('.').pop().toLowerCase()

    try {
      // For profile images
      if (isProfileImage) {
        return await uploadService.uploadProfilePicture(file)
      }

      // For documents (PDF, DOC, etc.)
      if (['pdf', 'doc', 'docx'].includes(fileExtension)) {
        return await uploadService.uploadDocument(file)
      }

      // For regular images
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        return await uploadService.uploadImage(file)
      }

      throw new Error('Unsupported file type')
    } catch (error) {
      throw error
    }
  },

  // Validate file before upload
  validateFile: (file, isProfileImage = false) => {
    const allowedTypes = config.upload.allowedTypes
    const maxSize = isProfileImage ? config.upload.maxProfileImageSize : config.upload.maxFileSize
    const fileExtension = file.name.split('.').pop().toLowerCase()

    const errors = []

    // Check file type
    if (!allowedTypes.includes(fileExtension)) {
      errors.push(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024)
      const fileSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100
      errors.push(`File size ${fileSizeMB}MB exceeds ${maxSizeMB}MB limit`)
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Get file type category
  getFileType: (filename) => {
    const extension = filename.split('.').pop().toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image'
    } else if (['pdf', 'doc', 'docx'].includes(extension)) {
      return 'document'
    }
    
    return 'unknown'
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}