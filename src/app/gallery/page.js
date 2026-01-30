'use client';

import React, { useState } from 'react';
import { Card, Image, Modal, Row, Col, Typography, Tag, Space, Button, Input, Select } from 'antd';
import { EyeOutlined, DownloadOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const galleryData = [
  {
    id: 1,
    title: "Academic Research Laboratory",
    description: "Modern research facility with state-of-the-art equipment for computer science research and thesis projects.",
    imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&h=400&fit=crop",
    category: "Research",
    tags: ["Laboratory", "Research", "Technology", "Science"],
    photographer: "ThisisEngineering RAEng"
  },
  {
    id: 2,
    title: "Student Collaboration Space",
    description: "Collaborative workspace where students work together on thesis projects and academic research.",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    category: "Collaboration",
    tags: ["Students", "Teamwork", "Study", "Collaboration"],
    photographer: "Brooke Cagle"
  },
  {
    id: 3,
    title: "Digital Library Resources",
    description: "Extensive digital library with access to academic journals, research papers, and educational materials.",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
    category: "Library",
    tags: ["Library", "Books", "Reading", "Knowledge"],
    photographer: "Alfons Morales"
  },
  {
    id: 4,
    title: "Computer Science Lab",
    description: "Advanced computer laboratory equipped with latest technology for software development and programming projects.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    category: "Technology",
    tags: ["Programming", "Development", "Coding", "Technology"],
    photographer: "Christopher Gower"
  },
  {
    id: 5,
    title: "Graduation Ceremony",
    description: "Celebrating academic achievements and successful completion of thesis projects.",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
    category: "Achievement",
    tags: ["Graduation", "Success", "Achievement", "Celebration"],
    photographer: "Vasily Koloda"
  },
  {
    id: 6,
    title: "Data Analysis Workspace",
    description: "Data science workspace with advanced analytics tools for research data processing and visualization.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    category: "Analytics",
    tags: ["Data", "Analytics", "Research", "Statistics"],
    photographer: "Carlos Muza"
  },
  {
    id: 7,
    title: "Academic Conference",
    description: "Students and faculty presenting research findings and thesis results at academic conferences.",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop",
    category: "Presentation",
    tags: ["Conference", "Presentation", "Academic", "Research"],
    photographer: "Kane Reinholdtsen"
  },
  {
    id: 8,
    title: "Innovation Workshop",
    description: "Hands-on workshop for developing innovative solutions and exploring new research methodologies.",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
    category: "Innovation",
    tags: ["Workshop", "Innovation", "Creativity", "Learning"],
    photographer: "ThisisEngineering RAEng"
  },
  {
    id: 9,
    title: "Online Learning Platform",
    description: "Digital education platform facilitating remote learning and thesis supervision through technology.",
    imageUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&h=400&fit=crop",
    category: "Digital",
    tags: ["Online", "Learning", "Digital", "Education"],
    photographer: "Chris Montgomery"
  },
  {
    id: 10,
    title: "Research Documentation",
    description: "Comprehensive documentation and record-keeping for academic research and thesis projects.",
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop",
    category: "Documentation",
    tags: ["Documentation", "Notes", "Research", "Writing"],
    photographer: "Thought Catalog"
  },
  {
    id: 11,
    title: "AI & Machine Learning Lab",
    description: "Specialized laboratory for artificial intelligence and machine learning research projects.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
    category: "AI/ML",
    tags: ["AI", "Machine Learning", "Technology", "Innovation"],
    photographer: "Alex Knight"
  },
  {
    id: 12,
    title: "Academic Success Stories",
    description: "Celebrating outstanding thesis projects and academic achievements of our students.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
    category: "Success",
    tags: ["Success", "Achievement", "Excellence", "Recognition"],
    photographer: "Scott Graham"
  }
];

const categories = ["All", "Research", "Collaboration", "Library", "Technology", "Achievement", "Analytics", "Presentation", "Innovation", "Digital", "Documentation", "AI/ML", "Success"];

const categoryColors = {
  "Research": "blue",
  "Collaboration": "green", 
  "Library": "purple",
  "Technology": "cyan",
  "Achievement": "gold",
  "Analytics": "orange",
  "Presentation": "red",
  "Innovation": "magenta",
  "Digital": "lime",
  "Documentation": "volcano",
  "AI/ML": "geekblue",
  "Success": "yellow"
};

const Gallery = () => {
  const [filteredData, setFilteredData] = useState(galleryData);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDescription, setPreviewDescription] = useState("");

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterData(category, searchTerm);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterData(selectedCategory, value);
  };

  const filterData = (category, search) => {
    let filtered = galleryData;

    if (category !== "All") {
      filtered = filtered.filter(item => item.category === category);
    }

    if (search) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredData(filtered);
  };

  const handlePreview = (image) => {
    setPreviewImage(image.imageUrl);
    setPreviewTitle(image.title);
    setPreviewDescription(image.description);
    setPreviewVisible(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Title level={1} className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📸 Academic Gallery
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our collection of academic spaces, research facilities, and student achievements. 
            Discover the vibrant learning environment that supports thesis projects and academic excellence.
          </Paragraph>
        </div>

        {/* Filter and Search Section */}
        <Card className="mb-8 shadow-lg border-0">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Search
                placeholder="Search by title, description, or tags..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Filter by category"
                size="large"
                value={selectedCategory}
                onChange={handleCategoryFilter}
                className="w-full"
                suffixIcon={<FilterOutlined />}
              >
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Category Tags */}
        <div className="my-8 text-center">
          <Space wrap size="small">
            {categories.map(category => (
              <Tag
                key={category}
                color={category === "All" ? "default" : categoryColors[category]}
                className={`cursor-pointer px-3 py-1 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category 
                    ? 'scale-105 shadow-md' 
                    : 'hover:scale-105 hover:shadow-sm'
                }`}
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <Text className="text-gray-600 text-lg">
            Showing <span className="font-semibold text-blue-600">{filteredData.length}</span> of {galleryData.length} images
            {selectedCategory !== "All" && <span> in <span className="font-semibold">{selectedCategory}</span></span>}
            {searchTerm && <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>}
          </Text>
        </div>

        {/* Gallery Grid */}
        <Row gutter={[24, 24]}>
          {filteredData.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                className="h-full shadow-lg border-0 overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                cover={
                  <div className="relative overflow-hidden">
                    <Image
                      alt={item.title}
                      src={item.imageUrl}
                      preview={false}
                      className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <Space className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button 
                          type="primary" 
                          icon={<EyeOutlined />} 
                          onClick={() => handlePreview(item)}
                          className="bg-white text-blue-600 border-0 hover:bg-blue-50"
                        >
                          Preview
                        </Button>
                        <Button 
                          icon={<DownloadOutlined />}
                          onClick={() => window.open(item.imageUrl, '_blank')}
                          className="bg-white text-gray-600 border-0 hover:bg-gray-50"
                        >
                          View Original
                        </Button>
                      </Space>
                    </div>
                  </div>
                }
              >
                <div className="p-2">
                  <div className="flex justify-between items-start mb-2">
                    <Title level={5} className="mb-0 text-gray-800 line-clamp-1">
                      {item.title}
                    </Title>
                    <Tag color={categoryColors[item.category]} className="text-xs">
                      {item.category}
                    </Tag>
                  </div>
                  
                  <Paragraph 
                    className="text-gray-600 text-sm mb-3 line-clamp-2"
                    ellipsis={{ rows: 2 }}
                  >
                    {item.description}
                  </Paragraph>

                  <div className="mb-3">
                    <Space wrap size="small">
                      {item.tags.slice(0, 3).map(tag => (
                        <Tag key={tag} className="text-xs border-gray-200 text-gray-500">
                          {tag}
                        </Tag>
                      ))}
                      {item.tags.length > 3 && (
                        <Tag className="text-xs text-gray-400">
                          +{item.tags.length - 3} more
                        </Tag>
                      )}
                    </Space>
                  </div>

                  <Text className="text-xs text-gray-400">
                    📷 {item.photographer}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* No Results Message */}
        {filteredData.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <Title level={3} className="text-gray-500 mb-2">No images found</Title>
            <Paragraph className="text-gray-400 mb-4">
              Try adjusting your search terms or category filter
            </Paragraph>
            <Button 
              type="primary" 
              onClick={() => {
                setSelectedCategory("All");
                setSearchTerm("");
                setFilteredData(galleryData);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Image Preview Modal */}
        <Modal
          open={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={800}
          centered
          className="preview-modal"
        >
          <div className="text-center">
            <Image
              alt={previewTitle}
              src={previewImage}
              className="max-w-full h-auto mb-4"
            />
            <Paragraph className="text-gray-600">
              {previewDescription}
            </Paragraph>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => window.open(previewImage, '_blank')}
              >
                View Original
              </Button>
              <Button onClick={() => setPreviewVisible(false)}>
                Close
              </Button>
            </Space>
          </div>
        </Modal>
      </div>

      <style jsx global>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .preview-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }

        .ant-card-hoverable:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Gallery;