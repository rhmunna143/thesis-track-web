'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  BookOutlined,
  BarChartOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'

const { Sider } = Layout

const menuItems = {
  STUDENT: [
    {
      key: '/student',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/student/proposals',
      icon: <FileTextOutlined />,
      label: 'My Proposals',
    },
    {
      key: '/student/proposals/new',
      icon: <PlusOutlined />,
      label: 'New Proposal',
    },
    {
      key: '/student/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
  ],
  TEACHER: [
    {
      key: '/teacher',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/teacher/proposals',
      icon: <FileTextOutlined />,
      label: 'Review Proposals',
    },
    {
      key: '/teacher/students',
      icon: <TeamOutlined />,
      label: 'My Students',
    },
    {
      key: '/teacher/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/teacher/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
  ],
  ADMIN: [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'User Management',
    },
    {
      key: '/admin/sessions',
      icon: <DatabaseOutlined />,
      label: 'Sessions',
    },
    {
      key: '/admin/proposals',
      icon: <FileTextOutlined />,
      label: 'All Proposals',
    },
    {
      key: '/admin/analytics',
      icon: <BarChartOutlined />,
      label: 'System Analytics',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ],
}

export default function Sidebar({ collapsed, onCollapse }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push(`/${user?.role?.toLowerCase()}/profile`),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  const currentMenuItems = menuItems[user?.role] || []

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={256}
      className="min-h-screen"
      theme="light"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOutlined className="text-white" />
              </div>
              <span className="font-bold text-lg">ThesisTrack</span>
            </>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <BookOutlined className="text-white" />
            </div>
          )}
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        className="border-r-0"
        items={currentMenuItems.map(item => ({
          ...item,
          onClick: () => router.push(item.key),
        }))}
      />

      <div className="absolute bottom-4 left-4 right-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar size={32} icon={<UserOutlined />} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</div>
            </div>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="topRight"
              arrow
            >
              <Button type="text" size="small" icon={<SettingOutlined />} />
            </Dropdown>
          </div>
        ) : (
          <div className="flex justify-center">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="topRight"
              arrow
            >
              <Avatar size={32} icon={<UserOutlined />} className="cursor-pointer" />
            </Dropdown>
          </div>
        )}
      </div>
    </Sider>
  )
}