import { message } from 'antd';
import dayjs from 'dayjs';
import { adminBookingService } from '../../../../services/adminBookingService';

export const useBookingActions = ({
    // Data
    bookings, rooms, services, 
    // State Values
    filterBranch, draggedWaitlistItem,
    // Actions
    fetchData,
    // Setters
    setIsModalVisible, setDrawerVisible, setSelectedBooking, setIsEditing, setDraggedWaitlistItem, setRefreshWaitlist
}) => {

    const handleCreateSubmit = async (values) => {
         const data = {
             customerName: values.customerName,
             phone: values.phone,
             serviceName: values.serviceName,
             date: values.date.format('YYYY-MM-DD'),
             time: values.time,
             branchId: filterBranch 
         };
         
         if (!filterBranch) {
             message.error("Vui lòng chọn chi nhánh trước khi tạo đơn!");
             return;
         }

         try {
            await adminBookingService.createBooking(data);
            message.success("Tạo đơn thành công");
            setIsModalVisible(false);
            fetchData();
         } catch (error) {
             message.error("Tạo đơn thất bại");
         }
    };

    const handleSearchSelect = (value, option) => {
        const booking = option.booking;
        if (booking) {
            setSelectedBooking(booking);
            setIsEditing(true);
            setDrawerVisible(true); // Open drawer on select
        }
    };

    // Note: handleViewChange is trivial (setViewMode), kept in component or passed directly.

    const handleApprove = async (bookingId) => {
        try {
            const result = await adminBookingService.approveBooking(bookingId);
            if (result.success) {
                message.success('Đã duyệt đơn');
                await fetchData(); 
            } else {
                message.error(result.message || 'Không thể duyệt đơn');
            }
        } catch (error) {
            message.error('Không thể duyệt đơn');
        }
    };

    const handleInvoiceSubmit = async (invoiceData) => {
        try {
            await adminBookingService.createInvoice(invoiceData);
            message.success('Thanh toán thành công');
            setSelectedBooking(null);
            fetchData();
        } catch (error) {
            message.error('Thanh toán thất bại');
        }
    };

    const handleAction = async (action, bookingId, data) => {
        try {
            let result;
            switch(action) {
                case 'checkIn':
                    result = await adminBookingService.checkIn(bookingId);
                    if (result.success) message.success('Check-in thành công');
                    break;
                case 'complete':
                    result = await adminBookingService.completeBooking(bookingId);
                    if (result.success) message.success('Hoàn thành');
                    break;
                case 'cancel':
                    result = await adminBookingService.cancelBooking(bookingId);
                    if (result.success) message.success('Đã hủy');
                    break;
                case 'approve': 
                    result = await adminBookingService.approveBooking(bookingId);
                    if (result.success) message.success('Đã duyệt đơn hàng');
                    break;
                case 'update':
                    result = await adminBookingService.updateBooking(bookingId, data);
                    if (result.success) message.success('Đã cập nhật');
                    break;
                case 'upsell_save':
                     // Create Linked Booking Logic
                     if (data && data.addedService) {
                         const currentBooking = data.booking;
                         const newServiceData = data.addedService; // { name, price, qty } 
                         
                         // 1. Find Real Service Object
                         const foundService = services.find(s => s.name === newServiceData.name);
                         
                         if (!foundService) {
                             message.error(`Không tìm thấy dịch vụ: ${newServiceData.name}`);
                             break;
                         }

                         // 2. Determine Duration
                         let duration = foundService.duration || 60; 

                         const startTimeObj = dayjs(currentBooking.endTime); 
                         const endTimeObj = startTimeObj.add(duration, 'minute');

                         // 3. AUTO-ASSIGN ROOM
                         let targetType = foundService.requiredRoomType || 'BODY_SPA'; 
                         const sName = foundService.name.toLowerCase();
                         
                         const headKeywords = ['gội', 'hair', 'tóc', 'head', 'dưỡng sinh', 'shampoo', 'wash'];
                         const nailKeywords = ['nail', 'móng', 'tay', 'chân', 'sơn', 'gel', 'da', 'bột', 'dũa', 'úp', 'gắn', 'đắp', 'vẽ', 'ẩn', 'xà cừ', 'ombre', 'mắt mèo', 'cat eye', 'tháo'];

                         if (headKeywords.some(k => sName.includes(k))) {
                             targetType = 'HEAD_SPA';
                         } else if (nailKeywords.some(k => sName.includes(k))) {
                             targetType = 'NAIL_SPA';
                         }
                         
                         // Find active room
                         const suitableRooms = rooms.filter(r => {
                             if (!r.isActive) return false;
                             if (r.type === targetType) return true;
                             
                             const rName = (r.name || '').toLowerCase();
                             if (targetType === 'NAIL_SPA' && (rName.includes('nail') || rName.includes('móng'))) return true;
                             if (targetType === 'HEAD_SPA' && (rName.includes('gội') || rName.includes('hair') || rName.includes('tóc'))) return true;
                             
                             return false;
                         });

                         let assignedRoomId = null;
                         
                         const freeRoom = suitableRooms.find(room => {
                             const isBusy = bookings.some(b => {
                                 if (b.resourceId === room._id && b.status !== 'cancelled') {
                                     const bStart = dayjs(b.start);
                                     const bEnd = dayjs(b.end);
                                     return startTimeObj.isBefore(bEnd) && endTimeObj.isAfter(bStart);
                                 }
                                 return false;
                             });
                             return !isBusy;
                         });

                         if (freeRoom) {
                             assignedRoomId = freeRoom._id;
                         } else if (suitableRooms.length > 0) {
                             assignedRoomId = suitableRooms[0]._id;
                         } else {
                             if (targetType === 'NAIL_SPA') {
                                 message.error('Không tìm thấy phòng Nail trống! Vui lòng kiểm tra lại.');
                                 return; 
                             }
                         }

                         const newBookingData = {
                             customerName: currentBooking.customerName,
                             phone: currentBooking.phone,
                             serviceId: foundService._id, 
                             serviceName: foundService.name, 
                             date: startTimeObj.format('YYYY-MM-DD'),
                             time: startTimeObj.format('HH:mm'),
                             startTime: startTimeObj.toDate(), 
                             endTime: endTimeObj.toDate(),
                             status: 'confirmed', 
                             note: `Làm thêm từ đơn #${currentBooking._id.slice(-4)}`,
                             type: targetType, 
                             roomId: assignedRoomId, 
                             branchId: filterBranch || (currentBooking.branchId?._id || currentBooking.branchId)
                         };
                         
                         result = await adminBookingService.createBooking(newBookingData);
                         
                         if (result.success) {
                             message.success(`Đã thêm lịch: ${foundService.name}`);
                             fetchData(); 
                         } else {
                              if (result.message && result.message.includes('serviceId')) {
                                   message.error('Lỗi: ID Dịch vụ không hợp lệ');
                              } else {
                                  message.error(result.message || 'Không thể tạo lịch làm thêm');
                              }
                         }
                     }
                     break;
                default:
                    break;
            }
            
            // Only refresh if action was successful (and distinct from upsell which handles its own refresh)
            if (result && result.success && action !== 'upsell_save') {
                setDrawerVisible(false);
                await fetchData(); 
            } else if (result && !result.success && action !== 'upsell_save') {
                message.error(result.message || 'Thao tác thất bại');
            }
        } catch (error) {
            console.error(error);
            message.error('Thao tác thất bại');
        }
    };

    const handleEventDrop = async ({ event, start, end, resourceId }) => {
        try {
            const targetResource = rooms.find(r => r.id === resourceId);
            let finalRoomId = resourceId;
            let finalBedId = undefined;

            if (targetResource?.isBed) {
                finalBedId = resourceId;
                finalRoomId = targetResource.parentRoomId;
            } else if (typeof resourceId === 'string' && resourceId.includes('_bed_')) {
                finalRoomId = resourceId.split('_bed_')[0];
            }

            const updatePayload = { startTime: start, endTime: end, roomId: finalRoomId };
            if (finalBedId !== undefined) updatePayload.bedId = finalBedId;

            await adminBookingService.updateBooking(event._id, updatePayload);
            message.success('Đã chuyển lịch');
            fetchData();
        } catch (error) {
            message.error('Không thể chuyển lịch');
        }
    };

    const handleEventResize = async ({ event, start, end }) => {
        try {
            await adminBookingService.updateBooking(event._id, {
                startTime: start,
                endTime: end
            });
            message.success('Đã thay đổi thời gian');
            fetchData();
        } catch (error) {
            message.error('Không thể thay đổi thời gian');
        }
    };

    const handleWaitlistDrop = async ({ start, resourceId, resource }) => {
        const waitlistItem = draggedWaitlistItem;
        
        if (!waitlistItem) {
            console.warn('No dragged waitlist item found');
            return;
        }

        // react-big-calendar onDropFromOutside passes 'resource' not 'resourceId'
        const resolvedResourceId = resourceId || resource;

        // Resolve resource: bed (isBed=true) or room
        const targetResource = rooms.find(r => r.id === resolvedResourceId);
        let finalRoomId = resolvedResourceId;
        let finalBedId = null;

        if (targetResource?.isBed) {
            // Multi-bed: resolvedResourceId is bed._id, parentRoomId is the actual room
            finalBedId = resolvedResourceId;
            finalRoomId = targetResource.parentRoomId;
        } else if (typeof resolvedResourceId === 'string' && resolvedResourceId.includes('_bed_')) {
            // Legacy fallback
            finalRoomId = resolvedResourceId.split('_bed_')[0];
        }

        // --- SERVICE vs ROOM TYPE VALIDATION ---
        const svcName = (waitlistItem.serviceName || '').toLowerCase();
        const headKw = ['gội', 'hair', 'tóc', 'head', 'dưỡng sinh', 'shampoo'];
        const nailKw = ['nail', 'móng', 'sơn', 'gel', 'đắp', 'gắn', 'tháo'];
        let expectedType = 'BODY_SPA';
        if (headKw.some(k => svcName.includes(k))) expectedType = 'HEAD_SPA';
        else if (nailKw.some(k => svcName.includes(k))) expectedType = 'NAIL_SPA';

        const targetRoomType = targetResource?.roomType || targetResource?.type;
        if (targetRoomType && targetRoomType !== expectedType) {
            const typeLabel = { HEAD_SPA: 'Gội đầu', BODY_SPA: 'Body Spa', NAIL_SPA: 'Nail' };
            const confirmMsg = `Dịch vụ "${waitlistItem.serviceName}" phù hợp với phòng ${typeLabel[expectedType] || expectedType}, nhưng bạn đang kéo vào phòng ${typeLabel[targetRoomType] || targetRoomType}. Tiếp tục?`;
            if (!window.confirm(confirmMsg)) return;
        }

        let targetBranchId = filterBranch;
        if (!targetBranchId && targetResource) {
            targetBranchId = targetResource.branchId?._id || targetResource.branchId;
        }

        if (!targetBranchId) {
             message.error('Không xác định được chi nhánh cho phòng này');
             return;
        }

        try {
            const bookingPayload = {
                customerName: waitlistItem.customerName,
                phone: waitlistItem.phone,
                serviceName: waitlistItem.serviceName,
                date: dayjs(start).format('YYYY-MM-DD'),
                time: dayjs(start).format('HH:mm'),
                branchId: targetBranchId,
                roomId: finalRoomId
            };
            if (finalBedId) bookingPayload.bedId = finalBedId;

            const result = await adminBookingService.createBooking(bookingPayload);
            if (!result.success) {
                message.error(result.message || 'Không thể tạo booking');
                return;
            }
            
            await adminBookingService.deleteWaitlist(waitlistItem._id);
            
            message.success(`Đã xếp lịch cho ${waitlistItem.customerName}`);
            setDraggedWaitlistItem(null); 
            
            fetchData();
            setRefreshWaitlist(prev => prev + 1);
        } catch (error) {
            console.error('Drop Error:', error);
            message.error('Không thể tạo booking');
        }
    };

    return {
        handleCreateSubmit,
        handleSearchSelect,
        handleApprove,
        handleInvoiceSubmit,
        handleAction,
        handleEventDrop,
        handleEventResize,
        handleWaitlistDrop
    };
};
