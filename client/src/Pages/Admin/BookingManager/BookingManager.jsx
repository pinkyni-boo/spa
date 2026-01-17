import React, { useState, useEffect } from 'react';
import { Layout, Typography, Segmented, Button, message, notification, Modal, Form, Input, DatePicker, Select, ConfigProvider, Badge, Radio, AutoComplete, Tag } from 'antd';
import { AppstoreOutlined, BarsOutlined, PlusOutlined, LeftOutlined, RightOutlined, UnorderedListOutlined } from '@ant-design/icons';
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
    const [filterStaff, setFilterStaff] = useState(null); // [NEW]
    const [filterPayment, setFilterPayment] = useState(null); // [NEW]
    const [staffs, setStaffs] = useState([]); // [NEW]

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

    // [NEW] WAITLIST STATE
    const [waitlist, setWaitlist] = useState([]);
    const [draggedWaitlistItem, setDraggedWaitlistItem] = useState(null);
    const [refreshWaitlist, setRefreshWaitlist] = useState(0);

    // [NEW] SYNC SEARCH STATE
    const [highlightBookingId, setHighlightBookingId] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    // 1. INIT DATA
    const fetchData = async () => {
        setLoading(true);
        try {
            // A. Get Bookings with Filters
            const resData = await adminBookingService.getAllBookings({
                staffId: filterStaff
                // paymentStatus removed
            });
            
            // [FIX] Ensure it is array
            const bookingData = Array.isArray(resData) ? resData : (resData.data || []); 

            // Map for Calendar (BigCalendar needs specific keys)
            const mappedBookings = bookingData
                .map(b => ({
                    ...b,
                    id: b._id,
                    title: `${b.customerName} (${b.serviceId?.name || 'dv'})`,
                    start: new Date(b.startTime),
                    end: new Date(b.endTime),
                    resourceId: b.roomId?._id || 'unknown',
                    // Add payment status for styling later
                    paymentStatus: b.paymentStatus || 'unpaid' 
                }))
                .filter(b => !isNaN(b.start.getTime()) && !isNaN(b.end.getTime()));

            setBookings(mappedBookings);

            // B. Get Rooms (For Calendar Resources)
            const roomRes = await resourceService.getAllRooms();
            if (roomRes?.success) {
                 const dbRooms = roomRes.rooms.map(r => ({ id: r._id, title: r.name }));
                 // [FIX] Add 'Unassigned' resource for web bookings or manual bookings without room
                 setRooms([
                    { id: 'unknown', title: '❓ Chưa xếp phòng' },
                    ...dbRooms
                 ]);
            }
            
            // C. Get Staffs (For Filter)
            const staffRes = await resourceService.getAllStaff();
            if (staffRes?.success) {
                setStaffs(staffRes.staff || staffRes.data || []); // [FIX] Handle 'staff' key
            }

        } catch (error) {
            message.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [filterStaff, filterPayment, refreshWaitlist]); // Trigger fetch when filters change

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
                
                // [SMART ALERT] Check for matching waitlist items
                try {
                    console.log('🔍 [SMART ALERT] Checking waitlist for:', {
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        serviceName: booking.serviceId?.name || booking.serviceName || 'dv'
                    });

                    const matchResult = await adminBookingService.findMatchingWaitlist(
                        booking.startTime,
                        booking.endTime,
                        booking.serviceId?.name || booking.serviceName || 'dv'
                    );
                    
                    console.log('📊 [SMART ALERT] API Response:', matchResult);
                    
                    if (matchResult.success && matchResult.matches && matchResult.matches.length > 0) {
                        console.log('🎉 [SMART ALERT] Found matches! Showing notification...');
                        
                        // Show notification
                        notification.success({
                            message: `🎉 ${matchResult.message}`,
                            description: (
                                <div style={{ marginTop: 8 }}>
                                    {matchResult.matches.map((m, idx) => (
                                        <div key={idx} style={{ marginBottom: 4 }}>
                                            • <b>{m.waitlistItem.customerName}</b> - {m.waitlistItem.phone}
                                            {m.waitlistItem.preferredTime && 
                                                <span style={{color: '#faad14', marginLeft: 4}}>
                                                    (Mong: {m.waitlistItem.preferredTime})
                                                </span>
                                            }
                                        </div>
                                    ))}
                                </div>
                            ),
                            duration: 10,
                            placement: 'topRight' // Easier to see
                        });
                        
                        // Auto-expand sidebar
                        setSidebarCollapsed(false);
                        setRightSidebarMode('waitlist');
                    } else {
                        console.log('ℹ️ [SMART ALERT] No matches found');
                    }
                } catch (error) {
                    console.error('❌ [SMART ALERT] Error:', error);
                }
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
            const updates = { startTime: start, endTime: end, roomId: resourceId };
            // [REMOVED] Auto-approve logic - only auto-approve from Waitlist
            
            await adminBookingService.updateBooking(event.id, updates);
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


    // [NEW] SEARCH HANDLER
    const handleSearchSelect = async (value, option) => {
        const b = option.booking;
        console.log('[SEARCH] Selected booking:', b);
        
        if (!b) return;

        // 1. Highlight on Calendar (Existing)
        if (b.startTime) {
             setFilterStaff(null);
             setFilterPayment(null);
             setCurrentDate(dayjs(b.startTime));
             setHighlightBookingId(b._id);
             setTimeout(() => setHighlightBookingId(null), 3000);
        }

        // 2. Fetch Customer Details (NEW - CRM)
        const phoneToSearch = b.phone; 
        console.log('[SEARCH] Phone to search:', phoneToSearch);
        
        if (phoneToSearch) {
             setViewingCustomer({
                 name: b.customerName,
                 phone: b.phone
             });
             
             // Fetch History
             try {
                 console.log('[SEARCH] Calling getCustomerHistory with:', phoneToSearch);
                 const history = await adminBookingService.getCustomerHistory(phoneToSearch);
                 console.log('[SEARCH] History received:', history);
                 setCustomerHistory(history);
                 setRightSidebarMode('customer'); // SWITCH SIDEBAR
             } catch (e) {
                 console.error('[SEARCH] Error:', e);
                 message.error("Lỗi tải lịch sử khách hàng");
             }
        } else {
            console.warn('[SEARCH] No phone number found in booking:', b);
        }
    };

    // [NEW] QUICK APPROVE HANDLER
    const handleApprove = async (booking) => {
        try {
            // Approve booking directly
            const result = await adminBookingService.updateBooking(booking._id, {
                status: 'confirmed'
            });

            if (result.success) {
                message.success(`✅ Đã duyệt đơn cho ${booking.customerName}`);
                fetchData(); // Refresh list
            } else {
                // Backend will return error if conflict exists
                message.error({
                    content: `⚠️ ${result.message || 'Không thể duyệt đơn này'}`,
                    duration: 5
                });
            }
        } catch (error) {
            console.error('[APPROVE] Error:', error);
            message.error('Lỗi hệ thống khi duyệt đơn');
        }
    };

    // E. Waitlist Drop Handler
    const handleWaitlistDrop = async ({ start, end, resourceId }) => {
        console.log('[DROP] Received:', { start, end, resourceId, draggedWaitlistItem });
        
        if (!draggedWaitlistItem) {
            console.error('[DROP] No dragged item!');
            message.error('Lỗi: Không nhận được thông tin khách hàng');
            return;
        }

        try {
            // Create a new Booking from Waitlist Item
            const data = {
                customerName: draggedWaitlistItem.customerName,
                phone: draggedWaitlistItem.phone,
                serviceName: draggedWaitlistItem.serviceName,
                date: dayjs(start).format('YYYY-MM-DD'),
                time: dayjs(start).format('HH:mm'),
                roomId: resourceId,
                status: 'confirmed', // [AUTO-APPROVE]
                source: 'offline'
            };

            console.log('[DROP] Creating booking with data:', data);
            const result = await adminBookingService.createBooking(data);
            console.log('[DROP] Result:', result);
            
            if (result.success) {
                // Remove from Waitlist
                await adminBookingService.deleteWaitlist(draggedWaitlistItem._id);

                message.success(`Đã xếp lịch cho ${draggedWaitlistItem.customerName}`);
                setDraggedWaitlistItem(null);
                
                // Debounce to prevent duplicate fetches
                setTimeout(() => {
                    fetchData();
                    setRefreshWaitlist(prev => !prev);
                }, 300);
            } else {
                message.error(result.message || 'Lỗi xếp lịch');
            }
        } catch (error) {
            console.error('[DROP] Error:', error);
            message.error(error.message || "Lỗi xếp lịch waitlist");
        }
    };

    // F. Create New (Open Modal)
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

    // [NEW] WAITLIST DROP HANDLER (Separated)
    const handleDropFromWaitlist = async ({ start, end, allDay }) => {
        try {
            if (!draggedWaitlistItem) return;

            const droppedTime = dayjs(start).format('HH:mm');
            
            if (window.confirm(`Xếp lịch cho khách ${draggedWaitlistItem.customerName} vào lúc ${droppedTime}?`)) {
                // 1. Auto Create Booking
                const payload = {
                    customerName: draggedWaitlistItem.customerName,
                    phone: draggedWaitlistItem.phone,
                    serviceName: draggedWaitlistItem.serviceName,
                    date: dayjs(start).format('YYYY-MM-DD'),
                    time: droppedTime,
                    source: 'waitlist'
                };
                
                await adminBookingService.createBooking(payload);
                message.success('Đã xếp lịch thành công!');
                
                // 2. Delete from Waitlist
                await adminBookingService.deleteWaitlist(draggedWaitlistItem._id);
                
                // 3. Refresh
                fetchData();
                setDraggedWaitlistItem(null); // Clear
                setRefreshWaitlist(prev => prev + 1); // Trigger sidebar refresh
            }
        } catch (e) {
            console.error(e);
            message.error('Lỗi xếp lịch!');
        }
    };

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
