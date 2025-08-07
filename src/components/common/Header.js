'use client'

import { Breadcrumb, Button, Badge, Dropdown, Avatar, Space } from 'antd'
import { BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import useAuthStore from '../../store/authStore'

export default function Header({ collapsed, onCollapse }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [
      {
        title: 'Home',
        onClick: () => router.push(`/${user?.role?.toLowerCase()}`),
      },
    ]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      breadcrumbs.push({
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        ...(isLast ? {} : { onClick: () => router.push(currentPath) }),
      })
    })

    return breadcrumbs
  }

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
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  const notificationItems = [
    {
      key: '1',
      label: 'New proposal submitted',
      description: '2 minutes ago',
    },
    {
      key: '2',
      label: 'Review deadline approaching',
      description: '1 hour ago',
    },
    {
      key: '3',
      label: 'Proposal approved',
      description: '2 hours ago',
    },
  ]

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <Breadcrumb
          items={generateBreadcrumbs()}
          className="text-sm"
        />
      </div>

      <Space size="middle">
        <Dropdown
          menu={{
            items: notificationItems.map(item => ({
              key: item.key,
              label: (
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              ),
            })),
          }}
          placement="bottomRight"
          arrow
        >
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="flex items-center justify-center"
            />
          </Badge>
        </Dropdown>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
            <Avatar size={32} icon={<UserOutlined />} />
            <div className="hidden sm:block">
              <div className="font-medium text-sm">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role?.toLowerCase()}
              </div>
            </div>
          </div>
        </Dropdown>
      </Space>
    </div>
  )
}