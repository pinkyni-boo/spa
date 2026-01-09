import React, { createContext, useState, useContext } from 'react';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState(null); // Kho chứa dữ liệu đặt lịch (VD: Tên dịch vụ)

  const openBooking = (data = null) => {
    setBookingData(data); // Lưu hàng vào kho
    setIsBookingOpen(true); // Mở cửa
  };
  
  const closeBooking = () => {
    setIsBookingOpen(false);
    // Không cần reset bookingData ngay để tránh glitch giao diện khi đóng
  };

  return (
    <BookingContext.Provider value={{ isBookingOpen, openBooking, closeBooking, bookingData }}>
      {children}
    </BookingContext.Provider>
  );
};
