/**
 * dateHelper.js — Tiện ích xử lý ngày giờ theo múi giờ Việt Nam (UTC+7)
 *
 * QUAN TRỌNG: File này KHÔNG extend dayjs/plugin/utc và dayjs/plugin/timezone.
 * Lý do: dayjsLocalizer (react-big-calendar) bị lỗi khi utc plugin được load —
 * nó chuyển sang hiển thị giờ UTC thay vì local, khiến lưới lịch hiện sai giờ.
 * Thay vào đó ta dùng offset cứng UTC+7 (Việt Nam không có DST).
 */
import dayjs from 'dayjs';

export const VN_TZ = 'Asia/Ho_Chi_Minh';
const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7, Việt Nam không có DST
const pad = (n) => String(n).padStart(2, '0');

/** Chuyển bất kỳ giá trị date nào sang object các thành phần giờ VN */
const toVNParts = (d) => {
    const ms = new Date(d).getTime();
    const v = new Date(ms + VN_OFFSET_MS);
    return {
        year:   v.getUTCFullYear(),
        month:  pad(v.getUTCMonth() + 1),
        day:    pad(v.getUTCDate()),
        hour:   pad(v.getUTCHours()),
        minute: pad(v.getUTCMinutes()),
        second: pad(v.getUTCSeconds()),
    };
};

/** Hiển thị giờ: HH:mm */
export const fmtTime = (d) => { const v = toVNParts(d); return `${v.hour}:${v.minute}`; };

/** Hiển thị ngày: DD/MM/YYYY */
export const fmtDate = (d) => { const v = toVNParts(d); return `${v.day}/${v.month}/${v.year}`; };

/** Hiển thị đầy đủ: HH:mm DD/MM/YYYY */
export const fmtDT = (d) => { const v = toVNParts(d); return `${v.hour}:${v.minute} ${v.day}/${v.month}/${v.year}`; };

/** Hiển thị ngắn: DD/MM HH:mm */
export const fmtDTShort = (d) => { const v = toVNParts(d); return `${v.day}/${v.month} ${v.hour}:${v.minute}`; };

/**
 * toCalendarDate — Chuyển ISO string UTC sang Date "fake-local" (không có Z).
 * React Big Calendar dùng Date object + browser local time để định vị sự kiện.
 * Fake-local = lấy giờ VN và tạo Date string không TZ → browser hiểu là "local".
 * Ví dụ: "2026-02-28T02:00:00Z" (=09:00 VN) → new Date("2026-02-28T09:00:00") → hiện 09:00 ✓
 */
export const toCalendarDate = (isoString) => {
    if (!isoString) return new Date();
    const v = toVNParts(isoString);
    return new Date(`${v.year}-${v.month}-${v.day}T${v.hour}:${v.minute}:${v.second}`);
};

/**
 * dayjsVN — trả về dayjs trong hệ toạ độ fake-local (giờ VN).
 * Dùng để so sánh với event.start/end (cũng là fake-local từ toCalendarDate).
 */
export const dayjsVN = (d) => {
    if (!d) return dayjs(toCalendarDate(new Date().toISOString()));
    return dayjs(toCalendarDate(typeof d === 'string' ? d : new Date(d).toISOString()));
};

export default dayjs;
