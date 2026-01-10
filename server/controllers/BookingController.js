const Booking = require('../models/Booking');
const Staff = require('../models/Staff');
const servicesData = require('../data/services.json'); // Load dữ liệu tĩnh

// --- HÀM HỖ TRỢ: TÌM DỊCH VỤ TRONG JSON ---
// Vì giá và thời gian cố định, ta tìm trong file JSON cho nhanh
const findServiceDetails = (serviceName) => {
  return servicesData.find(s => s.name === serviceName);
};

// --- HELPER: MUTEX (KHÓA) ĐỂ CHỐNG RACE CONDITION ---
class Mutex {
    constructor() {
        this._locking = Promise.resolve();
        this._locked = false;
    }

    lock() {
        let unlockNext;
        const willLock = new Promise(resolve => unlockNext = resolve);
        const willUnlock = this._locking.then(() => unlockNext);
        this._locking = this._locking.then(() => willLock);
        return willUnlock;
    }
}
const bookingMutex = new Mutex();

// --- LOGIC 1: CHECK SLOT TRỐNG (RESOURCE POOLING) ---
exports.checkAvailability = async (req, res) => {
  try {
    const { date, serviceName } = req.query; // VD: 2024-01-20, Massage Body
    
    // 1. Validate Input
    if (!date || !serviceName) {
      return res.status(400).json({ success: false, message: 'Thiếu ngày hoặc tên dịch vụ' });
    }

    // 2. Lấy thông tin dịch vụ (để biết Duration)
    const service = findServiceDetails(serviceName);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Dịch vụ không tồn tại' });
    }
    const duration = service.duration; // VD: 60 phút

    // 3. Đếm tổng nhân viên đang đi làm (Active)
    const totalStaff = await Staff.countDocuments({ isActive: true });
    if (totalStaff === 0) {
      return res.json({ success: true, availableSlots: [] }); // Không có ai đi làm
    }

    // 4. Tạo các khung giờ (Slots) để kiểm tra
    // Giả sử Spa mở từ 09:00 đến 18:00
    const openTime = 9; // 9h sáng
    const closeTime = 18; // 18h tối
    const availableSlots = [];

    // Chuyển ngày request thành Object Date đầu ngày và cuối ngày
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0,0,0,0));
    const endOfDay = new Date(selectedDate.setHours(23,59,59,999));

    // Lấy TOÀN BỘ booking trong ngày đó ra 1 lần (để đỡ query nhiều lần)
    const bookingsToday = await Booking.find({
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' } // Không tính đơn hủy
    });

    // VÒNG LẶP KIỂM TRA TỪNG GIỜ (09:00, 09:30, 10:00...)
    // Bước nhảy: 30 phút một lần
    for (let hour = openTime; hour < closeTime; hour += 0.5) {
      // a. Quy đổi giờ hiện tại ra Date
      // hour = 9.5 nghĩa là 9h30
      const currentSlotStart = new Date(startOfDay);
      currentSlotStart.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

      const currentSlotEnd = new Date(currentSlotStart.getTime() + duration * 60000); // Cộng thêm duration phút

      // b. Nếu giờ kết thúc vượt quá giờ đóng cửa -> Bỏ qua
      const closeDate = new Date(startOfDay);
      closeDate.setHours(closeTime, 0, 0, 0);
      if (currentSlotEnd > closeDate) continue;

      // c. ĐẾM SỐ NHÂN VIÊN BẬN TẠI KHUNG GIỜ NÀY
      // Logic trùng: (Start_Booking < End_Slot) AND (End_Booking > Start_Slot)
      let busyCount = 0;
      bookingsToday.forEach(booking => {
        if (booking.startTime < currentSlotEnd && booking.endTime > currentSlotStart) {
          busyCount++;
        }
      });

      // d. PHÉP TOÁN RESOURCE POOLING
      const freeStaff = totalStaff - busyCount;

      // e. Nếu còn dư thợ -> Thêm vào danh sách Slot trống
      if (freeStaff > 0) {
        // Format giờ đẹp (09:30)
        const timeString = `${currentSlotStart.getHours().toString().padStart(2, '0')}:${currentSlotStart.getMinutes().toString().padStart(2, '0')}`;
        availableSlots.push(timeString);
      }
    }

    // 5. Trả kết quả về Frontend
    res.json({ success: true, totalStaff, availableSlots });

  } catch (error) {
    console.error('Lỗi Check Availability:', error);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// --- LOGIC 2: TẠO BOOKING MỚI ---
exports.createBooking = async (req, res) => {
  // KHÓA LẠI (Xếp hàng) - Chỉ 1 người được đặt tại 1 thời điểm
  const unlock = await bookingMutex.lock();
  
  try {
    const { customerName, phone, serviceName, date, time } = req.body;

    // 1. Tìm dịch vụ
    const service = findServiceDetails(serviceName);
    if (!service) return res.status(400).json({ message: 'Dịch vụ lỗi' });

    // 2. Tính StartTime và EndTime
    // time dạng "14:30"
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // 3. (QUAN TRỌNG) Double Check lại lần cuối xem còn thợ rảnh không
    // (Tránh trường hợp 2 người cùng bấm nút 1 lúc)
    const totalStaff = await Staff.countDocuments({ isActive: true });
    const busyCount = await Booking.countDocuments({
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $ne: 'cancelled' }
    });

    if (totalStaff - busyCount <= 0) {
      return res.status(409).json({ success: false, message: 'Rất tiếc, khung giờ này vừa có người đặt mất rồi!' });
    }

    // 4. Lưu Booking
    // Chúng ta cần tìm Service Object ID thật từ DB để lưu vào quan hệ
    const ServiceModel = require('../models/Service');
    const dbService = await ServiceModel.findOne({ name: serviceName }); 
    
    // Nếu trong DB chưa có service này (do ta mới thêm trong JSON), fallback tạm
    if (!dbService) {
        return res.status(500).json({message: 'Dữ liệu không đồng bộ. Vui lòng liên hệ Admin.'});
    }

    const newBooking = new Booking({
      customerName,
      phone,
      serviceId: dbService._id,
      startTime,
      endTime,
      status: 'pending',
      source: req.body.source || 'online' // Nhận source từ Admin (offline) hoặc mặc định là online
    });

    await newBooking.save();

    res.json({ success: true, message: 'Đặt lịch thành công! Vui lòng chờ xác nhận.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi đặt lịch' });
  } finally {
    unlock(); // MỞ KHÓA (Cho người tiếp theo vào)
  }
};

// --- LOGIC 3: LẤY DANH SÁCH BOOKING (CHO ADMIN) ---
exports.getAllBookings = async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = {};

    // Lọc theo ngày (nếu có)
    if (date) {
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate.setHours(0,0,0,0));
        const endOfDay = new Date(selectedDate.setHours(23,59,59,999));
        filter.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    // Lọc theo trạng thái
    if (status) {
        filter.status = status;
    }

    // Query DB
    const bookings = await Booking.find(filter)
      .populate('serviceId', 'name price duration') // Join bảng Service lấy tên
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.json({ success: true, bookings });

  } catch (error) {
    console.error('Lỗi Get Bookings:', error);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// --- LOGIC 4: CẬP NHẬT BOOKING (Admin sửa đơn) ---
exports.updateBooking = async (req, res) => {
    const unlock = await bookingMutex.lock(); // Dùng lại Mutex để an toàn
    try {
        const { id } = req.params;
        const { date, time, serviceName, customerName, phone, status, note } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt' });
        }

        // 1. Nếu có thay đổi liên quan đến Thời gian/Dịch vụ -> Cần check lại slot
        let newStartTime = booking.startTime;
        let newEndTime = booking.endTime;
        let serviceId = booking.serviceId;

        const isTimeChanged = (date || time || serviceName);
        
        if (isTimeChanged) {
             // Lấy thông tin dịch vụ mới (hoặc cũ)
             const sName = serviceName || (await require('../models/Service').findById(booking.serviceId)).name;
             const service = findServiceDetails(sName);
             if (!service) return res.status(400).json({ message: 'Dịch vụ lỗi' });

             // Nếu có date/time mới thì dùng, không thì lấy cái cũ
             const dateStr = date || booking.startTime.toISOString().split('T')[0];
             const timeStr = time || `${booking.startTime.getHours()}:${booking.startTime.getMinutes()}`;

             const [hours, minutes] = timeStr.split(':').map(Number);
             newStartTime = new Date(dateStr);
             newStartTime.setHours(hours, minutes, 0, 0);
             newEndTime = new Date(newStartTime.getTime() + service.duration * 60000);

             // CHECK TRÙNG (Loại trừ chính đơn này ra)
             const totalStaff = await Staff.countDocuments({ isActive: true });
             const busyCount = await Booking.countDocuments({
                 startTime: { $lt: newEndTime },
                 endTime: { $gt: newStartTime },
                 status: { $ne: 'cancelled' },
                 _id: { $ne: id } // Quan trọng: Không đếm chính mình
             });

             if (totalStaff - busyCount <= 0) {
                 return res.status(409).json({ success: false, message: 'Khung giờ mới này đã đầy!' });
             }

             // Cập nhật Service ID dính kèm
             const ServiceModel = require('../models/Service');
             const dbService = await ServiceModel.findOne({ name: sName });
             if (dbService) serviceId = dbService._id;
        }

        // 2. Cập nhật thông tin
        booking.customerName = customerName || booking.customerName;
        booking.phone = phone || booking.phone;
        booking.startTime = newStartTime;
        booking.endTime = newEndTime;
        booking.serviceId = serviceId;
        booking.note = note || booking.note;
        if (status) booking.status = status;

        await booking.save();
        res.json({ success: true, message: 'Cập nhật thành công!' });

    } catch (error) {
        console.error('Lỗi Update:', error);
        res.status(500).json({ success: false, message: 'Lỗi Server' });
    } finally {
        unlock();
    }
};

// --- LOGIC 5: HỦY BOOKING ---
exports.cancelBooking = async (req, res) => {
    // Hủy thì không cần Lock quá chặt, nhưng để nhất quán status thì cứ Lock nhẹ
    const unlock = await bookingMutex.lock();
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ success: true, message: 'Đã hủy đơn thành công' });
    } catch (error) {
         console.error('Lỗi Cancel:', error);
         res.status(500).json({ success: false, message: 'Lỗi Server' });
    } finally {
        unlock();
    }
};
