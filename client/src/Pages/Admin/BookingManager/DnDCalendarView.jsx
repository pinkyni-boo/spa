import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import dayjs from 'dayjs';
import withDragAndDropLib from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Spin, message } from 'antd';
import theme from '../../../theme';
import { adminBookingService } from '../../../services/adminBookingService';

// FIX: Robust check for Vite + CommonJS interop (Handles Double Default)
let withDragAndDrop = withDragAndDropLib;
if (withDragAndDrop.default) withDragAndDrop = withDragAndDrop.default;
if (withDragAndDrop.default) withDragAndDrop = withDragAndDrop.default; // Double check

// LOCALE SETUP
import 'dayjs/locale/vi';
dayjs.locale('vi');

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = dayjsLocalizer(dayjs);

import { Button } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';

// CUSTOM TOOLBAR COMPONENT
const CustomToolbar = (toolbar) => {
    // Manually calculate new date to pass valid Date object to parent onNavigate
    const goToBack = () => {
        const newDate = dayjs(toolbar.date).subtract(1, 'day').toDate();
        toolbar.onNavigate(newDate); // Pass Date, not string 'PREV'
    };
    const goToNext = () => {
        const newDate = dayjs(toolbar.date).add(1, 'day').toDate();
        toolbar.onNavigate(newDate); // Pass Date, not string 'NEXT'
    };
    const goToCurrent = () => {
        const newDate = new Date();
        toolbar.onNavigate(newDate); // Pass Date, not string 'TODAY'
    };

    const label = () => {
        const date = dayjs(toolbar.date);
        return (
            <span style={{ textTransform: 'capitalize', fontSize: 18, fontWeight: '600', color: '#1f1f1f' }}>
                {date.format('dddd, DD [tháng] MM, YYYY')}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0 12px 16px', position: 'relative', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
            {/* Left Controls */}
            <div style={{ display: 'flex', gap: 8, zIndex: 10 }}>
                 <Button onClick={goToCurrent} icon={<CalendarOutlined />} />
                 <Button onClick={goToBack} icon={<LeftOutlined />} />
                 <Button onClick={goToNext} icon={<RightOutlined />} />
            </div>
            
            {/* Centered Label */}
            <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                {label()}
            </div>
        </div>
    );
};

const DnDCalendarView = ({ date, views, events, resources, onNavigate, onEventDrop, onEventResize, onSelectEvent, onSelectSlot, onDropFromOutside, highlightBookingId }) => {
    
    // --- [NEW] SYNC SEARCH SCROLL ---
    useEffect(() => {
        if (highlightBookingId) {
            // Delay slightly to ensure render
            setTimeout(() => {
                const eventElement = document.querySelector(`.booking-highlight-${highlightBookingId}`);
                if (eventElement) {
                    eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [highlightBookingId, date]); // Run when ID changes or Date changes (view update)

    // Style cho event
    const eventPropGetter = useCallback((event) => {
        let newStyle = {
            backgroundColor: theme.colors.primary[500],
            color: 'white',
            borderRadius: '4px',
            border: 'none',
            fontSize: '12px',
            fontWeight: '600',
            overflow: 'hidden'
        };

        const now = dayjs();
        const start = dayjs(event.start);
        
        let className = `booking-highlight-${event.id}`; // [NEW] Class helper for selector

        // 1. Pending: Vàng Cam (Soft Lock)
        if (event.status === 'pending') {
            newStyle.backgroundColor = '#fffbe6'; // Light Yellow Background
            newStyle.border = '1px solid #ffe58f'; // Yellow Border
            newStyle.color = '#faad14'; // Dark Yellow Text
            newStyle.backgroundImage = 'none';
        } 
        // 2. Confirmed: Xanh Dương (Sắp tới)
        else if (event.status === 'confirmed') {
             newStyle.backgroundColor = '#1890ff'; // Blue
             
             // [NEW] Warning Logic: Trễ giờ chưa Check-in
             if (now.isAfter(start.add(15, 'minute'))) {
                 // Trễ quá 15p -> Báo Động Đỏ
                 newStyle.backgroundColor = '#ff4d4f'; 
                 newStyle.animation = 'pulse 2s infinite';
             } else if (now.isAfter(start)) {
                 // Vừa trễ -> Báo Động Cam
                 newStyle.backgroundColor = '#faad14';
             }
        }
        // 3. Processing: Xanh Lá (Đang làm)
        else if (event.status === 'processing') {
            newStyle.backgroundColor = '#52c41a'; // Green
            newStyle.boxShadow = '0 0 8px rgba(82, 196, 26, 0.6)'; // Glow Effect
        }
        // 4. Completed: Xám (Ghost)
        else if (event.status === 'completed') {
            newStyle.backgroundColor = '#f5f5f5'; // Grey Background
            newStyle.color = '#bfbfbf'; // Grey Text
            newStyle.border = '1px solid #d9d9d9';
            newStyle.opacity = 0.7;
        }
        // 5. Cancelled: Ẩn hoặc Đỏ nhạt
        else if (event.status === 'cancelled') {
             newStyle.backgroundColor = '#fff2f0';
             newStyle.color = '#ffccc7';
             newStyle.textDecoration = 'line-through';
             newStyle.opacity = 0.5;
        }

        // Highlight Effect from Search
        if (highlightBookingId && event.id === highlightBookingId) {
            newStyle.animation = 'flash 1s infinite';
            newStyle.border = '2px solid #f5222d';
            newStyle.zIndex = 100;
        }

        // [NEW] UNPAID INDICATOR (Override colors if Unpaid and Completed)
        // Only override if not already cancelled or pending
        if (event.paymentStatus === 'unpaid' && event.status !== 'cancelled' && event.status !== 'pending') {
             // Logic: If service is Done (Completed) OR Processing but not paid
             // User said: "Khách làm xong ... đỏ lòm" -> Status Completed + Unpaid
             if (event.status === 'completed') {
                  newStyle.backgroundColor = '#ff4d4f'; // Red
                  newStyle.color = 'white';
                  newStyle.border = '2px solid #cf1322';
                  newStyle.fontWeight = 'bold';
                  newStyle.opacity = 1; // Remove ghost effect
             }
        }

        return { style: newStyle, className: className };
    }, [highlightBookingId]);

    // --- LOGIC GỢI Ý GIỜ TRỐNG (QUICK SUGGESTION) ---
    // Tìm các khung giờ mà CÓ ÍT NHẤT 1 PHÒNG TRỐNG
    const availableRanges = React.useMemo(() => {
        if (!resources || resources.length === 0) return "Đang tải...";
        
        const startOfDay = dayjs(date).hour(9).minute(0);
        const endOfDay = dayjs(date).hour(18).minute(0);
        const suggestions = []; // Array of { start, end, count }
        
        const totalRooms = resources.length;
        
        // Loop every 30 mins
        let currentSlot = startOfDay;
        while (currentSlot.isBefore(endOfDay)) {
            const nextSlot = currentSlot.add(30, 'minute');
            
            // Count active bookings in this slot
            let busyCount = 0;
            (events || []).forEach(b => {
                const bStart = dayjs(b.start);
                const bEnd = dayjs(b.end);
                // Overlap check
                if (bStart.isBefore(nextSlot) && bEnd.isAfter(currentSlot) && b.status !== 'cancelled') {
                    busyCount++;
                }
            });

            const freeCount = totalRooms - busyCount;
            if (freeCount > 0) {
                // Merge with previous if same
                const last = suggestions[suggestions.length - 1];
                if (last && last.end.isSame(currentSlot) && last.count === freeCount) {
                     last.end = nextSlot;
                } else {
                     suggestions.push({ start: currentSlot, end: nextSlot, count: freeCount });
                }
            }
            currentSlot = nextSlot;
        }
        
        // Format for display (Top 3 longest ranges)
        suggestions.sort((a,b) => (b.end.diff(b.start)) - (a.end.diff(a.start)));
        
        if (suggestions.length === 0) return "Hôm nay đã kín lịch!";

        return suggestions.slice(0, 3).map((s, idx) => (
            <span key={idx} style={{ marginRight: 15 }}>
                {s.start.format('HH:mm')} - {s.end.format('HH:mm')} 
                <span style={{ color: '#52c41a', marginLeft: 4 }}>(Còn {s.count} phòng)</span>
                {idx < 2 && idx < suggestions.length - 1 ? ',' : ''}
            </span>
        ));
    }, [events, resources, date]);

    return (
        <div style={{ height: '100%', background: 'white', padding: 0, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0' }}>
            {/* CSS FOR FLASH & PULSE & CLEAN GRID */}
            <style>{`
                @keyframes flash { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); } 50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); } }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); } }
                
                .rbc-calendar { font-family: 'Inter', sans-serif !important; }
                .rbc-header { padding: 12px 0 !important; font-weight: 600 !important; color: #595959 !important; font-size: 11px; letter-spacing: 0.5px; border-bottom: 1px solid #f0f0f0 !important; background: #fafafa; }
                .rbc-time-view { border: none !important; }
                .rbc-time-content { border: none !important; }
                .rbc-timeslot-group { border-bottom: 1px dashed #f5f5f5 !important; min-height: 40px !important; } /* Compact slots */
                .rbc-day-slot { border-left: 1px dashed #f5f5f5 !important; }
                .rbc-today { background-color: #fff !important; }
                .rbc-time-gutter .rbc-timeslot-group { border-bottom: none !important; }
                .rbc-label { color: #8c8c8c !important; font-size: 11px !important; }
                .rbc-current-time-indicator { background-color: #ff4d4f !important; height: 2px !important; }
                .rbc-allday-cell { display: none !important; } /* Hide All Day Row */
                
                /* Hide Default Toolbar via CSS just in case, though we replace it */
                .rbc-toolbar { display: none !important; } 
            `}</style>
            
            {/* CUSTOM TOOLBAR INSIDE */}
            <CustomToolbar date={date} onNavigate={onNavigate} />

            {/* SUGGESTION BANNER (Compact) */}
             <div style={{ padding: '8px 16px', background: '#f6ffed', borderBottom: '1px solid #b7eb8f', color: '#389e0d', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, fontSize: 13 }}>
                <ClockCircleOutlined style={{ fontSize: 16 }} />
                <span><strong>Giờ trống:</strong> {availableRanges}</span>
             </div>

             <DnDCalendar
                localizer={localizer}
                events={events}
                resources={resources} 
                resourceIdAccessor="id"
                resourceTitleAccessor="title"
                startAccessor="start"
                endAccessor="end"
                defaultView={Views.DAY} 
                views={[Views.DAY]} 
                step={30} 
                timeslots={2} 
                
                // FIX: Use stable constant date (Year 2000) for TimeGutter to avoid Invalid Date issues
                // RBC only cares about the Time component for min/max
                min={new Date(2000, 0, 1, 8, 0, 0)} 
                max={new Date(2000, 0, 1, 20, 0, 0)} 
                
                date={dayjs(date).isValid() ? dayjs(date).toDate() : new Date()}
                onNavigate={onNavigate}
                eventPropGetter={eventPropGetter}
                
                // COMPONENTS OVERRIDE
                components={{
                    toolbar: () => null // We render toolbar manually above to control layout perfectly
                }}

                // DRAG & DROP
                resizable
                selectable
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                onDropFromOutside={onDropFromOutside} // [NEW] Waitlist Drop
                draggableAccessor={() => true} // Enable dragging

                // INTERACTION
                onSelectEvent={onSelectEvent}
                onSelectSlot={onSelectSlot}
                dragFromOutsideItem={() => ({ name: 'New Booking' })} 

                messages={{
                    next: "Sau",
                    previous: "Trước",
                    today: "Hôm nay",
                    day: "Ngày",
                    noEventsInRange: "Trống lịch."
                }}
             />
        </div>
    );
};

export default DnDCalendarView;
