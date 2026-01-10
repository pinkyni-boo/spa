import React from 'react';
import { Drawer, Button, Typography, Descriptions, Tag, Avatar, Space, Divider } from 'antd';
import dayjs from 'dayjs';
import theme from '../../../theme';

const { Title, Text } = Typography;

const BookingDrawer = ({ visible, onClose, booking, onAction }) => {
    if (!booking) return null;

    const statusColor = {
        pending: 'gold',
        confirmed: 'green',
        completed: 'blue',
        cancelled: 'red'
    }[booking.status] || 'default';

    return (
        <Drawer
            title="Chi Tiết Đơn Hàng"
            placement="right"
            width={450}
            onClose={onClose}
            open={visible}
            styles={{ body: { paddingBottom: 80 } }}
            extra={
                <Tag color={statusColor} style={{ fontSize: '14px', padding: '4px 10px' }}>
                    {(booking.status || '').toUpperCase()}
                </Tag>
            }
        >
            {/* 1. Customer Info */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar size={64} style={{ backgroundColor: theme.colors.primary[100], color: theme.colors.primary[600], fontSize: '24px', marginBottom: 12 }}>
                    {booking.customerName?.charAt(0)}
                </Avatar>
                <Title level={4} style={{ margin: 0 }}>{booking.customerName}</Title>
                <Text type="secondary">{booking.phone}</Text>
            </div>

            <Divider />

            {/* 2. Details */}
            <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Dịch vụ">
                     <span style={{ fontWeight: 600 }}>{booking.serviceId?.name || booking.serviceName || '---'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày giờ">
                     {dayjs(booking.startTime).format('HH:mm - DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Thời lượng">
                     {booking.serviceId?.duration || 60} phút
                </Descriptions.Item>
                <Descriptions.Item label="Phòng">
                     {booking.roomId?.name || 'Chưa xếp'}
                </Descriptions.Item>
                <Descriptions.Item label="Nhân viên">
                     {booking.staffId?.name || 'Chưa xếp'}
                </Descriptions.Item>
                <Descriptions.Item label="Nguồn">
                     {booking.source === 'offline' ? 'Tại quầy' : 'Website'}
                </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
                <Text strong>Ghi chú:</Text>
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8, minHeight: 60 }}>
                    {booking.note || 'Không có ghi chú.'}
                </div>
            </div>

            {/* 3. Actions (Sticky Bottom) */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                left: 0,
                padding: '16px 24px',
                background: '#fff',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12
            }}>
                <Button danger onClick={() => onAction('cancel', booking)} disabled={booking.status === 'cancelled'}>
                    Hủy Đơn
                </Button>
                
                <Space>
                    {booking.status === 'pending' && (
                        <Button type="primary" onClick={() => onAction('approve', booking)}>
                            Duyệt Ngay
                        </Button>
                    )}
                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                        <Button type="primary" style={{ background: '#52c41a' }} onClick={() => onAction('checkin', booking)}>
                            Check-in / Thanh Toán
                        </Button>
                    )}
                </Space>
            </div>
        </Drawer>
    );
};

export default BookingDrawer;
