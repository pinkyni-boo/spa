const express = require('express');
const router = express.Router();

const BookingController = require('../controllers/BookingController');
const RoomController = require('../controllers/RoomController');
const StaffController = require('../controllers/StaffController');

// --- BOOKING ROUTES ---
router.post('/bookings/check-slot', BookingController.checkAvailability);
router.post('/bookings', BookingController.createBooking);
router.get('/bookings', BookingController.getAllBookings); // Admin
router.put('/bookings/:id', BookingController.updateBooking);
router.delete('/bookings/:id', BookingController.cancelBooking);

// --- ROOM ROUTES (NEW PHASE 1) ---
router.get('/rooms', RoomController.getAllRooms);
router.post('/rooms', RoomController.createRoom);
router.put('/rooms/:id', RoomController.updateRoom);
router.delete('/rooms/:id', RoomController.deleteRoom);

// --- STAFF ROUTES ---
router.get('/staff', StaffController.getAllStaff);
router.put('/staff/:id', StaffController.updateStaffDetails);

module.exports = router;
