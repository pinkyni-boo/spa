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
    <div style={{ background: theme.colors.backgroundDark, color: theme.colors.textLight }}>
      {/* Hero Section */}
      <div style={{
        width: '100%',
        height: 350,
        background: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop') center/cover`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Title style={{ color: '#fff', fontFamily: 'serif', fontSize: 48, marginBottom: 0 }}>DỊCH VỤ</Title>
        <Text style={{ color: '#fff', fontSize: 20, fontStyle: 'italic' }}>Nâng niu vẻ đẹp tự nhiên của bạn</Text>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Breadcrumb
            separator="/"
            items={[
              { title: <a href="/" style={{ color: '#888' }}>Trang chủ</a> },
              { title: <span style={{ fontWeight: 600 }}>Dịch vụ</span> },
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
        />
      </div>

      {/* Service Grid */}
      <div style={{ color: '#D4AF37', maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <Row gutter={[32, 32]}>
          {filteredServices.map(service => (
            <Col xs={24} md={12} lg={8} key={service.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={service.title}
                    src={service.image}
                    style={{ height: 240, objectFit: 'cover' }}
                  />
                }
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <Title level={4} style={{ color: '#D4AF37', fontFamily: 'serif' }}>{service.title}</Title>
                <Paragraph style={{ minHeight: 60 }}>{service.desc}</Paragraph>
                <Divider style={{ margin: '12px 0' }} />
                <Text strong>{service.duration}</Text>
                <span style={{ margin: '0 8px', color: '#D4AF37' }}>•</span>
                <Text strong>{service.price}</Text>
                <div style={{ marginTop: 16 }}>
                  <Button type="link" style={{ color: '#D4AF37', fontWeight: 'bold' }}>Xem chi tiết</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Button type="default" size="large" style={{ borderRadius: 24, padding: '0 48px', fontWeight: 'bold' }}>
            Xem thêm dịch vụ
          </Button>
        </div>
      </div>

      {/* Promo Section */}
      <div style={{ 
  /* Kéo full chiều ngang màn hình */
  width: '100%',
  /* Sử dụng nền Off-white tinh khôi */
  background: '#FFFFFF', 
  padding: '100px 0', 
  marginTop: 64,
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center'
}}>
  {/* Khung nội dung chính - Giãn cách rộng rãi để text "đều" và thoáng */}
  <div style={{ 
    width: '90%', /* Chiếm 90% chiều ngang màn hình để không bị dính sát lề */
    maxWidth: '1400px', /* Giới hạn tối đa cho màn hình cực lớn để text không bị loãng */
    padding: '80px 40px',
    border: '1px solid #D4AF37', /* Viền Gold Metallic sang trọng */
    position: 'relative',
    backgroundColor: '#FBFBF9', /* Nền kem nhẹ bên trong */
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }}>
    {/* Biểu tượng Spa làm điểm nhấn chính giữa */}
    <div style={{ 
      position: 'absolute', 
      top: '-25px', 
      left: '50%', 
      transform: 'translateX(-50%)',
      background: '#FFFFFF',
      padding: '0 30px'
    }}>
      <span className="material-symbols-outlined" style={{ color: '#D4AF37', fontSize: '45px' }}>
        spa
      </span>
    </div>

    {/* Tiêu đề viết hoa, giãn cách chữ rộng chuẩn vibe Hoàng gia */}
    <Title level={2} style={{ 
      color: '#1C1F1A', 
      fontFamily: "'Playfair Display', serif", 
      fontSize: '42px',
      letterSpacing: '5px',
      textTransform: 'uppercase',
      fontWeight: 400,
      marginBottom: '32px',
      width: '100%'
    }}>
      Trải nghiệm sự khác biệt
    </Title>
    
    {/* Đoạn văn bản mô tả căn giữa, giãn dòng thoáng */}
    <Paragraph style={{ 
      color: '#626262', 
      fontSize: '20px', 
      lineHeight: '2.2',
      maxWidth: '800px', /* Giới hạn độ rộng text để dễ đọc và đều hơn */
      margin: '0 auto 56px auto',
      fontFamily: "'Montserrat', sans-serif",
      letterSpacing: '0.8px'
    }}>
      Chào mừng bạn đến với không gian thư giãn đẳng cấp. Đặt lịch ngay hôm nay để nhận đặc quyền 
      <span style={{ 
        color: '#D4AF37', 
        fontWeight: 600, 
        borderBottom: '1px solid #D4AF37', 
        margin: '0 10px',
        fontSize: '22px'
      }}>
        giảm giá 20%
      </span> 
      cho tất cả liệu trình trong lần đầu ghé thăm MIU SPA.
    </Paragraph>

    {/* Hệ thống nút bấm cân đối */}
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
          background: '#1C1F1A', /* Đen chì Graphite */
          color: '#D4AF37', 
          border: 'none', 
          borderRadius: '0px', /* Góc vuông hiện đại quý phái */
          height: '60px',
          padding: '0 60px',
          fontSize: '14px',
          fontWeight: 'bold',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
        }}
      >
        Đặt lịch ngay
      </Button>
      
      <Button 
        type="default" 
        size="large" 
        style={{ 
          borderRadius: '0px', 
          height: '60px',
          padding: '0 60px',
          fontSize: '14px',
          fontWeight: 'bold',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          border: '1px solid #D4AF37',
          color: '#1C1F1A',
          background: 'transparent'
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
      background: #D4AF37 !important;
      transition: none !important;
    }
    .ant-tabs-tab .ant-tabs-tab-btn {
      transition: none !important;
    }
    .ant-tabs-tab:hover .ant-tabs-tab-btn,
    .ant-tabs-tab:focus .ant-tabs-tab-btn {
      color: #D4AF37 !important;
    }
    .ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #D4AF37 !important;
      font-weight: bold;
    }
  `}
</style>
    </div>
  );
};

export default ServicePage;