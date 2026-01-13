import React from 'react';
import { Drawer, Button, Typography, Descriptions, Tag, Avatar, Space, Divider, Select, InputNumber } from 'antd';
import { HistoryOutlined } from '@ant-design/icons'; // [NEW] Icon
import dayjs from 'dayjs';
import theme from '../../../theme';
import CustomerHistoryModal from './CustomerHistoryModal'; // [NEW] Modal

const { Title, Text } = Typography;

const BookingDrawer = ({ visible, onClose, booking, onAction }) => {
    if (!booking) return null;

    // --- [NEW] STATE FOR UPSELL ---
    const [isEditing, setIsEditing] = React.useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = React.useState(null);

    // --- [NEW] STATE FOR HISTORY (CRM) ---
    const [historyVisible, setHistoryVisible] = React.useState(false);

    // --- LOGIC: COUNTDOWN TIMER ---
    const [timeLeft, setTimeLeft] = React.useState('');
    
    React.useEffect(() => {
        const updateTimer = () => {
             if (booking.status === 'processing') {
                const now = dayjs();
                const end = dayjs(booking.endTime);
                const diff = end.diff(now, 'minute');
                
                if (diff > 0) {
                    setTimeLeft(`Còn ${diff} phút`);
                } else {
                    setTimeLeft('Đã hết giờ');
                }
             }
        };
        
        // Call immediately
        updateTimer();

        // Then interval
        const timer = setInterval(updateTimer, 60000);
        return () => clearInterval(timer);
    }, [booking]);

    const handleAddService = () => {
        // Mock Add Logic for UI Demo - Real logic needs Service List from props
        if (!selectedServiceToAdd) return;
        
        onAction('upsell_save', { 
            booking,
            addedService: selectedServiceToAdd 
        });
        setIsEditing(false);
    };

    const statusColor = {
        pending: 'gold',
        confirmed: 'green',
        processing: 'blue', // [NEW]
        completed: 'green', // Changed from blue to green for done
        cancelled: 'red'
    }[booking.status] || 'default';

    return (
        <Drawer
            title={
                <div>
                    Chi Tiết Đơn Hàng
                    {booking.status === 'processing' && (
                        <Tag color="geekblue" style={{ marginLeft: 10 }}>
                            ⏱️ {timeLeft || 'Đang tính...'}
                        </Tag>
                    )}
                </div>
            }
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Title level={4} style={{ margin: 0 }}>{booking.customerName}</Title>
                    {/* [NEW] HISTORY BUTTON */}
                    <Button 
                        type="text" 
                        shape="circle" 
                        icon={<HistoryOutlined style={{ color: '#1890ff' }} />} 
                        onClick={() => setHistoryVisible(true)}
                        title="Xem lịch sử khách hàng"
                    />
                </div>
                <Text type="secondary">{booking.phone}</Text>
            </div>

            <Divider />

            {/* 2. Details (Edit Mode Support Phase 2 - Just View for now) */}
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
                
                {/* [NEW] Show Upsell Items */}
                {booking.servicesDone && booking.servicesDone.length > 0 && (
                    <Descriptions.Item label="Làm thêm">
                        {booking.servicesDone.map((s, i) => (
                            <div key={i}>+ {s.name} ({s.qty})</div>
                        ))}
                    </Descriptions.Item>
                )}
            </Descriptions>

            <div style={{ marginTop: 24 }}>
                <Text strong>Ghi chú:</Text>
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8, minHeight: 60 }}>
                    {booking.note || 'Không có ghi chú.'}
                </div>
            </div>
            
            {/* [NEW] UPSELL FORM */}
            {isEditing && (
                <div style={{ marginTop: 20, border: '1px dashed #1890ff', padding: 16, borderRadius: 8, background: '#e6f7ff' }}>
                    <Text strong style={{ color: '#1890ff' }}>⚡ Thêm Dịch Vụ Nhanh</Text>
                    
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Select 
                            placeholder="Chọn dịch vụ thêm..." 
                            style={{ width: '100%' }}
                            onChange={(val) => {
                                // Mock data parsing
                                const [name, price] = val.split('|');
                                setSelectedServiceToAdd({ name, price: parseInt(price), qty: 1 });
                            }}
                        >
                            <Select.Option value="Mặt nạ vàng 24k|200000">Mặt nạ vàng 24k (200k)</Select.Option>
                            <Select.Option value="Gội thảo dược|150000">Gội thảo dược (150k)</Select.Option>
                            <Select.Option value="Massage chân|300000">Massage chân (300k)</Select.Option>
                            <Select.Option value="Combo Gội + Massage|400000">Combo Gội + Massage (400k)</Select.Option>
                        </Select>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <Text>Số lượng:</Text>
                            <InputNumber min={1} defaultValue={1} onChange={(val) => setSelectedServiceToAdd(prev => ({ ...prev, qty: val }))} />
                            
                            <Button type="primary" onClick={handleAddService} disabled={!selectedServiceToAdd}>
                                Lưu (+ Thêm giờ)
                            </Button>
                            <Button onClick={() => setIsEditing(false)}>Hủy</Button>
                        </div>
                    </div>
                </div>
            )}

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
                justifyContent: 'flex-end',
                gap: 12
            }}>
                {/* GENERAL ACTIONS */}
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                     <Button danger onClick={() => onAction('cancel', booking)}>Hủy Đơn</Button>
                )}

                {/* FLOW ACTIONS */}
                
                {/* A. PENDING -> CONFIRM */}
                {booking.status === 'pending' && (
                    <Button type="primary" onClick={() => onAction('approve', booking)}>
                        Duyệt Ngay
                    </Button>
                )}

                {/* B. CONFIRMED -> CHECK-IN (START) */}
                {booking.status === 'confirmed' && (
                    <Button type="primary" style={{ background: theme.colors.primary[500] }} onClick={() => onAction('checkin', booking)}>
                        ▶ CHECK-IN (Bắt đầu)
                    </Button>
                )}

                {/* C. PROCESSING -> UPSPELL OR CHECKOUT */}
                {booking.status === 'processing' && (
                    <>
                        <Button 
                            onClick={() => setIsEditing(true)}
                            disabled={isEditing}
                        >
                            🔓 Thêm Dịch vụ
                        </Button>
                        <Button type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => onAction('checkout', booking)}>
                            💰 THANH TOÁN
                        </Button>
                    </>
                )}

                {/* D. COMPLETED -> VIEW INVOICE */}
                {booking.status === 'completed' && (
                    <Button onClick={() => onAction('view_invoice', booking)}>
                        📜 Xem Hóa Đơn
                    </Button>
                )}
            </div>
            {/* [NEW] HISTORY MODAL */}
            <CustomerHistoryModal
                visible={historyVisible}
                onClose={() => setHistoryVisible(false)}
                customerPhone={booking.phone}
                customerName={booking.customerName}
            />
        </Drawer>
    );
};

export default BookingDrawer;
