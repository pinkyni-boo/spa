import React from 'react';
import { Typography, Divider, Row, Col } from 'antd';
import { ClockCircleOutlined, SafetyCertificateOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import royalLuxuryTheme from '../theme';

const { Title, Paragraph, Text } = Typography;

const Policies = () => {
  const styles = {
    container: {
      backgroundColor: royalLuxuryTheme.colors.neutral[50],
      fontFamily: royalLuxuryTheme.fonts.body,
      padding: '80px 20px',
      minHeight: '100vh',
    },
    documentWrapper: {
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#FFFFFF',
      padding: '60px 40px', // Paper-like padding
      borderRadius: '2px',
      boxShadow: royalLuxuryTheme.shadows.soft,
      border: `1px solid ${royalLuxuryTheme.colors.primary[100]}`,
    },
    pageHeader: {
      textAlign: 'center',
      marginBottom: '60px',
    },
    pageTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.text.main,
      fontSize: '36px',
      textTransform: 'uppercase',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    section: {
      marginBottom: '50px',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: `1px solid ${royalLuxuryTheme.colors.primary[200]}`,
      paddingBottom: '10px',
    },
    sectionIcon: {
      fontSize: '24px',
      color: royalLuxuryTheme.colors.primary[400], // Gold
      marginRight: '15px',
    },
    sectionTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.primary[600], // Muted Gold
      fontSize: '20px',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    paragraph: {
      fontFamily: royalLuxuryTheme.fonts.body,
      color: royalLuxuryTheme.colors.text.secondary,
      fontSize: '15px',
      lineHeight: '1.8',
      marginBottom: '16px',
      paddingLeft: '40px', // Indent content under title
    },
    boldLabel: {
      fontWeight: 600,
      color: royalLuxuryTheme.colors.text.main,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.documentWrapper}>
        
        {/* Header */}
        <div style={styles.pageHeader}>
          <Text style={{ fontFamily: royalLuxuryTheme.fonts.sans, color: royalLuxuryTheme.colors.primary[400], letterSpacing: '3px', textTransform: 'uppercase', fontSize: '12px' }}>
            Thông tin khách hàng
          </Text>
          <Title level={1} style={styles.pageTitle}>Chính Sách Dịch Vụ</Title>
          <div style={{ width: '60px', height: '2px', backgroundColor: royalLuxuryTheme.colors.primary[400], margin: '0 auto' }}></div>
        </div>

        {/* I. CHÍNH SÁCH ĐẶT LỊCH VÀ HỦY LỊCH */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <ClockCircleOutlined style={styles.sectionIcon} />
            <Title level={3} style={styles.sectionTitle}>I. Chính Sách Đặt Lịch & Hủy Lịch</Title>
          </div>
          <Paragraph style={styles.paragraph}>
            <span style={styles.boldLabel}>Đặt lịch:</span> Khách hàng nên đặt lịch trước ít nhất <span style={{ color: royalLuxuryTheme.colors.primary[600] }}>2 giờ</span> để được phục vụ tốt nhất.
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            <span style={styles.boldLabel}>Đến muộn:</span> Trong trường hợp quý khách đến muộn quá 15 phút mà không thông báo, MIU SPA xin phép ưu tiên phục vụ khách hàng kế tiếp hoặc rút ngắn thời gian liệu trình để không ảnh hưởng đến các ca sau.
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            <span style={styles.boldLabel}>Hủy/Đổi lịch:</span> Vui lòng thông báo trước ít nhất <span style={{ color: royalLuxuryTheme.colors.primary[600] }}>3 giờ</span> nếu có thay đổi để chúng tôi sắp xếp lại nhân viên kỹ thuật.
          </Paragraph>
        </div>

        {/* II. CHÍNH SÁCH BẢO HÀNH & HOÀN TIỀN */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
             <SafetyCertificateOutlined style={styles.sectionIcon} />
            <Title level={3} style={styles.sectionTitle}>II. Chính Sách Bảo Hành & Hoàn Tiền</Title>
          </div>
          <Paragraph style={styles.paragraph}>
            <span style={styles.boldLabel}>Bảo hành dịch vụ:</span> Đối với các liệu trình chuyên sâu (trị mụn, nám, phun xăm...), MIU SPA cam kết bảo hành theo đúng lộ trình đã tư vấn bằng văn bản.
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            <span style={styles.boldLabel}>Hoàn tiền:</span> Chúng tôi hỗ trợ hoàn phí hoặc đổi gói dịch vụ tương đương nếu khách hàng có minh chứng về việc kích ứng sản phẩm hoặc dịch vụ không đúng như cam kết ban đầu.
          </Paragraph>
        </div>

        {/* III. CHÍNH SÁCH BẢO MẬT THÔNG TIN */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <LockOutlined style={styles.sectionIcon} />
            <Title level={3} style={styles.sectionTitle}>III. Chính Sách Bảo Mật Thông Tin</Title>
          </div>
          <Paragraph style={styles.paragraph}>
            Mọi thông tin cá nhân và tình trạng sức khỏe của khách hàng đều được bảo mật tuyệt đối trên hệ thống nội bộ của chúng tôi.
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            MIU SPA chỉ sử dụng hình ảnh khách hàng (Feedback) cho mục đích truyền thông khi có sự đồng ý trực tiếp của quý khách.
          </Paragraph>
        </div>

        {/* IV. QUY ĐỊNH CHUNG */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <InfoCircleOutlined style={styles.sectionIcon} />
            <Title level={3} style={styles.sectionTitle}>IV. Quy Định Chung</Title>
          </div>
          <Paragraph style={styles.paragraph}>
            Quý khách vui lòng không mang thú cưng hoặc thức ăn có mùi vào khu vực làm đẹp để đảm bảo không gian thư giãn chung.
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            Vui lòng tự bảo quản tài sản cá nhân có giá trị hoặc gửi tại quầy lễ tân trước khi vào phòng dịch vụ. MIU SPA miễn trừ trách nhiệm với các tài sản thất lạc nếu không được gửi giữ.
          </Paragraph>
        </div>

        {/* Footer Note */}
        <Divider style={{ margin: '40px 0' }} />
        <div style={{ textAlign: 'center' }}>
          <Text style={{ fontStyle: 'italic', color: royalLuxuryTheme.colors.text.secondary }}>
            Cảm ơn quý khách đã tin tưởng và lựa chọn MIU SPA CENTER.
          </Text>
        </div>

      </div>
    </div>
  );
};

export default Policies;
