'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Select, 
  Space, 
  Divider,
  Timeline,
  Alert,
  message
} from 'antd';
import { 
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  BugOutlined,
  BulbOutlined,
  SendOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const contactMethods = [
    {
      icon: <MailOutlined className="text-3xl text-blue-500" />,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@thesistrack.edu",
      action: "mailto:support@thesistrack.edu"
    },
    {
      icon: <PhoneOutlined className="text-3xl text-green-500" />,
      title: "Phone Support",
      description: "Call us during business hours",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: <EnvironmentOutlined className="text-3xl text-purple-500" />,
      title: "Office Location",
      description: "Visit our campus office",
      contact: "Room 301, Academic Building\nUniversity Campus",
      action: "#"
    },
    {
      icon: <ClockCircleOutlined className="text-3xl text-orange-500" />,
      title: "Business Hours",
      description: "We're available to help",
      contact: "Mon-Fri: 9:00 AM - 5:00 PM\nSat: 10:00 AM - 2:00 PM",
      action: "#"
    }
  ];

  const socialLinks = [
    {
      icon: <GithubOutlined className="text-xl" />,
      name: "GitHub",
      url: "https://github.com/thesistrack",
      color: "#24292e"
    },
    {
      icon: <LinkedinOutlined className="text-xl" />,
      name: "LinkedIn", 
      url: "https://linkedin.com/company/thesistrack",
      color: "#0077b5"
    },
    {
      icon: <TwitterOutlined className="text-xl" />,
      name: "Twitter",
      url: "https://twitter.com/thesistrack",
      color: "#1da1f2"
    },
    {
      icon: <GlobalOutlined className="text-xl" />,
      name: "Website",
      url: "https://thesistrack.edu",
      color: "#52c41a"
    }
  ];

  const faqCategories = [
    {
      icon: <UserOutlined className="text-blue-500" />,
      category: "Account & Profile",
      description: "Issues with login, registration, or profile management"
    },
    {
      icon: <QuestionCircleOutlined className="text-green-500" />,
      category: "General Inquiry",
      description: "General questions about the platform or features"
    },
    {
      icon: <BugOutlined className="text-red-500" />,
      category: "Bug Report",
      description: "Report technical issues or system bugs"
    },
    {
      icon: <BulbOutlined className="text-yellow-500" />,
      category: "Feature Request",
      description: "Suggest new features or improvements"
    }
  ];

  const responseTimeline = [
    {
      color: 'green',
      children: (
        <div>
          <Text strong>Immediate</Text>
          <br />
          <Text type="secondary">Auto-confirmation email sent</Text>
        </div>
      ),
    },
    {
      color: 'blue',
      children: (
        <div>
          <Text strong>Within 2 hours</Text>
          <br />
          <Text type="secondary">Initial response for urgent issues</Text>
        </div>
      ),
    },
    {
      color: 'orange',
      children: (
        <div>
          <Text strong>Within 24 hours</Text>
          <br />
          <Text type="secondary">Detailed response for most inquiries</Text>
        </div>
      ),
    },
    {
      color: 'purple',
      children: (
        <div>
          <Text strong>Follow-up</Text>
          <br />
          <Text type="secondary">Continued support until resolution</Text>
        </div>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Message sent successfully! We\'ll get back to you soon.');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <MailOutlined className="text-3xl text-white" />
            </div>
          </div>
          <Title level={1} className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Contact Us
          </Title>
          <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about ThesisTrack? Need technical support? Want to provide feedback? 
            We're here to help! Choose the best way to reach us below.
          </Paragraph>
        </div>

        {/* Contact Methods Grid */}
        <Row gutter={[24, 24]} className="mb-16">
          {contactMethods.map((method, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <Card 
                className="h-full text-center shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => method.action !== '#' && window.open(method.action)}
              >
                <div className="mb-4">{method.icon}</div>
                <Title level={4} className="mb-2 text-gray-800">{method.title}</Title>
                <Paragraph className="text-gray-600 text-sm mb-3">{method.description}</Paragraph>
                <Text className="text-gray-700 font-medium whitespace-pre-line">{method.contact}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[32, 32]}>
          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <Card className="shadow-lg border-0">
              <Title level={3} className="mb-6 text-gray-800">Send us a Message</Title>
              
              <Alert
                message="Quick Response Guarantee"
                description="We typically respond to all inquiries within 24 hours during business days."
                type="info"
                showIcon
                className="mb-6"
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-4"
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="firstName"
                      label="First Name"
                      rules={[{ required: true, message: 'Please enter your first name' }]}
                    >
                      <Input 
                        size="large" 
                        placeholder="John"
                        prefix={<UserOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lastName"
                      label="Last Name"
                      rules={[{ required: true, message: 'Please enter your last name' }]}
                    >
                      <Input 
                        size="large" 
                        placeholder="Doe"
                        prefix={<UserOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input 
                    size="large" 
                    placeholder="john.doe@university.edu"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select a category' }]}
                >
                  <Select size="large" placeholder="Select inquiry type">
                    {faqCategories.map((cat, index) => (
                      <Option key={index} value={cat.category}>
                        <Space>
                          {cat.icon}
                          {cat.category}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please enter a subject' }]}
                >
                  <Input 
                    size="large" 
                    placeholder="Brief description of your inquiry"
                  />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Message"
                  rules={[
                    { required: true, message: 'Please enter your message' },
                    { min: 10, message: 'Message must be at least 10 characters' }
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Please provide detailed information about your inquiry, including any error messages, steps to reproduce issues, or specific questions you have..."
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  name="priority"
                  label="Priority Level"
                  initialValue="medium"
                >
                  <Select size="large">
                    <Option value="low">🟢 Low - General inquiry</Option>
                    <Option value="medium">🟡 Medium - Standard support</Option>
                    <Option value="high">🟠 High - Urgent issue</Option>
                    <Option value="critical">🔴 Critical - System down</Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    icon={<SendOutlined />}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 border-0 h-12 text-lg font-semibold"
                  >
                    Send Message
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Sidebar Information */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" className="w-full">
              
              {/* Response Timeline */}
              <Card className="shadow-lg border-0">
                <Title level={4} className="mb-4 text-gray-800">Response Timeline</Title>
                <Timeline size="small" items={responseTimeline} />
              </Card>

              {/* FAQ Categories */}
              <Card className="shadow-lg border-0">
                <Title level={4} className="mb-4 text-gray-800">Common Inquiry Types</Title>
                <Space direction="vertical" size="middle" className="w-full">
                  {faqCategories.map((category, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {category.icon}
                      </div>
                      <div>
                        <Text strong className="text-gray-800">{category.category}</Text>
                        <br />
                        <Text type="secondary" className="text-sm">{category.description}</Text>
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>

              {/* Social Links */}
              <Card className="shadow-lg border-0">
                <Title level={4} className="mb-4 text-gray-800">Connect With Us</Title>
                <Space direction="vertical" size="middle" className="w-full">
                  {socialLinks.map((social, index) => (
                    <Button
                      key={index}
                      type="text"
                      icon={social.icon}
                      className="w-full justify-start h-10 text-left hover:bg-gray-50"
                      onClick={() => window.open(social.url, '_blank')}
                      style={{ color: social.color }}
                    >
                      Follow us on {social.name}
                    </Button>
                  ))}
                </Space>
              </Card>

              {/* Additional Help */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
                <Title level={5} className="mb-3 text-gray-800">Need Immediate Help?</Title>
                <Paragraph className="text-sm text-gray-600 mb-4">
                  For urgent technical issues during business hours, you can also:
                </Paragraph>
                <Space direction="vertical" size="small" className="w-full">
                  <Text className="text-sm">📞 Call our hotline: +1 (555) 123-4567</Text>
                  <Text className="text-sm">💬 Use the live chat on our website</Text>
                  <Text className="text-sm">📧 Email: urgent@thesistrack.edu</Text>
                </Space>
              </Card>

            </Space>
          </Col>
        </Row>

        {/* Bottom Section */}
        <div className="mt-16">
          <Divider />
          <Row gutter={[24, 24]} className="text-center">
            <Col xs={24} md={8}>
              <Card className="border-0 bg-transparent shadow-none">
                <MailOutlined className="text-4xl text-blue-500 mb-3" />
                <Title level={5} className="text-gray-800">Email Response</Title>
                <Text className="text-gray-600">Average response time: 4 hours</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="border-0 bg-transparent shadow-none">
                <PhoneOutlined className="text-4xl text-green-500 mb-3" />
                <Title level={5} className="text-gray-800">Phone Support</Title>
                <Text className="text-gray-600">Available Mon-Fri, 9 AM - 5 PM</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="border-0 bg-transparent shadow-none">
                <ClockCircleOutlined className="text-4xl text-purple-500 mb-3" />
                <Title level={5} className="text-gray-800">24/7 Resources</Title>
                <Text className="text-gray-600">Documentation and FAQ available</Text>
              </Card>
            </Col>
          </Row>
        </div>

      </div>
    </div>
  );
};

export default Contact;