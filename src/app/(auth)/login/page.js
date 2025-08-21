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
        <div className="bg-gradient-to-b from-PrimaryBlue backdrop-blur-sm border-2 border-SuccessGreen rounded-lg p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">LOGIN</h1>
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
                  prefix={<MailOutlined className="text-gray-300" />}
                  placeholder="Email"
                  className="bg-transparent border-2 border-SuccessGreen rounded-full px-4 py-3 text-white placeholder-gray-300 hover:border-yellow-400 focus:border-yellow-400 focus:shadow-none"
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
                prefix={<LockOutlined className="text-gray-300" />}
                placeholder="Password"
                className="bg-transparent border-2 border-yellow-400/60 rounded-full px-4 py-3 text-white placeholder-gray-300 hover:border-yellow-400 focus:border-yellow-400"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone className="text-gray-300" />
                  ) : (
                    <EyeInvisibleOutlined className="text-gray-300" />
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
                <Checkbox className="text-white">
                  <span className="text-white ml-2">Remember Me</span>
                </Checkbox>
              </Form.Item>
            </Form.Item>

            {/* Login Button */}
            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-PrimaryBlue hover:bg-blue-700 border-2 border-yellow-400/60 rounded-full text-white font-semibold text-lg transition-all duration-300 hover:border-yellow-400"
                style={{
                  backgroundColor: "#1e40af",
                  borderColor: "rgba(251, 191, 36, 0.6)",
                }}
              >
                LOGIN
              </Button>
            </Form.Item>
          </Form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-white">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                SignUp
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .ant-input {
          background: transparent !important;
          color: white !important;
          border-radius: 9999px !important;
        }

        .ant-input::placeholder {
          color: #d1d5db !important;
        }

        .ant-input-password {
          background: transparent !important;
          border-radius: 9999px !important;
        }

        .ant-input-password input {
          background: transparent !important;
          color: white !important;
        }

        .ant-input {
          background: transparent !important;
        }

        .ant-checkbox-wrapper {
          color: white !important;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #0891b2 !important;
          border-color: #0891b2 !important;
        }

        .ant-btn-primary {
          background: #1e40af !important;
          border-color: rgba(251, 191, 36, 0.6) !important;
          border-radius: 9999px !important;
        }

        .ant-btn-primary:hover {
          background: #1d4ed8 !important;
          border-color: rgb(251, 191, 36) !important;
        }

        .ant-form-item-label > label {
          color: white !important;
        }
      `}</style>
    </>
  );
}
