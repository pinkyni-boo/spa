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

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = dayjsLocalizer(dayjs);

const DnDCalendarView = ({ bookings, rooms, onEventDrop, onEventResize, onNavigate, date, onSelectEvent }) => {
    
    // Style cho event
    const eventPropGetter = useCallback((event) => {
        let newStyle = {
            backgroundColor: theme.colors.primary[500],
            color: 'white',
            borderRadius: '4px',
            border: 'none',
            fontSize: '12px',
            fontWeight: '600'
        };
        if (event.status === 'confirmed') newStyle.backgroundColor = '#52c41a'; 
        if (event.status === 'pending') newStyle.backgroundColor = '#faad14'; 
        if (event.status === 'completed') newStyle.backgroundColor = '#1890ff'; 
        if (event.status === 'cancelled') newStyle.backgroundColor = '#ff4d4f'; 
        return { style: newStyle };
    }, []);

    // --- LOGIC GỢI Ý GIỜ TRỐNG (QUICK SUGGESTION) ---
    // Tìm các khung giờ mà CÓ ÍT NHẤT 1 PHÒNG TRỐNG
    const availableRanges = React.useMemo(() => {
        if (!rooms || rooms.length === 0) return "Đang tải...";
        
        const startOfDay = dayjs(date).hour(9).minute(0);
        const endOfDay = dayjs(date).hour(18).minute(0);
        const timeWindows = [];
        
        let currentWindowStart = null;
        
        // Quét từng slot 30 phút
        for (let time = startOfDay; time.isBefore(endOfDay); time = time.add(30, 'minute')) {
            const nextTime = time.add(30, 'minute');
            
            // Đếm số phòng bận trong slot này
            const busyRoomCount = bookings.filter(b => {
                const bStart = dayjs(b.start);
                const bEnd = dayjs(b.end);
                // Check overlap: (StartA < EndB) && (EndA > StartB)
                return time.isBefore(bEnd) && nextTime.isAfter(bStart);
            }).length;

            // KHÁCH YÊU CẦU: Chỉ gợi ý giờ HOÀN TOÀN TRỐNG (Không có đơn nào)
            const isFree = busyRoomCount === 0;

            if (isFree) {
                if (!currentWindowStart) currentWindowStart = time; // Bắt đầu chuỗi rảnh
            } else {
                if (currentWindowStart) {
                    // Kết thúc chuỗi rảnh -> Lưu lại
                    timeWindows.push(`${currentWindowStart.format('HH:mm')} - ${time.format('HH:mm')}`);
                    currentWindowStart = null;
                }
            }
        }
        // Chốt sổ slot cuối ngày nếu còn đang rảnh
        if (currentWindowStart) {
             timeWindows.push(`${currentWindowStart.format('HH:mm')} - ${endOfDay.format('HH:mm')}`);
        }

        return timeWindows.length > 0 ? timeWindows.join(',  ') : "Hôm nay đã kín lịch!";
    }, [bookings, rooms, date]);

    return (
        <div style={{ height: '75vh', padding: '10px', background: '#fff', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
             {/* GỢI Ý GIỜ TRỐNG */}
             <div style={{ 
                marginBottom: '10px', 
                padding: '12px', 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f', 
                borderRadius: '6px',
                color: '#389e0d',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
             }}>
                <span className="material-symbols-outlined">event_available</span>
                <span>
                    <strong>Gợi ý giờ trống hôm nay: </strong> 
                    {availableRanges}
                </span>
             </div>

             <DnDCalendar
                localizer={localizer}
                events={bookings}
                resources={rooms} 
                resourceIdAccessor="id"
                resourceTitleAccessor="title"
                startAccessor="start"
                endAccessor="end"
                defaultView={Views.DAY} 
                views={[Views.DAY, Views.WORK_WEEK]} 
                step={30} 
                timeslots={2} 
                min={dayjs().set('hour', 8).set('minute', 0).toDate()}
                max={dayjs().set('hour', 20).set('minute', 0).toDate()}
                date={date}
                onNavigate={onNavigate}
                eventPropGetter={eventPropGetter}
                
                // DRAG & DROP
                resizable
                selectable
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                
                // INTERACTION
                onSelectEvent={onSelectEvent} // Bấm vào để mở Drawer

                messages={{
                    next: "Sau",
                    previous: "Trước",
                    today: "Hôm nay",
                    day: "Ngày",
                    week: "Tuần",
                    noEventsInRange: "Không có lịch đặt nào."
                }}
             />
        </div>
    );
};

export default DnDCalendarView;
