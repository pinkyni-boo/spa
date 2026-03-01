import { useState, useEffect, useRef, useCallback } from 'react';
import { App } from 'antd';
import dayjs from 'dayjs';
import { toCalendarDate } from '../../../../config/dateHelper';

// Services
import { adminBookingService } from '../../../../services/adminBookingService';
import { resourceService } from '../../../../services/resourceService';
import { branchService } from '../../../../services/branchService';

export const useBookingData = () => {
    const { message, notification } = App.useApp();
    // STATE
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // FILTERS
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [filterStaff, setFilterStaff] = useState(null); 
    const [filterPayment, setFilterPayment] = useState(null);
    const [filterBranch, setFilterBranch] = useState(null);

    // AUTH / CONFIG
    const [userRole, setUserRole] = useState(null);
    const [managedBranches, setManagedBranches] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // POLLING
    const knownIdsRef = useRef(new Set());
    const filterRef   = useRef({});
    const roomsRef    = useRef([]);  // để transform bookings mà không cần refetch rooms

    // 1. INITIALIZE (AUTH & BRANCH)
    useEffect(() => {
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
                            setIsInitialized(true); 
                        }
                    });
                } else {
                    // Admin sees assigned branches
                    setManagedBranches(u.managedBranches || []);
                    
                     // [AUTO-MAPPING] If Admin manages only 1 branch, force lock it
                    if (u.role === 'admin' && u.managedBranches?.length === 1) {
                        setFilterBranch(u.managedBranches[0]._id || u.managedBranches[0]);
                    } else if (u.role === 'admin' && u.managedBranches?.length > 1) {
                         setFilterBranch(u.managedBranches[0]._id || u.managedBranches[0]); // Default to first
                    }
                    setIsInitialized(true); 
                }
            } catch (e) { 
                console.error("Parse user error", e); 
                setIsInitialized(true); 
            }
        } else {
            setIsInitialized(true); 
        }
    }, []);

    // 2. FETCH DATA FUNCTION
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Resources FIRST
            const [roomsRes, bedsRes, staffRes, servicesRes] = await Promise.all([
                resourceService.getAllRooms(),
                resourceService.getAllBeds(filterBranch ? { branchId: filterBranch } : {}),
                resourceService.getAllStaff(),
                adminBookingService.getServices()
            ]);

            // Handle Staff
            if (staffRes.success) setStaffs(staffRes.staff || []);

            // Handle Services
            if (servicesRes && (servicesRes.success || Array.isArray(servicesRes))) {
                 const list = Array.isArray(servicesRes) ? servicesRes : (servicesRes.services || []);
                 setServices(list);
            }

            // Handle Rooms and Build Resources
            let transformedResources = [];

            let allRooms = [];
            if (roomsRes.success || Array.isArray(roomsRes.rooms) || Array.isArray(roomsRes)) {
                allRooms = roomsRes.rooms || roomsRes;
                if (!Array.isArray(allRooms)) allRooms = [];
                if (filterBranch) {
                    allRooms = allRooms.filter(r => {
                        const rBranchId = r.branchId?._id || r.branchId;
                        return rBranchId === filterBranch;
                    });
                }
            }

            // Room name shortener
            const shortName = (name) => {
                let s = name.replace(/Phòng|Khu|Spa|Quận 1|TPHCM|Q1|\(.*?\)|-|\|/gi, '').trim();
                return s.length >= 2 ? s : name;
            };

            // [MULTI-BED] Use real beds if available, else fall back to capacity
            const allBeds = (bedsRes.success && bedsRes.beds) ? bedsRes.beds : [];

            // Build room lookup
            const roomById = {};
            allRooms.forEach(r => { roomById[r._id] = r; });

            if (allBeds.length > 0) {
                // Build resources from beds, grouped visually by room
                const bedsByRoom = {};
                allBeds.forEach(bed => {
                    const roomId = bed.roomId?._id || bed.roomId;
                    if (!bedsByRoom[roomId]) bedsByRoom[roomId] = [];
                    bedsByRoom[roomId].push(bed);
                });

                allRooms.forEach(room => {
                    const roomBeds = bedsByRoom[room._id] || [];
                    if (roomBeds.length > 0) {
                        roomBeds.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                        roomBeds.forEach(bed => {
                            transformedResources.push({
                                ...bed,
                                id: bed._id,
                                title: `${shortName(room.name)} - ${bed.name.replace(/gi[uư]ờng\s*/i, '')}`,
                                parentRoomId: room._id,
                                isBed: true,
                                roomType: room.type
                            });
                        });
                    } else {
                        // Room has no beds yet — show room itself
                        transformedResources.push({
                            ...room,
                            id: room._id,
                            title: shortName(room.name)
                        });
                    }
                });
            } else {
                // Legacy: capacity-based virtual beds
                const multiBedRoomMap = {};
                allRooms.forEach(room => {
                    const capacity = room.capacity || 1;
                    if (capacity > 1) {
                        multiBedRoomMap[room._id] = true;
                        for (let i = 1; i <= capacity; i++) {
                            transformedResources.push({
                                ...room,
                                id: `${room._id}_bed_${i}`,
                                title: `${shortName(room.name)} - ${i}`,
                                parentRoomId: room._id,
                                isBed: true
                            });
                        }
                    } else {
                        transformedResources.push({ ...room, id: room._id, title: shortName(room.name) });
                    }
                });
            }

            setRooms([...transformedResources]);
            roomsRef.current = [...transformedResources];

            // Security Check for Bookings
            let shouldFetchBookings = true;
            if (userRole === 'admin' && !filterBranch) shouldFetchBookings = false;

            // Fetch Bookings
            if (shouldFetchBookings) {
                const params = {
                    branchId: filterBranch,
                    staffId: filterStaff,
                    paymentStatus: filterPayment
                };
                
                const result = await adminBookingService.getAllBookings(params);

                if (result.success) {
                    const transformedBookings = (result.bookings || []).map((booking) => {
                        try {
                            let resourceId = null;

                            // [MULTI-BED] Use bedId if available
                            if (booking.bedId) {
                                resourceId = typeof booking.bedId === 'object' ? booking.bedId._id : booking.bedId;
                            } else if (booking.roomId) {
                                // Legacy: fall back to room (or _bed_1 for multi-capacity rooms)
                                const rId = typeof booking.roomId === 'object' ? booking.roomId._id : booking.roomId;
                                const room = roomById[rId];
                                if (room && (room.capacity || 1) > 1 && allBeds.length === 0) {
                                    resourceId = `${rId}_bed_1`;
                                } else {
                                    resourceId = rId;
                                }
                            }

                            return {
                                ...booking,
                                start: toCalendarDate(booking.startTime),
                                end: toCalendarDate(booking.endTime),
                                title: booking.customerName || 'Khách',
                                resourceId: resourceId || 'unassigned'
                            };
                        } catch (err) {
                            return null;
                        }
                    }).filter(b => b !== null);
                    
                    setBookings(transformedBookings);
                    knownIdsRef.current = new Set(transformedBookings.map(b => b._id));
                    filterRef.current   = { branchId: filterBranch, staffId: filterStaff, paymentStatus: filterPayment };
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // 3. EFFECT: FETCH ON FILTER CHANGE
    useEffect(() => {
        if (isInitialized) {
            fetchData();
        }
    }, [isInitialized, filterBranch, filterStaff, filterPayment, currentDate]);

    // 4. SILENT REFRESH — only re-fetch bookings, no loading spinner
    const refreshBookings = useCallback(async () => {
        try {
            const params = filterRef.current;
            const result = await adminBookingService.getAllBookings(params);
            if (!result.success) return;

            const incoming = result.bookings || [];
            const newOnes  = incoming.filter(b => !knownIdsRef.current.has(b._id));

            const resources = roomsRef.current;
            // Build roomById lookup for legacy capacity fallback
            const roomById = {};
            resources.forEach(r => { if (r.parentRoomId) { /* bed */ } else { roomById[r._id] = r; } });

            const transformedBookings = incoming.map((booking) => {
                try {
                    let resourceId = null;
                    if (booking.bedId) {
                        resourceId = typeof booking.bedId === 'object' ? booking.bedId._id : booking.bedId;
                    } else if (booking.roomId) {
                        const rId = typeof booking.roomId === 'object' ? booking.roomId._id : booking.roomId;
                        const room = roomById[rId];
                        if (room && (room.capacity || 1) > 1) {
                            resourceId = `${rId}_bed_1`;
                        } else {
                            resourceId = rId;
                        }
                    }
                    return {
                        ...booking,
                        start: toCalendarDate(booking.startTime),
                        end:   toCalendarDate(booking.endTime),
                        title: booking.customerName || 'Khách',
                        resourceId: resourceId || 'unassigned'
                    };
                } catch { return null; }
            }).filter(Boolean);

            setBookings(transformedBookings);
            knownIdsRef.current = new Set(transformedBookings.map(b => b._id));

            if (newOnes.length > 0) {
                notification.success({
                    message: '🔔 Có đơn đặt lịch mới!',
                    description: newOnes.map(b => {
                        const timeStr = b.startTime
                            ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(b.startTime))
                            : '';
                        return `${b.customerName || 'Khách'} — ${b.serviceName || ''} lúc ${timeStr}`;
                    }).join('\n'),
                    duration: 8,
                    placement: 'topRight',
                });
            }
        } catch (err) {
            console.error('Silent refresh error:', err);
        }
    }, [notification]); // dùng refs → không bị stale closure theo filter

    // 5. POLLING mỗi 5 giây
    useEffect(() => {
        if (!isInitialized) return;
        const id = setInterval(refreshBookings, 5000);
        return () => clearInterval(id);
    }, [isInitialized, refreshBookings]);

    return {
        bookings, setBookings,
        rooms, staffs, services,
        loading, setLoading,
        filterBranch, setFilterBranch,
        filterStaff, setFilterStaff,
        filterPayment, setFilterPayment, // Exposed if needed later
        currentDate, setCurrentDate,
        userRole, managedBranches,
        fetchData, refreshBookings
    };
};
