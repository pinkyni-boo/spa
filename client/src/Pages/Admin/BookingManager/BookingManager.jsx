import React, { useState, useEffect } from 'react';
import { Layout, Typography, Segmented, Button, message, Modal, Form, Input, DatePicker, Select, ConfigProvider, Badge, Radio, AutoComplete, Tag } from 'antd'; // Added AutoComplete, Tag
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
import InvoiceModal from './InvoiceModal'; // [NEW]

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
    
    // Derived State
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    
    // FILTER STATE
    const [currentDate, setCurrentDate] = useState(dayjs());
    
    // DRAWER STATE
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // MODAL STATE (Create)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    
    // [NEW] INVOICE MODAL STATE
    const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState(null);

    // [NEW] CRM STATE
    const [customerOptions, setCustomerOptions] = useState([]);

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
                // [PHASE 4] Call Check-in API
                const res = await adminBookingService.checkIn(booking._id);
                if (!res.success) throw new Error(res.message);
                message.success('Check-in thành công!');
            }
            else if (action === 'checkout') {
                // [PHASE 4] Open Invoice Modal
                setViewingInvoice(null);
                setIsInvoiceVisible(true);
            }
            else if (action === 'upsell_save') {
                const { booking: targetBooking, addedService } = booking; // 'booking' arg here contains payload from drawer
                
                // 1. Calculate New EndTime (Mock 30 mins for demo)
                // Real logic: Fetch service duration from DB or Service List
                const additionalTime = 30; 
                const currentEnd = dayjs(targetBooking.endTime);
                const newEndTime = currentEnd.add(additionalTime, 'minute').toDate();

                // 2. Prepare Payload
                const currentServices = targetBooking.servicesDone || [];
                const updatedServices = [...currentServices, addedService];

                // 3. Call API
                const res = await adminBookingService.updateServices(targetBooking._id, {
                    servicesDone: updatedServices,
                    newEndTime: newEndTime
                });

                if (res.success) {
                    message.success(`Đã thêm: ${addedService.name}`);
                } else {
                    // Handle Conflict
                    if (res.conflictDetails) {
                        message.warning("⚠️ XUNG ĐỘT LỊCH: Không thể thêm giờ vì vướng khách sau!");
                    } else {
                        message.error(res.message || "Lỗi thêm dịch vụ");
                    }
                }
            }
            else if (action === 'view_invoice') {
                // VIEW Mode: Fetch existing
                const res = await adminBookingService.getInvoices({ bookingId: booking._id });
                if (res.success && res.invoices && res.invoices.length > 0) {
                    setViewingInvoice(res.invoices[0]); // Take the latest one
                    setIsInvoiceVisible(true);
                } else {
                    message.warning("Đơn hàng này chưa có hóa đơn (hoặc dữ liệu cũ).");
                }
                return; // Stop here, dont close drawer yet or maybe close it
            }
            
            // For view_invoice, we might want to keep the flow? 
            if (action !== 'view_invoice') {
                setDrawerVisible(false);
                fetchData(); 
            }
        } catch (error) {
            message.error(error.message || 'Lỗi thao tác!');
        }
    };

    // C. Drag & Drop Handlers (From Phase 3)
    const handleEventDrop = async ({ event, start, end, resourceId }) => {
        // 🛑 CHỐT CHẶN: Nếu đang làm hoặc đã xong -> CẤM KÉO
        if (event.status === 'processing' || event.status === 'completed') {
            message.warning("Đơn hàng đang thực hiện hoặc đã xong, không thể di chuyển!");
            return; // Dừng ngay lập tức
        }

        // Optimistic UI here if needed, or just call API
         try {
            await adminBookingService.updateBooking(event.id, { startTime: start, endTime: end, roomId: resourceId });
            message.success("Đã đổi lịch!");
            fetchData();
         } catch(e) { message.error("Lỗi đổi lịch"); }
    };
    
    const handleEventResize = async ({ event, start, end }) => {
        // 🛑 CHỐT CHẶN
        if (event.status === 'processing' || event.status === 'completed') {
            message.warning("Đơn hàng đang thực hiện hoặc đã xong, không thể thay đổi thời gian!");
            return; 
        }

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

    const handleInvoiceSubmit = async (invoiceData) => {
        try {
            const res = await adminBookingService.createInvoice(invoiceData);
            if (res.success) {
                message.success('Thanh toán thành công! Hóa đơn đã được tạo.');
                setIsInvoiceVisible(false);
                setDrawerVisible(false);
                fetchData();
            } else {
                message.error(res.message || 'Lỗi thanh toán');
            }
        } catch (error) {
            message.error('Lỗi hệ thống');
        }
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

                        <Radio.Group 
                            value={viewMode} 
                            onChange={(e) => handleViewChange(e.target.value)} 
                            buttonStyle="solid"
                            size="large"
                        >
                            <Radio.Button value="calendar" style={{ padding: '0 24px' }}>
                                <AppstoreOutlined style={{ marginRight: 8 }} />
                                Lịch Biểu
                            </Radio.Button>
                            <Radio.Button value="list" style={{ padding: '0 24px', position: 'relative' }}>
                                <BarsOutlined style={{ marginRight: 8 }} />
                                Danh Sách
                                {pendingCount > 0 && (
                                     <span style={{ 
                                        position: 'absolute',
                                        top: -5,
                                        right: -5,
                                        backgroundColor: '#ff4d4f', 
                                        color: '#fff', 
                                        padding: '0 6px', 
                                        borderRadius: '4px', 
                                        fontSize: '10px', 
                                        fontWeight: 'bold',
                                        lineHeight: '16px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                        zIndex: 1
                                     }}>
                                        {pendingCount}
                                     </span>
                                )}
                            </Radio.Button>
                        </Radio.Group>
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
                    wrapClassName="booking-create-modal"
                >
                    {/* Brute Force CSS Injection to fix invisible text */}
                    <style>{`
                        .booking-create-modal .ant-input, 
                        .booking-create-modal .ant-select-selection-item,
                        .booking-create-modal .ant-select-selector,
                        .booking-create-modal input {
                            color: #000000 !important; /* Force Black Text */
                            background-color: #ffffff !important;
                        }
                        .booking-create-modal .ant-select-arrow {
                            color: #000000 !important;
                        }
                    `}</style>
                    
                     <Form form={form} onFinish={handleCreateSubmit} layout="vertical">
                        {/* CUSTOMER SEARCH (CRM) */}
                        <Form.Item label="SĐT" name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                            <AutoComplete
                                placeholder="Nhập SĐT để tìm khách quen..."
                                onSearch={async (value) => {
                                    if (value.length > 2) {
                                        const res = await adminBookingService.searchCustomers(value);
                                        if (res.success) {
                                            setCustomerOptions(res.customers.map(c => ({
                                                value: c.phone,
                                                label: (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>
                                                            <strong>{c.name}</strong> 
                                                            {c.totalVisits > 5 && <Tag color="gold" style={{marginLeft: 5}}>VIP</Tag>}
                                                        </span>
                                                        <span style={{ color: '#888' }}>{c.phone}</span>
                                                    </div>
                                                ),
                                                customer: c // Keep full obj
                                            })));
                                        }
                                    }
                                }}
                                onSelect={(value, option) => {
                                    // Autofill
                                    form.setFieldsValue({ customerName: option.customer.name });
                                    message.success(`Đã chọn: ${option.customer.name} (${option.customer.totalVisits} lần ghé)`);
                                }}
                                options={customerOptions}
                            />
                        </Form.Item>

                        <Form.Item label="Tên" name="customerName" rules={[{ required: true }]}>
                            <Input /> 
                        </Form.Item>
                        
                        <Form.Item label="Dịch vụ" name="serviceName" rules={[{ required: true }]}>
                             <Select>{SERVICES_LIST.map(s=><Option key={s} value={s}>{s}</Option>)}</Select>
                        </Form.Item>
                        <Form.Item label="Ngày" name="date" rules={[{ required: true }]}><DatePicker style={{width:'100%'}}/></Form.Item>
                        <Form.Item label="Giờ" name="time" rules={[{ required: true }]}>
                             <Select>{TIME_SLOTS.map(t=><Option key={t} value={t}>{t}</Option>)}</Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block>TẠO</Button>
                     </Form>
                </Modal>

                {/* [NEW] INVOICE MODAL */}
                <InvoiceModal
                    visible={isInvoiceVisible}
                    onClose={() => {
                        setIsInvoiceVisible(false);
                        setViewingInvoice(null);
                    }}
                    booking={selectedBooking}
                    invoice={viewingInvoice} // Pass viewed invoice
                    onSubmit={handleInvoiceSubmit}
                />

            </div>
        </ConfigProvider>
    );
};

export default BookingManager;
