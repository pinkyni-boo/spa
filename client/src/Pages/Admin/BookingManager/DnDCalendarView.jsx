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

    return (
        <div style={{ height: '75vh', padding: '10px', background: '#fff', borderRadius: '8px' }}>
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
