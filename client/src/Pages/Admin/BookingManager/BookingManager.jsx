import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, Card, ConfigProvider, Button, Space, Avatar, Row, Col, Statistic, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { adminBookingService } from '../../../services/adminBookingService';
import dayjs from 'dayjs';
import theme from '../../../theme';

// Import services data để làm dropdown (tạm thời hardcode hoặc lấy từ file json nếu cần, 
// nhưng ở đây ta hardcode danh sách dịch vụ phổ biến để test nhanh)
// Import services data để làm dropdown (tạm thời hardcode hoặc lấy từ file json nếu cần, 
// nhưng ở đây ta hardcode danh sách dịch vụ phổ biến để test nhanh)
const SERVICES_LIST = [
    "Massage Body Thụy Điển", 
    "Chăm sóc da mặt chuyên sâu", 
    "Gội đầu dưỡng sinh"
];

// Thời gian mở cửa 9h - 18h
const TIME_SLOTS = [];
for (let i = 9; i <= 18; i++) {
    TIME_SLOTS.push(`${i}:00`);
    if(i !== 18) TIME_SLOTS.push(`${i}:30`);
}

const { Title, Text } = Typography;
const { Option } = Select;

const BookingManager = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  
  // State cho Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const data = await adminBookingService.getAllBookings(); 
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Xử lý tạo đơn
  const handleCreateBooking = async (values) => {
      setSubmitting(true);
      // Format lại date và time
      const formattedData = {
          customerName: values.customerName,
          phone: values.phone,
          serviceName: values.serviceName,
          date: values.date.format('YYYY-MM-DD'),
          time: values.time
      };

      const result = await adminBookingService.createBooking(formattedData);
      setSubmitting(false);

      if (result.success) {
          message.success('Tạo đơn thành công!');
          setIsModalVisible(false);
          form.resetFields();
          fetchBookings(); // Reload lại bảng
      } else {
          message.error(result.message || 'Có lỗi xảy ra');
      }
  };

  // Tính toán chỉ số nhanh
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const todayCount = bookings.filter(b => dayjs(b.startTime).isSame(dayjs(), 'day')).length;

  const columns = [
    {
      title: 'NGUỒN', // Cột Source Mới
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (source) => (
         <div style={{ textAlign: 'center' }}>
            {source === 'offline' ? (
                <span className="material-symbols-outlined" style={{ color: theme.colors.primary[600], fontSize: '24px' }} title="Đặt tại quầy/Điện thoại">
                    person_add
                </span>
            ) : (
                <span className="material-symbols-outlined" style={{ color: '#1890ff', fontSize: '24px' }} title="Đặt qua Web">
                    public
                </span>
            )}
            <div style={{ fontSize: '10px', color: '#888' }}>{source === 'offline' ? 'Tại quầy' : 'Web'}</div>
         </div>
      )
    },
    {
      title: 'THỜI GIAN',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 140,
      render: (text) => (
        <div>
          <div style={{ 
            color: theme.colors.primary[800], 
            fontWeight: '700', 
            fontSize: '15px',
            fontFamily: theme.fonts.body 
          }}>
            {dayjs(text).format('HH:mm')}
          </div>
          <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>
            {dayjs(text).format('DD/MM/YYYY')}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
    },
    {
      title: 'KHÁCH HÀNG',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <Avatar 
              size={40}
              style={{ 
                backgroundColor: theme.colors.primary[100], 
                color: theme.colors.primary[600],
                fontWeight: 'bold',
                border: `1px solid ${theme.colors.primary[200]}`
              }}
            >
              {text.charAt(0).toUpperCase()}
            </Avatar>
           <div>
              <div style={{ color: theme.colors.text.main, fontWeight: 600, fontSize: '14px' }}>{text}</div>
              <div style={{ color: theme.colors.text.secondary, fontSize: '12px' }}>{record.phone}</div>
           </div>
        </div>
      ),
    },
    {
      title: 'DỊCH VỤ',
      dataIndex: 'serviceId',
      key: 'service',
      render: (service) => service ? (
        <span style={{ 
          color: theme.colors.text.main, 
          fontWeight: 500,
          background: '#f5f5f5',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '13px'
        }}>
          {service.name}
        </span>
      ) : <Text type="danger">--</Text>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        let color = 'default';
        let text = 'Chờ xử lý';
        
        if (status === 'confirmed') { color = '#52c41a'; text = 'Đã nhận'; }
        if (status === 'pending') { color = '#faad14'; text = 'Mới đặt'; }
        if (status === 'completed') { color = '#1890ff'; text = 'Xong'; }
        if (status === 'cancelled') { color = '#ff4d4f'; text = 'Hủy'; }
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }}></div>
             <span style={{ fontWeight: 600, color: '#444', fontSize: '13px' }}>{text}</span>
          </div>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="text" 
          style={{ color: theme.colors.primary[600], fontWeight: 600 }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Component Card Thống Kê
  const StatCard = ({ title, value, icon, gradient }) => (
    <Card bordered={false} style={{ 
      background: gradient || '#fff', 
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.soft,
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Statistic 
        title={<span style={{ color: gradient ? '#fff' : '#666', fontWeight: 600 }}>{title}</span>}
        value={value} 
        valueStyle={{ color: gradient ? '#fff' : theme.colors.text.main, fontWeight: 'bold', fontSize: '32px' }}
      />
      {icon && <div style={{ 
        position: 'absolute', right: -10, bottom: -10, 
        fontSize: '80px', opacity: 0.1, color: gradient ? '#fff' : '#000' 
      }} className="material-symbols-outlined">{icon}</div>}
    </Card>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: theme.fonts.body,
          colorPrimary: theme.colors.primary[500],
        },
        components: {
          Table: {
            headerBg: 'transparent',
            headerColor: '#888',
            borderColor: '#f0f0f0',
            rowHoverBg: '#fafafa',
          },
        },
      }}
    >
      <div style={{ padding: '32px', minHeight: '100vh', background: '#F8F9FA' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ fontFamily: theme.fonts.heading, marginBottom: 0 }}>Chào buổi sáng, Admin</Title>
          <Text type="secondary">Đây là tình hình kinh doanh hôm nay.</Text>
        </div>

        {/* Stats Row */}
        <Row gutter={24} style={{ marginBottom: '32px' }}>
          <Col span={6}>
            <StatCard title="Đơn Chờ Xử Lý" value={pendingCount} icon="notifications_active" gradient={theme.gradients.royalGold} />
          </Col>
          <Col span={6}>
            <StatCard title="Khách Hôm Nay" value={todayCount} icon="calendar_today" />
          </Col>
          <Col span={6}>
            <StatCard title="Tổng Đơn Đặt" value={bookings.length} icon="receipt_long" />
          </Col>
        </Row>

        {/* Main Table Card */}
        <Card bordered={false} style={{ borderRadius: theme.borderRadius.md, boxShadow: theme.shadows.soft }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0, fontFamily: theme.fonts.heading }}>Danh Sách Đặt Lịch</Title>
            <Space>
               <Button>Lọc theo ngày</Button>
               <Button type="primary" size="large" onClick={() => setIsModalVisible(true)} style={{ background: theme.colors.primary[600] }}>
                 + Tạo Đơn
               </Button>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </Card>

        {/* MODAL TẠO ĐƠN THỦ CÔNG */}
        <Modal
            title={<span style={{fontFamily: theme.fonts.heading, fontSize: '20px', color: theme.colors.primary[600]}}>TẠO ĐƠN MỚI (TẠI QUẦY)</span>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            styles={{ body: { backgroundColor: '#fff', padding: '20px' } }}
            className="manual-booking-modal" // Thêm class để override CSS
        >
             {/* NUCLEAR OPTION: Bơm CSS trực tiếp để đè mọi Global Style */}
            <style>{`
                .manual-booking-modal .ant-input {
                    color: #000000 !important;
                    background-color: #ffffff !important;
                    border-color: #d9d9d9 !important;
                }
                .manual-booking-modal .ant-input::placeholder {
                    color: #8c8c8c !important;
                }
                .manual-booking-modal .ant-select-selection-item {
                    color: #000000 !important;
                }
                .manual-booking-modal .ant-select-selector {
                    color: #000000 !important;
                    background-color: #ffffff !important;
                    border-color: #d9d9d9 !important;
                }
                .manual-booking-modal .ant-picker-input > input {
                    color: #000000 !important;
                }
            `}</style>

            <ConfigProvider
                theme={{
                    token: {
                        colorText: '#000000',
                        colorTextPlaceholder: '#8c8c8c',
                        colorBgContainer: '#ffffff',
                    }
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateBooking}
                >
                    <Form.Item label="SĐT Khách hàng" name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                        <Input placeholder="Nhập số điện thoại..." size="large" />
                    </Form.Item>

                    <Form.Item label="Tên Khách hàng" name="customerName" rules={[{ required: true, message: 'Nhập tên' }]}>
                        <Input placeholder="Nhập tên khách..." size="large"/>
                    </Form.Item>

                    <Form.Item label="Dịch vụ" name="serviceName" rules={[{ required: true, message: 'Chọn dịch vụ' }]}>
                        <Select placeholder="Chọn dịch vụ" size="large">
                            {SERVICES_LIST.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Ngày" name="date" rules={[{ required: true, message: 'Chọn ngày' }]}>
                                <DatePicker style={{ width: '100%' }} size="large" format="DD/MM/YYYY" placeholder="Chọn ngày"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Giờ" name="time" rules={[{ required: true, message: 'Chọn giờ' }]}>
                                <Select placeholder="Giờ" size="large">
                                    {TIME_SLOTS.map(t => <Option key={t} value={t}>{t}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={submitting} block size="large" style={{ background: theme.colors.primary[600], color: '#fff', fontWeight: 'bold' }}>
                            XÁC NHẬN TẠO ĐƠN
                        </Button>
                    </Form.Item>
                </Form>
            </ConfigProvider>
        </Modal>

      </div>
    </ConfigProvider>
  );
};

export default BookingManager;
