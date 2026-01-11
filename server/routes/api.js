const express = require('express');
const router = express.Router();

const BookingController = require('../controllers/BookingController');
const RoomController = require('../controllers/RoomController');
const StaffController = require('../controllers/StaffController');
const ServiceController = require('../controllers/ServiceController');

// --- SERVICE ROUTES (NEW PHASE 6) ---
router.get('/services', ServiceController.getAllServices);
router.post('/services', ServiceController.createService);
router.put('/services/:id', ServiceController.updateService);
router.delete('/services/:id', ServiceController.deleteService);

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
