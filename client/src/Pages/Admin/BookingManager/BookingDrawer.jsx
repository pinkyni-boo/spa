import React from 'react';
import { Drawer, Button, Typography, Descriptions, Tag, Avatar, Space, Divider, Select, InputNumber, message, DatePicker, TimePicker } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import theme from '../../../theme';
import CustomerHistoryModal from './CustomerHistoryModal';
import { resourceService } from '../../../services/resourceService';

const { Title, Text } = Typography;

const BookingDrawer = ({ open, onClose, booking, onAction, services = [] }) => {
    // --- [NEW] STATE FOR UPSELL ---
    const [isEditing, setIsEditing] = React.useState(false);
    const [selectedServiceToAdd, setSelectedServiceToAdd] = React.useState(null);

    // --- STATE FOR RESCHEDULE ---
    const [isRescheduling, setIsRescheduling] = React.useState(false);
    const [editDate, setEditDate] = React.useState(null);
    const [editTime, setEditTime] = React.useState(null);
    const [editBedId, setEditBedId] = React.useState(null);
    const [availableBeds, setAvailableBeds] = React.useState([]);

    // --- [NEW] STATE FOR HISTORY (CRM) ---
    const [historyVisible, setHistoryVisible] = React.useState(false);

    // --- LOGIC: COUNTDOWN TIMER ---
    const [timeLeft, setTimeLeft] = React.useState('');
    
    React.useEffect(() => {
        if (!booking) return; // Guard inside effect

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

    if (!booking) return null;

    const openReschedule = async () => {
        setEditDate(dayjs(booking.startTime));
        setEditTime(dayjs(booking.startTime));
        setEditBedId(booking.bedId?._id || (typeof booking.bedId === 'string' ? booking.bedId : null));
        setAvailableBeds([]);
        if (booking.roomId?._id || booking.roomId) {
            const roomId = booking.roomId?._id || booking.roomId;
            try {
                const res = await resourceService.getAllBeds({ roomId });
                if (res.success) setAvailableBeds(res.beds || []);
            } catch (_) {}
        }
        setIsRescheduling(true);
    };

    const handleSaveReschedule = () => {
        if (!editDate && !editTime && editBedId === null) { message.warning('Chưa thay đổi gì'); return; }
        const base = editDate || dayjs(booking.startTime);
        const time = editTime || dayjs(booking.startTime);
        const newStart = base.hour(time.hour()).minute(time.minute()).second(0);
        const duration = booking.serviceId?.duration || 60;
        const newEnd = newStart.add(duration, 'minute');
        const payload = { startTime: newStart.toISOString(), endTime: newEnd.toISOString() };
        if (editBedId !== undefined && editBedId !== null) payload.bedId = editBedId;
        onAction('update', booking._id, payload);
        setIsRescheduling(false);
    };

    const handleAddService = () => {
        // Mock Add Logic for UI Demo
        if (!selectedServiceToAdd) return;
        
        console.log('>>> [DEBUG] Click Add Service:', selectedServiceToAdd); // [DEBUG]
        
        onAction('upsell_save', booking._id, { 
            booking,
            addedService: selectedServiceToAdd 
        });
        setIsEditing(false);
    };

    const statusColor = {
        pending: 'gold',
        confirmed: 'green',
        processing: 'blue', 
        completed: 'green', 
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
            width={450} // Valid valid override
            onClose={onClose}
            open={open} // Correct prop usage
            styles={{ body: { paddingBottom: 16 } }}
            footer={
                <div style={{ display: 'flex', gap: 5 }}>
                    {booking && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <Button danger size="small" style={{ flex: 1, fontSize: 12 }} onClick={() => onAction('cancel', booking._id)}>Hủy</Button>
                    )}
                    {booking && booking.status === 'pending' && (
                        <Button type="primary" size="small" style={{ flex: 1, fontSize: 12 }} onClick={() => onAction('approve', booking._id)}>Duyệt</Button>
                    )}
                    {booking && booking.status === 'confirmed' && (
                        <Button type="primary" size="small" style={{ flex: 1, fontSize: 12, background: theme.colors.primary[500] }} onClick={() => onAction('checkIn', booking._id)}>Check-in</Button>
                    )}
                    {booking && booking.status === 'processing' && (
                        <Button type="primary" size="small" style={{ flex: 1, fontSize: 12, background: '#52c41a', borderColor: '#52c41a' }} onClick={() => onAction('complete', booking._id)}>Thanh Toán</Button>
                    )}
                    {booking && booking.status === 'completed' && (
                        <Button size="small" style={{ flex: 1, fontSize: 12 }} onClick={() => onAction('view_invoice', booking)}>Hóa Đơn</Button>
                    )}
                    {booking && ['pending', 'confirmed'].includes(booking.status) && (
                        <Button size="small" style={{ flex: 1, fontSize: 12 }} onClick={openReschedule} disabled={isRescheduling}>Sửa giờ</Button>
                    )}
                    {booking && ['pending', 'confirmed', 'processing'].includes(booking.status) && (
                        <Button size="small" style={{ flex: 1, fontSize: 12 }} onClick={() => setIsEditing(true)} disabled={isEditing}>+ DV</Button>
                    )}
                </div>
            }
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
                <Descriptions.Item label="Phòng / Giường">
                     {booking.roomId?.name || 'Chưa xếp'}
                     {booking.bedId?.name && <span style={{ color: '#52c41a', marginLeft: 6 }}>— {booking.bedId.name}</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Nhân viên">
                     {booking.staffId?.name || 'Chưa xếp'}
                </Descriptions.Item>
                <Descriptions.Item label="Nguồn">
                     {booking.source === 'manual' ? '🖥️ Tạo thủ công' : booking.source === 'offline' ? '🏪 Tại quầy' : '🌐 Website'}
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
            
            {/* RESCHEDULE FORM */}
            {isRescheduling && (
                <div style={{ marginTop: 20, border: '1px dashed #52c41a', padding: 16, borderRadius: 8, background: '#f6ffed' }}>
                    <Typography.Text strong style={{ color: '#52c41a' }}>Sửa giờ / Đổi giường</Typography.Text>
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <DatePicker
                                value={editDate}
                                onChange={setEditDate}
                                format="DD/MM/YYYY"
                                style={{ flex: 1 }}
                                placeholder="Ngày"
                            />
                            <TimePicker
                                value={editTime}
                                onChange={setEditTime}
                                format="HH:mm"
                                minuteStep={5}
                                style={{ flex: 1 }}
                                placeholder="Giờ"
                            />
                        </div>
                        {availableBeds.length > 1 && (
                            <Select
                                value={editBedId}
                                onChange={setEditBedId}
                                placeholder="Chọn giường khác (tùy chọn)"
                                style={{ width: '100%' }}
                                allowClear
                            >
                                {availableBeds.map(bed => (
                                    <Select.Option key={bed._id} value={bed._id}>
                                        {bed.name}{bed._id === (booking.bedId?._id || booking.bedId) ? ' ★ hiện tại' : ''}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Dịch vụ: {booking.serviceId?.name} — {booking.serviceId?.duration || 60} phút. Hệ thống sẽ kiểm tra xung đột trước khi lưu.
                        </Typography.Text>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button type="primary" onClick={handleSaveReschedule} style={{ flex: 1 }}>Lưu thay đổi</Button>
                            <Button onClick={() => setIsRescheduling(false)}>Hủy</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* [NEW] UPSELL & EDIT FORM - ALLOWED FOR ALL ACTIVE STATES */}
            {isEditing && ['pending', 'confirmed', 'processing'].includes(booking.status) && (
                <div style={{ marginTop: 20, border: '1px dashed #1890ff', padding: 16, borderRadius: 8, background: '#e6f7ff' }}>
                    <Text strong style={{ color: '#1890ff' }}>✏️ Chỉnh Sửa Đơn Hàng</Text>
                    
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        
                        {/* 2. ADD SERVICE (Renamed to clear intent) */}
                        <Text strong>⚡ Thêm Dịch Vụ / Phụ Thu:</Text>
                        <Select 
                            placeholder="Chọn dịch vụ thêm..." 
                            style={{ width: '100%' }}
                            showSearch
                            optionFilterProp="children"
                            onChange={(val) => {
                                // Mock data parsing
                                const [name, price] = val.split('|');
                                setSelectedServiceToAdd({ name, price: parseInt(price), qty: 1 });
                            }}
                        >
                            {(services && services.length > 0) ? services.filter(s => s.type !== 'product').map(s => (
                                <Select.Option key={s._id} value={`${s.name}|${s.price || 0}`}>
                                    {s.name} ({(s.price || 0).toLocaleString()}đ)
                                </Select.Option>
                            )) : (
                                <Select.Option disabled>Đang tải dịch vụ...</Select.Option>
                            )}
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
