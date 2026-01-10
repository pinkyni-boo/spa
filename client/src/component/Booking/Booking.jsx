import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Typography, Button, Form, Input, Select, DatePicker, ConfigProvider, message, Spin } from 'antd';
import { PhoneOutlined, ArrowRightOutlined, CloseOutlined, DownOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useBooking } from './BookingContext';
import theme from '../../theme';
import { bookingService } from '../../services/bookingService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Danh sách dịch vụ (khớp với server/data/services.json)
const SERVICE_OPTIONS = [
  { label: "Massage Body Thụy Điển (60p)", value: "Massage Body Thụy Điển" },
  { label: "Chăm sóc da mặt chuyên sâu (90p)", value: "Chăm sóc da mặt chuyên sâu" },
  { label: "Gội đầu dưỡng sinh (45p)", value: "Gội đầu dưỡng sinh" }
];

// Tạo danh sách Full Slot từ 09:00 đến 17:30 (Khớp logic Server)
const FULL_TIME_SLOTS = [];
for (let i = 9; i < 18; i++) {
    FULL_TIME_SLOTS.push(`${i.toString().padStart(2, '0')}:00`);
    FULL_TIME_SLOTS.push(`${i.toString().padStart(2, '0')}:30`);
}

const Booking = () => {
  const { isBookingOpen, closeBooking, bookingData } = useBooking(); // Lấy bookingData từ kho
  const [form] = Form.useForm();
  
  // ... State ...
  const [loading, setLoading] = useState(false); 
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [showSlots, setShowSlots] = useState(false); 

  // Reset form hoặc điền form khi mở
  useEffect(() => {
    if (isBookingOpen) {
      if (bookingData) {
        // [CÓ HÀNG] User chọn từ trang Services -> Điền sẵn
        form.setFieldsValue({ serviceName: bookingData });
        
        // Bonus: Nếu muốn tự động check luôn thì cần có cả NGÀY. 
        // Hiện tại mới chỉ có Tên Dịch Vụ -> Chưa check được giờ.
        // Nhưng ta có thể set field để khách đỡ phải chọn.
      } else {
        // [KHÔNG HÀNG] User mở chay -> Reset sạch
        form.resetFields();
        setAvailableSlots([]);
        setSelectedSlot(null);
        setShowSlots(false);
      }
    }
  }, [isBookingOpen, bookingData, form]);

  // Logic: Khi chọn Ngày hoặc Dịch vụ -> Tự động check giờ
  // ... (Giữ nguyên logic cũ) ...

  // Logic: Khi chọn Ngày hoặc Dịch vụ -> Tự động check giờ
  const handleCheckAvailability = async () => {
    const values = form.getFieldsValue(['serviceName', 'date']);
    if (values.serviceName && values.date) {
      setLoading(true);
      setShowSlots(true);
      setSelectedSlot(null); // Reset giờ đã chọn cũ
      
      const dateStr = values.date.format('YYYY-MM-DD');
      const slots = await bookingService.checkAvailability(dateStr, values.serviceName);
      
      setAvailableSlots(slots);
      setLoading(false);
    }
  };

  // Logic: Gửi form đặt lịch
  const handleFinish = async (values) => {
    if (!selectedSlot) {
      message.error("Vui lòng chọn khung giờ trống!");
      return;
    }

    setSubmitting(true);
    const bookingData = {
      customerName: values.customerName,
      phone: values.phone,
      serviceName: values.serviceName,
      date: values.date.format('YYYY-MM-DD'),
      time: selectedSlot
    };

    const result = await bookingService.createBooking(bookingData);
    
    setSubmitting(false);
    if (result.success) {
      message.success(result.message);
      closeBooking();
    } else {
      message.error(result.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

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
        width={750} 
        centered
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
        {/* KHỐI CUSTOM CỦA BẠN */}
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

          <Form 
            form={form} 
            layout="vertical" 
            requiredMark={false} 
            onFinish={handleFinish}
            style={{ width: '100%' }}
          >
            <Row>
              {/* Cột Trái: Thông tin khách hàng */}
              <Col xs={24} md={10} style={{ 
                padding: '25px 25px', 
                borderRight: '1px solid #3a3528', 
                backgroundColor: '#181611' 
              }}>
                <Title level={5} style={{ color: '#fff', fontFamily: theme.fonts.heading, marginBottom: '20px' }}>
                  Your Information
                </Title>
                
                <Form.Item 
                  name="customerName"
                  label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Full Name</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập tên của bạn' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <Input 
                    placeholder="Enter your name" 
                    variant="borderless"
                    style={{ borderBottom: '1px solid #3a3528', borderRadius: 0, padding: '6px 0', fontSize: '13px' }} 
                  />
                </Form.Item>

                {/* THÊM TRƯỜNG SỐ ĐIỆN THOẠI (BẮT BUỘC ĐỂ LIÊN HỆ) */}
                <Form.Item 
                  name="phone"
                  label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Phone Number</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <Input 
                    placeholder="Enter your phone" 
                    variant="borderless"
                    style={{ borderBottom: '1px solid #3a3528', borderRadius: 0, padding: '6px 0', fontSize: '13px' }} 
                  />
                </Form.Item>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                   <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: '#221d10',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto 10px'
                  }}>
                    <PhoneOutlined style={{ fontSize: '18px', color: theme.colors.primary[400] }} />
                  </div>
                   <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Cần hỗ trợ gấp?</Text>
                   <br/>
                   <Text style={{ color: theme.colors.primary[400], fontWeight: 'bold' }}>0987.654.321</Text>
                </div>
              </Col>

              {/* Cột Phải: Chọn Dịch Vụ & Giờ (CORE LOGIC) */}
              <Col xs={24} md={14} style={{ padding: '25px 30px' }}>
                <Form.Item 
                  name="serviceName"
                  label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Select Service</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
                  style={{ marginBottom: '15px' }}
                >
                  <Select 
                    placeholder="Choose a ritual..."
                    variant="borderless"
                    suffixIcon={<DownOutlined style={{ color: theme.colors.primary[400] }} />}
                    style={{ borderBottom: '1px solid #3a3528', padding: '2px 0', fontSize: '13px' }}
                    dropdownStyle={{ backgroundColor: theme.colors.neutral[800], border: '1px solid #3a3528' }}
                    onChange={handleCheckAvailability} // Gọi hàm check khi đổi dịch vụ
                  >
                    {SERVICE_OPTIONS.map(opt => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="date"
                  label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Select Date</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                  style={{ marginBottom: '15px' }}
                >
                  <DatePicker 
                    variant="borderless"
                    style={{ width: '100%', borderBottom: '1px solid #3a3528', padding: '6px 0' }}
                    onChange={handleCheckAvailability} // Gọi hàm check khi đổi ngày
                    disabledDate={(current) => current && current < dayjs().startOf('day')} // Không cho chọn ngày quá khứ
                    popupClassName="booking-datepicker-popup" // Class riêng để style popup
                  />
                </Form.Item>

                {/* KHU VỰC HIỂN THỊ GIỜ TRỐNG (DYNAMIC SLOT) */}
                <div style={{ minHeight: '120px' }}>
                  <Text style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Available Time Slots
                  </Text>
                  
                  {loading ? (
                     <div style={{ textAlign: 'center', padding: '20px' }}>
                       <Spin tip="Checking availability..." size="small" style={{ color: theme.colors.primary[400] }} />
                     </div>
                  ) : !showSlots ? (
                    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontStyle: 'italic' }}>
                      Vui lòng chọn Dịch vụ và Ngày để xem lịch trống.
                    </Text>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                      {FULL_TIME_SLOTS.map(slot => {
                        const isAvailable = availableSlots.includes(slot);
                        return (
                          <Button
                            key={slot}
                            disabled={!isAvailable}
                            type={selectedSlot === slot ? 'primary' : 'default'}
                            onClick={() => setSelectedSlot(slot)}
                            style={{
                              fontSize: '12px',
                              height: '32px',
                              minWidth: '70px',
                              backgroundColor: isAvailable 
                                ? (selectedSlot === slot ? theme.colors.primary[400] : 'transparent')
                                : '#2a251b', // Màu xám tối cho nút disabled
                              borderColor: isAvailable 
                                ? (selectedSlot === slot ? theme.colors.primary[400] : '#3a3528')
                                : '#2a251b',
                              color: isAvailable
                                ? (selectedSlot === slot ? theme.colors.neutral[900] : 'rgba(255,255,255,0.7)')
                                : 'rgba(255,255,255,0.15)', // Chữ mờ
                              fontWeight: selectedSlot === slot ? 'bold' : 'normal',
                              cursor: isAvailable ? 'pointer' : 'not-allowed'
                            }}
                          >
                            {slot}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button 
                  type="primary" 
                  block 
                  icon={submitting ? <Spin size="small" /> : <ArrowRightOutlined />}
                  htmlType="submit"
                  loading={submitting}
                  style={{ 
                    height: '45px', 
                    marginTop: '20px', 
                    fontWeight: 'bold', 
                    backgroundColor: theme.colors.primary[400],
                    color: theme.colors.neutral[900],
                    border: 'none',
                    letterSpacing: '1.5px',
                    fontSize: '12px',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  CONFIRM BOOKING
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
      <style>{`
        /* Giữ nguyên CSS cũ */
        .ant-input::placeholder, 
        .ant-select-selection-placeholder, 
        .ant-picker-input > input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }
        .ant-input,
        .ant-select-selection-item,
        .ant-picker-input > input {
          color: rgba(255, 255, 255, 0.65) !important;
        }
        .ant-input:focus, .ant-input-focused, .ant-picker:focus {
          border-bottom: 1px solid #D4AF37 !important;
        }
        .ant-modal-close {
          display: none !important;
        }
        /* Custom Scrollbar cho list giờ */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #1c1a15; 
        }
        ::-webkit-scrollbar-thumb {
          background: #3a3528; 
          border-radius: 2px;
        }
        
        /* FIX LỖI DATEPICKER POPUP TRẮNG + CHỮ TRẮNG -> CHUYỂN CHỮ THÀNH ĐEN */
        .booking-datepicker-popup .ant-picker-content th,
        .booking-datepicker-popup .ant-picker-cell-inner,
        .booking-datepicker-popup .ant-picker-header-view button,
        .booking-datepicker-popup .ant-picker-header button {
            color: #000 !important;
        }
         .booking-datepicker-popup .ant-picker-cell-disabled .ant-picker-cell-inner{
             color: #ccc !important;
         }
      `}</style>
    </ConfigProvider>
  );
};

export default Booking;