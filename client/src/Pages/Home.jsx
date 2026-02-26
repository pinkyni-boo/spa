import React, { useState, useEffect } from 'react';
import { Typography, Button, Row, Col, Carousel, Card, Input, Form, Divider, Image, App, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CaretRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import royalLuxuryTheme from '../theme';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Home = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [consultForm] = Form.useForm();
  const [consultLoading, setConsultLoading] = useState(false);
  const [consultDone, setConsultDone] = useState(false);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/branches`)
      .then(r => r.json())
      .then(d => { if (d.success) setBranches(d.branches || []); })
      .catch(() => {});
  }, []);

  const handleConsultSubmit = async (values) => {
    setConsultLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source: 'website' }),
      });
      const data = await res.json();
      if (data.success) {
        setConsultDone(true);
        consultForm.resetFields();
      } else {
        message.error(data.message || 'Gửi thất bại. Vui lòng thử lại.');
      }
    } catch (e) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setConsultLoading(false);
    }
  };

  const styles = {
    container: {
      backgroundColor: royalLuxuryTheme.colors.neutral[50],
      fontFamily: royalLuxuryTheme.fonts.body,
    },
    // 1. BANNER CAROUSEL
    carouselSection: {
      position: 'relative',
    },
    carouselImage: {
      width: '100%',
      height: '600px',
      objectFit: 'cover',
      filter: 'brightness(0.9)', // Slight dim for better text contrast if needed
    },
    // 2. WELCOME SECTION
    welcomeSection: {
      padding: '80px 20px',
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
    },
    welcomeTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.text.main,
      fontSize: '42px',
      textTransform: 'uppercase',
      marginBottom: '20px',
    },
    welcomeDesc: {
      fontFamily: royalLuxuryTheme.fonts.body,
      color: royalLuxuryTheme.colors.text.secondary,
      fontSize: '16px',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.8',
    },
    // 3. SERVICE LIST
    serviceSection: {
      padding: '80px 20px',
      backgroundColor: royalLuxuryTheme.colors.primary[50], // Silk White
    },
    sectionTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.primary[600],
      fontSize: '36px',
      textAlign: 'center',
      marginBottom: '50px',
      textTransform: 'uppercase',
    },
    serviceCard: {
      border: 'none',
      backgroundColor: 'transparent',
      textAlign: 'center',
      cursor: 'pointer',
    },
    serviceImageWrapper: {
      overflow: 'hidden',
      borderRadius: '2px',
      marginBottom: '20px',
      boxShadow: royalLuxuryTheme.shadows.soft,
    },
    serviceImage: {
      width: '100%',
      height: '350px',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
    },
    serviceItemTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      fontSize: '24px',
      color: royalLuxuryTheme.colors.text.main,
      marginBottom: '10px',
    },
    serviceItemDesc: {
      color: royalLuxuryTheme.colors.text.secondary,
      fontSize: '15px',
      padding: '0 15px',
    },
    // 4. PROMOTIONS
    promoSection: {
      padding: '80px 20px',
      backgroundColor: royalLuxuryTheme.colors.text.main, // Dark background
      textAlign: 'center',
      color: '#FFFFFF',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
    },
    promoTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: '#D4AF37', // Bright Gold
      fontSize: '32px',
      marginBottom: '20px',
      textTransform: 'uppercase',
      letterSpacing: '2px',
    },
    // 5. CONSULTATION FORM
    formSection: {
      padding: '80px 20px',
      backgroundColor: '#FFFFFF',
    },
    formContainer: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px',
      border: `1px solid ${royalLuxuryTheme.colors.primary[200]}`,
      borderRadius: '4px',
      boxShadow: royalLuxuryTheme.shadows.elegant,
      backgroundColor: '#fff',
    },
  };

  const bannerImages = [
    "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Spa space
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Facial
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Product/Oil
  ];

  return (
    <div style={styles.container}>
      
      {/* 1. BANNER CAROUSEL (Auto-play) */}
      <div style={styles.carouselSection}>
        <Carousel autoplay autoplaySpeed={4000} effect="fade">
          {bannerImages.map((img, index) => (
            <div key={index}>
              <div 
                style={{
                  ...styles.carouselImage,
                  backgroundImage: `url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} 
              />
            </div>
          ))}
        </Carousel>
        
        {/* Banner Slogan Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#FFFFFF',
          width: '100%',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          zIndex: 10
        }}>
          <Title level={1} style={{ 
            color: '#FFFFFF', 
            fontFamily: royalLuxuryTheme.fonts.heading, 
            fontSize: '48px', 
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '5px'
          }}>
            Miu Spa
          </Title>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: '18px', 
            fontFamily: royalLuxuryTheme.fonts.sans,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            Tinh Hoa Thư Giãn Á Đông
          </Text>
        </div>
      </div>

      {/* 2. WELCOME SLOGAN */}
      <div style={styles.welcomeSection}>
        <Text style={{ fontFamily: royalLuxuryTheme.fonts.sans, color: royalLuxuryTheme.colors.primary[400], letterSpacing: '4px', textTransform: 'uppercase', fontSize: '13px', display: 'block', marginBottom: '15px' }}>
          Welcome to MIU SPA
        </Text>
        <Title level={1} style={styles.welcomeTitle}>
          Đánh Thức Vẻ Đẹp Tự Nhiên Từ Tâm
        </Title>
        <div style={{ width: '60px', height: '2px', backgroundColor: royalLuxuryTheme.colors.primary[400], margin: '0 auto 30px' }}></div>
        <Paragraph style={styles.welcomeDesc}>
          Nơi dừng chân lý tưởng để bạn gác lại âu lo, tận hưởng những giây phút thư giãn tuyệt đối và tái tạo năng lượng cho cơ thể. Chúng tôi tin rằng, vẻ đẹp thực sự bắt nguồn từ sự bình an trong tâm hồn.
        </Paragraph>
      </div>

      {/* 3. FEATURED SERVICES */}
      <div style={styles.serviceSection}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={styles.sectionTitle}>Dịch Vụ Tiêu Biểu</Title>
          
          <Row gutter={[32, 48]}>
            <Col xs={24} md={8}>
              <div style={styles.serviceCard} onClick={() => navigate('/services')}>
                <div style={styles.serviceImageWrapper}>
                  <img src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gội đầu" style={{ width: '100%', height: '350px', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                       onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                       onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <Title level={3} style={styles.serviceItemTitle}>Gội Đầu Dưỡng Sinh</Title>
                <Paragraph style={styles.serviceItemDesc}>Thư giãn sâu vùng đầu cổ, kết hợp thảo dược giúp tóc chắc khỏe.</Paragraph>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div style={styles.serviceCard} onClick={() => navigate('/services')}>
                <div style={styles.serviceImageWrapper}>
                   <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Massage" style={{ width: '100%', height: '350px', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                   />
                </div>
                <Title level={3} style={styles.serviceItemTitle}>Massage Body Đá Nóng</Title>
                <Paragraph style={styles.serviceItemDesc}>Kích thích lưu thông khí huyết, giảm đau nhức cơ xương khớp hiệu quả.</Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div style={styles.serviceCard} onClick={() => navigate('/services')}>
                <div style={styles.serviceImageWrapper}>
                   <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Facial" style={{ width: '100%', height: '350px', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                   />
                </div>
                <Title level={3} style={styles.serviceItemTitle}>Trị Liệu Chuyên Sâu</Title>
                <Paragraph style={styles.serviceItemDesc}>Liệu trình chăm sóc da mặt và cổ vai gáy được thiết kế riêng biệt.</Paragraph>
              </div>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Button 
              type="default" 
              size="large"
              style={{ 
                height: '50px', 
                padding: '0 40px', 
                fontSize: '14px', 
                textTransform: 'uppercase', 
                borderColor: royalLuxuryTheme.colors.primary[600], 
                color: royalLuxuryTheme.colors.primary[600],
                fontFamily: royalLuxuryTheme.fonts.heading,
                letterSpacing: '1px',
              }}
              onClick={() => navigate('/services')}
            >
              Khám Phá Tất Cả Dịch Vụ
            </Button>
          </div>
        </div>
      </div>

      {/* 4. PROMOTIONS */}
      <div style={styles.promoSection}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={styles.promoTitle}>"Rạng rỡ mỗi ngày – Nhận ngay ưu đãi đặc quyền"</Title>
          <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>
            Đăng ký hội viên ngay hôm nay để nhận ưu đãi lên đến 30% cho lần trải nghiệm đầu tiên.
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            style={{ 
              height: '50px', 
              padding: '0 40px', 
              backgroundColor: '#D4AF37', 
              color: '#000', 
              borderColor: '#D4AF37',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
            onClick={() => navigate('/incentives')}
          >
            Xem Chương Trình Ưu Đãi
          </Button>
        </div>
      </div>

      {/* 5. CONSULTATION FORM */}
      <div style={styles.formSection}>
        <div style={styles.formContainer} className="light-form">
          <Title level={3} style={{ textAlign: 'center', fontFamily: royalLuxuryTheme.fonts.heading, color: royalLuxuryTheme.colors.primary[600], marginBottom: '8px' }}>
            Đăng Ký Tư Vấn
          </Title>
          <p style={{ textAlign: 'center', color: royalLuxuryTheme.colors.text.secondary, marginBottom: '28px', fontSize: 15 }}>
            Để lại thông tin — chuyên viên sẽ liên hệ tư vấn miễn phí
          </p>

          {consultDone ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 12 }} />
              <Title level={4} style={{ color: '#52c41a' }}>Đã gửi thành công!</Title>
              <p style={{ color: royalLuxuryTheme.colors.text.secondary }}>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
              <Button onClick={() => setConsultDone(false)} style={{ marginTop: 8 }}>Gửi yêu cầu khác</Button>
            </div>
          ) : (
            <Form form={consultForm} layout="vertical" size="large" onFinish={handleConsultSubmit}>
              <Form.Item
                name="customerName"
                label={<span style={{ fontWeight: 600 }}>Họ và tên <span style={{ color: 'red' }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 600 }}>Số điện thoại <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="concern"
                label={<span style={{ fontWeight: 600 }}>Nội dung cần tư vấn <span style={{ color: 'red' }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng mô tả nhu cầu' }]}
              >
                <TextArea rows={4} />
              </Form.Item>
              {branches.length > 0 && (
                <Form.Item
                  name="preferredBranch"
                  label={<span style={{ fontWeight: 600 }}>Chi nhánh</span>}
                >
                  <Select allowClear placeholder="Chọn chi nhánh gần nhất">
                    {branches.map(b => (
                      <Option key={b._id} value={b._id}>{b.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={consultLoading}
                  style={{ backgroundColor: royalLuxuryTheme.colors.text.main, borderColor: royalLuxuryTheme.colors.text.main, height: '45px', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  Gửi Yêu Cầu Tư Vấn
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;
