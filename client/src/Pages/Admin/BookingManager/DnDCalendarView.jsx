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
                    // Get the calendar container (scrollable parent)
                    const calendarContainer = eventElement.closest('.rbc-time-content');
                    
                    if (calendarContainer) {
                        // Calculate position with offset for header (100px buffer)
                        const elementTop = eventElement.offsetTop;
                        const offset = 100; // Space for date header
                        
                        calendarContainer.scrollTo({
                            top: elementTop - offset,
                            behavior: 'smooth'
                        });
                    } else {
                        // Fallback to scrollIntoView
                        eventElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 100);
        }
    }, [highlightBookingId, date]); // Run when ID changes or Date changes (view update)

    // [DEBUG] Log events received by calendar
    console.log('🗓️ DnDCalendarView received:', events?.length, 'events');
    console.log('🗓️ Sample event:', events?.[0]);
    console.log('🏠 Resources (rooms):', resources?.length, 'rooms');
    console.log('🏠 Sample resource:', resources?.[0]);
    
    // [DEBUG] Check if events have valid resourceId
    const eventsWithoutResource = events?.filter(e => !e.resourceId);
    if (eventsWithoutResource?.length > 0) {
        console.warn('⚠️ Found', eventsWithoutResource.length, 'events WITHOUT resourceId!');
        console.warn('Sample event without resourceId:', eventsWithoutResource[0]);
    }

    // Style cho event
    const eventPropGetter = useCallback((event) => {
        // HIDE CANCELLED BOOKINGS
        if (event.status === 'cancelled') {
            return { 
                style: { display: 'none' }, 
                className: `booking-highlight-${event.id}` 
            };
        }

        let newStyle = {
            backgroundColor: 'white', // Default white
            color: '#333',
            borderRadius: '4px',
            border: '1px solid #d9d9d9',
            fontSize: '12px',
            fontWeight: '600',
            overflow: 'hidden'
        };

        const now = dayjs();
        const start = dayjs(event.start);
        
        let className = `booking-highlight-${event.id}`;

        // 1. Pending: Vàng FULL
        if (event.status === 'pending') {
            newStyle.backgroundColor = '#fadb14'; // Yellow FULL
            newStyle.border = '1px solid #d4b106';
            newStyle.color = 'white';
        } 
        // 2. Confirmed: Trắng (hoặc Trễ nếu hôm nay + qua giờ)
        else if (event.status === 'confirmed') {
             const isToday = start.isSame(now, 'day');
             const isPast = now.isAfter(start);
             
             if (isToday && isPast) {
                 // Trễ → Trắng + viền cam nhấp nháy
                 newStyle.backgroundColor = 'white';
                 newStyle.border = '3px solid #fa8c16'; // Orange border
                 newStyle.color = '#d46b08';
                 newStyle.animation = 'pulse 2s infinite';
             } else {
                 // Sắp tới → Trắng
                 newStyle.backgroundColor = 'white';
                 newStyle.border = '1px solid #d9d9d9';
                 newStyle.color = '#333';
             }
        }
        // 3. Processing: Xanh lá FULL
        else if (event.status === 'processing') {
            newStyle.backgroundColor = '#52c41a'; // Green FULL
            newStyle.border = '1px solid #389e0d';
            newStyle.color = 'white';
        }
        // 4. Completed: Xám FULL
        else if (event.status === 'completed') {
            newStyle.backgroundColor = '#8c8c8c'; // Gray FULL
            newStyle.color = 'white';
            newStyle.border = '1px solid #595959';
        }

        // Highlight Effect from Search
        if (highlightBookingId && event.id === highlightBookingId) {
            newStyle.animation = 'flash 1s infinite';
            newStyle.border = '2px solid #f5222d';
            newStyle.zIndex = 100;
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

                /* CUSTOM SCROLLBAR that only appears when absolutely necessary */
                .rbc-time-content::-webkit-scrollbar { height: 6px; }
                .rbc-time-content::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 3px; }
                
                /* [USER REQUEST]: FORCE FIT ALL COLUMNS (Responsive resizing) */
                .rbc-time-view { flex: 1; width: 100%; }
                
                /* Override default min-width to allow shrinking */
                .rbc-time-header-content { flex: 1; min-width: 0 !important; }
                .rbc-day-slot { min-width: 0 !important; } 
                .rbc-header { min-width: 0 !important; padding: 4px 2px !important; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
                
                /* Ensure columns share space equally */
                .rbc-time-header-content > .rbc-row.rbc-time-header-cell { display: flex; }
                .rbc-time-header-cell .rbc-header { flex: 1; }
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
