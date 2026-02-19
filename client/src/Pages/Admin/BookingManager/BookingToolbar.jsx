import React, { useState } from 'react';
import { Select, DatePicker, AutoComplete, Button, Badge } from 'antd';
import { AppstoreOutlined, BarsOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adminBookingService } from '../../../services/adminBookingService';

const { Option } = Select;

const BookingToolbar = ({
    userRole,
    managedBranches,
    filterBranch,
    setFilterBranch,
    staffs,
    filterStaff,
    setFilterStaff,
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    pendingCount,
    onNewBooking,
    onSearchSelect
}) => {
    
    // Local search state
    const [searchResults, setSearchResults] = useState([]);

    return (
        <>
        <style>{`
            .booking-toolbar-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                gap: 12px;
                flex-wrap: wrap;
            }
            .booking-toolbar-left,
            .booking-toolbar-right {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            }
            @media (max-width: 768px) {
                .booking-toolbar-container {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }
                .booking-toolbar-left,
                .booking-toolbar-right {
                    width: 100%;
                    justify-content: flex-start;
                }
                .booking-toolbar-right {
                    order: 2;
                }
            }
            @media (max-width: 480px) {
                .booking-toolbar-left > *,
                .booking-toolbar-right > * {
                    min-width: 0;
                    flex: 1 1 auto;
                }
            }
        `}</style>
        <div className="booking-toolbar-container">
            {/* LEFT: DATE & BRANCH */}
            <div className="booking-toolbar-left">
                <DatePicker 
                    value={currentDate} 
                    onChange={setCurrentDate} 
                    allowClear={false}
                    style={{ minWidth: 120, maxWidth: 160 }}
                    format="DD/MM/YYYY"
                />

                {(userRole === 'admin' || userRole === 'owner') && (
                    <Select
                        placeholder="Chi Nhánh"
                        style={{ minWidth: 140, maxWidth: 220 }}
                        value={filterBranch}
                        onChange={setFilterBranch}
                        options={managedBranches.map(b => ({ label: b.name, value: b._id }))}
                    />
                )}
            </div>

            {/* RIGHT: FILTERS & ACTIONS */}
            <div className="booking-toolbar-right">
                
                {/* STAFF FILTER */}
                <Select
                    placeholder="👤 Nhân Viên"
                    allowClear
                    style={{ minWidth: 120, maxWidth: 160 }}
                    value={filterStaff}
                    onChange={setFilterStaff}
                    options={staffs.map(s => ({ value: s._id, label: s.name }))}
                />

                {/* SEARCH BOOKING */}
                <AutoComplete
                    style={{ minWidth: 160, maxWidth: 280, background: 'white', borderRadius: 8, flex: '1 1 auto' }}
                    allowClear
                    filterOption={false}
                    placeholder="🔍 Tìm SĐT/Tên"
                    options={searchResults.map(b => ({
                        value: `${b.customerName} - ${dayjs(b.startTime).format('DD/MM HH:mm')}`, 
                        label: (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{b.customerName}</strong>
                                <span style={{ fontSize: 12, color: '#888' }}>{dayjs(b.startTime).format('DD/MM HH:mm')}</span>
                            </div>
                        ),
                        booking: b 
                    }))}
                    onSelect={(val, option) => {
                         if (onSearchSelect) onSearchSelect(option.booking._id, option.booking);
                    }}
                    onSearch={(val) => {
                        if (val.length >= 1) {
                            adminBookingService.searchBookings(val).then(res => {
                                if (res && (res.success || Array.isArray(res))) {
                                    const results = Array.isArray(res) ? res : (res.bookings || res.data);
                                    setSearchResults(results || []);
                                }
                            });
                        }
                    }}
                />

                {/* VIEW MODE TOGGLE (Calendar / List) */}
                <div style={{ 
                    display: 'flex', 
                    background: 'white', 
                    borderRadius: 8, 
                    border: '1px solid #d9d9d9', 
                    height: 40,
                    position: 'relative' 
                }}>
                    <div 
                        onClick={() => setViewMode('calendar')}
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
                        onClick={() => setViewMode('list')}
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
                                top: -10,
                                right: -10,
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

                {/* NEW BOOKING BUTTON */}
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={onNewBooking}
                    style={{ 
                        height: 40, 
                        background: '#D4Af37', 
                        borderColor: '#D4Af37',
                        minWidth: 90,
                        fontSize: 14,
                        fontWeight: 500,
                        whiteSpace: 'nowrap'
                    }}
                >
                    Tạo Đơn
                </Button>
            </div>
        </div>
        </>
    );
};

export default BookingToolbar;
