import React, { useState } from 'react';
import { Breadcrumb, Tabs, Button, Row, Col, Typography, Card, Divider } from 'antd';
import theme from '../../theme';

const { Title, Paragraph, Text } = Typography;

const services = [
  {
    id: 1,
    title: "Massage Đá Nóng",
    desc: "Sử dụng đá bazan nóng kết hợp tinh dầu tự nhiên giúp thư giãn cơ bắp sâu và giải tỏa căng thẳng.",
    duration: "60 Phút",
    price: "450.000 VNĐ",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
    category: "body"
  },
  {
    id: 2,
    title: "Chăm Sóc Da Mặt Gold",
    desc: "Liệu trình chăm sóc da cao cấp với tinh chất vàng 24k giúp trẻ hóa làn da, mờ nếp nhăn.",
    duration: "75 Phút",
    price: "800.000 VNĐ",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
    category: "face"
  },
  {
    id: 3,
    title: "Gội Đầu Dưỡng Sinh",
    desc: "Kết hợp gội đầu thảo dược và massage cổ vai gáy, giúp lưu thông khí huyết và giảm đau đầu.",
    duration: "45 Phút",
    price: "250.000 VNĐ",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=2070&auto=format&fit=crop",
    category: "hair"
  },
  {
    id: 4,
    title: "Trị Liệu Hương Thơm",
    desc: "Thư giãn tâm trí với các loại tinh dầu thiên nhiên cao cấp được chọn lọc kỹ lưỡng.",
    duration: "90 Phút",
    price: "650.000 VNĐ",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop",
    category: "deep"
  },
  {
    id: 5,
    title: "Massage Thái Cổ Truyền",
    desc: "Các động tác ấn huyệt và kéo giãn cơ thể giúp phục hồi năng lượng nhanh chóng.",
    duration: "90 Phút",
    price: "550.000 VNĐ",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1974&auto=format&fit=crop",
    category: "body"
  },
  {
    id: 6,
    title: "Combo Bạn Thân",
    desc: "Gói dịch vụ dành cho 2 người bao gồm xông hơi, massage body và chăm sóc da mặt cơ bản.",
    duration: "120 Phút",
    price: "1.200.000 VNĐ",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop",
    category: "body"
  }
];

const tabList = [
  { key: 'all', label: 'Tất cả' },
  { key: 'body', label: 'Massage Body' },
  { key: 'face', label: 'Chăm sóc da mặt' },
  { key: 'hair', label: 'Gội đầu dưỡng sinh' },
  { key: 'deep', label: 'Trị liệu chuyên sâu' },
];

const ServicePage = () => {
  const [activeKey, setActiveKey] = useState('all');

  // Lọc dịch vụ theo tab
  const filteredServices = activeKey === 'all'
    ? services
    : services.filter(s => s.category === activeKey);

  return (
    <div style={{ background: theme.colors.neutral[100], color: theme.colors.text.main }}>
      {/* Hero Section */}
      <div style={{
        width: '100%',
        height: 350,
        background: `linear-gradient(rgba(28,31,26,0.5),rgba(28,31,26,0.5)), url('https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop') center/cover`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Title style={{
          color: theme.colors.neutral[50],
          fontFamily: theme.fonts.heading,
          fontSize: 48,
          marginBottom: 0,
          letterSpacing: 3
        }}>DỊCH VỤ</Title>
        <Text style={{
          color: theme.colors.neutral[50],
          fontSize: 20,
          fontStyle: 'italic',
          fontFamily: theme.fonts.body
        }}>Nâng niu vẻ đẹp tự nhiên của bạn</Text>
      </div>

      {/* Breadcrumb */}
      <div style={{
        background: theme.colors.neutral[50],
        borderBottom: `1px solid ${theme.colors.neutral[300]}`,
        padding: '16px 0'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumb
            separator="/"
            items={[
              { title: <a href="/" style={{ color: theme.colors.neutral[600] }}>Trang chủ</a> },
              { title: <span style={{ fontWeight: 600, color: theme.colors.text.main }}>Dịch vụ</span> },
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0 24px' }}>
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabList}
          tabBarStyle={{
            color: theme.colors.text.main,
            fontFamily: theme.fonts.body,
            fontWeight: 500
          }}
        />
      </div>

      {/* Service Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <Row gutter={[32, 32]}>
          {filteredServices.map(service => (
            <Col xs={24} md={12} lg={8} key={service.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={service.title}
                    src={service.image}
                    style={{ height: 240, objectFit: 'cover', borderTopLeftRadius: theme.borderRadius.md, borderTopRightRadius: theme.borderRadius.md }}
                  />
                }
                style={{
                  borderRadius: theme.borderRadius.md,
                  boxShadow: theme.shadows.soft,
                  fontFamily: theme.fonts.body,
                  border: `1px solid ${theme.colors.primary[100]}`
                }}
              >
                <Title level={4} style={{
                  color: theme.colors.primary[400],
                  fontFamily: theme.fonts.heading,
                  letterSpacing: 1,
                  marginBottom: 8
                }}>{service.title}</Title>
                <Paragraph style={{
                  minHeight: 60,
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fonts.body
                }}>{service.desc}</Paragraph>
                <Divider style={{ margin: '12px 0', borderColor: theme.colors.primary[100] }} />
                <Text strong style={{ color: theme.colors.text.gold }}>{service.duration}</Text>
                <span style={{ margin: '0 8px', color: theme.colors.primary[400] }}>•</span>
                <Text strong style={{ color: theme.colors.primary[400] }}>{service.price}</Text>
                <div style={{ marginTop: 16 }}>
                  <Button type="link" style={{
                    color: theme.colors.primary[600],
                    fontWeight: 'bold',
                    fontFamily: theme.fonts.body
                  }}>Xem chi tiết</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Button type="default" size="large" style={{
            borderRadius: theme.borderRadius.md,
            padding: '0 48px',
            fontWeight: 'bold',
            color: theme.colors.primary[400],
            border: `1.5px solid ${theme.colors.primary[400]}`,
            background: theme.colors.neutral[50],
            fontFamily: theme.fonts.body
          }}>
            Xem thêm dịch vụ
          </Button>
        </div>
      </div>

      {/* Promo Section */}
      <div style={{
        width: '100%',
        background: theme.colors.neutral[50],
        padding: '100px 0',
        marginTop: 64,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '90%',
          maxWidth: '1400px',
          padding: '80px 40px',
          border: `1.5px solid ${theme.colors.primary[400]}`,
          position: 'relative',
          backgroundColor: theme.colors.neutral[100],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: theme.borderRadius.md,
          boxShadow: theme.shadows.elegant
        }}>
          {/* Biểu tượng Spa */}
          <div style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: theme.colors.neutral[50],
            padding: '0 30px'
          }}>
            <span className="material-symbols-outlined" style={{
              color: theme.colors.primary[400],
              fontSize: '45px'
            }}>
              spa
            </span>
          </div>

          <Title level={2} style={{
            color: theme.colors.text.main,
            fontFamily: theme.fonts.heading,
            fontSize: '42px',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            fontWeight: 400,
            marginBottom: '32px',
            width: '100%'
          }}>
            Trải nghiệm sự khác biệt
          </Title>

          <Paragraph style={{
            color: theme.colors.text.secondary,
            fontSize: '20px',
            lineHeight: '2.2',
            maxWidth: '800px',
            margin: '0 auto 56px auto',
            fontFamily: theme.fonts.body,
            letterSpacing: '0.8px'
          }}>
            Chào mừng bạn đến với không gian thư giãn đẳng cấp. Đặt lịch ngay hôm nay để nhận đặc quyền
            <span style={{
              color: theme.colors.primary[400],
              fontWeight: 600,
              borderBottom: `1.5px solid ${theme.colors.primary[400]}`,
              margin: '0 10px',
              fontSize: '22px'
            }}>
              giảm giá 20%
            </span>
            cho tất cả liệu trình trong lần đầu ghé thăm MIU SPA.
          </Paragraph>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            <Button
              type="primary"
              size="large"
              style={{
                background: theme.colors.text.main,
                color: theme.colors.primary[400],
                border: 'none',
                borderRadius: theme.borderRadius.none,
                height: '60px',
                padding: '0 60px',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                boxShadow: theme.shadows.royal,
                fontFamily: theme.fonts.body
              }}
            >
              Đặt lịch ngay
            </Button>

            <Button
              type="default"
              size="large"
              style={{
                borderRadius: theme.borderRadius.none,
                height: '60px',
                padding: '0 60px',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                border: `1.5px solid ${theme.colors.primary[400]}`,
                color: theme.colors.text.main,
                background: 'transparent',
                fontFamily: theme.fonts.body
              }}
            >
              Liên hệ tư vấn
            </Button>
          </div>
        </div>
      </div>
      <style>
        {`
          .ant-tabs-ink-bar {
            background: ${theme.colors.primary[400]} !important;
            transition: none !important;
          }
          .ant-tabs-tab .ant-tabs-tab-btn {
            transition: none !important;
          }
          .ant-tabs-tab:hover .ant-tabs-tab-btn,
          .ant-tabs-tab:focus .ant-tabs-tab-btn {
            color: ${theme.colors.primary[400]} !important;
          }
          .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: ${theme.colors.primary[400]} !important;
            font-weight: bold;
          }
        `}
      </style>
    </div>
  );
};

export default ServicePage;