import React from 'react';
import { Typography, Row, Col, Collapse, Button, Divider, Space } from 'antd';
import { 
  TeamOutlined, 
  DollarCircleOutlined, 
  GiftOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  CaretRightOutlined 
} from '@ant-design/icons';
import royalLuxuryTheme from '../theme';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const Careers = () => {
  const styles = {
    container: {
      backgroundColor: royalLuxuryTheme.colors.neutral[50], // Pure White
      fontFamily: royalLuxuryTheme.fonts.body,
      minHeight: '100vh',
      paddingBottom: '100px',
    },
    // HERO
    heroSection: {
      padding: '80px 20px 60px',
      backgroundColor: royalLuxuryTheme.colors.primary[50], // Silk White
      textAlign: 'center',
    },
    heroTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.text.main,
      fontSize: '40px',
      textTransform: 'uppercase',
      marginBottom: '20px',
    },
    heroSubtitle: {
      fontFamily: royalLuxuryTheme.fonts.body,
      color: royalLuxuryTheme.colors.text.secondary,
      fontSize: '16px',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.8',
    },
    // CONTENT WRAPPER
    contentWrapper: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 20px',
    },
    // POSITIONS (ACCORDION)
    sectionTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.primary[600],
      fontSize: '28px',
      marginTop: '60px',
      marginBottom: '30px',
      textAlign: 'center',
    },
    collapse: {
      backgroundColor: 'transparent',
      border: 'none',
    },
    panel: {
      marginBottom: '20px',
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      border: `1px solid ${royalLuxuryTheme.colors.primary[200]}`,
      boxShadow: royalLuxuryTheme.shadows.soft,
      overflow: 'hidden',
    },
    panelHeader: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      fontSize: '18px',
      color: royalLuxuryTheme.colors.text.main,
      padding: '20px',
    },
    jobDescTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: royalLuxuryTheme.colors.primary[600],
      marginTop: '10px',
      marginBottom: '8px',
      textTransform: 'uppercase',
      fontSize: '14px',
      letterSpacing: '1px',
    },
    list: {
      paddingLeft: '20px',
      marginBottom: '20px',
      color: royalLuxuryTheme.colors.text.secondary,
    },
    // BENEFITS
    benefitCard: {
      backgroundColor: '#FFFFFF',
      padding: '30px',
      textAlign: 'center',
      border: `1px solid ${royalLuxuryTheme.colors.neutral[200]}`,
      height: '100%',
      transition: 'all 0.3s ease',
    },
    // APPLY
    applySection: {
      backgroundColor: royalLuxuryTheme.colors.text.main, // Dark background
      color: '#FFFFFF',
      padding: '60px 40px',
      marginTop: '80px',
      borderRadius: '4px',
      textAlign: 'center',
    },
  };

  // Custom Expansion Icon
  const expandIcon = ({ isActive }) => (
    <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ color: royalLuxuryTheme.colors.primary[400] }} />
  );

  return (
    <div style={styles.container}>
      
      {/* 1. HERO SECTION */}
      <div style={styles.heroSection}>
         <Text style={{ fontFamily: royalLuxuryTheme.fonts.sans, color: royalLuxuryTheme.colors.primary[400], letterSpacing: '3px', textTransform: 'uppercase', fontSize: '12px', display: 'block', marginBottom: '10px' }}>
            Cơ hội nghề nghiệp
          </Text>
        <Title level={1} style={styles.heroTitle}>Gia Nhập Đội Ngũ MIU SPA</Title>
        <div style={{ width: '60px', height: '2px', backgroundColor: royalLuxuryTheme.colors.primary[400], margin: '0 auto 30px' }}></div>
        <Paragraph style={styles.heroSubtitle}>
          Bạn đang tìm kiếm một môi trường làm việc chuyên nghiệp, tận tâm và đầy cảm hứng trong ngành làm đẹp? 
          Hãy cùng MIU SPA viết tiếp hành trình mang lại sự thư giãn và vẻ đẹp cho mọi người.
        </Paragraph>
      </div>

      <div style={styles.contentWrapper}>
        
        {/* 2. CÁC VỊ TRÍ TUYỂN DỤNG (ACCORDION) */}
        <Title level={2} style={styles.sectionTitle}>Các Vị Trí Đang Tuyển</Title>
        
        <Collapse 
          accordion 
          bordered={false} 
          expandIcon={expandIcon} 
          style={styles.collapse}
          expandIconPosition="end"
        >
          {/* VỊ TRÍ 1 */}
          <Panel header={<span style={{ fontWeight: 600, fontSize: '18px' }}>1. Nhân viên Lễ tân & Thu ngân</span>} key="1" style={styles.panel}>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={styles.jobDescTitle}>Mô tả công việc</div>
              <ul style={styles.list}>
                <li>Đón tiếp khách hàng, hướng dẫn khách làm thủ tục check-in/check-out.</li>
                <li>Tư vấn sơ bộ về các gói dịch vụ và chương trình ưu đãi hiện có.</li>
                <li>Thực hiện thanh toán, quản lý hóa đơn và báo cáo doanh thu cuối ngày.</li>
              </ul>

              <div style={styles.jobDescTitle}>Yêu cầu</div>
              <ul style={styles.list}>
                <li>Ngoại hình ưa nhìn, giọng nói truyền cảm, không ngọng.</li>
                <li>Kỹ năng giao tiếp tốt, xử lý tình huống linh hoạt.</li>
                <li>Biết sử dụng máy tính cơ bản và phần mềm bán hàng là một lợi thế.</li>
              </ul>
            </div>
          </Panel>

          {/* VỊ TRÍ 2 */}
          <Panel header={<span style={{ fontWeight: 600, fontSize: '18px' }}>2. Kỹ thuật viên Spa </span>} key="2" style={styles.panel}>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={styles.jobDescTitle}>Mô tả công việc</div>
              <ul style={styles.list}>
                <li>Thực hiện các liệu trình chăm sóc da, massage body, trị liệu chuyên sâu theo quy chuẩn của spa.</li>
                <li>Chăm sóc và theo dõi tình trạng của khách hàng trong suốt quá trình dịch vụ.</li>
                <li>Đảm bảo vệ sinh khu vực giường tầng và dụng cụ làm nghề.</li>
              </ul>

              <div style={styles.jobDescTitle}>Yêu cầu</div>
              <ul style={styles.list}>
                <li>Đã có chứng chỉ hành nghề hoặc kinh nghiệm ở vị trí tương đương.</li>
                <li>Có tâm với nghề, thái độ phục vụ nhẹ nhàng, lịch sự.</li>
                <li><strong>Đặc biệt:</strong> MIU SPA có chế độ đào tạo nâng cao tay nghề định kỳ cho kỹ thuật viên.</li>
              </ul>
            </div>
          </Panel>
        </Collapse>


        {/* 3. QUYỀN LỢI CHUNG */}
        <Title level={2} style={{ ...styles.sectionTitle, marginTop: '80px' }}>Quyền Lợi Chung</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={styles.benefitCard}>
              <DollarCircleOutlined style={{ fontSize: '36px', color: royalLuxuryTheme.colors.primary[400], marginBottom: '20px' }} />
              <Title level={4} style={{ fontSize: '18px', marginBottom: '10px' }}>Thu Nhập Hấp Dẫn</Title>
              <Paragraph style={{ color: royalLuxuryTheme.colors.text.secondary }}>
                Lương cơ bản + % Hoa hồng dịch vụ + % Tư vấn sản phẩm + Thưởng chuyên cần.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={styles.benefitCard}>
              <TeamOutlined style={{ fontSize: '36px', color: royalLuxuryTheme.colors.primary[400], marginBottom: '20px' }} />
              <Title level={4} style={{ fontSize: '18px', marginBottom: '10px' }}>Môi Trường Chuyên Nghiệp</Title>
              <Paragraph style={{ color: royalLuxuryTheme.colors.text.secondary }}>
                Làm việc trong không gian sang trọng, hiện đại và thân thiện. Đồng nghiệp hỗ trợ nhiệt tình.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={styles.benefitCard}>
              <GiftOutlined style={{ fontSize: '36px', color: royalLuxuryTheme.colors.primary[400], marginBottom: '20px' }} />
              <Title level={4} style={{ fontSize: '18px', marginBottom: '10px' }}>Phúc Lợi Toàn Diện</Title>
              <Paragraph style={{ color: royalLuxuryTheme.colors.text.secondary }}>
                Nghỉ phép năm, thưởng lễ tết và được trải nghiệm dịch vụ spa miễn phí hàng tháng.
              </Paragraph>
            </div>
          </Col>
        </Row>


        {/* 4. CÁCH THỨC ỨNG TUYỂN */}
        <div style={styles.applySection}>
          <Title level={2} style={{ color: '#FFFFFF', marginBottom: '10px', textTransform: 'uppercase' }}>Ứng Tuyển Ngay</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '40px' }}>
            Để viết tiếp câu chuyện cùng MIU SPA, vui lòng chọn một trong hai cách sau:
          </Paragraph>
          
          <Row gutter={[48, 24]} justify="center">
            <Col xs={24} md={10}>
              <div style={{ textAlign: 'left', borderLeft: `2px solid ${royalLuxuryTheme.colors.primary[400]}`, paddingLeft: '20px' }}>
                <Title level={4} style={{ color: '#D4AF37', margin: 0, fontSize: '16px', textTransform: 'uppercase' }}>Cách 1: Nộp Trực Tiếp</Title>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '15px' }}>
                  <EnvironmentOutlined style={{ color: '#FFFFFF', fontSize: '18px', marginTop: '4px' }} />
                   <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                    123 Serenity Blvd, Suite 100,<br/> Beverly Hills
                   </Text>
                </div>
              </div>
            </Col>

            <Col xs={24} md={10}>
              <div style={{ textAlign: 'left', borderLeft: `2px solid ${royalLuxuryTheme.colors.primary[400]}`, paddingLeft: '20px' }}>
                 <Title level={4} style={{ color: '#D4AF37', margin: 0, fontSize: '16px', textTransform: 'uppercase' }}>Cách 2: Gửi CV Online</Title>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                  <MailOutlined style={{ color: '#FFFFFF', fontSize: '18px' }} />
                   <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                    concierge@miuspa.com
                   </Text>
                </div>
                 <div style={{ marginTop: '10px' }}>
                   <Text style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '13px' }}>
                    (Hoặc nhắn tin trực tiếp qua Zalo/Fanpage)
                   </Text>
                 </div>
              </div>
            </Col>
          </Row>
        </div>

      </div>
    </div>
  );
};

export default Careers;
