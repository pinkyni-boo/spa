import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Typography, Button, Form, Input, Select, DatePicker, ConfigProvider, App, Spin } from 'antd';
import { PhoneOutlined, ArrowRightOutlined, CloseOutlined, DownOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useBooking } from './BookingContext';
import theme from '../../theme';
import { bookingService } from '../../services/bookingService';
import { branchService } from '../../services/branchService'; // [NEW] Import branchService
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Tạo danh sách Full Slot từ 09:00 đến 20:00 (Backend cho phép lố giờ đến 20:30)
const FULL_TIME_SLOTS = [];
for (let i = 9; i < 20; i++) {
    FULL_TIME_SLOTS.push(`${i.toString().padStart(2, '0')}:00`);
    FULL_TIME_SLOTS.push(`${i.toString().padStart(2, '0')}:30`);
}

const Booking = () => {
  const { message } = App.useApp();
  const { isBookingOpen, closeBooking, bookingData } = useBooking(); // Lấy bookingData từ kho
  const [form] = Form.useForm();
  
  // ... State ...
  const [loading, setLoading] = useState(false); 
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [showSlots, setShowSlots] = useState(false); 

  // [NEW] Branch State
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // [NEW] Services State (fetched from API)
  const [serviceOptions, setServiceOptions] = useState([]);

  // [NEW] Fetch Branches on Init
  useEffect(() => {
    if (isBookingOpen) {
        branchService.getAllBranches().then(res => {
            if (res.success) {
                setBranches(res.branches || []);
                // Optional: Auto-select if only 1 branch
                if (res.branches?.length === 1) {
                    const b = res.branches[0]._id || res.branches[0];
                    setSelectedBranch(b);
                    form.setFieldsValue({ branchId: b });
                }
            }
        });

        // Fetch services from API
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/services?type=service`)
            .then(r => r.json())
            .then(data => {
                if (data.success && Array.isArray(data.services)) {
                    setServiceOptions(data.services);
                }
            })
            .catch(() => {});
    }
  }, [isBookingOpen]); 

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
    const values = form.getFieldsValue(['serviceName', 'date', 'branchId']);
    if (values.serviceName && values.date && values.branchId) {
      setLoading(true);
      setShowSlots(true);
      setSelectedSlot(null); // Reset giờ đã chọn cũ
      
      const dateStr = values.date.format('YYYY-MM-DD');
      // Pass branchId to check slot
      const slots = await bookingService.checkAvailability(dateStr, values.serviceName, values.branchId);
      
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
      time: selectedSlot,
      branchId: values.branchId // [NEW] Include branchId
    };

    const result = await bookingService.createBooking(bookingData);
    
    setSubmitting(false);
    if (result.success) {
      message.success("Gửi yêu cầu thành công! Spa sẽ gọi xác nhận sớm.");
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
        styles={{
          mask: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }
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


              </Col>

              {/* Cột Phải: Chọn Dịch Vụ & Giờ (CORE LOGIC) */}
              <Col xs={24} md={14} style={{ padding: '25px 30px' }}>

                {/* [NEW] CHI NHÁNH - BẮT BUỘC */}
                <Form.Item 
                  name="branchId"
                  label={<span style={{ color: theme.colors.primary[400], fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Select Branch</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                  style={{ marginBottom: '15px' }}
                >
                  <Select 
                    placeholder="Choose location..." 
                    variant="borderless"
                    suffixIcon={<DownOutlined style={{ color: theme.colors.primary[400] }} />}
                    style={{ borderBottom: '1px solid #3a3528', padding: '2px 0', fontSize: '13px' }}
                    dropdownStyle={{ backgroundColor: theme.colors.neutral[800], border: '1px solid #3a3528' }}
                    onChange={(val) => {
                        setSelectedBranch(val);
                        form.setFieldsValue({ branchId: val }); // Ensure form value is set
                        // Reset slots when branch changes
                        setAvailableSlots([]);
                        setSelectedSlot(null);
                        handleCheckAvailability(); // Re-check if date/service already picked
                    }}
                  >
                     {branches.map(b => (
                         <Option key={b._id} value={b._id}>{b.name} - {b.address}</Option>
                     ))}
                  </Select>
                </Form.Item>

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
                    onChange={(value) => {
                        form.setFieldsValue({ serviceName: value });
                        handleCheckAvailability();
                    }}
                  >
                    {serviceOptions.map(opt => (
                      <Option key={opt._id || opt.name} value={opt.name}>{opt.name} ({opt.duration}p)</Option>
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
                    format="DD/MM/YYYY"
                    style={{ width: '100%', borderBottom: '1px solid #3a3528', padding: '6px 0' }}
                    onChange={(date) => {
                        form.setFieldsValue({ date });
                        handleCheckAvailability();
                    }}
                    inputReadOnly={true} // [FIX] Prevent manual typing to bypass disabledDate
                    disabledDate={(current) => {
                        // Can not select days before today and today + 7 days
                        return current && (current < dayjs().startOf('day') || current > dayjs().add(7, 'day').endOf('day'));
                    }} // Không cho chọn ngày quá khứ và quá 7 ngày
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

                  {/* [NEW] Overtime Warning */}
                  {selectedSlot && (() => {
                    const service = serviceOptions.find(s => s.name === form.getFieldValue('serviceName'));
                    if (!service) return null;
                    
                    const duration = service.duration || 60;
                    
                    // Parse selected slot time
                    const [hour, minute] = selectedSlot.split(':').map(Number);
                    const slotMinutes = hour * 60 + minute;
                    const endMinutes = slotMinutes + duration;
                    const closeMinutes = 20 * 60; // 20:00
                    
                    // Show warning if service ends after 20:00
                    if (endMinutes > closeMinutes) {
                      return (
                        <div style={{
                          marginTop: '12px',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(255, 165, 0, 0.1)',
                          border: '1px solid rgba(255, 165, 0, 0.3)',
                          borderRadius: '4px'
                        }}>
                          <Text style={{ color: '#FFA500', fontSize: '11px' }}>
                            ⚠️ Lưu ý: Dịch vụ sẽ kết thúc sau giờ đóng cửa (20:00). Vui lòng đến đúng giờ!
                          </Text>
                        </div>
                      );
                    }
                    return null;
                  })()}
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
                  REQUEST RESERVATION
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