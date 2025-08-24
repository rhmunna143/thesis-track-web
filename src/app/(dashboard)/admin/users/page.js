"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Avatar,
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
  Upload,
  Drawer,
  Dropdown,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SettingOutlined,
  MailOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { userService } from "../../../../services/user.service";
import { authService } from "../../../../services/auth.service";
import { departmentService } from "../../../../services/department.service";
import useAuthStore from "../../../../store/authStore";
import useErrorHandler from "../../../../hooks/useErrorHandler";
import "../../../../styles/user-management.css";

const { Search } = Input;
const { Option } = Select;

export default function UsersManagementPage() {
  const { user: currentUser } = useAuthStore();
  const { handleError } = useErrorHandler();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    department: "",
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
  });

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [bulkUploadVisible, setBulkUploadVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Forms
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const departmentList = await departmentService.getAllDepartments();
      setDepartments(departmentList);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      // Fallback departments
      setDepartments([
        "Computer Science",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Chemical Engineering",
        "Industrial Engineering",
      ]);
    }
  };

  // Fetch users with filters and pagination
  const fetchUsers = async (page = 1, pageSize = 10, searchFilters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        ...filters,
        ...searchFilters,
      };

      const response = await userService.getAllUsers(params);

      setUsers(response.data || []);

      setPagination({
        current: page,
        pageSize,
        total: response.total || 0,
      });

      // Update stats
      if (response.stats) {
        setStats(response.stats);
      } else {
        // Calculate stats from response if not provided
        const stats = {
          totalUsers:
            response.total ||
            response.data?.filter((user) => user.role === "STUDENT").length +
              response.data?.filter((user) => user.role === "TEACHER").length +
              response.data?.filter((user) => user.role === "ADMIN").length,
          activeUsers:
            response.data?.filter((user) => user.isActive).length || 0,
          totalStudents:
            response.data?.filter((user) => user.role === "STUDENT").length ||
            0,
          totalTeachers:
            response.data?.filter((user) => user.role === "TEACHER").length ||
            0,
          totalAdmins:
            response.data?.filter((user) => user.role === "ADMIN").length || 0,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      handleError(error, { showNotification: true });
      setUsers([]);
      setPagination({ current: 1, pageSize: 10, total: 0 });
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
      });
    }
    setLoading(false);
  };

  // Create new user
  const handleCreateUser = async (values) => {
    try {
      const userData = {
        ...values,
        password: values.password || "temp123456", // Default password
      };

      await authService.registerUser(userData);
      message.success("User created successfully");
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to create user:", error);
      handleError(error, { showNotification: true });
    }
  };

  // Update user
  const handleUpdateUser = async (values) => {
    try {
      await userService.updateUserProfile(selectedUser.id, values);
      message.success("User updated successfully");
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedUser(null);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to update user:", error);
      handleError(error, { showNotification: true });
    }
  };

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      message.success("User role updated successfully");
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to update user role:", error);
      handleError(error, { showNotification: true });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      message.success("User deleted successfully");
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to delete user:", error);
      handleError(error, { showNotification: true });
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRowKeys.map((id) => userService.deleteUser(id))
      );
      message.success(`${selectedRowKeys.length} users deleted successfully`);
      setSelectedRowKeys([]);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to delete users:", error);
      handleError(error, { showNotification: true });
    }
  };

  // Bulk import users
  const handleBulkImport = async (csvData) => {
    try {
      const result = await userService.bulkImportUsers(csvData);
      message.success(`Successfully imported ${result.imported} users`);
      setBulkUploadVisible(false);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to bulk import users:", error);
      handleError(error, { showNotification: true });
    }
  };

  // Parse CSV file
  const handleCsvUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      const lines = csvContent.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        message.error(
          "CSV file must contain at least a header row and one data row"
        );
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const requiredHeaders = ["name", "email", "role"];

      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );
      if (missingHeaders.length > 0) {
        message.error(`Missing required columns: ${missingHeaders.join(", ")}`);
        return;
      }

      const users = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const user = {};

        headers.forEach((header, index) => {
          user[header] = values[index] || "";
        });

        // Add default password
        user.password = "temp123456";
        users.push(user);
      }

      if (users.length === 0) {
        message.error("No valid user data found in CSV");
        return;
      }

      handleBulkImport(users);
    };
    reader.readAsText(file);
    return false; // Prevent default upload
  };

  // CSV export
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,Role,Department,Status,Created At\n" +
      users
        .map(
          (user) =>
            `${user.name},${user.email},${user.role},${user.department || ""},${
              user.isActive ? "Active" : "Inactive"
            },${new Date(user.createdAt).toLocaleDateString()}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search and filter handlers
  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    fetchUsers(1, pagination.pageSize, { search: value });
  };

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    fetchUsers(1, pagination.pageSize, newFilters);
  };

  // Table columns
  const columns = [
    {
      title: "User",
      key: "user",
      width: 250,
      render: (_, record) => (
        <div className="user-avatar-cell">
          <Avatar
            size={40}
            src={record.profilePicture}
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
          <div className="user-info">
            <div className="user-name">{record.name}</div>
            <div className="user-email">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => {
        const colors = {
          ADMIN: "purple",
          TEACHER: "blue",
          STUDENT: "green",
        };
        return <Tag color={colors[role]}>{role}</Tag>;
      },
      filters: [
        { text: "Admin", value: "ADMIN" },
        { text: "Teacher", value: "TEACHER" },
        { text: "Student", value: "STUDENT" },
      ],
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 180,
      render: (dept) =>
        dept || <span className="text-gray-400">Not specified</span>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      width: 100,
      render: (isActive) => (
        <Tag
          color={isActive ? "green" : "red"}
          className={isActive ? "status-active" : "status-inactive"}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "Never"),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => {
        const actionMenuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View Profile",
            onClick: () => {
              // TODO: Implement view profile
              message.info("View profile functionality to be implemented");
            },
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit User",
            onClick: () => {
              setSelectedUser(record);
              editForm.setFieldsValue(record);
              setEditModalVisible(true);
            },
          },
          {
            key: "reset-password",
            icon: <KeyOutlined />,
            label: "Reset Password",
            onClick: () => {
              // TODO: Implement password reset
              message.info("Password reset functionality to be implemented");
            },
            disabled: record.id === currentUser?.id,
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete User",
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Delete User",
                content: `Are you sure you want to delete ${record.name}?`,
                icon: <ExclamationCircleOutlined />,
                okType: "danger",
                onOk: () => handleDeleteUser(record.id),
              });
            },
            disabled: record.id === currentUser?.id,
          },
        ];

        return (
          <div className="action-buttons">
            <Tooltip title="Edit User">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedUser(record);
                  editForm.setFieldsValue(record);
                  setEditModalVisible(true);
                }}
              />
            </Tooltip>

            <Select
              value={record.role}
              size="small"
              style={{ width: 90 }}
              onChange={(value) => handleRoleChange(record.id, value)}
              disabled={record.id === currentUser?.id}
            >
              <Option value="STUDENT">Student</Option>
              <Option value="TEACHER">Teacher</Option>
              <Option value="ADMIN">Admin</Option>
            </Select>

            <Dropdown
              menu={{
                items: actionMenuItems,
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.preventDefault()}
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: record.id === currentUser?.id,
    }),
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  return (
    <div className="user-management-page space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="page-header-actions">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchUsers(pagination.current, pagination.pageSize)}
          >
            Refresh
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setBulkUploadVisible(true)}
          >
            Bulk Import
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Students"
              value={stats.totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Teachers"
              value={stats.totalTeachers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Admins"
              value={stats.totalAdmins}
              prefix={<SettingOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Filter Toggles */}
      <Card>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Quick Filters:
          </span>
          <Button
            size="small"
            type={filters.role === "" ? "primary" : "default"}
            onClick={() => handleFilterChange("role", "")}
          >
            All Users
          </Button>
          <Button
            size="small"
            type={filters.role === "STUDENT" ? "primary" : "default"}
            onClick={() => handleFilterChange("role", "STUDENT")}
          >
            Students ({stats.totalStudents})
          </Button>
          <Button
            size="small"
            type={filters.role === "TEACHER" ? "primary" : "default"}
            onClick={() => handleFilterChange("role", "TEACHER")}
          >
            Teachers ({stats.totalTeachers})
          </Button>
          <Button
            size="small"
            type={filters.role === "ADMIN" ? "primary" : "default"}
            onClick={() => handleFilterChange("role", "ADMIN")}
          >
            Admins ({stats.totalAdmins})
          </Button>
        </div>

        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by name or email"
              allowClear
              onSearch={handleSearch}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by role"
              allowClear
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("role", value)}
            >
              <Option value="ADMIN">Admin</Option>
              <Option value="TEACHER">Teacher</Option>
              <Option value="STUDENT">Student</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by department"
              allowClear
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("department", value)}
            >
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
                Export CSV
              </Button>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title="Bulk Delete"
                  description={`Delete ${selectedRowKeys.length} selected users?`}
                  onConfirm={handleBulkDelete}
                >
                  <Button danger>
                    Delete Selected ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
            onChange: (page, pageSize) => {
              fetchUsers(page, pageSize);
            },
          }}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="john@university.edu"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role">
                  <Option value="STUDENT">Student</Option>
                  <Option value="TEACHER">Teacher</Option>
                  <Option value="ADMIN">Admin</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Select placeholder="Select department">
                  {departments.map((dept) => (
                    <Option key={dept} value={dept}>
                      {dept}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter password" visibilityToggle />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Confirm password" visibilityToggle />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setSelectedUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateUser}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="department" label="Department">
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="bio" label="Bio">
            <Input.TextArea rows={3} placeholder="Enter bio" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Import Users"
        open={bulkUploadVisible}
        onCancel={() => setBulkUploadVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Columns: name, email, role, department</li>
              <li>• Roles: STUDENT, TEACHER, ADMIN</li>
              <li>• Default password will be set to "temp123456"</li>
              <li>
                • Users will be required to change password on first login
              </li>
            </ul>
          </div>

          <Upload.Dragger
            accept=".csv"
            beforeUpload={handleCsvUpload}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag CSV file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for single CSV file upload only
            </p>
          </Upload.Dragger>

          <div className="text-right">
            <Button onClick={() => setBulkUploadVisible(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
