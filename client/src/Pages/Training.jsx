import React from 'react';
import { Typography, Row, Col, Card, Form, Input, Button, Checkbox, Image, Divider, List } from 'antd';
import { CheckCircleOutlined, BookOutlined, StarOutlined, FireOutlined } from '@ant-design/icons';
import royalLuxuryTheme from '../theme';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const Training = () => {
  const styles = {
    container: {
      backgroundColor: royalLuxuryTheme.colors.neutral[50], // Pure White
      fontFamily: royalLuxuryTheme.fonts.body,
      minHeight: '100vh',
      paddingBottom: '100px',
    },
    // HERO
    heroSection: {
      padding: '60px 20px',
      backgroundColor: royalLuxuryTheme.colors.primary[50], // Silk White
      textAlign: 'center',
      marginBottom: '60px',
    },
    heroTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.text.main,
      fontSize: '36px',
      textTransform: 'uppercase',
      marginBottom: '10px',
    },
    heroSubtitle: {
      fontFamily: royalLuxuryTheme.fonts.body,
      color: royalLuxuryTheme.colors.text.secondary,
      fontSize: '16px',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    // CONTENT WRAPPER
    contentWrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    // LEFT COLUMN (Main Content)
    mainContent: {
      paddingRight: '40px',
    },
    courseCard: {
      marginBottom: '40px',
      backgroundColor: '#FFFFFF',
      border: `1px solid ${royalLuxuryTheme.colors.primary[100]}`,
      boxShadow: royalLuxuryTheme.shadows.soft,
      borderRadius: '4px',
      overflow: 'hidden',
    },
    courseHeader: {
      padding: '24px',
      borderBottom: `1px solid ${royalLuxuryTheme.colors.primary[100]}`,
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    courseTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: royalLuxuryTheme.colors.text.main,
      fontSize: '22px',
      margin: 0,
    },
    courseBody: {
      padding: '24px',
    },
    // RIGHT COLUMN (Sidebar)
    sidebar: {
      position: 'sticky',
      top: '100px', // Adjust based on Nav height
    },
    formCard: {
      backgroundColor: '#FFFFFF',
      border: `1px solid ${royalLuxuryTheme.colors.primary[400]}`, // Gold border
      boxShadow: royalLuxuryTheme.shadows.elegant,
      borderRadius: '4px',
      textAlign: 'center',
    },
    formHeader: {
      backgroundColor: royalLuxuryTheme.colors.primary[400],
      padding: '15px',
      color: '#FFFFFF',
      fontFamily: royalLuxuryTheme.fonts.heading,
      fontSize: '18px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    formBody: {
      padding: '30px 20px',
    },
    commitmentList: {
      marginTop: '30px',
      backgroundColor: royalLuxuryTheme.colors.neutral[100],
      padding: '20px',
      borderRadius: '4px',
    },
  };

  return (
    <div style={styles.container}>
      
      {/* 1. HERO SECTION */}
      <div style={styles.heroSection}>
         <Text style={{ fontFamily: royalLuxuryTheme.fonts.sans, color: royalLuxuryTheme.colors.primary[400], letterSpacing: '3px', textTransform: 'uppercase', fontSize: '12px', display: 'block', marginBottom: '10px' }}>
            Học viện đào tạo
          </Text>
        <Title level={1} style={styles.heroTitle}>Đào Tạo Học Viên Spa Chuyên Nghiệp</Title>
        <Text style={{ fontSize: '20px', fontStyle: 'italic', color: royalLuxuryTheme.colors.primary[600], display: 'block', marginBottom: '20px' }}>
             "Kiến tạo sự nghiệp vững vàng"
        </Text>
        <div style={{ width: '60px', height: '2px', backgroundColor: royalLuxuryTheme.colors.primary[400], margin: '0 auto 20px' }}></div>
        <Paragraph style={styles.heroSubtitle}>
          MIU SPA tự hào là đơn vị uy tín trong việc đào tạo đội ngũ kỹ thuật viên lành nghề. 
          Chúng tôi không chỉ dạy kỹ thuật, chúng tôi truyền nghề bằng tâm thế của người làm dịch vụ tận tâm.
        </Paragraph>
      </div>

      <div style={styles.contentWrapper}>
        <Row gutter={[48, 48]}>
          
          {/* --- CỘT TRÁI: NỘI DUNG KHÓA HỌC (70%) --- */}
          <Col xs={24} lg={16} style={styles.mainContent}>
            
            {/* Khóa 1 */}
            <div style={styles.courseCard}>
              <div style={styles.courseHeader}>
                <Divider type="vertical" style={{ height: '30px', backgroundColor: royalLuxuryTheme.colors.primary[400], width: '4px' }} />
                <Title level={3} style={styles.courseTitle}>1. Gội Đầu Dưỡng Sinh & Massage Trị Liệu</Title>
              </div>
              <div style={styles.courseBody}>
                <Row gutter={[24, 24]}>
                   <Col xs={24} md={12}>
                     <Image 
                       src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                       style={{ borderRadius: '2px', height: '200px', objectFit: 'cover', width: '100%' }}
                     />
                   </Col>
                   <Col xs={24} md={12}>
                     <Paragraph style={{ color: royalLuxuryTheme.colors.text.secondary }}>
                       Khóa học chuyên sâu về sự kết hợp giữa kỹ thuật gội thảo dược phương Đông và bấm huyệt trị liệu vùng Đầu - Vai - Gáy.
                     </Paragraph>
                     <List
                        size="small"
                        dataSource={[
                          "Kỹ thuật khai huyệt & massage thư giãn",
                          "Công thức pha chế thảo dược tự nhiên",
                          "Kỹ năng xử lý các vấn đề đau mỏi thường gặp"
                        ]}
                        renderItem={item => (
                          <List.Item style={{ padding: '4px 0', border: 'none' }}>
                             <BookOutlined style={{ color: royalLuxuryTheme.colors.primary[400], marginRight: '10px' }} /> {item}
                          </List.Item>
                        )}
                      />
                   </Col>
                </Row>
              </div>
            </div>

            {/* Khóa 2 */}
            <div style={styles.courseCard}>
              <div style={styles.courseHeader}>
                 <Divider type="vertical" style={{ height: '30px', backgroundColor: royalLuxuryTheme.colors.primary[400], width: '4px' }} />
                <Title level={3} style={styles.courseTitle}>2. Chăm Sóc Da Mặt (Facial) Cơ Bản - Nâng Cao</Title>
              </div>
              <div style={styles.courseBody}>
                <Row gutter={[24, 24]}>
                   <Col xs={24} md={12}>
                     <Image 
                       src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                       style={{ borderRadius: '2px', height: '200px', objectFit: 'cover', width: '100%' }}
                     />
                   </Col>
                   <Col xs={24} md={12}>
                     <Paragraph style={{ color: royalLuxuryTheme.colors.text.secondary }}>
                        Trang bị kiến thức nền tảng vững chắc về da liễu và làm chủ các công nghệ làm đẹp hiện đại.
                     </Paragraph>
                     <List
                        size="small"
                        dataSource={[
                          "Phân loại da & Quy trình soi da chuẩn y khoa",
                          "Kỹ thuật lấy nhân mụn chuẩn 3K (Không sưng, Không đau, Không thâm)",
                          "Vận hành máy móc công nghệ cao"
                        ]}
                        renderItem={item => (
                          <List.Item style={{ padding: '4px 0', border: 'none' }}>
                             <StarOutlined style={{ color: royalLuxuryTheme.colors.primary[400], marginRight: '10px' }} /> {item}
                          </List.Item>
                        )}
                      />
                   </Col>
                </Row>
              </div>
            </div>

             {/* Khóa 3 */}
            <div style={styles.courseCard}>
              <div style={styles.courseHeader}>
                 <Divider type="vertical" style={{ height: '30px', backgroundColor: royalLuxuryTheme.colors.primary[400], width: '4px' }} />
                <Title level={3} style={styles.courseTitle}>3. Massage Body & Thư Giãn Chuyên Sâu</Title>
              </div>
              <div style={styles.courseBody}>
                <Row gutter={[24, 24]}>
                   <Col xs={24} md={12}>
                     <Image 
                       src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                       style={{ borderRadius: '2px', height: '200px', objectFit: 'cover', width: '100%' }}
                     />
                   </Col>
                   <Col xs={24} md={12}>
                     <Paragraph style={{ color: royalLuxuryTheme.colors.text.secondary }}>
                        Nghệ thuật sử dụng đôi bàn tay và nhiệt lượng để đánh bay mệt mỏi, giúp khách hàng phục hồi năng lượng toàn diện.
                     </Paragraph>
                     <List
                        size="small"
                        dataSource={[
                          "Massage đá nóng (Hot Stone)",
                          "Kỹ thuật Massage Thụy Điển & Thái",
                          "Liệu pháp tinh dầu (Aromatherapy)"
                        ]}
                        renderItem={item => (
                          <List.Item style={{ padding: '4px 0', border: 'none' }}>
                             <FireOutlined style={{ color: royalLuxuryTheme.colors.primary[400], marginRight: '10px' }} /> {item}
                          </List.Item>
                        )}
                      />
                   </Col>
                </Row>
              </div>
            </div>

          </Col>

          {/* --- CỘT PHẢI: SIDEBAR (30%) --- */}
          <Col xs={24} lg={8}>
            <div style={styles.sidebar}>
              
              {/* Form Đăng Ký */}
              <div style={styles.formCard}>
                <div style={styles.formHeader}>
                  Đăng Ký Tư Vấn
                </div>
                <div style={styles.formBody}>
                  <Form layout="vertical">
                    <Form.Item name="name" style={{ marginBottom: '15px' }}>
                      <Input placeholder="Họ và tên của bạn" style={{ height: '40px' }} />
                    </Form.Item>
                    <Form.Item name="phone" style={{ marginBottom: '15px' }}>
                      <Input placeholder="Số điện thoại" style={{ height: '40px' }} />
                    </Form.Item>
                    <Form.Item name="courses" label="Khóa học quan tâm" style={{ textAlign: 'left', marginBottom: '15px' }}>
                      <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Checkbox value="goidau">Gội đầu dưỡng sinh</Checkbox>
                        <Checkbox value="facial">Chăm sóc da chuyên sâu</Checkbox>
                        <Checkbox value="body">Massage Body</Checkbox>
                      </Checkbox.Group>
                    </Form.Item>
                    <Form.Item name="message" style={{ marginBottom: '20px' }}>
                      <TextArea rows={3} placeholder="Lời nhắn (nếu có)..." />
                    </Form.Item>
                    <Button type="primary" block style={{ 
                      height: '45px', 
                      backgroundColor: royalLuxuryTheme.colors.primary[600], 
                      borderColor: royalLuxuryTheme.colors.primary[600],
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      Gửi Yêu Cầu Ngay
                    </Button>
                  </Form>
                </div>
              </div>

              {/* Cam Kết */}
              <div style={styles.commitmentList}>
                 <Title level={5} style={{ textAlign: 'center', marginBottom: '15px', textTransform: 'uppercase', fontSize: '14px' }}>
                   Quyền Lợi Học Viên
                 </Title>
                 <List
                    size="small"
                    split={false}
                    dataSource={[
                      "Cấp chứng chỉ hoàn thành khóa học.",
                      "100% học viên thực hành trên mẫu thật.",
                      "Hỗ trợ giới thiệu việc làm tại MIU SPA.",
                    ]}
                    renderItem={item => (
                      <List.Item style={{ padding: '6px 0', border: 'none', fontSize: '13px' }}>
                         <CheckCircleOutlined style={{ color: royalLuxuryTheme.colors.primary[600], marginRight: '8px' }} /> {item}
                      </List.Item>
                    )}
                  />
              </div>

            </div>
          </Col>

        </Row>
      </div>
    </div>
  );
};

export default Training;
