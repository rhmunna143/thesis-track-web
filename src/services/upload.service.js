import axios from 'axios'
import { config } from '../lib/config'

export const uploadService = {
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

  uploadFile: async (file, isProfileImage = false) => {
    // Validate file
    const validation = uploadService.validateFile(file, isProfileImage)
    if (!validation.isValid) {
      throw new Error(validation.errors[0])
    }

    const fileExtension = file.name.split('.').pop().toLowerCase()

    // For images, use Imgbb
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return await uploadService.uploadToImgbb(file)
    }

    // For other files (PDF, DOC), you would typically use your own backend
    // This is a placeholder for backend file upload
    return new Promise((resolve, reject) => {
      // Mock upload for development
      setTimeout(() => {
        resolve({
          url: `https://example.com/files/${Date.now()}-${file.name}`,
          filename: file.name,
          size: file.size,
          type: file.type,
        })
      }, 1000)
    })
  },

  validateFile: (file, isProfileImage = false) => {
    const allowedTypes = config.upload.allowedTypes
    const maxSize = isProfileImage ? config.upload.maxProfileImageSize : config.upload.maxFileSize
    const fileExtension = file.name.split('.').pop().toLowerCase()

    const errors = []

    if (!allowedTypes.includes(fileExtension)) {
      errors.push(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }

    if (file.size > maxSize) {
      errors.push(`File size ${Math.round(file.size / 1024 / 1024)}MB exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}