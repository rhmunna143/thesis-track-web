"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, Checkbox } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import useAuthStore from "../../../store/authStore";
import useErrorHandler from "../../../hooks/useErrorHandler";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const { handleError } = useErrorHandler();

  const onFinish = async (values) => {
    setError("");

    try {
      const result = await login({
        email: values.email,
        password: values.password,
      });

      if (result.success) {
        // Redirect based on user role
        const role = result.user.role.toLowerCase();
        router.push(`/${role}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      const errorInfo = handleError(err, { silent: true });
      setError(errorInfo.message);
    }
  };

  return (
    // login page
    <>
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-b from-PrimaryBlue to-blue backdrop-blur-sm border border-SuccessGreen rounded-2xl p-8 shadow-2xl shadow-PrimaryBlue">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2 tracking-wider">
              LOGIN
            </h1>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-400 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            {/* Email Field */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
              className="mb-6"
            >
              <div className="relative">
                <Input
                  prefix={<MailOutlined className="text-gray-400 mr-2" />}
                  placeholder="Email"
                  className="custom-input bg-transparent border border-[#2C5F8D] rounded-full px-5 py-3 text-white placeholder-gray-400 hover:border-[#3B82F6] focus:border-[#3B82F6] transition-all duration-300"
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                  }}
                />
              </div>
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
              className="mb-6"
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

            {/* Remember Me */}
            <Form.Item className="mb-6">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-300">
                  <span className="text-gray-300 ml-2 text-sm">
                    Remember Me
                  </span>
                </Checkbox>
              </Form.Item>
            </Form.Item>

            {/* Login Button */}
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
                LOGIN
              </Button>
            </Form.Item>
          </Form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-300 text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#5DADE2] hover:text-[#85C1E9] font-medium transition-colors"
              >
                SignUp
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
      `}</style>
    </>
  );
}
