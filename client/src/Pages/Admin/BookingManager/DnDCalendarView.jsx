import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import dayjs from 'dayjs';
import withDragAndDropLib from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Spin, message, Tabs, Button, Popover, Tag } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined, SkinOutlined } from '@ant-design/icons';
import theme from '../../../theme';
// import { adminBookingService } from '../../../services/adminBookingService';

// FIX: Robust check for Vite + CommonJS interop (Handles Double Default)
let withDragAndDrop = withDragAndDropLib;
if (withDragAndDrop.default) withDragAndDrop = withDragAndDrop.default;
if (withDragAndDrop.default) withDragAndDrop = withDragAndDrop.default; // Double check

// LOCALE SETUP
import 'dayjs/locale/vi';
dayjs.locale('vi');

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = dayjsLocalizer(dayjs);

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
            <>
                <span className="toolbar-label-full" style={{ textTransform: 'capitalize', fontSize: 18, fontWeight: '600', color: '#1f1f1f' }}>
                    {date.format('dddd, DD [tháng] MM, YYYY')}
                </span>
                <span className="toolbar-label-mobile" style={{ textTransform: 'capitalize', fontSize: 14, fontWeight: '600', color: '#1f1f1f', display: 'none' }}>
                    {date.format('DD/MM/YYYY')}
                </span>
                <style>{`
                    @media (max-width: 768px) {
                        .toolbar-label-full { display: none !important; }
                        .toolbar-label-mobile { display: inline !important; }
                    }
                `}</style>
            </>
        );
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0 12px 16px', position: 'relative', background: '#fafafa', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 8 }}>
            {/* Left Controls */}
            <div style={{ display: 'flex', gap: 8, zIndex: 10 }}>
                 <Button onClick={goToCurrent} icon={<CalendarOutlined />} size="small" />
                 <Button onClick={goToBack} icon={<LeftOutlined />} size="small" />
                 <Button onClick={goToNext} icon={<RightOutlined />} size="small" />
            </div>
            
            {/* Centered Label */}
            <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                {label()}
            </div>
        </div>
    );
};

const DnDCalendarView = ({ date, views, events, resources, onNavigate, onEventDrop, onEventResize, onSelectEvent, onSelectSlot, onDropFromOutside, draggedWaitlistItem, highlightBookingId, highlightRoomType, highlightTime }) => {
    
    // [NEW] TAB STATE
    const [activeTab, setActiveTab] = useState('all');

    // [NEW] FILTER RESOURCES LOGIC
    const filteredResources = React.useMemo(() => {
        if (!resources) return [];
        if (activeTab === 'all') return resources;

        return resources.filter(r => {
            // Check by TYPE or ROOMTYPE (beds use roomType, rooms use type)
            const rType = r.roomType || r.type || '';
            // Also match by title/name (bed titles are like "Body - 1", "Gội - 1")
            const rTitle = (r.title || r.name || '').toLowerCase();

            if (activeTab === 'HEAD_SPA') {
                return rType === 'HEAD_SPA' || rTitle.includes('gội') || rTitle.includes('tóc') || rTitle.includes('head');
            }
            if (activeTab === 'BODY_SPA') {
                return rType === 'BODY_SPA' || rTitle.includes('body') || rTitle.includes('massage');
            }
            if (activeTab === 'NAIL_SPA') {
                return rType === 'NAIL_SPA' || rTitle.includes('nail') || rTitle.includes('móng');
            }
            return true;
        });
    }, [resources, activeTab]);


    // --- SYNC SEARCH SCROLL ---
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

    // --- SCROLL TO PREFERRED TIME SLOT ---
    useEffect(() => {
        if (!highlightTime) return;
        setTimeout(() => {
            const container = document.querySelector('.rbc-time-content');
            if (!container) return;
            // Each 30-min slot = 60px (min-height). Calendar starts at 08:00
            const [hh, mm] = highlightTime.split(':').map(Number);
            const totalMinutesFrom8 = (hh - 8) * 60 + (mm || 0);
            const px = Math.max(0, (totalMinutesFrom8 / 30) * 60 - 60); // 1 slot = 60px, offset -60 so it appears near top
            container.scrollTo({ top: px, behavior: 'smooth' });
        }, 150);
    }, [highlightTime]);

    // slotPropGetter: mark time band class (animation only applied to matching cols via dynamic CSS below)
    const slotPropGetter = useCallback((slotDate) => {
        if (!highlightTime) return {};
        const [hh, mm] = highlightTime.split(':').map(Number);
        const slotMins = slotDate.getHours() * 60 + slotDate.getMinutes();
        const startMins = hh * 60 + mm;
        if (slotMins >= startMins && slotMins < startMins + 60) {
            return { className: 'slot-time-highlight' };
        }
        return {};
    }, [highlightTime]);

    // Dynamic CSS: only animate slot-time-highlight inside matching resource columns
    // .rbc-time-content: 1st child = gutter, then resources in order → nth-child(i+2)
    const dynamicSlotCSS = React.useMemo(() => {
        if (!highlightTime || !highlightRoomType || !filteredResources?.length) return '';
        const selectors = filteredResources
            .map((r, i) => {
                const rType = r.roomType || r.type || '';
                const rTitle = (r.title || r.name || '').toLowerCase();
                let matches = false;
                if (highlightRoomType === 'HEAD_SPA') matches = rType === 'HEAD_SPA' || rTitle.includes('gội') || rTitle.includes('tóc');
                else if (highlightRoomType === 'BODY_SPA') matches = rType === 'BODY_SPA' || rTitle.includes('body') || rTitle.includes('massage');
                else if (highlightRoomType === 'NAIL_SPA') matches = rType === 'NAIL_SPA' || rTitle.includes('nail') || rTitle.includes('móng');
                if (!matches) return null;
                // +2 because nth-child is 1-based and gutter is first child
                return `.rbc-time-content > .rbc-day-slot:nth-child(${i + 2}) .slot-time-highlight`;
            })
            .filter(Boolean)
            .join(', ');
        if (!selectors) return '';
        return `${selectors} { animation: slot-highlight 0.75s ease-in-out infinite !important; background: rgba(24,144,255,0.18) !important; }`;
    }, [highlightTime, highlightRoomType, filteredResources]);

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
            backgroundColor: 'white',
            color: '#333',
            borderRadius: '4px',
            border: '1px solid #d9d9d9',
            fontSize: '12px',
            fontWeight: '600',
            overflow: 'hidden',
            boxSizing: 'border-box',
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
                 // Trễ → Trắng + viền cam nhấp nháy (outline không ảnh hưởng kích thước)
                 newStyle.backgroundColor = 'white';
                 newStyle.border = '1px solid #fa8c16';
                 newStyle.outline = '2px solid #fa8c16';
                 newStyle.outlineOffset = '-1px';
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
            newStyle.outline = '2px solid #f5222d';
            newStyle.outlineOffset = '-1px';
            newStyle.zIndex = 100;
        }

        return {
            style: newStyle,
            className: className
        };
    }, [highlightBookingId]);

    // [OPTIMIZATION] Memoize components to prevent infinite re-renders in RBC
    const { components, messages } = React.useMemo(() => {
        // Custom Resource Header - blinks if matches highlightRoomType
        const CustomResourceHeader = ({ label, resource }) => {
            const isMatch = highlightRoomType && (
                resource.roomType === highlightRoomType ||
                resource.type === highlightRoomType
            );
            return (
                <div
                    title={resource.title}
                    className={isMatch ? 'resource-header-highlight' : ''}
                    style={{
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        fontWeight: 600,
                        padding: '4px 2px',
                        borderRadius: isMatch ? 4 : 0,
                    }}
                >
                    {label}
                </div>
            );
        };

        // Custom Event Component
        const CustomEvent = ({ event }) => {

            return (
                <Popover 
                    title={<div style={{ fontWeight: 700 }}>📋 Chi tiết lịch hẹn</div>} 
                    content={
                        <div style={{ padding: 4, maxWidth: 300 }}>
                            <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 700, color: '#1890ff', borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>
                                <UserOutlined /> {event.title}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div><ClockCircleOutlined style={{ marginRight: 6, color: '#fa8c16' }} /> <strong>{dayjs(event.start).format('HH:mm')} - {dayjs(event.end).format('HH:mm')}</strong></div>
                                {event.phone && <div><PhoneOutlined style={{ marginRight: 6, color: '#52c41a' }} /> {event.phone}</div>}
                                {event.serviceName && <div><SkinOutlined style={{ marginRight: 6, color: '#eb2f96' }} /> {event.serviceName}</div>}
                                {event.note && <div style={{ background: '#fff7e6', padding: 4, borderRadius: 4, fontStyle: 'italic', color: '#d46b08', fontSize: 12 }}>📝 "{event.note}"</div>}
                            </div>
                        </div>
                    }
                    overlayStyle={{ zIndex: 9999 }}
                    trigger="hover"
                >
                    <div style={{
                        height: '100%',
                        overflow: 'hidden',
                        padding: '2px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 1,
                        boxSizing: 'border-box',
                    }}>
                        <div style={{
                            fontWeight: 700,
                            fontSize: 11,
                            lineHeight: '14px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {event.title}
                        </div>
                        <div style={{
                            fontSize: 10,
                            lineHeight: '12px',
                            opacity: 0.85,
                            whiteSpace: 'nowrap',
                        }}>
                            {dayjs(event.start).format('HH:mm')}–{dayjs(event.end).format('HH:mm')}
                        </div>
                    </div>
                </Popover>
            );
        };

        return {
            components: {
                event: CustomEvent,
                toolbar: () => null, // We render toolbar manually above
                resourceHeader: CustomResourceHeader,
            },
            messages: {
                next: "Sau",
                previous: "Trước",
                today: "Hôm nay",
                day: "Ngày",
                noEventsInRange: "Trống lịch."
            }
        };
    }, [highlightRoomType]); // re-create when highlight type changes

    const availableRanges = React.useMemo(() => {
        const targetResources = filteredResources; // [CHANGED] Use filtered
        if (!targetResources || targetResources.length === 0) return "Không có phòng trong khu vực này.";
        
        const startOfDay = dayjs(date).hour(9).minute(0);
        const endOfDay = dayjs(date).hour(18).minute(0);
        const suggestions = []; 
        
        const totalRooms = targetResources.length;
        
        let currentSlot = startOfDay;
        while (currentSlot.isBefore(endOfDay)) {
            const nextSlot = currentSlot.add(30, 'minute');
            
            let busyCount = 0;
            (events || []).forEach(b => {
                // Only count events for resources in the current filter
                if (!targetResources.find(r => r.id === b.resourceId)) return;

                const bStart = dayjs(b.start);
                const bEnd = dayjs(b.end);
                if (bStart.isBefore(nextSlot) && bEnd.isAfter(currentSlot) && b.status !== 'cancelled') {
                    busyCount++;
                }
            });

            const freeCount = totalRooms - busyCount;
            if (freeCount > 0) {
                const last = suggestions[suggestions.length - 1];
                if (last && last.end.isSame(currentSlot) && last.count === freeCount) {
                     last.end = nextSlot;
                } else {
                     suggestions.push({ start: currentSlot, end: nextSlot, count: freeCount });
                }
            }
            currentSlot = nextSlot;
        }
        
        suggestions.sort((a,b) => (b.end.diff(b.start)) - (a.end.diff(a.start)));
        
        if (suggestions.length === 0) return "Khu vực này đã kín lịch!";

        return suggestions.slice(0, 3).map((s, idx) => (
            <span key={idx} style={{ marginRight: 15 }}>
                {s.start.format('HH:mm')} - {s.end.format('HH:mm')} 
                <span style={{ color: '#52c41a', marginLeft: 4 }}>(Còn {s.count} phòng)</span>
                {idx < 2 && idx < suggestions.length - 1 ? ',' : ''}
            </span>
        ));
    }, [events, filteredResources, date, resources]);

    return (
        <div style={{ minHeight: 600, background: 'white', padding: 0, borderRadius: 12, overflow: 'visible', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0' }}>
            {/* CSS FOR FLASH & PULSE & CLEAN GRID */}
            <style>{`
                @keyframes flash { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); } 50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); } }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); } }
                @keyframes col-highlight { 0%, 100% { background: rgba(24,144,255,0.12); color: #003a8c; } 50% { background: rgba(24,144,255,0.45); color: #002766; } }
                .resource-header-highlight { animation: col-highlight 0.75s ease-in-out infinite; border-radius: 4px; }
                @keyframes slot-highlight { 0%, 100% { background: rgba(24,144,255,0.07); } 50% { background: rgba(24,144,255,0.22); } }
                /* slot-time-highlight base: no animation — applied only to matching cols via dynamic CSS */
                .slot-time-highlight { background: transparent; }
                
                .rbc-calendar { font-family: 'Inter', sans-serif !important; }
                
                /* Header cells - base */
                .rbc-header { 
                    padding: 12px 4px !important; 
                    font-weight: 600 !important; 
                    color: #595959 !important; 
                    font-size: max(11px, 0.7rem) !important; 
                    letter-spacing: 0.5px; 
                    border-bottom: 2px solid #ddd !important; 
                    border-right: 1px solid #f0f0f0 !important;
                    background: #fafafa !important;
                    overflow: visible !important; /* Show room names */
                    white-space: normal !important;
                    line-height: 1.3 !important;
                    height: auto !important;
                    min-height: 50px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center !important;
                    box-sizing: border-box !important;
                    flex: 1 1 0 !important; /* Equal width from parent */
                    min-width: 0 !important;
                    width: auto !important; /* Allow flex to control width */
                }

                /* Removed duplicate .rbc-header style */
                .rbc-time-view { border: none !important; }
                .rbc-time-content { border: none !important; }
                .rbc-timeslot-group { border-bottom: 1px dashed #f5f5f5 !important; min-height: 60px !important; } 
                .rbc-day-slot { border-left: 1px dashed #f5f5f5 !important; }
                .rbc-today { background-color: #fff !important; }
                .rbc-time-gutter .rbc-timeslot-group { border-bottom: none !important; }
                
                /* FIX: Header gutter + body gutter same width */
                .rbc-time-header-gutter,
                .rbc-time-gutter {
                    flex: none !important;
                    width: 60px !important;
                    min-width: 60px !important;
                    max-width: 60px !important;
                    margin-right: 0 !important; /* Override RBC default margin-right: -1px */
                    border-right: 1px solid #ddd !important; /* Consistent gutter border */
                    box-sizing: border-box !important;
                }
                .rbc-label { color: #8c8c8c !important; font-size: max(10px, 0.65rem) !important; }
                .rbc-current-time-indicator { background-color: #ff4d4f !important; height: 2px !important; }
                
                /* ẨN label giờ mặc định của RBC — kích thước ô do thời lượng quyết định */
                .rbc-event-label { display: none !important; }
                /* CustomEvent fill toàn bộ chiều cao ô */
                .rbc-event-content { height: 100% !important; overflow: hidden !important; }
                /* Đảm bảo mọi event cùng box-model, không bị border thay đổi kích thước */
                .rbc-event { box-sizing: border-box !important; border-width: 1px !important; }
                
                .rbc-time-view .rbc-row { min-height: 20px; } /* Reset min-height */
                
                /* HIDE DATE ROW - keep resource row visible */
                .rbc-time-header .rbc-row.rbc-time-header-cell { display: none !important; } /* Hide duplicate date cells */
                .rbc-toolbar { display: none !important; }
                
                /* RESOURCE HEADER ROW - show room names */
                .rbc-row-resource {
                    display: flex !important;
                    width: 100% !important;
                    min-height: 45px !important;
                    background: #fafafa !important;
                    border-bottom: 2px solid #ddd !important;
                }
                .rbc-row-resource .rbc-header {
                    flex: 1 1 0 !important;
                    min-width: 0 !important;
                    max-width: none !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 8px 2px !important;
                    font-weight: 600 !important;
                    font-size: clamp(10px, 1vw, 13px) !important; /* Co lại theo viewport */
                    color: #595959 !important;
                    border-right: 1px solid #f0f0f0 !important;
                    border-left: 1px dashed #f5f5f5 !important;
                    white-space: nowrap !important;      /* Không xuống dòng */
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;  /* Hiện ... nếu quá dài */
                    text-align: center !important;
                    box-sizing: border-box !important;
                } 
                
                /* [FIX 1] PERFECT HEADER/BODY ALIGNMENT - SCROLLBAR GUTTER */
                /* KEY: Cả 2 phải dùng CÙNG width scrollbar thì cột mới thẳng hàng */
                .rbc-time-content {
                    scrollbar-width: thin !important; /* Firefox */
                }
                .rbc-time-content::-webkit-scrollbar { 
                    width: 8px !important; /* Custom width - body scrollbar */
                }
                .rbc-time-content::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
                .rbc-time-content::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
                .rbc-time-content::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
                
                /* Header: cùng overflow-y:scroll + cùng 8px → chiếm layout space bằng nhau */
                .rbc-time-view .rbc-time-header { 
                    overflow-y: scroll !important;
                    overflow-x: hidden !important;
                    scrollbar-width: thin !important; /* Firefox: same as body */
                }
                /* Header scrollbar: CÙNG 8px nhưng trong suốt → không nhìn thấy */
                .rbc-time-view .rbc-time-header::-webkit-scrollbar {
                    width: 8px !important; /* PHẢI bằng body: 8px */
                }
                .rbc-time-view .rbc-time-header::-webkit-scrollbar-track,
                .rbc-time-view .rbc-time-header::-webkit-scrollbar-thumb {
                    background: transparent !important;
                    border: none !important;
                }
                
                /* [FIX 2] ẨN HÀNG ALL-DAY TRỐNG - khoảng trắng giữa header và body */
                .rbc-time-view .rbc-allday-cell,
                .rbc-time-view .rbc-row.rbc-allday-row,
                .rbc-time-view .rbc-allday-events,
                .rbc-time-header-content > .rbc-row:not(.rbc-row-resource):not(.rbc-time-header-cell) {
                    display: none !important;
                    height: 0 !important;
                    overflow: hidden !important;
                }

                /* [FIX] CRITICAL UI ALIGNMENT & LAYOUT */
                
                /* X-SCROLL MASTER CONTAINER */
                .rbc-time-view { 
                    overflow-x: auto !important; 
                    overflow-y: visible !important;
                    display: flex !important; 
                    flex-direction: column !important; 
                    width: 100% !important; 
                }
                
                /* CHILD CONTAINERS */
                .rbc-time-view .rbc-time-header { 
                    flex: none !important; 
                    width: 100% !important;
                    margin: 0 !important;
                    box-sizing: border-box !important;
                    display: flex !important;
                    flex-wrap: nowrap !important;
                }
                
                .rbc-time-content { 
                    flex: 1 !important; 
                    width: 100% !important;
                    overflow-y: scroll !important;
                    overflow-x: hidden !important;
                    border-top: 1px solid #eee;
                    display: flex !important;
                    flex-wrap: nowrap !important;
                    box-sizing: border-box !important;
                }
                
                /* [FIX 2] Each resource gets its own .rbc-time-header-content */
                /* Must use flex: 1 1 0 so all 10 resources share width equally */
                .rbc-time-header-content { 
                    flex: 1 1 0 !important;  /* Equal distribution */
                    min-width: 0 !important;  /* Allow shrinking */
                    width: auto !important;   /* Don't force 100% */
                    margin: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    border: none !important;  /* Remove RBC default border-left: 1px solid #ddd */
                    padding: 0 !important;
                    box-sizing: border-box !important;
                }
                /* Remove RBC default margin-left: -1px between adjacent header-content */
                .rbc-time-header-content + .rbc-time-header-content {
                    margin-left: 0 !important;
                }
                
                /* Rows inside each resource header - fill parent */
                .rbc-time-header-content > .rbc-row { 
                    width: 100% !important;
                    display: flex !important; 
                    flex-wrap: nowrap !important;
                }
                
                /* Time content rows */
                .rbc-time-content > * > .rbc-row { 
                    width: 100% !important;
                    display: flex !important; 
                    flex-wrap: nowrap !important; 
                }
                
                /* Day slots styling - must match header exactly */
                .rbc-day-slot {
                    flex: 1 1 0 !important; /* Equal width distribution */
                    min-width: 0 !important; /* Override RBC default min-width: 140px */
                    max-width: none !important;
                    border-right: 1px solid #f0f0f0 !important;
                    border-left: 1px dashed #f5f5f5 !important;
                    box-sizing: border-box !important;
                    padding: 0 !important; /* No horizontal padding */
                }
                /* Override RBC resource view defaults that force fixed widths */
                .rbc-time-view-resources .rbc-day-slot {
                    min-width: 0 !important;
                }
                .rbc-time-view-resources .rbc-header,
                .rbc-time-view-resources .rbc-day-bg {
                    width: auto !important;
                }
                /* Remove overflowing border that shifts header */
                .rbc-time-header.rbc-overflowing {
                    border-right: none !important;
                }

                /* [FIX 3] BOOKING BLOCK PERFECT FILL - ZERO GAPS */
                
                /* Remove all padding from parent containers */
                .rbc-events-container {
                    padding: 0 !important;
                    margin: 0 !important;
                }
                
                .rbc-event-label {
                    padding: 0 !important;
                    margin: 0 !important;
                }
                
                .rbc-day-slot .rbc-events-container {
                    padding: 0 !important;
                    margin: 0 !important;
                }
                
                /* Booking block fills 100% with ZERO gaps */
                .rbc-event { 
                    width: calc(100% + 1px) !important; /* +1px to cover right border */
                    left: 0 !important; 
                    right: 0 !important; 
                    margin: 0 !important; 
                    padding: 0 !important;
                    border-radius: 0px !important;
                    box-shadow: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    border-top: 1px solid rgba(0,0,0,0.1) !important;
                    border-bottom: 1px solid rgba(0,0,0,0.1) !important;
                    font-size: max(11px, 0.7rem) !important;
                }
                
                /* Ensure content inside event fills space */
                .rbc-event-content {
                    width: 100% !important;
                    height: 100% !important;
                    padding: 2px 4px !important; /* Internal padding for text readability */
                    font-size: max(11px, 0.7rem) !important;
                    box-sizing: border-box !important;
                }
                
                /* Zoom-aware event text */
                @media (max-width: 800px) {
                    .rbc-event, .rbc-event-content {
                        font-size: max(9px, 0.6rem) !important;
                    }
                }

                /* Removed duplicate .rbc-header style */
                
                .rbc-time-header-content > .rbc-row.rbc-time-header-cell { display: flex; width: 100%; }
                .rbc-time-header-cell .rbc-header { flex: 1; }
                
                /* Mobile responsive optimizations */
                @media (max-width: 768px) {
                    .rbc-time-view {
                        font-size: 12px !important;
                    }
                    .rbc-header {
                        padding: 8px 2px !important;
                        font-size: max(10px, 0.65rem) !important;
                    }
                    .rbc-label {
                        font-size: max(9px, 0.6rem) !important;
                    }
                    .rbc-timeslot-group {
                        min-height: 40px !important;
                    }
                }
                @media (max-width: 480px) {
                    .rbc-header {
                        padding: 6px 1px !important;
                        font-size: max(9px, 0.55rem) !important;
                    }
                    .rbc-day-slot {
                        width: 80px !important;
                        min-width: 80px !important;
                        flex: 0 0 80px !important;
                    }
                }
            `}</style>
            {/* Dynamic: highlight time slots only in matching resource columns */}
            {dynamicSlotCSS && <style>{dynamicSlotCSS}</style>}
            
            {/* [NEW] TABS HEADER */}
            <div style={{ padding: '8px 16px 0 16px', background: '#fff', borderBottom: '1px solid #f0f0f0', overflowX: 'auto', overflowY: 'visible' }}>
                 <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    type="card"
                    size="small"
                    tabBarStyle={{ marginBottom: 0, minWidth: 'max-content' }}
                    items={[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'HEAD_SPA', label: '💆 Gội' },
                        { key: 'BODY_SPA', label: '🛁 Body' },
                        { key: 'NAIL_SPA', label: '💅 Nail' }
                    ]}
                />
            </div>
            
            {/* CUSTOM TOOLBAR */}
            <CustomToolbar date={date} onNavigate={onNavigate} />

            {/* SUGGESTION BANNER */}
             <div className="suggestion-banner" style={{ padding: '8px 16px', background: '#f6ffed', borderBottom: '1px solid #b7eb8f', color: '#389e0d', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, fontSize: 13, flexWrap: 'wrap', overflowX: 'auto' }}>
                <ClockCircleOutlined style={{ fontSize: 16 }} />
                <span style={{ minWidth: 0, flex: '1 1 auto' }}><strong>Giờ trống ({activeTab === 'all' ? 'Tất cả' : activeTab === 'HEAD_SPA' ? 'Gội' : activeTab === 'BODY_SPA' ? 'Body' : 'Nail'}):</strong> {availableRanges}</span>
             </div>
             <style>{`
                @media (max-width: 768px) {
                    .suggestion-banner {
                        padding: 6px 12px !important;
                        font-size: 11px !important;
                    }
                    .suggestion-banner svg {
                        font-size: 14px !important;
                    }
                }
                @media (max-width: 480px) {
                    .suggestion-banner {
                        padding: 4px 8px !important;
                        font-size: 10px !important;
                    }
                }
             `}</style>

             <div style={{ minHeight: 500, height: 500, overflow: 'hidden' }}>
                <DnDCalendar
                    localizer={localizer}
                    events={events} // Events passed are all events
                    style={{ height: '100%' }}
                    defaultView={Views.DAY}
                    views={[Views.DAY]}
                    
                    // Resource View Props
                    resources={filteredResources} // [NEW] Filtered Resources
                    resourceIdAccessor="id"
                    resourceTitleAccessor="title" // Display short names: Body-1, Body-2, Gội-1, nail-1
                    
                    // Drag & Drop Handlers
                    onEventDrop={onEventDrop}
                    onEventResize={onEventResize}
                    onSelectEvent={onSelectEvent}
                    onSelectSlot={onSelectSlot}
                    
                    // Customization
                    step={30}
                    timeslots={2}
                    min={new Date(2000, 0, 1, 8, 0, 0)} // 8:00 AM
                    max={new Date(2000, 0, 1, 21, 0, 0)} // 21:00 - buffer để thấy rõ 20:00
                    slotPropGetter={slotPropGetter}
                    
                    formats={{
                        dayHeaderFormat: (date) => '', // HIDE DATE (e.g. 11) from header
                    }}

                    date={dayjs(date).isValid() ? dayjs(date).toDate() : new Date()}
                    onNavigate={onNavigate}
                    eventPropGetter={eventPropGetter}
                    
                    // COMPONENTS OVERRIDE
                    components={components} // [OPTIMIZED]
                    messages={messages} // [OPTIMIZED]
                    
                    // Tắt all-day row (không cần cho spa)
                    allDayAccessor={() => false}
                    
                    // DnD Props
                    draggableAccessor={() => true}
                    resizable={true}
                    onDropFromOutside={onDropFromOutside}
                    dragFromOutsideItem={() => draggedWaitlistItem ? { title: draggedWaitlistItem.customerName || 'Waitlist', start: new Date(), end: new Date() } : null}
                />
            </div>
        </div>
    );
};

export default DnDCalendarView;
