import React, { useState, useEffect } from 'react';
import { Layout, Typography, Segmented, Button, message, Modal, Form, Input, DatePicker, Select, ConfigProvider } from 'antd';
import { AppstoreOutlined, BarsOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import theme from '../../../theme';

// Services
import { adminBookingService } from '../../../services/adminBookingService';
import { resourceService } from '../../../services/resourceService';

// Sub Components
import StatsHeader from './StatsHeader';
import BookingListView from './BookingListView';
import BookingDrawer from './BookingDrawer';
import DnDCalendarView from './DnDCalendarView';

const { Title } = Typography;
const { Option } = Select;

// Reuse Constants
const SERVICES_LIST = ["Massage Body Thụy Điển", "Chăm sóc da mặt chuyên sâu", "Gội đầu dưỡng sinh"];
const TIME_SLOTS = [];
for (let i = 9; i <= 18; i++) { TIME_SLOTS.push(`${i}:00`); if(i!==18) TIME_SLOTS.push(`${i}:30`); }

const BookingManager = () => {
    // STATE
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // FILTER STATE (For List/Calendar)
    const [currentDate, setCurrentDate] = useState(dayjs());
    
    // DRAWER STATE
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // MODAL STATE (Create/Manual Edit)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // 1. INIT DATA
    const fetchData = async () => {
        setLoading(true);
        try {
            // A. Get Bookings (All for now, or filtered by month if optimize)
            // For simplicity: Fetch all so Scheduler looks full
            const bookingData = await adminBookingService.getAllBookings();
            
            // Map for Calendar (BigCalendar needs specific keys)
            const mappedBookings = bookingData.map(b => ({
                ...b,
                id: b._id,
                title: `${b.customerName} (${b.serviceId?.name || 'dv'})`,
                start: new Date(b.startTime),
                end: new Date(b.endTime),
                resourceId: b.roomId?._id || 'unknown',
            }));
            setBookings(mappedBookings);

            // B. Get Rooms (For Calendar Resources)
            const roomRes = await resourceService.getAllRooms();
            if (roomRes?.success) {
                 setRooms(roomRes.rooms.map(r => ({ id: r._id, title: r.name })));
            }
        } catch (error) {
            message.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. HANDLERS
    
    // A. Toggle View
    const handleViewChange = (value) => setViewMode(value);

    // B. Actions (Checkin, Cancel, Pay)
    const handleAction = async (action, booking) => {
        try {
            if (action === 'cancel') {
                if (!window.confirm('Hủy đơn này?')) return;
                await adminBookingService.cancelBooking(booking._id);
            } 
            else if (action === 'approve') {
                await adminBookingService.updateBooking(booking._id, { status: 'confirmed' });
            }
            else if (action === 'checkin') {
                await adminBookingService.updateBooking(booking._id, { status: 'completed' });
            }
            
            message.success('Thành công!');
            setDrawerVisible(false);
            fetchData(); // Reload data
        } catch (error) {
            message.error('Lỗi thao tác!');
        }
    };

    // C. Drag & Drop Handlers (From Phase 3)
    const handleEventDrop = async ({ event, start, end, resourceId }) => {
        // Optimistic UI here if needed, or just call API
         try {
            await adminBookingService.updateBooking(event.id, { startTime: start, endTime: end, roomId: resourceId });
            message.success("Đã đổi lịch!");
            fetchData();
         } catch(e) { message.error("Lỗi đổi lịch"); }
    };
    
    const handleEventResize = async ({ event, start, end }) => {
         try {
            await adminBookingService.updateBooking(event.id, { startTime: start, endTime: end });
            message.success("Đã gia hạn!");
            fetchData();
         } catch(e) { message.error("Lỗi đổi giờ"); }
    };

    // D. Create New (Open Modal)
    const openCreateModal = () => {
        setSelectedBooking(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleCreateSubmit = async (values) => {
        // Logic create giống cũ
         const data = {
             customerName: values.customerName,
             phone: values.phone,
             serviceName: values.serviceName,
             date: values.date.format('YYYY-MM-DD'),
             time: values.time
         };
         await adminBookingService.createBooking(data);
         message.success("Tạo đơn thành công");
         setIsModalVisible(false);
         fetchData();
    };

    return (
        <ConfigProvider theme={{ token: { fontFamily: theme.fonts.body, colorPrimary: theme.colors.primary[500] } }}>
            <div style={{ padding: '24px', minHeight: '100vh', background: '#F8F9FA' }}>
                
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0, fontFamily: theme.fonts.heading }}>Quản Lý Đặt Lịch</Title>
                        <Typography.Text type="secondary">Trung tâm điều hành Spa</Typography.Text>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12 }}>
                        {/* VIEW TOGGLE */}
                        <Segmented
                            options={[
                                { label: 'Lịch Biểu', value: 'calendar', icon: <AppstoreOutlined /> },
                                { label: 'Danh Sách', value: 'list', icon: <BarsOutlined /> },
                            ]}
                            value={viewMode}
                            onChange={handleViewChange}
                            size="large"
                        />
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreateModal}>
                            Tạo Đơn
                        </Button>
                    </div>
                </div>

                {/* STATS */}
                <StatsHeader bookings={bookings} />

                {/* MAIN CONTENT AREA */}
                {viewMode === 'calendar' ? (
                    <DnDCalendarView 
                        bookings={bookings} 
                        rooms={rooms}
                        date={currentDate.toDate()}
                        onNavigate={(d) => setCurrentDate(dayjs(d))}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                        onSelectEvent={(event) => {
                            setSelectedBooking(event);
                            setDrawerVisible(true);
                        }}
                    />
                ) : (
                    <BookingListView 
                        bookings={bookings}
                        loading={loading}
                        filterDate={currentDate}
                        setFilterDate={setCurrentDate}
                        onCreate={openCreateModal}
                        onEdit={(record) => {
                            setSelectedBooking(record);
                            setDrawerVisible(true); // Open Drawer instead of old modal
                        }}
                    />
                )}

                {/* DRAWER (DETAILS) */}
                <BookingDrawer 
                    visible={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                    booking={selectedBooking}
                    onAction={handleAction}
                />

                {/* MODAL (CREATE ONLY) */}
                <Modal 
                    title="Tạo Đơn Mới" 
                    open={isModalVisible} 
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                     <Form form={form} onFinish={handleCreateSubmit} layout="vertical">
                        {/* ... Reuse fields from old BookingManager ... */}
                        <Form.Item label="SĐT" name="phone"><Input /></Form.Item>
                        <Form.Item label="Tên" name="customerName"><Input /></Form.Item>
                        <Form.Item label="Dịch vụ" name="serviceName">
                             <Select>{SERVICES_LIST.map(s=><Option key={s} value={s}>{s}</Option>)}</Select>
                        </Form.Item>
                        <Form.Item label="Ngày" name="date"><DatePicker style={{width:'100%'}}/></Form.Item>
                        <Form.Item label="Giờ" name="time">
                             <Select>{TIME_SLOTS.map(t=><Option key={t} value={t}>{t}</Option>)}</Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block>TẠO</Button>
                     </Form>
                </Modal>

            </div>
        </ConfigProvider>
    );
};

export default BookingManager;
