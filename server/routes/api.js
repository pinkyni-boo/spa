const express = require('express');
const router = express.Router();

const BookingController = require('../controllers/BookingController');
const RoomController = require('../controllers/RoomController');
const StaffController = require('../controllers/StaffController');
const ServiceController = require('../controllers/ServiceController');
const DashboardController = require('../controllers/DashboardController');
const BranchController = require('../controllers/BranchController');
const PromotionController = require('../controllers/PromotionController');
const FeedbackController = require('../controllers/FeedbackController');
const UserController = require('../controllers/UserController');

// --- DASHBOARD ROUTES ---
router.get('/dashboard/stats', DashboardController.getStats);
router.get('/dashboard/revenue-chart', DashboardController.getRevenueChart);
router.get('/dashboard/top-services', DashboardController.getTopServices);
router.get('/dashboard/staff-status', DashboardController.getStaffStatus);
router.get('/dashboard/staff-performance', DashboardController.getStaffPerformance);

// --- USER MANAGEMENT ROUTES ---
router.get('/users', UserController.getAllUsers);
router.post('/users', UserController.createUser);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);
 // [NEW]

// --- BRANCH ROUTES ---
router.get('/branches', BranchController.getAllBranches);
router.post('/branches', BranchController.createBranch);
router.get('/branches/:id', BranchController.getBranch);
router.put('/branches/:id', BranchController.updateBranch);
router.delete('/branches/:id', BranchController.deleteBranch);
router.get('/branches/:id/stats', BranchController.getBranchStats);

// --- PROMOTION ROUTES ---
router.get('/promotions', PromotionController.getAllPromotions);
router.get('/promotions/active', PromotionController.getActivePromotions);
router.post('/promotions', PromotionController.createPromotion);
router.put('/promotions/:id', PromotionController.updatePromotion);
router.delete('/promotions/:id', PromotionController.deletePromotion);
router.post('/promotions/validate', PromotionController.validateCode);
router.post('/promotions/apply', PromotionController.applyPromotion);

// --- FEEDBACK ROUTES ---
router.get('/feedbacks', FeedbackController.getAllFeedbacks);
router.get('/feedbacks/approved', FeedbackController.getApprovedFeedbacks);
router.post('/feedbacks', FeedbackController.createFeedback);
router.put('/feedbacks/:id/approve', FeedbackController.approveFeedback);
router.put('/feedbacks/:id/reject', FeedbackController.rejectFeedback);
router.delete('/feedbacks/:id', FeedbackController.deleteFeedback);

// --- CUSTOMER HISTORY ROUTES (PHASE 4) ---
const CustomerController = require('../controllers/CustomerController');
router.get('/customers/search', CustomerController.searchCustomers);
router.get('/customers/:phone/history', CustomerController.getCustomerHistory);

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
router.put('/bookings/:id/approve', BookingController.approveBooking); // [FIX] Add approve route
router.put('/bookings/:id/complete', BookingController.completeBooking); // [FIX] Add complete route
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
router.post('/staff', StaffController.createStaff); // [NEW] Create staff
router.put('/staff/:id', StaffController.updateStaffDetails);

// --- WAITLIST ROUTES (NEW) ---
const WaitlistController = require('../controllers/WaitlistController');
router.post('/waitlist', WaitlistController.addToWaitlist);
router.get('/waitlist', WaitlistController.getWaitlist);
router.delete('/waitlist/:id', WaitlistController.deleteWaitlist);


module.exports = router;
