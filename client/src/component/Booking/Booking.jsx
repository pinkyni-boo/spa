import React from 'react';
import { Modal, Row, Col, Typography, Button, Form, Input, Select, DatePicker, TimePicker, ConfigProvider } from 'antd';
import { PhoneOutlined, ArrowRightOutlined, CloseOutlined, DownOutlined } from '@ant-design/icons';
import { useBooking } from './BookingContext';
import theme from '../../theme';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Booking = () => {
  const { isBookingOpen, closeBooking } = useBooking();
  return (
    /* 1. Sử dụng ConfigProvider để GHI ĐÈ thiết lập mặc định của Ant Design cho Modal này */
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: theme.colors.primary[400],
          colorText: 'rgba(255, 255, 255, 0.65)',
          colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
          fontFamily: theme.fonts.body,
        },
        components: {
          Modal: {
            contentBg: 'transparent',
            headerBg: 'transparent',
            footerBg: 'transparent',
            boxShadow: 'none',
            borderRadiusLG: 0,
            paddingContentHorizontalLG: 0,
            paddingMD: 0,
          },
          Input: {
            colorText: 'rgba(255, 255, 255, 0.65)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
            colorBgContainer: 'transparent',
          },
          Select: {
            colorText: 'rgba(255, 255, 255, 0.65)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
            selectorBg: 'transparent',
            colorBgElevated: theme.colors.neutral[800],
            optionSelectedBg: theme.colors.primary[400],
            optionSelectedColor: theme.colors.neutral[900],
          },
          DatePicker: {
            colorText: 'rgba(255, 255, 255, 0.65)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
            colorBgContainer: 'transparent',
          },
        },
      }}
    >
      <Modal
        open={isBookingOpen}
        onCancel={closeBooking}
        footer={null}
        closable={false}
        width={600}
        centered
        /* modalRender giúp ta can thiệp trực tiếp vào node của Modal để xóa style thừa nếu ConfigProvider chưa đủ */
        modalRender={(modal) => (
          <div style={{ backgroundColor: 'transparent', padding: 0 }}>
            {React.cloneElement(modal, { style: { ...modal.props.style, boxShadow: 'none', background: 'transparent' } })}
          </div>
        )}
        maskStyle={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* KHỐI CUSTOM CỦA BẠN - Nằm độc lập, không còn bị lớp trắng bao quanh */}
        <div style={{ 
          backgroundColor: '#1c1a15', 
          minHeight: 'auto', 
          borderRadius: '8px', 
          border: '1px solid #3a3528',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)'
        }}>
          
          {/* Nút X tùy chỉnh */}
          <Button 
            type="text"
            onClick={closeBooking}
            icon={<CloseOutlined style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }} />}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 10,
            }}
          />

          {/* Header Section */}
          <div style={{ 
            textAlign: 'center', 
            padding: '25px 20px 18px', 
            borderBottom: '1px solid #3a3528' 
          }}>
            <Title 
              style={{ 
                color: theme.colors.primary[400], 
                fontFamily: theme.fonts.heading, 
                fontSize: '24px', 
                marginBottom: '6px',
                marginTop: 0
              }}
            >
              A Moment of Serenity Awaits
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300, fontSize: '13px' }}>
              Hãy lựa chọn cách thức Quý khách mong muốn khởi đầu hành trình.
            </Text>
          </div>

          <Row>
            {/* Cột Trái: Immediate Assistance */}
            <Col xs={24} md={10} style={{ 
              padding: '25px 25px', 
              borderRight: '1px solid #3a3528', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#181611' 
            }}>
              <div style={{ 
                width: '55px', 
                height: '55px', 
                borderRadius: '50%', 
                border: '1px solid rgba(236,182,19,0.15)', 
                backgroundColor: '#221d10',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: theme.colors.primary[400] }}>ring_volume</span>
              </div>
              
              <Title level={5} style={{ color: '#fff', fontFamily: theme.fonts.heading, marginBottom: '8px' }}>
                Immediate Assistance
              </Title>
              <Paragraph style={{ color: '#b9b29d', fontSize: '11px', marginBottom: '18px', fontWeight: 300, lineHeight: '1.4' }}>
                Kết nối trực tiếp với Quản gia.
              </Paragraph>

              <Button 
                ghost 
                icon={<PhoneOutlined />}
                style={{ 
                  borderColor: theme.colors.primary[400], 
                  color: theme.colors.primary[400], 
                  height: '36px', 
                  width: '100%', 
                  maxWidth: '170px',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  fontSize: '10px'
                }}
                href="tel:+84987654321"
              >
                CALL TO MIU SPA
              </Button>
            </Col>

            {/* Cột Phải: Bespoke Reservation */}
            <Col xs={24} md={14} style={{ padding: '25px 30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '25px', height: '1px', backgroundColor: theme.colors.primary[400], marginRight: '10px' }}></div>
                <Title level={5} style={{ color: '#fff', fontFamily: theme.fonts.heading, fontStyle: 'italic', margin: 0, fontWeight: 400 }}>
                  Bespoke Reservation
                </Title>
              </div>

              <Form layout="vertical" requiredMark={false} style={{ marginBottom: 0 }}>
                <Form.Item 
                  label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Your Name</span>}
                  style={{ marginBottom: '12px' }}
                >
                  <Input 
                    placeholder="Enter your full name" 
                    variant="borderless"
                    style={{ 
                      borderBottom: '1px solid #3a3528', 
                      borderRadius: 0, 
                      color: 'rgba(255, 255, 255, 0.6)', 
                      padding: '6px 0',
                      fontSize: '13px',
                      backgroundColor: 'transparent'
                    }} 
                  />
                </Form.Item>

                <Form.Item 
                  label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Preferred Service</span>}
                  style={{ marginBottom: '12px' }}
                >
                  <Select 
                    placeholder="Select a ritual..."
                    variant="borderless"
                    suffixIcon={<DownOutlined style={{ color: theme.colors.primary[400] }} />}
                    style={{ borderBottom: '1px solid #3a3528', padding: '2px 0', fontSize: '13px' }}
                    dropdownStyle={{ backgroundColor: theme.colors.neutral[800], border: '1px solid #3a3528' }}
                  >
                    <Option value="massage">Royal Thai Massage</Option>
                    <Option value="facial">Gold Facial Rejuvenation</Option>
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Date</span>} style={{ marginBottom: '8px' }}>
                      <DatePicker 
                        variant="borderless"
                        style={{ width: '100%', borderBottom: '1px solid #3a3528', padding: '6px 0' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Time</span>} style={{ marginBottom: '8px' }}>
                      <TimePicker 
                        variant="borderless"
                        format="HH:mm"
                        style={{ width: '100%', borderBottom: '1px solid #3a3528', padding: '6px 0' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Button 
                  type="primary" 
                  block 
                  icon={<ArrowRightOutlined />}
                  style={{ 
                    height: '40px', 
                    marginTop: '12px', 
                    fontWeight: '600', 
                    backgroundColor: theme.colors.primary[400],
                    color: theme.colors.neutral[900],
                    border: 'none',
                    letterSpacing: '1px',
                    fontSize: '11px',
                    boxShadow: 'none'
                  }}
                >
                  SEND REQUEST
                </Button>
              </Form>
            </Col>
          </Row>
        </div>
      </Modal>

      {/* Global CSS để xử lý chi tiết các thành phần con */}
      <style>{`
        /* Đồng bộ màu placeholder cho tất cả các trường */
        .ant-input::placeholder, 
        .ant-select-selection-placeholder, 
        .ant-picker-input > input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        /* Màu chữ khi nhập */
        .ant-input,
        .ant-select-selection-item,
        .ant-picker-input > input {
          color: rgba(255, 255, 255, 0.65) !important;
        }

        /* Hiệu ứng focus cho input */
        .ant-input:focus, .ant-input-focused, .ant-picker:focus {
          border-bottom: 1px solid #D4AF37 !important;
        }

        /* Ẩn nút X mặc định */
        .ant-modal-close {
          display: none !important;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default Booking;