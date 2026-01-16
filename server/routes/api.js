const express = require('express');
const router = express.Router();

const BookingController = require('../controllers/BookingController');
const RoomController = require('../controllers/RoomController');
const StaffController = require('../controllers/StaffController');
const ServiceController = require('../controllers/ServiceController');

// --- SERVICE ROUTES (NEW PHASE 6) ---
router.get('/services', ServiceController.getAllServices);
router.post('/services', ServiceController.createService);
router.post('/services/seed', ServiceController.seedServices); // [NEW]
router.put('/services/:id', ServiceController.updateService);
router.delete('/services/:id', ServiceController.deleteService);

// --- BOOKING ROUTES ---
router.post('/bookings/check-slot', BookingController.checkAvailability);
router.post('/bookings', BookingController.createBooking);
router.get('/bookings/search', BookingController.searchBookings); // [NEW] Global Search - Trigger Restart
router.get('/bookings/history/:phone', BookingController.getCustomerHistory); // [NEW] CRM - Customer History
router.get('/bookings', BookingController.getAllBookings); // Admin
router.put('/bookings/:id', BookingController.updateBooking);
router.delete('/bookings/:id', BookingController.cancelBooking);

// [PHASE 4] Smart Operations Routes
router.post('/bookings/:id/check-in', BookingController.checkIn);
router.put('/bookings/:id/services', BookingController.updateBookingServices);
router.post('/bookings/complete-past', BookingController.completePastBookings); // [NEW] Bulk complete
router.get('/bookings/complete-past', BookingController.completePastBookings); // [NEW] Also support GET for browser
router.get('/bookings/fix-future', BookingController.fixFutureBookings); // [NEW] Fix future completed bookings
router.post('/bookings/find-waitlist-match', BookingController.findMatchingWaitlist); // [NEW] Smart Alert

// --- INVOICE ROUTES (NEW PHASE 4) ---
const InvoiceController = require('../controllers/InvoiceController'); 
router.post('/invoices', InvoiceController.createInvoice);
router.get('/invoices', InvoiceController.getAllInvoices);
router.post('/invoices/:id/void', InvoiceController.voidInvoice);

// --- ROOM ROUTES (NEW PHASE 1) ---
router.get('/rooms', RoomController.getAllRooms);
router.post('/rooms', RoomController.createRoom);
router.put('/rooms/:id', RoomController.updateRoom);
router.delete('/rooms/:id', RoomController.deleteRoom);

// --- STAFF ROUTES ---
router.get('/staff', StaffController.getAllStaff);
router.put('/staff/:id', StaffController.updateStaffDetails);

const CustomerController = require('../controllers/CustomerController'); // [NEW]

// --- CUSTOMER ROUTES (CRM) ---
router.get('/customers/search', CustomerController.search);
router.get('/customers/:id', CustomerController.getById);

// --- WAITLIST ROUTES (NEW) ---
const WaitlistController = require('../controllers/WaitlistController');
router.post('/waitlist', WaitlistController.addToWaitlist);
router.get('/waitlist', WaitlistController.getWaitlist);
router.delete('/waitlist/:id', WaitlistController.deleteWaitlist);


module.exports = router;
