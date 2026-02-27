/**
 * dateHelper.js — Tiện ích xử lý ngày giờ theo múi giờ Việt Nam (UTC+7)
 * Dùng để đảm bảo tất cả giờ hiển thị đúng bất kể browser ở timezone nào.
 */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const VN_TZ = 'Asia/Ho_Chi_Minh';

/** Hiển thị giờ: HH:mm */
export const fmtTime = (d) => dayjs.tz(d, VN_TZ).format('HH:mm');

/** Hiển thị ngày: DD/MM/YYYY */
export const fmtDate = (d) => dayjs.tz(d, VN_TZ).format('DD/MM/YYYY');

/** Hiển thị đầy đủ: HH:mm DD/MM/YYYY */
export const fmtDT = (d) => dayjs.tz(d, VN_TZ).format('HH:mm DD/MM/YYYY');

/** Hiển thị ngắn: DD/MM HH:mm */
export const fmtDTShort = (d) => dayjs.tz(d, VN_TZ).format('DD/MM HH:mm');

/**
 * Chuyển ISO string thành Date object "fake-local":
 * RBC (React Big Calendar) dùng Date để định vị sự kiện trên lưới.
 * Trick: tạo Date không có TZ suffix → trình duyệt hiểu là LOCAL time
 * → sự kiện luôn hiện đúng giờ VN dù browser ở timezone nào.
 *
 * Ví dụ: "2026-02-28T02:00:00Z" (= 09:00 VN) → Date("2026-02-28T09:00:00") (no Z)
 * → trình duyệt UTC: 09:00 UTC displayed ✓
 * → trình duyệt VN:  09:00 VN displayed  ✓
 */
export const toCalendarDate = (isoString) => {
    if (!isoString) return new Date();
    const vnStr = dayjs.tz(isoString, VN_TZ).format('YYYY-MM-DDTHH:mm:ss');
    return new Date(vnStr);
};

/** dayjs VN — dùng khi cần so sánh hoặc tính toán theo giờ VN */
export const dayjsVN = (d) => dayjs.tz(d, VN_TZ);

export default dayjs;
