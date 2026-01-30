"use client";

import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Timeline,
  Statistic,
  Avatar,
  Space,
  Button,
  Divider,
  Tag,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  HeartOutlined,
  SafetyOutlined,
  GlobalOutlined,
  BulbOutlined,
  StarOutlined,
  MailOutlined,
  GithubOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const About = () => {
  const features = [
    {
      icon: <BookOutlined className="text-3xl text-blue-500" />,
      title: "Proposal Management",
      description:
        "Streamlined thesis proposal submission, review, and approval process with real-time tracking and feedback.",
    },
    {
      icon: <UserOutlined className="text-3xl text-green-500" />,
      title: "User-Centric Design",
      description:
        "Intuitive interface designed for students, teachers, and administrators with role-based access control.",
    },
    {
      icon: <TeamOutlined className="text-3xl text-purple-500" />,
      title: "Collaboration Tools",
      description:
        "Enhanced communication between students and supervisors through integrated commenting and notification systems.",
    },
    {
      icon: <RocketOutlined className="text-3xl text-orange-500" />,
      title: "Modern Technology",
      description:
        "Built with cutting-edge technologies including Next.js, React, and Ant Design for optimal performance.",
    },
  ];

  const teamMembers = [
    {
      name: "Development Team",
      role: "Full-Stack Developer",
      avatar:
        "https://i.ibb.co.com/Q7ZRMxrD/Md-Rabbi-Haque-Munna-in-office-at-Nex-Stack-BD.jpg",
      description: "Passionate developers creating innovative solutions",
    },
    {
      name: "UX/UI Designer",
      role: "User Experience Design",
      avatar:
        "https://i.ibb.co.com/nq1prvBt/360-F-558469941-y8vj87-Bfri-Cq-Jkk-Wen-M5nu-VAlc-BI9y1k.jpg",
      description: "Creating intuitive and accessible user interfaces",
    },
    {
      name: "Project Supervisor",
      role: "Lecturer, RMU",
      avatar: "https://i.ibb.co.com/4Rs0jjWK/1718712386915.jpg",
      description: "Experienced educator guiding system requirements",
    },
  ];

  const milestones = [
    {
      color: "blue",
      children: (
        <div>
          <Title level={5}>Project Conception</Title>
          <Text type="secondary">
            Identified the need for digital transformation in academic proposal
            management
          </Text>
        </div>
      ),
    },
    {
      color: "green",
      children: (
        <div>
          <Title level={5}>Development Phase</Title>
          <Text type="secondary">
            Built comprehensive system with modern web technologies and
            user-centered design
          </Text>
        </div>
      ),
    },
    {
      color: "orange",
      children: (
        <div>
          <Title level={5}>Testing & Refinement</Title>
          <Text type="secondary">
            Extensive testing with real users and iterative improvements based
            on feedback
          </Text>
        </div>
      ),
    },
    {
      color: "purple",
      children: (
        <div>
          <Title level={5}>Launch & Growth</Title>
          <Text type="secondary">
            Successfully deployed and continuously evolving to meet academic
            needs
          </Text>
        </div>
      ),
    },
  ];

  const values = [
    {
      icon: <StarOutlined className="text-2xl text-yellow-500" />,
      title: "Excellence",
      description:
        "Committed to delivering the highest quality academic management solutions",
    },
    {
      icon: <HeartOutlined className="text-2xl text-red-500" />,
      title: "Student-Focused",
      description:
        "Every feature designed with student success and academic achievement in mind",
    },
    {
      icon: <SafetyOutlined className="text-2xl text-blue-500" />,
      title: "Security & Privacy",
      description:
        "Robust security measures protecting sensitive academic data and user privacy",
    },
    {
      icon: <GlobalOutlined className="text-2xl text-green-500" />,
      title: "Accessibility",
      description:
        "Inclusive design ensuring equal access for all users regardless of their abilities",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <BookOutlined className="text-3xl text-white" />
            </div>
          </div>
          <Title
            level={1}
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
          >
            About Appro
          </Title>
          <Paragraph className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Empowering academic excellence through innovative digital solutions.
            ThesisTrack (Appro) revolutionizes the way students, teachers, and
            administrators manage thesis proposals and project reviews in
            academic institutions.
          </Paragraph>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 shadow-lg border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="text-center py-8">
            <BulbOutlined className="text-5xl mb-4" />
            <Title level={2} className="text-white mb-4">
              Our Mission
            </Title>
            <Paragraph className="text-lg text-blue-50 max-w-4xl mx-auto">
              To streamline academic processes, enhance collaboration between
              students and faculty, and create a transparent, efficient platform
              that supports academic excellence and innovation. We believe
              technology should simplify education, not complicate it.
            </Paragraph>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={[24, 24]} className="mb-16">
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <Statistic
                title="Active Users"
                value={1500}
                suffix="+"
                valueStyle={{ color: "#3f8600", fontSize: "2rem" }}
                prefix={<UserOutlined />}
              />
              <Text type="secondary">Students, Teachers & Admins</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <Statistic
                title="Proposals Processed"
                value={2800}
                suffix="+"
                valueStyle={{ color: "#1890ff", fontSize: "2rem" }}
                prefix={<BookOutlined />}
              />
              <Text type="secondary">Successfully Managed</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <Statistic
                title="Time Saved"
                value={70}
                suffix="%"
                valueStyle={{ color: "#cf1322", fontSize: "2rem" }}
                prefix={<RocketOutlined />}
              />
              <Text type="secondary">Process Efficiency</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <Statistic
                title="Satisfaction Rate"
                value={98}
                suffix="%"
                valueStyle={{ color: "#722ed1", fontSize: "2rem" }}
                prefix={<TrophyOutlined />}
              />
              <Text type="secondary">User Satisfaction</Text>
            </Card>
          </Col>
        </Row>

        {/* Features Grid */}
        <div className="mb-16">
          <Title level={2} className="text-center mb-8 text-gray-800">
            Why Choose ThesisTrack?
          </Title>
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col key={index} xs={24} md={12}>
                <Card className="h-full shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{feature.icon}</div>
                    <div>
                      <Title level={4} className="mb-2 text-gray-800">
                        {feature.title}
                      </Title>
                      <Paragraph className="text-gray-600 mb-0">
                        {feature.description}
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <Title level={2} className="text-center mb-8 text-gray-800">
            Our Core Values
          </Title>
          <Row gutter={[24, 24]}>
            {values.map((value, index) => (
              <Col key={index} xs={24} sm={12} md={6}>
                <Card className="h-full text-center shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-4">{value.icon}</div>
                  <Title level={4} className="mb-3 text-gray-800">
                    {value.title}
                  </Title>
                  <Paragraph className="text-gray-600 text-sm">
                    {value.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <Title level={2} className="text-center mb-8 text-gray-800">
            Our Journey
          </Title>
          <Card className="shadow-lg border-0">
            <Timeline mode="left" items={milestones} />
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <Title level={2} className="text-center mb-8 text-gray-800">
            Meet Our Team
          </Title>
          <Row gutter={[24, 24]}>
            {teamMembers.map((member, index) => (
              <Col key={index} xs={24} md={8}>
                <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Avatar size={80} src={member.avatar} className="mb-4" />
                  <Title level={4} className="mb-1 text-gray-800">
                    {member.name}
                  </Title>
                  <Tag color="blue" className="mb-3">
                    {member.role}
                  </Tag>
                  <Paragraph className="text-gray-600 text-sm">
                    {member.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Technology Stack */}
        <Card className="mb-16 shadow-lg border-0">
          <Title level={3} className="text-center mb-6 text-gray-800">
            Built with Modern Technology
          </Title>
          <Row gutter={[16, 16]} justify="center">
            <Col>
              <Tag color="blue" className="px-4 py-2 text-sm">
                Next.js 14
              </Tag>
            </Col>
            <Col>
              <Tag color="cyan" className="px-4 py-2 text-sm">
                React 18
              </Tag>
            </Col>
            <Col>
              <Tag color="purple" className="px-4 py-2 text-sm">
                Ant Design
              </Tag>
            </Col>
            <Col>
              <Tag color="green" className="px-4 py-2 text-sm">
                Tailwind CSS
              </Tag>
            </Col>
            <Col>
              <Tag color="orange" className="px-4 py-2 text-sm">
                Zustand
              </Tag>
            </Col>
            <Col>
              <Tag color="red" className="px-4 py-2 text-sm">
                Axios
              </Tag>
            </Col>
            <Col>
              <Tag color="gold" className="px-4 py-2 text-sm">
                JavaScript ES6+
              </Tag>
            </Col>
          </Row>
        </Card>

        {/* Contact Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="text-center py-8">
            <Title level={3} className="mb-4 text-gray-800">
              Get in Touch
            </Title>
            <Paragraph className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Have questions about ThesisTrack? Want to learn more about how we
              can help your institution? We'd love to hear from you!
            </Paragraph>
            <Space size="large" wrap>
              <Button
                type="primary"
                icon={<MailOutlined />}
                size="large"
                className="bg-blue-500 hover:bg-blue-600 border-0"
              >
                Contact Us
              </Button>
              <Button
                icon={<GithubOutlined />}
                size="large"
                className="border-gray-300 hover:border-gray-400"
              >
                View on GitHub
              </Button>
              <Button
                icon={<LinkedinOutlined />}
                size="large"
                className="border-gray-300 hover:border-gray-400"
              >
                Follow Us
              </Button>
            </Space>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <Divider />
          <Paragraph className="text-gray-500">
            <CheckCircleOutlined className="mr-2" />
            Built with ❤️ for the academic community. Continuously evolving to
            serve educational excellence.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default About;
