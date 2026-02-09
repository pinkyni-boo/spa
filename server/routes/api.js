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
const SeedController = require('../controllers/SeedController'); // [NEW]
const { verifyToken, checkRole } = require('../middleware/auth'); // [NEW] Auth Middleware
const { branchCheck } = require('../middleware/branchCheck'); // [NEW] Isolation Middleware

// --- DASHBOARD ROUTES ---
router.post('/seed-data', SeedController.seedGalleryAndFeedback); // [NEW] Seed Route
router.get('/dashboard/stats', verifyToken, branchCheck, DashboardController.getStats);
router.get('/dashboard/revenue-chart', verifyToken, checkRole(['admin', 'owner']), branchCheck, DashboardController.getRevenueChart);
router.get('/dashboard/top-services', verifyToken, branchCheck, DashboardController.getTopServices);
router.get('/dashboard/staff-status', verifyToken, branchCheck, DashboardController.getStaffStatus);
router.get('/dashboard/staff-performance', verifyToken, checkRole(['admin', 'owner']), branchCheck, DashboardController.getStaffPerformance);

// --- USER MANAGEMENT ROUTES ---
router.get('/users', verifyToken, checkRole(['admin', 'owner']), UserController.getAllUsers);
router.post('/users', verifyToken, checkRole(['admin', 'owner']), UserController.createUser);
router.put('/users/:id', verifyToken, checkRole(['admin', 'owner']), UserController.updateUser);
router.delete('/users/:id', verifyToken, checkRole(['admin', 'owner']), UserController.deleteUser);
 // [NEW]

// --- BRANCH ROUTES ---
router.get('/branches', verifyToken, BranchController.getAllBranches);
router.post('/branches', verifyToken, checkRole(['owner']), BranchController.createBranch);
router.get('/branches/:id', verifyToken, BranchController.getBranch);
router.put('/branches/:id', verifyToken, checkRole(['owner']), BranchController.updateBranch);
router.delete('/branches/:id', verifyToken, checkRole(['owner']), BranchController.deleteBranch);
router.get('/branches/:id/stats', verifyToken, checkRole(['admin', 'owner']), BranchController.getBranchStats);

// --- PROMOTION ROUTES ---
router.get('/promotions', verifyToken, PromotionController.getAllPromotions);
router.get('/promotions/active', PromotionController.getActivePromotions); // Public
router.post('/promotions', verifyToken, checkRole(['admin', 'owner']), PromotionController.createPromotion);
router.put('/promotions/:id', verifyToken, checkRole(['admin', 'owner']), PromotionController.updatePromotion);
router.delete('/promotions/:id', verifyToken, checkRole(['admin', 'owner']), PromotionController.deletePromotion);
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
router.get('/services', ServiceController.getAllServices); // Public
router.post('/services', verifyToken, checkRole(['admin', 'owner']), ServiceController.createService);
router.post('/services/seed', verifyToken, checkRole(['admin', 'owner']), ServiceController.seedServices);
router.put('/services/:id', verifyToken, checkRole(['admin', 'owner']), ServiceController.updateService);
router.delete('/services/:id', verifyToken, checkRole(['admin', 'owner']), ServiceController.deleteService);

// --- BOOKING ROUTES ---
// --- BOOKING ROUTES ---
router.post('/bookings/check-slot', BookingController.checkAvailability); // Public
router.post('/bookings', BookingController.createBooking); // Public (Customers)
router.get('/bookings/search', verifyToken, branchCheck, BookingController.searchBookings); // Admin
router.get('/bookings/history/:phone', verifyToken, BookingController.getCustomerHistory); // Admin
router.get('/bookings', verifyToken, branchCheck, BookingController.getAllBookings); // Admin
router.put('/bookings/:id', verifyToken, checkRole(['admin', 'owner', 'ktv']), BookingController.updateBooking);
router.put('/bookings/:id/approve', verifyToken, checkRole(['admin', 'owner']), BookingController.approveBooking);
router.put('/bookings/:id/complete', verifyToken, checkRole(['admin', 'owner']), BookingController.completeBooking);
router.delete('/bookings/:id', verifyToken, checkRole(['admin', 'owner']), BookingController.cancelBooking);

// [PHASE 4] Smart Operations Routes
router.post('/bookings/:id/check-in', verifyToken, BookingController.checkIn);
router.put('/bookings/:id/services', verifyToken, BookingController.updateBookingServices);
router.post('/bookings/complete-past', verifyToken, checkRole(['admin', 'owner']), BookingController.completePastBookings);
router.get('/bookings/complete-past', verifyToken, checkRole(['admin', 'owner']), BookingController.completePastBookings);
router.get('/bookings/fix-future', verifyToken, checkRole(['admin', 'owner']), BookingController.fixFutureBookings);
router.post('/bookings/find-waitlist-match', verifyToken, BookingController.findMatchingWaitlist);

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
router.get('/staff', verifyToken, StaffController.getAllStaff);
router.post('/staff', verifyToken, checkRole(['admin', 'owner']), StaffController.createStaff);
router.put('/staff/:id', verifyToken, checkRole(['admin', 'owner']), StaffController.updateStaffDetails);
router.delete('/staff/:id', verifyToken, checkRole(['admin', 'owner']), StaffController.deleteStaff); // [NEW] Soft Delete

// --- GALLERY ROUTES (NEW) ---
const GalleryController = require('../controllers/GalleryController');
const upload = require('../middleware/upload'); // [NEW]

const galleryUpload = upload.fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 },
    { name: 'imageUrl', maxCount: 1 }
]);

router.get('/gallery', GalleryController.getAllGalleryItems);
router.post('/gallery', galleryUpload, GalleryController.createGalleryItem);
router.put('/gallery/:id', galleryUpload, GalleryController.updateGalleryItem);
router.delete('/gallery/:id', GalleryController.deleteGalleryItem);

// --- WAITLIST ROUTES (NEW) ---
const WaitlistController = require('../controllers/WaitlistController');
router.post('/waitlist', WaitlistController.addToWaitlist);
router.get('/waitlist', WaitlistController.getWaitlist);
router.delete('/waitlist/:id', WaitlistController.deleteWaitlist);


module.exports = router;
