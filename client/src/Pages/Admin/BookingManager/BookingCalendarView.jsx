import React from 'react';
import dayjs from 'dayjs';
import DnDCalendarView from './DnDCalendarView';
import BookingListView from './BookingListView';

/**
 * BookingCalendarView - Wrapper component for Calendar/List view switching
 * Encapsulates the view mode logic and props management
 */
const BookingCalendarView = ({
    viewMode,
    bookings,
    rooms,
    loading,
    currentDate,
    setCurrentDate,
    highlightBookingId,
    onEventDrop,
    onEventResize,
    onWaitlistDrop,
    draggedWaitlistItem,
    highlightRoomType,
    highlightTime,
    onSelectEvent,
    onSelectSlot,
    openCreateModal,
    handleApprove
}) => {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 600, minWidth: 0 }}>
            {viewMode === 'calendar' ? (
                <div style={{ flex: 1, minHeight: 600, overflow: 'visible' }}>
                    <DnDCalendarView 
                        events={bookings} 
                        resources={rooms}
                        date={currentDate.toDate()}
                        onNavigate={(d) => setCurrentDate(dayjs(d))}
                        onEventDrop={onEventDrop}
                        onEventResize={onEventResize}
                        highlightBookingId={highlightBookingId} 
                        onSelectEvent={onSelectEvent}
                        onSelectSlot={onSelectSlot}
                        onDropFromOutside={onWaitlistDrop}
                        draggedWaitlistItem={draggedWaitlistItem}
                        highlightRoomType={highlightRoomType}
                        highlightTime={highlightTime}
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
                        onEdit={onSelectEvent}
                    />
                </div>
            )}
        </div>
    );
};

export default BookingCalendarView;
