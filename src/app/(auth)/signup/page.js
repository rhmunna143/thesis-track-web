'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, Input, Button, Alert, Checkbox, Select } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import useAuthStore from '../../../store/authStore'
import { authService } from '../../../services/auth.service'
import { config } from '../../../lib/config'

const { Option } = Select

const departments = config.academic.departments

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const onFinish = async (values) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await authService.signup({
        name: values.name,
        email: values.email,
        password: values.password,
        department: values.department,
        role: 'STUDENT', // Default role
      })
      
      setSuccess('Account created successfully! Please check your email for verification.')
      
      // Auto login after successful signup
      setTimeout(() => {
        login(response.user, response.token)
        router.push('/student')
      }, 2000)
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-b from-PrimaryBlue to-blue backdrop-blur-sm border border-SuccessGreen rounded-2xl p-8 shadow-2xl shadow-PrimaryBlue">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2 tracking-wider">
              CREATE ACCOUNT
            </h1>
            <p className="text-gray-300 text-sm">Join ThesisTrack to manage your proposals</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-400 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-3 bg-green-500/20 border border-green-400 rounded-lg">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* Signup Form */}
          <Form
            name="signup"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            {/* Full Name Field */}
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input your full name!' }]}
              className="mb-5"
            >
              <Input
                prefix={<UserOutlined className="text-gray-400 mr-2" />}
                placeholder="Full Name"
                className="custom-input bg-transparent border border-[#2C5F8D] rounded-full px-5 py-3 text-white placeholder-gray-400 hover:border-[#3B82F6] focus:border-[#3B82F6] transition-all duration-300"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                }}
              />
            </Form.Item>

            {/* Email Field */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
                {
                  pattern: /.*\.edu$/,
                  message: 'Please use your university email (.edu domain)',
                },
              ]}
              className="mb-5"
            >
              <Input
                prefix={<MailOutlined className="text-gray-400 mr-2" />}
                placeholder="University Email"
                className="custom-input bg-transparent border border-[#2C5F8D] rounded-full px-5 py-3 text-white placeholder-gray-400 hover:border-[#3B82F6] focus:border-[#3B82F6] transition-all duration-300"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                }}
              />
            </Form.Item>

            {/* Department Field */}
            <Form.Item
              name="department"
              rules={[{ required: true, message: 'Please select your department!' }]}
              className="mb-5"
            >
              <Select 
                placeholder="Select Department"
                className="custom-select"
                dropdownClassName="custom-dropdown"
                style={{
                  width: '100%',
                }}
              >
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
              ]}
              className="mb-5"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400 mr-2" />}
                placeholder="Password"
                className="custom-input-password bg-transparent border border-[#2C5F8D] rounded-full px-5 py-3 text-white placeholder-gray-400 hover:border-[#3B82F6] focus:border-[#3B82F6] transition-all duration-300"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone twoToneColor="#9CA3AF" />
                  ) : (
                    <EyeInvisibleOutlined className="text-gray-400" />
                  )
                }
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                }}
              />
            </Form.Item>

            {/* Confirm Password Field */}
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match!'))
                  },
                }),
              ]}
              className="mb-5"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400 mr-2" />}
                placeholder="Confirm Password"
                className="custom-input-password bg-transparent border border-[#2C5F8D] rounded-full px-5 py-3 text-white placeholder-gray-400 hover:border-[#3B82F6] focus:border-[#3B82F6] transition-all duration-300"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone twoToneColor="#9CA3AF" />
                  ) : (
                    <EyeInvisibleOutlined className="text-gray-400" />
                  )
                }
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                }}
              />
            </Form.Item>

            {/* Terms Agreement */}
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error('Please accept the terms!')),
                },
              ]}
              className="mb-6"
            >
              <Checkbox className="text-gray-300">
                <span className="text-gray-300 text-sm">
                  I agree to the <Link href="/terms" className="text-[#5DADE2] hover:text-[#85C1E9]">Terms of Service</Link> and{' '}
                  <Link href="/privacy" className="text-[#5DADE2] hover:text-[#85C1E9]">Privacy Policy</Link>
                </span>
              </Checkbox>
            </Form.Item>

            {/* Signup Button */}
            <Form.Item className="mb-6">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full h-12 bg-PrimaryBlue hover:bg-[#2C5F8D] border border-[#2C5F8D] rounded-full text-white font-medium text-base transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: "#1B4F72",
                  borderColor: "#2C5F8D",
                }}
              >
                CREATE ACCOUNT
              </Button>
            </Form.Item>
          </Form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-300 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#5DADE2] hover:text-[#85C1E9] font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        /* Input Base Styles */
        .custom-input,
        .custom-input-password {
          background: transparent !important;
          border: 1px solid #2c5f8d !important;
          border-radius: 9999px !important;
          height: 48px !important;
          font-size: 15px !important;
        }

        .custom-input:hover,
        .custom-input-password:hover {
          border-color: #3b82f6 !important;
        }

        .custom-input:focus,
        .custom-input-password:focus,
        .custom-input-password.ant-input-affix-wrapper-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        /* Ant Design Input Overrides */
        .ant-input {
          background: transparent !important;
          color: white !important;
          border-radius: 9999px !important;
        }

        .ant-input::placeholder {
          color: #9ca3af !important;
        }

        .ant-input-password {
          background: transparent !important;
          border-radius: 9999px !important;
        }

        .ant-input-password input {
          background: transparent !important;
          color: white !important;
        }

        .ant-input-affix-wrapper {
          background: transparent !important;
          border: 1px solid #2c5f8d !important;
          border-radius: 9999px !important;
        }

        .ant-input-affix-wrapper:hover {
          border-color: #3b82f6 !important;
        }

        .ant-input-affix-wrapper-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        /* Select Dropdown Styles */
        .custom-select .ant-select-selector {
          background: transparent !important;
          border: 1px solid #2c5f8d !important;
          border-radius: 9999px !important;
          height: 48px !important;
          padding: 0 20px !important;
          color: white !important;
        }

        .custom-select .ant-select-selector:hover {
          border-color: #3b82f6 !important;
        }

        .custom-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        .custom-select .ant-select-selection-placeholder {
          color: #9ca3af !important;
        }

        .custom-select .ant-select-selection-item {
          color: white !important;
          line-height: 46px !important;
        }

        .custom-select .ant-select-arrow {
          color: #9ca3af !important;
        }

        /* Dropdown Menu Styles */
        .custom-dropdown {
          background: #0B2447 !important;
          border: 1px solid #2c5f8d !important;
          border-radius: 8px !important;
        }

        .custom-dropdown .ant-select-item {
          color: #9ca3af !important;
        }

        .custom-dropdown .ant-select-item:hover {
          background: #1B4F72 !important;
          color: white !important;
        }

        .custom-dropdown .ant-select-item-option-selected {
          background: #2C5F8D !important;
          color: white !important;
        }

        /* Checkbox Styles */
        .ant-checkbox-wrapper {
          color: #9ca3af !important;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        .ant-checkbox-inner {
          background-color: transparent !important;
          border-color: #2c5f8d !important;
        }

        /* Button Styles */
        .ant-btn-primary {
          background: #1b4f72 !important;
          border-color: #2c5f8d !important;
          border-radius: 9999px !important;
        }

        .ant-btn-primary:hover {
          background: #2c5f8d !important;
          border-color: #3b82f6 !important;
        }

        /* Form Item Label */
        .ant-form-item-label > label {
          color: white !important;
        }

        /* Remove focus outlines */
        .ant-input:focus,
        .ant-input-focused {
          box-shadow: none !important;
        }

        /* Error message styles */
        .ant-form-item-explain-error {
          color: #ff6b6b !important;
          font-size: 12px !important;
        }
      `}</style>
    </>
  )
}