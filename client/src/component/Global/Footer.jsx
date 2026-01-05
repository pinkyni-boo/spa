import React from 'react';
import { Layout, Row, Col, Button, Typography, Space, Divider } from 'antd';
import { 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  PhoneOutlined, 
  MailOutlined 
} from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const AppFooter = () => {
  return (
    <Footer style={{ backgroundColor: '#181611', padding: '30px 40px 15px 40px', color: 'white' }}>
      {/* Container maxWidth 100% để tràn đều sang 2 bên */}
      <div style={{ margin: '0 auto', width: '100%' }}>
        
        {/* CTA Section - Rất gọn */}
        <Row justify="space-between" align="middle" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '25px' }}>
          <Col>
            <Title level={4} style={{ color: 'white', fontFamily: 'serif', marginBottom: '4px', fontSize: '24px' }}>
              Sẵn sàng thư giãn chưa?
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              Đặt lịch hẹn ngay hôm nay và bắt đầu hành trình hướng tới một cuộc sống khỏe mạnh và cân bằng hơn.
            </Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              style={{ 
                height: '40px', 
                fontWeight: 'bold', 
                borderRadius: '4px',
                backgroundColor: '#D4AF37',
                color: '#181611',
                border: 'none'
              }}
            >
              Bắt đầu hành trình của bạn
            </Button>
          </Col>
        </Row>

        {/* Footer Links Grid - Dàn đều 4 cột */}
        <Row gutter={[16, 16]} justify="space-between" style={{ marginBottom: '20px' }}>
          {/* Brand */}
          <Col xs={24} md={6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#D4AF37', fontSize: '18px' }}>spa</span>
              <Text strong style={{ color: 'white', fontSize: '14px', textTransform: 'uppercase' }}>MIU SPA</Text>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', display: 'block', maxWidth: '250px' }}>
              Trung tâm chăm sóc sức khỏe cao cấp chuyên về liệu pháp hữu cơ và sức khỏe toàn diện.
            </Text>
          </Col>

          {/* Khám phá */}
          <Col xs={12} md={4}>
            <Title level={5} style={{ color: '#D4AF37', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Khám phá</Title>
            <Space direction="vertical" size={2}>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Câu chuyện của chúng tôi</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Điều trị</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Thành viên</Link>
            </Space>
          </Col>

          {/* Địa chỉ */}
          <Col xs={12} md={6}>
            <Title level={5} style={{ color: '#D4AF37', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Hãy ghé thăm chúng tôi</Title>
            <Space direction="vertical" size={4} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <EnvironmentOutlined style={{ color: '#D4AF37' }} />
                <span>123 Serenity Blvd, Suite 100, Beverly Hills, CA 90210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: '#D4AF37' }} />
                <span>Hàng ngày: 9:00 sáng - 8:00 tối</span>
              </div>
            </Space>
          </Col>

          {/* Liên hệ */}
          <Col xs={24} md={5}>
            <Title level={5} style={{ color: '#D4AF37', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>Liên hệ</Title>
            <Space direction="vertical" size={4} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneOutlined style={{ color: '#D4AF37' }} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MailOutlined style={{ color: '#D4AF37' }} />
                <span>concierge@miuspa.com</span>
              </div>
            </Space>
          </Col>
        </Row>

        {/* Bottom Bar - Sát đáy */}
        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0' }} />
        <Row justify="space-between" align="middle" style={{ paddingTop: '15px' }}>
          <Col>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>
              © {new Date().getFullYear()} TRUNG TÂM SPA MIU. Bảo lưu mọi quyền.
            </Text>
          </Col>
          <Col>
            <Space size="middle">
              <Link href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Sự riêng tư</Link>
              <Link href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Điều khoản</Link>
            </Space>
          </Col>
        </Row>
      </div>
    </Footer>
  );
};

export default AppFooter;