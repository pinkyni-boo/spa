import React, { useState, useEffect } from 'react';
import { Layout, Typography, Segmented, Button, message, notification, Modal, Form, Input, DatePicker, Select, ConfigProvider, Badge, Radio, AutoComplete, Tag } from 'antd';
import { AppstoreOutlined, BarsOutlined, PlusOutlined, LeftOutlined, RightOutlined, UnorderedListOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import theme from '../../../theme';

// Services
import { adminBookingService } from '../../../services/adminBookingService';
import { resourceService } from '../../../services/resourceService';
import { branchService } from '../../../services/branchService'; // [NEW]

// Sub Components
import StatsHeader from './StatsHeader';
import BookingListView from './BookingListView';
import BookingDrawer from './BookingDrawer';
import DnDCalendarView from './DnDCalendarView';
import InvoiceModal from '../Payment/InvoiceModal'; // [MOVED]
import WaitlistSidebar from './WaitlistSidebar';
import CustomerInfoSidebar from './CustomerInfoSidebar'; // [NEW]

const { Title } = Typography;
const { Option } = Select;

// Reuse Constants
const SERVICES_LIST = ["Massage Body Thụy Điển", "Chăm sóc da mặt chuyên sâu", "Gội đầu dưỡng sinh"];
const TIME_SLOTS = [];
for (let i = 9; i <= 18; i++) { TIME_SLOTS.push(`${i}:00`); if(i!==18) TIME_SLOTS.push(`${i}:30`); }

const BookingManager = () => {
    // STATE
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
    
    // [NEW] DYNAMIC SIDEBAR STATE
    const [rightSidebarMode, setRightSidebarMode] = useState('waitlist'); // 'waitlist' | 'customer'
    const [viewingCustomer, setViewingCustomer] = useState(null);
    const [customerHistory, setCustomerHistory] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // [NEW] Collapsible sidebar
    // STATE -- (Original state declarations follow below)
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Derived State
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    
    // FILTER STATE
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [filterStaff, setFilterStaff] = useState(null); 
    const [filterPayment, setFilterPayment] = useState(null);
    const [filterBranch, setFilterBranch] = useState(null); // [NEW] Link to Branch
    const [userRole, setUserRole] = useState(null);
    const [managedBranches, setManagedBranches] = useState([]);
    
    const [staffs, setStaffs] = useState([]);
    const [searchResults, setSearchResults] = useState([]); // [FIX] Add missing state for search autocomplete
    const [isModalVisible, setIsModalVisible] = useState(false); // [FIX] Add missing modal state
    const [drawerVisible, setDrawerVisible] = useState(false); // [FIX] Add missing drawer state
    const [waitlist, setWaitlist] = useState([]); // [FIX] Add missing waitlist state
    const [highlightBookingId, setHighlightBookingId] = useState(null); // [FIX] Add missing highlight state
    const [refreshWaitlist, setRefreshWaitlist] = useState(0); // [FIX] Add missing trigger for waitlist refresh
    const [draggedWaitlistItem, setDraggedWaitlistItem] = useState(null); // [FIX] Add missing drag state
    const [selectedBooking, setSelectedBooking] = useState(null); // [FIX] Add missing selected booking state
    
    // [FIX] Add Form instance
    const [form] = Form.useForm();
    
    // [FIX] Add customer options for autocomplete
    const [customerOptions, setCustomerOptions] = useState([]);
    
    // [FIX] Add invoice modal states
    const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState(null);

    useEffect(() => {
        // [AUTH] Load User Role & Branches
        const raw = localStorage.getItem('user');
        if (raw) {
            try {
                const u = JSON.parse(raw);
                setUserRole(u.role);
                
                if (u.role === 'owner') {
                    // Owner sees all branches -> Fetch from API
                    branchService.getAllBranches().then(res => {
                        if (res.success) {
                            setManagedBranches(res.branches || []);
                            // Optional: Default to first branch or All (null)
                        }
                    });
                } else {
                    // Admin sees assigned branches
                    setManagedBranches(u.managedBranches || []);
                    
                     // [AUTO-MAPPING] If Admin manages only 1 branch, force lock it
                    if (u.role === 'admin' && u.managedBranches?.length === 1) {
                        setFilterBranch(u.managedBranches[0]._id || u.managedBranches[0]);
                    } else if (u.role === 'admin' && u.managedBranches?.length > 1) {
                         setFilterBranch(u.managedBranches[0]._id || u.managedBranches[0]);
                    }
                }
            } catch (e) { console.error("Parse user error", e); }
        }
    }, []);

    // [FIX] Add missing fetchData function
    const fetchData = async () => {
        setLoading(true);
        try {
            // [FIX] Remove date filter - load ALL bookings, then filter by tabs
            const params = {
                // date: currentDate.format('YYYY-MM-DD'), // REMOVED - load all bookings
                branchId: filterBranch,
                staffId: filterStaff,
                paymentStatus: filterPayment
            };
            
            console.log('\n========== FRONTEND FETCH DEBUG ==========');
            console.log('Params:', params);
            
            const result = await adminBookingService.getAllBookings(params);
            
            console.log('API Result:', result);
            console.log('Result.success:', result?.success);
            console.log('Result.bookings:', result?.bookings);
            console.log('Bookings count:', result?.bookings?.length);
            
            if (result.success) {
                // [FIX] Transform bookings to calendar event format
                const transformedBookings = (result.bookings || []).map(booking => ({
                    ...booking, // Keep all original fields
                    start: new Date(booking.startTime), // Calendar needs 'start'
                    end: new Date(booking.endTime), // Calendar needs 'end'
                    title: booking.customerName || 'Khách', // Calendar needs 'title'
                    resourceId: booking.roomId?._id || booking.roomId // Calendar needs 'resourceId'
                }));
                setBookings(transformedBookings);
                console.log('State updated with', transformedBookings.length, 'bookings (transformed for calendar)');
            } else {
                console.warn('API returned success=false');
            }
            
            // Fetch staff list
            const staffRes = await resourceService.getAllStaff();
            if (staffRes.success) {
                setStaffs(staffRes.staff || []);
            }
            
            // [FIX] Fetch rooms for calendar view
            const roomsRes = await resourceService.getAllRooms();
            console.log('Rooms response:', roomsRes);
            if (roomsRes.success) {
                // [FIX] Transform rooms to calendar resource format
                const transformedRooms = (roomsRes.rooms || []).map(room => ({
                    ...room, // Keep all original fields
                    id: room._id, // Calendar needs 'id' (not '_id')
                    title: room.name || 'Phòng' // Calendar needs 'title' (not 'name')
                }));
                setRooms(transformedRooms);
                console.log('Loaded', transformedRooms.length, 'rooms (transformed for calendar)');
            } else if (Array.isArray(roomsRes)) {
                const transformedRooms = roomsRes.map(room => ({
                    ...room,
                    id: room._id,
                    title: room.name || 'Phòng'
                }));
                setRooms(transformedRooms);
                console.log('Loaded', transformedRooms.length, 'rooms (array format, transformed)');
            }
            
            console.log('==========================================\n');
        } catch (error) {
            console.error('FETCH ERROR:', error);
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // [FIX] Add missing openCreateModal function
    const openCreateModal = () => {
        setIsModalVisible(true);
    };

    // Fetch data when filters change
    useEffect(() => {
        // Both Admin and Owner can view all branches (filterBranch can be null)
        fetchData();
    }, [currentDate, filterBranch, filterStaff, filterPayment]);

    const handleCreateSubmit = async (values) => {
        // Logic create giống cũ
         const data = {
             customerName: values.customerName,
             phone: values.phone,
             serviceName: values.serviceName,
             date: values.date.format('YYYY-MM-DD'),
             time: values.time,
             branchId: filterBranch // [NEW] Pass selected branch
         };
         
         if (!filterBranch) {
             message.error("Vui lòng chọn chi nhánh trước khi tạo đơn!");
             return;
         }

         await adminBookingService.createBooking(data);
         message.success("Tạo đơn thành công");
         setIsModalVisible(false);
         fetchData();
    };

    // [FIX] Add missing search select handler
    const handleSearchSelect = (value, option) => {
        // When user selects a search result, open the booking in edit mode
        const booking = option.booking;
        if (booking) {
            setSelectedBooking(booking);
            setIsEditing(true);
        }
    };

    // [FIX] Add missing view change handler
    const handleViewChange = (mode) => {
        setViewMode(mode);
    };

    // [FIX] Add missing approve handler
    const handleApprove = async (bookingId) => {
        try {
            const result = await adminBookingService.approveBooking(bookingId);
            if (result.success) {
                message.success('Đã duyệt đơn');
                await fetchData(); // Refresh to show updated booking
            } else {
                message.error(result.message || 'Không thể duyệt đơn');
            }
        } catch (error) {
            message.error('Không thể duyệt đơn');
        }
    };

    // [FIX] Add missing action handler
    const handleAction = async (action, bookingId, data) => {
        try {
            let result;
            switch(action) {
                case 'checkIn':
                    result = await adminBookingService.checkIn(bookingId);
                    if (result.success) message.success('Check-in thành công');
                    break;
                case 'complete':
                    result = await adminBookingService.completeBooking(bookingId);
                    if (result.success) message.success('Hoàn thành');
                    break;
                case 'cancel':
                    result = await adminBookingService.cancelBooking(bookingId);
                    if (result.success) message.success('Đã hủy');
                    break;
                case 'update':
                    result = await adminBookingService.updateBooking(bookingId, data);
                    if (result.success) message.success('Đã cập nhật');
                    break;
                default:
                    break;
            }
            
            // Only refresh if action was successful
            if (result && result.success) {
                setDrawerVisible(false);
                await fetchData(); // Refresh bookings list
            } else if (result && !result.success) {
                message.error(result.message || 'Thao tác thất bại');
            }
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    // [FIX] Add missing calendar drag handlers
    const handleEventDrop = async ({ event, start, end, resourceId }) => {
        try {
            await adminBookingService.updateBooking(event._id, {
                startTime: start,
                endTime: end,
                roomId: resourceId
            });
            message.success('Đã chuyển lịch');
            fetchData();
        } catch (error) {
            message.error('Không thể chuyển lịch');
        }
    };

    const handleEventResize = async ({ event, start, end }) => {
        try {
            await adminBookingService.updateBooking(event._id, {
                startTime: start,
                endTime: end
            });
            message.success('Đã thay đổi thời gian');
            fetchData();
        } catch (error) {
            message.error('Không thể thay đổi thời gian');
        }
    };

    const handleWaitlistDrop = async ({ start, resourceId, draggedEvent }) => {
        // Convert waitlist item to booking
        try {
            const waitlistItem = draggedEvent;
            await adminBookingService.createBooking({
                customerName: waitlistItem.customerName,
                phone: waitlistItem.phone,
                serviceName: waitlistItem.serviceName,
                date: dayjs(start).format('YYYY-MM-DD'),
                time: dayjs(start).format('HH:mm'),
                branchId: filterBranch,
                roomId: resourceId
            });
            message.success('Đã chuyển từ waitlist');
            fetchData();
        } catch (error) {
            message.error('Không thể tạo booking');
        }
    };

    // [FIX] Add missing invoice submit handler
    const handleInvoiceSubmit = async (invoiceData) => {
        try {
            // Process payment and complete booking
            await adminBookingService.processPayment(selectedBooking._id, invoiceData);
            message.success('Thanh toán thành công');
            setSelectedBooking(null);
            fetchData();
        } catch (error) {
            message.error('Thanh toán thất bại');
        }
    };


    // ... (rest of handlers)

    return (
        <ConfigProvider theme={{ token: { fontFamily: theme.fonts.body, colorPrimary: theme.colors.primary[500] } }}>
            <div style={{ padding: '16px', height: '100vh', background: '#f0f2f5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* HEADER - TRANSPARENT & CLEAN */}
                <div style={{ 
                    marginTop: 8,
                    marginBottom: 16,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexShrink: 0
                }}>
                    <div>
                         {/* Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Title level={3} style={{ margin: 0, fontFamily: theme.fonts.heading, color: '#1f1f1f' }}>Quản Lý Đặt Lịch</Title>
                            <Tag color="cyan" style={{ borderRadius: 12 }}>Admin Portal</Tag>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                         
                         {/* [NEW] BRANCH SELECTOR */}
                         {(userRole === 'owner' || (userRole === 'admin' && managedBranches.length > 1)) && (
                             <Select
                                placeholder="🏢 Chọn Chi Nhánh"
                                style={{ width: 220, border: '1px solid #D4Af37', borderRadius: 8 }}
                                value={filterBranch}
                                onChange={setFilterBranch}
                                options={managedBranches.map(b => ({ 
                                    value: b._id || b, 
                                    label: b.name || `Chi nhánh ${b._id || b}` 
                                }))}
                            />
                         )}

                         {/* [NEW] ADVANCED FILTERS */}
                         <Select
                            placeholder="👤 Lọc Nhân Viên"
                            allowClear
                            style={{ width: 160 }}
                            onChange={setFilterStaff}
                            options={staffs.map(s => ({ value: s._id, label: s.name }))}
                        />

                        {/* [REMOVED Payment Filter as per user request] */}

                         <AutoComplete
                            style={{ width: 280, background: 'white', borderRadius: 8 }}
                            allowClear
                            filterOption={false} // [FIX] Disable local filter (server-side search)
                            placeholder="🔍 Tìm nhanh..."
                            options={searchResults.map(b => ({
                                // [FIX] Value MUST be unique. Appending time prevents duplicates & React Crash.
                                value: `${b.customerName} - ${dayjs(b.startTime).format('DD/MM HH:mm')}`, 
                                label: (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{b.customerName}</strong>
                                        <span style={{ fontSize: 12, color: '#888' }}>{dayjs(b.startTime).format('DD/MM HH:mm')}</span>
                                    </div>
                                ),
                                booking: b 
                            }))}
                            onSelect={handleSearchSelect}
                            onSearch={(val) => {
                                // Add search logic that was missing
                                if (val.length >= 1) { // [FIX] Search immediately from 1 char
                                    adminBookingService.searchBookings(val).then(res => {
                                        if (res && (res.success || Array.isArray(res))) {
                                            // Handle both API response structures
                                            const results = Array.isArray(res) ? res : (res.bookings || res.data); // [FIX] Access correct property
                                            setSearchResults(results || []);
                                        }
                                    });
                                }
                            }}
                        />

                        {/* CUSTOM GOLD TOGGLE - MATCHING SCREENSHOT */}
                        <div style={{ 
                            display: 'flex', 
                            background: 'white', 
                            borderRadius: 8, 
                            border: '1px solid #d9d9d9', 
                            // overflow: 'hidden', // REMOVED to allow badge overlap
                            height: 40,
                            position: 'relative' // Ensure stacking context
                        }}>
                            <div 
                                onClick={() => handleViewChange('calendar')}
                                style={{ 
                                    width: 60, 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    background: viewMode === 'calendar' ? '#D4Af37' : 'white', 
                                    color: viewMode === 'calendar' ? 'white' : 'black',
                                    transition: 'all 0.3s',
                                    borderTopLeftRadius: 7,
                                    borderBottomLeftRadius: 7
                                }}
                            >
                                <AppstoreOutlined style={{ fontSize: 20 }} />
                            </div>
                            <div style={{ width: 1, background: '#f0f0f0' }}></div>
                            <div 
                                onClick={() => handleViewChange('list')}
                                style={{ 
                                    width: 60, 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    background: viewMode === 'list' ? '#D4Af37' : 'white',
                                    color: viewMode === 'list' ? 'white' : 'black',
                                    position: 'relative',
                                    transition: 'all 0.3s',
                                    borderTopRightRadius: 7,
                                    borderBottomRightRadius: 7
                                }}
                            >
                                <BarsOutlined style={{ fontSize: 20 }} />
                                {pendingCount > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -10, // Moved up
                                        right: -10, // Moved right outside
                                        background: '#ff4d4f',
                                        color: 'white',
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                        height: 20,
                                        minWidth: 20,
                                        borderRadius: 10,
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        padding: '0 4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        zIndex: 100
                                    }}>
                                        {pendingCount}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={openCreateModal}
                            style={{ 
                                height: 40, 
                                background: '#D4Af37', // Gold 
                                borderColor: '#D4Af37',
                                width: 100,
                                fontSize: 15,
                                fontWeight: 500
                            }}
                        >
                            Tạo Đơn
                        </Button>
                    </div>
                </div>

                {/* STATS HEADER */}
                <div style={{ marginBottom: 12, flexShrink: 0 }}>
                    <StatsHeader bookings={bookings} />
                </div>

                {/* MAIN CONTENT AREA - FULL HEIGHT & WIDTH */}
                <div style={{ flex: 1, display: 'flex', gap: 16, minHeight: 0 }}>
                    
                    {/* LEFT: CALENDAR (Flexible, Full Width) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
                        {viewMode === 'calendar' ? (
                            <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                                <DnDCalendarView 
                                    events={bookings} 
                                    resources={rooms}
                                    date={currentDate.toDate()}
                                    onNavigate={(d) => setCurrentDate(dayjs(d))}
                                    onEventDrop={handleEventDrop}
                                    onEventResize={handleEventResize}
                                    highlightBookingId={highlightBookingId} 
                                    onSelectEvent={(event) => {
                                        setSelectedBooking(event);
                                        setDrawerVisible(true);
                                    }}
                                    onSelectSlot={(slotInfo) => {
                                         // Quick create on click logic if needed
                                    }}
                                    onDropFromOutside={handleWaitlistDrop} // [NEW]
                                />
                            </div>
                        ) : (
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <BookingListView 
                                    bookings={bookings}
                                    loading={loading}
                                    filterDate={currentDate}
                                    setFilterDate={setCurrentDate}
                                    onCreate={openCreateModal}
                                    onApprove={handleApprove}
                                    onEdit={(record) => {
                                        setSelectedBooking(record);
                                        setDrawerVisible(true); 
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: DYNAMIC SIDEBAR (Collapsible) - Always visible */}
                    <div style={{ 
                        position: 'relative',
                        width: sidebarCollapsed ? 60 : 270, // [FIX] Force layout shift
                        transition: 'width 0.3s ease-in-out',
                        flexShrink: 0 // Prevent sidebar form shrinking
                    }}>
                        {/* Floating Badge (outside sidebar) */}
                        {sidebarCollapsed && waitlist.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                background: '#ff4d4f',
                                color: 'white',
                                fontSize: 10,
                                fontWeight: 'bold',
                                height: 18,
                                minWidth: 18,
                                borderRadius: 9,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '0 4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                zIndex: 100
                            }}>
                                {waitlist.length}
                            </div>
                        )}

                        {sidebarCollapsed ? (
                            // Collapsed: Show as compact button
                            <Button
                                type="primary"
                                icon={<UnorderedListOutlined />}
                                onClick={() => setSidebarCollapsed(false)}
                                style={{
                                    height: 40,
                                    width: 50,
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                    fontWeight: 500,
                                    padding: 0
                                }}
                            >
                                
                            </Button>
                        ) : (
                            // Expanded: Show full sidebar
                            <div 
                                style={{ 
                                    width: 260,
                                    background: 'white', 
                                    borderRadius: 12, 
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    height: '100%',
                                    flexShrink: 0,
                                    border: '1px solid #f0f0f0',
                                    position: 'relative',
                                    transition: 'all 0.3s ease-in-out',
                                    overflow: 'hidden'
                                }}
                            >
                                {rightSidebarMode === 'waitlist' ? (
                                    <WaitlistSidebar 
                                       waitlist={waitlist}
                                       setWaitlist={setWaitlist}
                                       refreshTrigger={refreshWaitlist}
                                       onDragStart={(item) => setDraggedWaitlistItem(item)}
                                       onCollapse={() => setSidebarCollapsed(true)}
                                    />
                                ) : (
                                    <CustomerInfoSidebar 
                                       customer={viewingCustomer}
                                       history={customerHistory}
                                       onClose={() => setRightSidebarMode('waitlist')}
                                       onSelectHistory={(booking) => {
                                           setCurrentDate(dayjs(booking.startTime));
                                           setHighlightBookingId(booking._id);
                                           setTimeout(() => setHighlightBookingId(null), 3000);
                                       }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* DRAWER (DETAILS) */}
                <BookingDrawer 
                    open={drawerVisible} // visible is deprecated too, use open
                    width={720} // width is fine in newer antd if not using 'size', but 'visible' -> 'open' is crucial
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
