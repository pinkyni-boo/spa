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
const SeedController = require('../controllers/SeedController');
const ActionLogController = require('../controllers/ActionLogController');
const { verifyToken, checkRole, optionalAuth } = require('../middleware/auth');
const { branchCheck } = require('../middleware/branchCheck');
const { bookingLimiter, apiLimiter, destructiveLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { createBookingSchema } = require('../validations/booking.validation');
const { createUserSchema, updateUserSchema } = require('../validations/user.validation');
const { createPromotionSchema, updatePromotionSchema } = require('../validations/promotion.validation');
const { createExpenseSchema } = require('../validations/expense.validation');
const { createConsultationSchema } = require('../validations/consultation.validation');

router.use(apiLimiter);

// --- DASHBOARD ROUTES ---
router.post('/seed-data', verifyToken, checkRole(['owner']), destructiveLimiter, SeedController.seedGalleryAndFeedback);
router.get('/dashboard/stats', verifyToken, branchCheck, DashboardController.getStats);
router.get('/dashboard/revenue-chart', verifyToken, checkRole(['admin', 'owner']), branchCheck, DashboardController.getRevenueChart);
router.get('/dashboard/top-services', verifyToken, branchCheck, DashboardController.getTopServices);
router.get('/dashboard/staff-status', verifyToken, branchCheck, DashboardController.getStaffStatus);
router.get('/dashboard/staff-performance', verifyToken, checkRole(['admin', 'owner']), branchCheck, DashboardController.getStaffPerformance);
router.get('/dashboard/occupancy-rate', verifyToken, branchCheck, DashboardController.getOccupancyRate);

// --- USER MANAGEMENT ROUTES ---
router.get('/users', verifyToken, checkRole(['admin', 'owner']), UserController.getAllUsers);
router.post('/users', verifyToken, checkRole(['admin', 'owner']), validate(createUserSchema), UserController.createUser);
router.put('/users/:id', verifyToken, checkRole(['admin', 'owner']), validate(updateUserSchema), UserController.updateUser);
router.delete('/users/:id', verifyToken, checkRole(['admin', 'owner']), UserController.deleteUser);

// --- BRANCH ROUTES ---
router.get('/branches', BranchController.getAllBranches); // Public — dùng cho form public
router.post('/branches', verifyToken, checkRole(['owner']), BranchController.createBranch);
router.get('/branches/:id', verifyToken, BranchController.getBranch);
router.put('/branches/:id', verifyToken, checkRole(['owner']), BranchController.updateBranch);
router.delete('/branches/:id', verifyToken, checkRole(['owner']), BranchController.deleteBranch);
router.get('/branches/:id/stats', verifyToken, checkRole(['admin', 'owner']), BranchController.getBranchStats);

// --- PROMOTION ROUTES ---
router.get('/promotions', verifyToken, PromotionController.getAllPromotions);
router.get('/promotions/active', PromotionController.getActivePromotions); // Public
router.post('/promotions', verifyToken, checkRole(['admin', 'owner']), validate(createPromotionSchema), PromotionController.createPromotion);
router.put('/promotions/:id', verifyToken, checkRole(['admin', 'owner']), validate(updatePromotionSchema), PromotionController.updatePromotion);
router.delete('/promotions/:id', verifyToken, checkRole(['admin', 'owner']), PromotionController.deletePromotion);
router.post('/promotions/validate', PromotionController.validateCode);
router.post('/promotions/apply', PromotionController.applyPromotion);

// --- FEEDBACK ROUTES ---
router.get('/feedbacks', FeedbackController.getAllFeedbacks);
router.get('/feedbacks/approved', FeedbackController.getApprovedFeedbacks);
router.post('/feedbacks', FeedbackController.createFeedback);
router.put('/feedbacks/:id/approve', verifyToken, checkRole(['admin', 'owner']), FeedbackController.approveFeedback);
router.put('/feedbacks/:id/reject', verifyToken, checkRole(['admin', 'owner']), FeedbackController.rejectFeedback);
router.delete('/feedbacks/:id', verifyToken, checkRole(['admin', 'owner']), FeedbackController.deleteFeedback);

// --- CUSTOMER HISTORY ROUTES (PHASE 4) ---
const CustomerController = require('../controllers/CustomerController');
router.get('/customers/search', verifyToken, checkRole(['admin', 'owner']), CustomerController.searchCustomers);
router.get('/customers/:phone/history', verifyToken, checkRole(['admin', 'owner']), CustomerController.getCustomerHistory);

// --- SERVICE ROUTES (NEW PHASE 6) ---
router.get('/services', ServiceController.getAllServices); // Public
router.post('/services', verifyToken, checkRole(['admin', 'owner']), ServiceController.createService);
router.post('/services/seed', verifyToken, checkRole(['admin', 'owner']), ServiceController.seedServices);
router.put('/services/:id', verifyToken, checkRole(['admin', 'owner']), ServiceController.updateService);
router.delete('/services/:id', verifyToken, checkRole(['admin', 'owner']), ServiceController.deleteService);

// --- BOOKING ROUTES ---
// --- BOOKING ROUTES ---
router.post('/bookings/check-slot', bookingLimiter, BookingController.checkAvailability); // Public
router.post('/bookings', bookingLimiter, optionalAuth, validate(createBookingSchema), BookingController.createBooking); // Public (Customers) — optionalAuth for audit log
router.get('/bookings/search', verifyToken, branchCheck, BookingController.searchBookings); // Admin
router.get('/bookings/history/:phone', verifyToken, BookingController.getCustomerHistory); // Admin
router.get('/bookings', verifyToken, branchCheck, BookingController.getAllBookings); // Admin
router.put('/bookings/:id', verifyToken, checkRole(['admin', 'owner', 'ktv']), BookingController.updateBooking);
router.put('/bookings/:id/approve', verifyToken, checkRole(['admin', 'owner']), BookingController.approveBooking);
router.put('/bookings/:id/complete', verifyToken, checkRole(['admin', 'owner']), BookingController.completeBooking);
router.delete('/bookings/:id', verifyToken, checkRole(['admin', 'owner']), BookingController.cancelBooking);

router.post('/bookings/:id/check-in', verifyToken, BookingController.checkIn);
router.put('/bookings/:id/services', verifyToken, BookingController.updateBookingServices);
router.post('/bookings/complete-past', verifyToken, checkRole(['admin', 'owner']), BookingController.completePastBookings);
router.post('/bookings/fix-future', verifyToken, checkRole(['admin', 'owner']), BookingController.fixFutureBookings);
router.post('/bookings/find-waitlist-match', verifyToken, BookingController.findMatchingWaitlist);

// --- INVOICE ROUTES (NEW PHASE 4) ---
const InvoiceController = require('../controllers/InvoiceController'); 
router.post('/invoices/retail', verifyToken, checkRole(['admin', 'owner']), InvoiceController.createRetailInvoice);
router.post('/invoices', verifyToken, checkRole(['admin', 'owner']), InvoiceController.createInvoice);
router.get('/invoices', verifyToken, branchCheck, InvoiceController.getAllInvoices);
router.post('/invoices/:id/void', verifyToken, checkRole(['owner']), InvoiceController.voidInvoice);

// --- ROOM ROUTES (NEW PHASE 1) ---
router.get('/rooms', RoomController.getAllRooms);
router.post('/rooms', verifyToken, checkRole(['admin', 'owner']), RoomController.createRoom);
router.put('/rooms/:id', verifyToken, checkRole(['admin', 'owner']), RoomController.updateRoom);
router.delete('/rooms/:id', verifyToken, checkRole(['admin', 'owner']), RoomController.deleteRoom);

// --- BED ROUTES (MULTI-BED) ---
router.get('/beds', verifyToken, RoomController.getBeds);
router.post('/beds', verifyToken, checkRole(['admin', 'owner']), RoomController.createBed);
router.put('/beds/:id', verifyToken, checkRole(['admin', 'owner']), RoomController.updateBed);
router.delete('/beds/:id', verifyToken, checkRole(['admin', 'owner']), RoomController.deleteBed);
router.post('/rooms/:roomId/auto-beds', verifyToken, checkRole(['admin', 'owner']), RoomController.autoCreateBedsForRoom);

// --- STAFF ROUTES ---
router.get('/staff', verifyToken, StaffController.getAllStaff);
router.post('/staff', verifyToken, checkRole(['admin', 'owner']), StaffController.createStaff);
router.put('/staff/:id', verifyToken, checkRole(['admin', 'owner']), StaffController.updateStaffDetails);
router.delete('/staff/:id', verifyToken, checkRole(['admin', 'owner']), StaffController.deleteStaff);

// --- GALLERY ROUTES (NEW) ---
const GalleryController = require('../controllers/GalleryController');
const upload = require('../middleware/upload');

const galleryUpload = upload.fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 },
    { name: 'imageUrl', maxCount: 1 }
]);

router.get('/gallery', GalleryController.getAllGalleryItems);
router.post('/gallery', verifyToken, checkRole(['admin', 'owner']), galleryUpload, GalleryController.createGalleryItem);
router.put('/gallery/:id', verifyToken, checkRole(['admin', 'owner']), galleryUpload, GalleryController.updateGalleryItem);
router.delete('/gallery/:id', verifyToken, checkRole(['admin', 'owner']), GalleryController.deleteGalleryItem);

// --- WAITLIST ROUTES (NEW) ---
const WaitlistController = require('../controllers/WaitlistController');
router.post('/waitlist', WaitlistController.addToWaitlist); // Public — customer form
router.get('/waitlist', verifyToken, checkRole(['admin', 'owner']), WaitlistController.getWaitlist);
router.delete('/waitlist/:id', verifyToken, checkRole(['admin', 'owner']), WaitlistController.deleteWaitlist);

// --- EXPENSE (PHIẼU CHI) ROUTES ---
const ExpenseController = require('../controllers/ExpenseController');
router.get('/expenses', verifyToken, checkRole(['admin', 'owner']), ExpenseController.getExpenses);
router.post('/expenses', verifyToken, checkRole(['admin', 'owner']), validate(createExpenseSchema), ExpenseController.createExpense);
router.delete('/expenses/:id', verifyToken, checkRole(['admin', 'owner']), ExpenseController.deleteExpense);
// --- TRANSACTION (SỔ QUỸ) ROUTES ---
const TransactionController = require('../controllers/TransactionController');
router.get('/transactions', verifyToken, checkRole(['admin', 'owner']), TransactionController.getTransactions);
router.post('/transactions', verifyToken, checkRole(['admin', 'owner']), TransactionController.createTransaction);
router.delete('/transactions/:id', verifyToken, checkRole(['owner']), TransactionController.deleteTransaction);
// --- REPORTS ---
const ReportController = require('../controllers/ReportController');
router.get('/reports/daily', verifyToken, branchCheck, ReportController.getDailyReport);
router.get('/reports/cashflow', verifyToken, checkRole(['admin', 'owner']), ReportController.getCashflowReport);

// --- CONSULTATION ROUTES ---
const ConsultationController = require('../controllers/ConsultationController');
router.post('/consultations', validate(createConsultationSchema), ConsultationController.createConsultation); // Public
router.get('/consultations', verifyToken, checkRole(['admin', 'owner']), ConsultationController.getAllConsultations);
router.put('/consultations/:id', verifyToken, checkRole(['admin', 'owner']), ConsultationController.updateConsultation);
router.delete('/consultations/:id', verifyToken, checkRole(['admin', 'owner']), ConsultationController.deleteConsultation);

// --- AUDIT LOG ROUTES ---
router.get('/logs', verifyToken, checkRole(['admin', 'owner']), branchCheck, ActionLogController.getLogs);


module.exports = router;
