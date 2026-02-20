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
import BookingListView from './BookingListView';
import BookingDrawer from './BookingDrawer';
import DnDCalendarView from './DnDCalendarView';
import InvoiceModal from '../Payment/InvoiceModal'; // [MOVED]
import WaitlistSidebar from './WaitlistSidebar';
import CustomerInfoSidebar from './CustomerInfoSidebar'; // [NEW]
import BookingToolbar from './BookingToolbar';
import BookingCreateModal from './BookingCreateModal';
import BookingCalendarView from './BookingCalendarView';
import { useBookingData } from './hooks/useBookingData';
import { useBookingActions } from './hooks/useBookingActions';

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
    // [HOOK] Data Logic
    const { 
        bookings, rooms, staffs, services, loading, 
        filterBranch, setFilterBranch, 
        filterStaff, setFilterStaff, 
        filterPayment, setFilterPayment, 
        currentDate, setCurrentDate, 
        userRole, managedBranches, 
        fetchData 
    } = useBookingData();

    // [UI STATE]
    const [isModalVisible, setIsModalVisible] = useState(false); 
    const [drawerVisible, setDrawerVisible] = useState(false); 
    const [waitlist, setWaitlist] = useState([]); 
    const [highlightBookingId, setHighlightBookingId] = useState(null); 
    const [refreshWaitlist, setRefreshWaitlist] = useState(0);
    const [draggedWaitlistItem, setDraggedWaitlistItem] = useState(null); 
    const [selectedBooking, setSelectedBooking] = useState(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [highlightRoomType, setHighlightRoomType] = useState(null); // [NEW] Highlight matching calendar columns
    const [highlightTime, setHighlightTime] = useState(null); // [NEW] Highlight preferred time slot

    // Derived State
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    
    // [FORMS & MODALS]
    const [form] = Form.useForm();
    const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState(null);

    // [HANDLERS]
    const openCreateModal = () => {
        setIsModalVisible(true);
    };

    // [HOOK] Actions
    const {
        handleCreateSubmit,
        handleSearchSelect,
        handleApprove,
        handleInvoiceSubmit,
        handleAction,
        handleEventDrop,
        handleEventResize,
        handleWaitlistDrop
    } = useBookingActions({
        // Data
        bookings, rooms, services, 
        // State Values
        filterBranch, draggedWaitlistItem,
        // Actions
        fetchData,
        // Setters
        setIsModalVisible, setDrawerVisible, setSelectedBooking, setIsEditing, setDraggedWaitlistItem, setRefreshWaitlist
    });

    const handleViewChange = (mode) => setViewMode(mode);

    // [NEW] Highlight calendar columns matching service type
    const handleHighlightRoom = (waitlistItem) => {
        const svc = (waitlistItem.serviceName || '').toLowerCase();
        const headKw = ['gội', 'hair', 'tóc', 'head', 'dưỡng sinh', 'shampoo'];
        const nailKw = ['nail', 'móng', 'sơn', 'gel', 'đắp', 'gắn', 'tháo'];
        let roomType = 'BODY_SPA';
        if (headKw.some(k => svc.includes(k))) roomType = 'HEAD_SPA';
        else if (nailKw.some(k => svc.includes(k))) roomType = 'NAIL_SPA';
        setHighlightRoomType(roomType);
        // Extract preferred time (e.g. "14:00")
        setHighlightTime(waitlistItem.preferredTime || null);
        // Auto clear after 6 seconds
        setTimeout(() => { setHighlightRoomType(null); setHighlightTime(null); }, 6000);
    };

    // Intercept drawer actions that need invoice modal
    const handleDrawerAction = async (action, bookingId, data) => {
        if (action === 'complete') {
            // Mở modal thanh toán, chưa gọi API
            setDrawerVisible(false);
            setIsInvoiceVisible(true);
            return;
        }
        if (action === 'view_invoice') {
            const bookingObj = typeof bookingId === 'object' ? bookingId : bookings.find(b => b._id === bookingId);
            if (bookingObj) {
                setSelectedBooking(bookingObj);
                const result = await adminBookingService.getInvoices({ bookingId: bookingObj._id });
                const inv = Array.isArray(result) ? result[0] : (result.invoices?.[0] || null);
                if (!inv) { message.warning('Chưa có hóa đơn cho đơn này'); return; }
                setViewingInvoice(inv);
                setIsInvoiceVisible(true);
            }
            return;
        }
        // Các action khác gọi bình thường
        handleAction(action, bookingId, data);
    };

    return (
        <ConfigProvider theme={{ token: { fontFamily: theme.fonts.body, colorPrimary: theme.colors.primary[500] } }}>
            <style>{`
                /* Mobile responsive */
                @media (max-width: 768px) {
                    .booking-manager-container {
                        padding: 8px !important;
                    }
                    .booking-manager-container h3 {
                        font-size: 18px !important;
                    }
                }
                @media (max-width: 480px) {
                    .booking-manager-container {
                        padding: 4px !important;
                    }
                    .booking-manager-container h3 {
                        font-size: 16px !important;
                    }
                }
                
                /* Zoom-aware responsive (detects small viewport from zoom) */
                @media (max-width: 1400px) {
                    .booking-manager-container {
                        padding: 12px !important;
                    }
                }
                @media (max-width: 1000px) {
                    .booking-manager-container {
                        padding: 8px !important;
                    }
                }
                
                /* Mobile header fixes */
                @media (max-width: 768px) {
                    .booking-header-section {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 12px !important;
                    }
                    .booking-header-title {
                        width: 100%;
                    }
                    .booking-sidebar-container {
                        display: none !important; /* Hide sidebar on mobile */
                    }
                }
                @media (max-width: 480px) {
                    .booking-header-section {
                        margin-bottom: 8px !important;
                    }
                }
            `}</style>
            <div className="booking-manager-container" style={{ padding: '16px', minHeight: '100vh', background: '#f0f2f5', overflow: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                
                {/* HEADER - TRANSPARENT & CLEAN */}
                <div className="booking-header-section" style={{ 
                    marginTop: 8,
                    marginBottom: 16,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexShrink: 0,
                    gap: 16,
                    flexWrap: 'wrap'
                }}>
                    <div className="booking-header-title" style={{ minWidth: 'fit-content' }}>
                         {/* Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <Title level={3} style={{ margin: 0, fontFamily: theme.fonts.heading, color: '#1f1f1f', whiteSpace: 'nowrap', minWidth: 'max-content', fontSize: 'clamp(18px, 5vw, 24px)' }}>Quản Lý Đặt Lịch</Title>
                            <Tag color="cyan" style={{ borderRadius: 12, whiteSpace: 'nowrap' }}>Admin Portal</Tag>
                        </div>
                    </div>
                    
                    <BookingToolbar 
                        userRole={userRole}
                        managedBranches={managedBranches}
                        filterBranch={filterBranch}
                        setFilterBranch={setFilterBranch}
                        staffs={staffs}
                        filterStaff={filterStaff}
                        setFilterStaff={setFilterStaff}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        viewMode={viewMode}
                        setViewMode={(mode) => handleViewChange(mode)}
                        pendingCount={pendingCount}
                        onNewBooking={openCreateModal}
                        onSearchSelect={handleSearchSelect}
                    />
                </div>

                {/* MAIN CONTENT AREA - FULL HEIGHT & WIDTH */}
                <div style={{ display: 'flex', gap: 16 }}>
                    
                    {/* LEFT: CALENDAR/LIST VIEW */}
                    <BookingCalendarView 
                        viewMode={viewMode}
                        bookings={bookings}
                        rooms={rooms}
                        loading={loading}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        highlightBookingId={highlightBookingId}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                        onWaitlistDrop={handleWaitlistDrop}
                        draggedWaitlistItem={draggedWaitlistItem}
                        highlightRoomType={highlightRoomType}
                        highlightTime={highlightTime}
                        onSelectEvent={(event) => {
                            setSelectedBooking(event);
                            setDrawerVisible(true);
                        }}
                        onSelectSlot={(slotInfo) => {
                            // Quick create on click logic if needed
                        }}
                        openCreateModal={openCreateModal}
                        handleApprove={handleApprove}
                    />

                    {/* RIGHT: DYNAMIC SIDEBAR (Collapsible) - Always visible */}
                    <div className="booking-sidebar-container" style={{ 
                        position: 'relative',
                        width: sidebarCollapsed ? 60 : Math.min(270, window.innerWidth * 0.25),
                        minWidth: sidebarCollapsed ? 60 : 200,
                        maxWidth: sidebarCollapsed ? 60 : 300,
                        transition: 'width 0.3s ease-in-out',
                        flexShrink: 1
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
                                    width: '100%',
                                    minWidth: 200,
                                    maxWidth: 300,
                                    background: 'white', 
                                    borderRadius: 12, 
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    height: '100%',
                                    flexShrink: 1,
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
                                       onHighlightRoom={handleHighlightRoom}
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
                    open={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                    booking={selectedBooking}
                    onAction={handleDrawerAction}
                    services={services}
                />

                {/* MODAL (CREATE ONLY) */}
                {/* [NEW] STYLE FOR MODAL */}
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
                <BookingCreateModal 
                    visible={isModalVisible} 
                    onCancel={() => setIsModalVisible(false)}
                    onCreate={handleCreateSubmit}
                />

                {/* [NEW] INVOICE MODAL */}
                <InvoiceModal
                    visible={isInvoiceVisible}
                    onClose={() => {
                        setIsInvoiceVisible(false);
                        setViewingInvoice(null);
                    }}
                    booking={viewingInvoice ? null : selectedBooking}
                    invoice={viewingInvoice}
                    onSubmit={async (invoiceData) => {
                        await handleInvoiceSubmit(invoiceData);
                        setIsInvoiceVisible(false);
                        setViewingInvoice(null);
                    }}
                />

            </div>
        </ConfigProvider>
    );
};

export default BookingManager;
