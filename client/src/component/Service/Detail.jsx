import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Row, Col, Card, Divider } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import theme from '../../theme';

const { Title, Paragraph, Text } = Typography;

// Dữ liệu dịch vụ (tạm thời hardcode, sau này có thể lấy từ API)
const services = [
  {
    id: 1,
    title: "Massage Đá Nóng",
    desc: "Sử dụng đá bazan nóng kết hợp tinh dầu tự nhiên giúp thư giãn cơ bắp sâu và giải tỏa căng thẳng.",
    duration: "60 Phút",
    price: "450.000 VNĐ",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Chăm Sóc Da Mặt Gold",
    desc: "Liệu trình chăm sóc da cao cấp với tinh chất vàng 24k giúp trẻ hóa làn da, mờ nếp nhăn.",
    duration: "75 Phút",
    price: "800.000 VNĐ",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Gội Đầu Dưỡng Sinh",
    desc: "Kết hợp gội đầu thảo dược và massage cổ vai gáy, giúp lưu thông khí huyết và giảm đau đầu.",
    duration: "45 Phút",
    price: "250.000 VNĐ",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Trị Liệu Hương Thơm",
    desc: "Thư giãn tâm trí với các loại tinh dầu thiên nhiên cao cấp được chọn lọc kỹ lưỡng.",
    duration: "90 Phút",
    price: "650.000 VNĐ",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Massage Thái Cổ Truyền",
    desc: "Các động tác ấn huyệt và kéo giãn cơ thể giúp phục hồi năng lượng nhanh chóng.",
    duration: "90 Phút",
    price: "550.000 VNĐ",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Combo Bạn Thân",
    desc: "Gói dịch vụ dành cho 2 người bao gồm xông hơi, massage body và chăm sóc da mặt cơ bản.",
    duration: "120 Phút",
    price: "1.200.000 VNĐ",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop",
  }
];

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const service = services.find(s => s.id === parseInt(id));
  
  if (!service) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <Title level={3}>Không tìm thấy dịch vụ</Title>
        <Button type="primary" onClick={() => navigate('/services')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div style={{ background: theme.colors.neutral[100], minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{
        height: '350px',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${service.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <Title style={{ 
          color: theme.colors.primary[400], 
          fontFamily: theme.fonts.heading,
          fontSize: '42px',
          marginBottom: '8px'
        }}>
          {service.title}
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
          {service.duration} • {service.price}
        </Text>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/services')}
          style={{ 
            color: theme.colors.primary[400], 
            marginBottom: '30px',
            fontFamily: theme.fonts.body
          }}
        >
          Quay lại danh sách dịch vụ
        </Button>

        <Row gutter={[40, 40]}>
          <Col xs={24} md={16}>
            <Title level={3} style={{ 
              color: theme.colors.text.main, 
              fontFamily: theme.fonts.heading,
              marginBottom: '20px'
            }}>
              Mô tả dịch vụ
            </Title>
            <Paragraph style={{ 
              fontSize: '16px', 
              lineHeight: '1.8',
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body
            }}>
              {service.desc}
            </Paragraph>
            <Paragraph style={{ 
              fontSize: '16px', 
              lineHeight: '1.8',
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body
            }}>
              Tại MIU Spa, chúng tôi cam kết mang đến cho bạn trải nghiệm thư giãn tuyệt vời nhất 
              với đội ngũ chuyên viên được đào tạo bài bản và không gian sang trọng, tinh tế.
            </Paragraph>
          </Col>
          
          <Col xs={24} md={8}>
            <Card style={{ 
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.primary[200]}`,
              boxShadow: theme.shadows.soft
            }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ 
                  color: theme.colors.primary[400],
                  fontFamily: theme.fonts.heading
                }}>
                  Thông tin dịch vụ
                </Title>
                <Divider />
                <div style={{ marginBottom: '16px' }}>
                  <ClockCircleOutlined style={{ color: theme.colors.primary[400], marginRight: '8px' }} />
                  <Text strong>Thời gian: </Text>
                  <Text>{service.duration}</Text>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <DollarOutlined style={{ color: theme.colors.primary[400], marginRight: '8px' }} />
                  <Text strong>Giá: </Text>
                  <Text style={{ color: theme.colors.primary[400], fontWeight: 'bold' }}>{service.price}</Text>
                </div>
                <Button 
                  type="primary" 
                  block
                  style={{
                    backgroundColor: theme.colors.primary[400],
                    borderColor: theme.colors.primary[400],
                    height: '45px',
                    fontWeight: '600',
                    fontFamily: theme.fonts.body
                  }}
                >
                  Đặt lịch ngay
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Detail;
