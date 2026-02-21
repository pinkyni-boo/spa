const Customer = require('../models/Customer');
const Booking = require('../models/Booking'); // Import Booking model

// 1. Search Customers (Aggregated from Booking & Customer)
// 1. Search Customers (Aggregated from Booking & Customer)
exports.searchCustomers = async (req, res) => {
    try {
        const { query, branchId } = req.query; // Search by name or phone, filter by branch
        
        let customers = [];
        let bookings = [];

        if (!query) {
            // [DEFAULT VIEW] Return recent unique customers (from recent bookings)
            // Filter by Branch if provided (for Admins)
            const filter = {};
            if (branchId) {
                filter.branchId = branchId;
            }

            // Get last 200 bookings to aggregate
            bookings = await Booking.find(filter)
                .select('customerName phone createdAt')
                .sort({ createdAt: -1 })
                .limit(200);
        } else {
            // [SEARCH VIEW] GLOBAL SEARCH (As per requirement: CRM is Global)
            // Priority 1: Search in Customer collection (synced data)
            customers = await Customer.find({
                $or: [
                    { phone: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            }).limit(20).sort({ lastVisit: -1 });
            // Priority 2: Fallback search in Booking collection
            bookings = await Booking.find({
                $or: [
                    { phone: { $regex: query, $options: 'i' } },
                    { customerName: { $regex: query, $options: 'i' } }
                ]
            }).select('customerName phone createdAt').sort({ createdAt: -1 }).limit(100);
        }

        // Aggregate unique phone numbers
        // If 'customers' array has data, put them in Map first
        const uniqueMap = new Map();
        
        customers.forEach(c => {
            uniqueMap.set(c.phone, c);
        });

        const result = [...customers]; // Start with CRM data

        for (const booking of bookings) {
            if (!uniqueMap.has(booking.phone)) {
                // Found a guest not in CRM list (or not in search result yet)
                const guestObj = {
                    _id: null,
                    phone: booking.phone,
                    name: booking.customerName || 'Khách vãng lai',
                    totalVisits: 0,
                    totalSpent: 0,
                    lastVisit: booking.createdAt,
                    isGuest: true
                };
                uniqueMap.set(booking.phone, guestObj);
                result.push(guestObj);
            }
        }

        // Return top 50
        res.json({
            success: true,
            customers: result.slice(0, 50)
        });

    } catch (error) {
        console.error('Error searching customers:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 2. Get Customer History & Stats
exports.getCustomerHistory = async (req, res) => {
    try {
        const { phone } = req.params;

        // Get Bookings
        const bookings = await Booking.find({ phone })
            .populate('serviceId', 'name price duration')
            .populate('staffId', 'name')
            .sort({ startTime: -1 });

        // Calculate Real-time Stats from Bookings (Source of Truth)
        let totalSpent = 0;
        let completedVisits = 0;
        let cancelledVisits = 0;
        let lastVisit = null;

        bookings.forEach(booking => {
            if (booking.status === 'completed') {
                const price = booking.finalPrice || (booking.serviceId ? booking.serviceId.price : 0);
                totalSpent += price;
                completedVisits++;
                
                // Track latest completed visit
                if (!lastVisit || new Date(booking.startTime) > new Date(lastVisit)) {
                    lastVisit = booking.startTime;
                }
            } else if (booking.status === 'cancelled') {
                cancelledVisits++;
            }
        });

        // Get CRM Data if exists
        const customerProfile = await Customer.findOne({ phone });

        res.json({
            success: true,
            profile: customerProfile || { 
                name: bookings[0]?.customerName || 'Khách vãng lai', 
                phone 
            },
            stats: {
                totalSpent,
                visitCount: completedVisits, // Use actual completed count
                cancelledVisits,
                lastVisit: lastVisit || (bookings.length > 0 ? bookings[0].startTime : null),
                loyaltyPoints: Math.floor(totalSpent / 100000)
            },
            history: bookings
        });

    } catch (error) {
        console.error('Error getting customer history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 3. [INTERNAL] Sync Customer Stats (Keep existing logic)
exports.syncCustomerStats = async (data) => {
    try {
        // data = { phone, name, amount }
        if (!data.phone) return;

        let customer = await Customer.findOne({ phone: data.phone });

        // [CONFIG] 1 Point per 10,000 VND
        const POINTS_DIVISOR = 10000; 
        const newPoints = Math.floor((data.amount || 0) / POINTS_DIVISOR);

        if (!customer) {
            // New Customer
            customer = new Customer({
                phone: data.phone,
                name: data.name || 'Khách Vãng Lai',
                totalVisits: 1,
                totalSpent: data.amount || 0,
                lastVisit: new Date(),
                loyaltyPoints: newPoints
            });
        } else {
            // Returning Customer
            customer.totalVisits += 1;
            customer.totalSpent += (data.amount || 0);
            customer.lastVisit = new Date();
            customer.loyaltyPoints = (customer.loyaltyPoints || 0) + newPoints;
            
            // Allow name update if provided and different
             if (data.name && data.name !== customer.name) {
                // Logic to update name if needed
            }
        }
        
        await customer.save();
        console.log(`Synced Customer: ${customer.name} (${customer.phone}) - Added ${newPoints} points`);
        return customer;
    } catch (error) {
        console.error("Sync Error:", error);
    }
};

// 4. [INTERNAL] Deduct Points
exports.deductPoints = async (phone, points) => {
    try {
        const customer = await Customer.findOne({ phone });
        if (!customer) throw new Error('Customer not found');
        
        if (customer.loyaltyPoints < points) {
            throw new Error('Not enough points');
        }

        customer.loyaltyPoints -= points;
        await customer.save();
        console.log(`Deducted ${points} points from ${phone}`);
        return true;
    } catch (error) {
        console.error("Deduct Points Error:", error);
        throw error;
    }
};
