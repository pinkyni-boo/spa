import { App } from 'antd';
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
    setIsModalVisible, setDrawerVisible, setSelectedBooking, setIsEditing, setDraggedWaitlistItem, setRefreshWaitlist, setRefreshBookingList
}) => {
    const { message } = App.useApp();

    const refreshBookingViews = async () => {
        await fetchData();
        if (typeof setRefreshBookingList === 'function') {
            setRefreshBookingList(prev => prev + 1);
        }
    };

    const handleCreateSubmit = async (values) => {
         if (!filterBranch) {
             message.error("Vui lòng chọn chi nhánh trước khi tạo đơn!");
             return;
         }

         // Clean phone: only digits
         const cleanPhone = (values.phone || '').replace(/[^0-9]/g, '');

         const data = {
             customerName: values.customerName,
             phone: cleanPhone || undefined,   // undefined = server won't validate
             serviceName: values.serviceName,
             serviceId: values.serviceId,      // send ID for exact match — no fuzzy needed
             date: values.date.format('YYYY-MM-DD'),
             time: values.time,
             branchId: filterBranch,
             source: 'offline',                // MUST be here before Joi runs
         };

         try {
            const result = await adminBookingService.createBooking(data);
            if (result.success) {
                message.success("Tạo đơn thành công!");
                setIsModalVisible(false);
                await refreshBookingViews();
            } else {
                // Show Joi errors if available, else generic message
                const detail = result.errors?.join(', ') || result.message || 'Tạo đơn thất bại';
                message.error(detail);
            }
         } catch (error) {
             message.error("Tạo đơn thất bại: " + (error.message || ''));
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
                await refreshBookingViews();
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
            await refreshBookingViews();
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
                     // Append service to parent's servicesDone + create linked child booking for calendar
                     if (data && data.addedService) {
                         const { addedService, bookingId: targetBookingId, roomId, bedId, startTime } = data;

                         const items = [{
                             name: addedService.name,
                             price: addedService.price || 0,
                             quantity: addedService.qty || 1,
                             serviceId: addedService._id || null
                         }];

                         result = await adminBookingService.addServiceToBooking(
                             targetBookingId,
                             items,
                             { roomId: roomId || null, bedId: bedId || null, startTime: startTime || null }
                         );

                         if (result.success) {
                             message.success(`Đã thêm "${addedService.name}" vào đơn hàng`);
                             setSelectedBooking(result.booking); // Cập nhật drawer ngay lập tức
                             await refreshBookingViews(); // Cập nhật bảng biểu ngay
                         } else {
                             message.error(result.message || 'Không thể thêm dịch vụ');
                         }
                     }
                     break;
                default:
                    break;
            }
            
            // Only refresh if action was successful (and distinct from upsell which handles its own refresh)
            if (result && result.success && action !== 'upsell_save') {
                setDrawerVisible(false);
                await refreshBookingViews();
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

            // Check virtual bed (legacy id "roomId_bed_N") BEFORE isBed flag
            if (typeof resourceId === 'string' && resourceId.includes('_bed_')) {
                finalRoomId = resourceId.split('_bed_')[0];
            } else if (targetResource?.isBed) {
                // Real bed from Bed model
                finalBedId = resourceId;
                finalRoomId = targetResource.parentRoomId;
            }

            const updatePayload = { startTime: start, endTime: end, roomId: finalRoomId };
            if (finalBedId !== undefined) updatePayload.bedId = finalBedId;

            await adminBookingService.updateBooking(event._id, updatePayload);
            message.success('Đã chuyển lịch');
            await refreshBookingViews();
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
            await refreshBookingViews();
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

        // Check virtual bed (legacy id "roomId_bed_N") BEFORE isBed flag
        if (typeof resolvedResourceId === 'string' && resolvedResourceId.includes('_bed_')) {
            // Virtual bed — extract parent roomId, no bedId
            finalRoomId = resolvedResourceId.split('_bed_')[0];
        } else if (targetResource?.isBed) {
            // Real bed from Bed model — set both
            finalBedId = resolvedResourceId;
            finalRoomId = targetResource.parentRoomId;
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
            targetBranchId = targetResource.branchId?._id?.toString() || targetResource.branchId?.toString();
        }

        if (!targetBranchId) {
             message.error('Không xác định được chi nhánh cho phòng này');
             return;
        }

        try {
            const cleanPhone = (waitlistItem.phone || '').replace(/[^0-9]/g, '');
            const bookingPayload = {
                customerName: waitlistItem.customerName,
                phone: cleanPhone || undefined,
                serviceName: waitlistItem.serviceName,
                date: dayjs(start).format('YYYY-MM-DD'),
                time: dayjs(start).format('HH:mm'),
                branchId: String(targetBranchId),
                roomId: finalRoomId || null,
                source: 'offline',
            };
            if (finalBedId) bookingPayload.bedId = finalBedId;

            const result = await adminBookingService.createBooking(bookingPayload);
            if (!result.success) {
                const errDetail = result.errors?.join(', ') || result.message || 'Không thể tạo booking';
                message.error(errDetail);
                return;
            }
            
            await adminBookingService.deleteWaitlist(waitlistItem._id);
            
            message.success(`Đã xếp lịch cho ${waitlistItem.customerName}`);
            setDraggedWaitlistItem(null); 
            
            await refreshBookingViews();
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
