import React from 'react';
import { Typography, Row, Col, Image, Divider, Card } from 'antd';
import { CheckOutlined, HeartOutlined, SafetyCertificateOutlined, ExperimentOutlined } from '@ant-design/icons';
import royalLuxuryTheme from '../theme';

const { Title, Paragraph, Text } = Typography;

const About = () => {
  const styles = {
    container: {
      backgroundColor: royalLuxuryTheme.colors.neutral[50],
      fontFamily: royalLuxuryTheme.fonts.body,
      paddingBottom: '80px',
    },
    // HERO SECTION (Giới thiệu chung)
    heroSection: {
      padding: '80px 20px',
      backgroundColor: '#FFFFFF',
    },
    heroContent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      padding: '0 20px', // Adjusted padding
    },
    heroTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.text.main,
      fontSize: '40px',
      textTransform: 'uppercase',
      lineHeight: '1.2',
      marginBottom: '20px',
    },
    heroSubtitle: {
      fontFamily: royalLuxuryTheme.fonts.body,
      color: royalLuxuryTheme.colors.text.secondary,
      fontSize: '16px',
      lineHeight: '1.8',
      textAlign: 'justify',
    },
    
    // VALUES SECTION (Giá trị cốt lõi) - Redesigned to 3 Columns for usability
    valueSection: {
      padding: '80px 20px',
      backgroundColor: royalLuxuryTheme.colors.primary[50], // Silk White background
    },
    sectionHeader: {
      textAlign: 'center',
      marginBottom: '60px',
      maxWidth: '800px', 
      margin: '0 auto 60px',
    },
    valueCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      padding: '40px 30px',
      height: '100%',
      textAlign: 'center',
      border: `1px solid ${royalLuxuryTheme.colors.primary[100]}`,
      boxShadow: royalLuxuryTheme.shadows.soft,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'default',
    },
    iconWrapper: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      backgroundColor: royalLuxuryTheme.colors.primary[50], // Light Gold bg
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      color: royalLuxuryTheme.colors.primary[600],
      fontSize: '28px',
      border: `1px solid ${royalLuxuryTheme.colors.primary[200]}`,
    },
    valueItemTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.text.main,
      fontSize: '22px',
      marginBottom: '16px',
    },
    valueItemDesc: {
      fontFamily: royalLuxuryTheme.fonts.body,
      color: royalLuxuryTheme.colors.text.secondary,
      fontSize: '15px',
      lineHeight: '1.6',
    },
  };

  return (
    <div style={styles.container}>
      
      {/* ---------------- SECTION 1: LỜI CHÀO & TẦM NHÌN ---------------- */}
      <div style={styles.heroSection}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]} align="middle">
            {/* Image Left */}
            <Col xs={24} md={12}>
              <div style={{ position: 'relative', padding: '10px' }}>
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, width: '90%', height: '90%', 
                  border: `1px solid ${royalLuxuryTheme.colors.primary[200]}`, zIndex: 0 
                }} />
                <Image 
                  src="https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="MIU SPA Reception"
                  style={{ position: 'relative', zIndex: 1, boxShadow: royalLuxuryTheme.shadows.elegant, borderRadius: '2px', display: 'block' }}
                  preview={false}
                />
              </div>
            </Col>
            
            {/* Content Right */}
            <Col xs={24} md={12}>
              <div style={styles.heroContent}>
                <Text style={{ 
                  fontFamily: royalLuxuryTheme.fonts.sans, 
                  color: royalLuxuryTheme.colors.primary[400], 
                  letterSpacing: '3px', 
                  textTransform: 'uppercase', 
                  fontSize: '12px',
                  display: 'block',
                  marginBottom: '12px' 
                }}>
                  Câu chuyện của chúng tôi
                </Text>
                <Title level={1} style={styles.heroTitle}>
                  MIU SPA – <br/>
                  <span style={{ color: royalLuxuryTheme.colors.primary[600], fontStyle: 'italic', fontSize: '36px' }}>Nơi đánh thức vẻ đẹp tự nhiên</span>
                </Title>
                <div style={{ width: '60px', height: '2px', backgroundColor: royalLuxuryTheme.colors.primary[400], margin: '20px 0 30px' }}></div>
                <Paragraph style={styles.heroSubtitle}>
                  Chào mừng bạn đến với <strong>MIU SPA CENTER</strong> – ốc đảo bình yên giữa lòng thành phố nhộn nhịp. Chúng tôi tin rằng mỗi người phụ nữ đều sở hữu một vẻ đẹp riêng biệt, thuần khiết và tỏa sáng theo cách của riêng mình.
                  <br /><br />
                  Tại MIU, hành trình làm đẹp không chỉ là chăm sóc làn da, mà còn là sự vỗ về tâm hồn. Với không gian tĩnh lặng, hương thơm thảo mộc dịu nhẹ và đôi bàn tay Tận tâm, chúng tôi mong muốn mang lại cho bạn những giây phút thư giãn trọn vẹn nhất.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* ---------------- SECTION 2: GIÁ TRỊ CỐT LÕI (Grid Layout) ---------------- */}
      <div style={styles.valueSection}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={styles.sectionHeader}>
            <Title level={2} style={{ fontFamily: royalLuxuryTheme.fonts.heading, marginBottom: '10px' }}>Giá Trị Cốt Lõi</Title>
            <Text style={{ fontFamily: royalLuxuryTheme.fonts.subheading, fontStyle: 'italic', fontSize: '16px', color: royalLuxuryTheme.colors.text.secondary }}>
              "Niềm tin của khách hàng là tài sản quý giá nhất của chúng tôi"
            </Text>
          </div>

          {/* Grid Cards (Convenient Layout) */}
          <Row gutter={[30, 30]}>
            {/* CARD 1: TẬN TÂM */}
            <Col xs={24} md={8}>
              <div style={styles.valueCard} 
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = royalLuxuryTheme.shadows.elegant; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = royalLuxuryTheme.shadows.soft; }}
              >
                <div style={styles.iconWrapper}>
                  <HeartOutlined />
                </div>
                <Title level={4} style={styles.valueItemTitle}>Tận Tâm</Title>
                <Paragraph style={styles.valueItemDesc}>
                  Lắng nghe và thấu hiểu từng nhu cầu nhỏ nhất. Đội ngũ kỹ thuật viên được đào tạo bài bản không chỉ về tay nghề mà còn về thái độ phục vụ từ tâm.
                </Paragraph>
              </div>
            </Col>

            {/* CARD 2: AN TOÀN */}
            <Col xs={24} md={8}>
              <div style={styles.valueCard}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = royalLuxuryTheme.shadows.elegant; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = royalLuxuryTheme.shadows.soft; }}
              >
                <div style={styles.iconWrapper}>
                  <SafetyCertificateOutlined />
                </div>
                <Title level={4} style={styles.valueItemTitle}>An Toàn</Title>
                <Paragraph style={styles.valueItemDesc}>
                  Cam kết sử dụng 100% sản phẩm có nguồn gốc thiên nhiên và hữu cơ (Organic). Quy trình vệ sinh, khử khuẩn dụng cụ đạt chuẩn y khoa.
                </Paragraph>
              </div>
            </Col>

            {/* CARD 3: CÔNG NGHỆ */}
            <Col xs={24} md={8}>
              <div style={styles.valueCard}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = royalLuxuryTheme.shadows.elegant; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = royalLuxuryTheme.shadows.soft; }}
              >
                <div style={styles.iconWrapper}>
                  <ExperimentOutlined />
                </div>
                <Title level={4} style={styles.valueItemTitle}>Công Nghệ</Title>
                <Paragraph style={styles.valueItemDesc}>
                  Không ngừng cập nhật các phương pháp và thiết bị làm đẹp tiên tiến nhất trên thế giới, mang lại hiệu quả điều trị cao và nhanh chóng.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </div>

    </div>
  );
};

export default About;
