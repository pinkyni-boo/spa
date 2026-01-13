const Customer = require('../models/Customer');

// 1. Search API (Autosuggest)
exports.search = async (req, res) => {
    try {
        const { query } = req.query; // e.g. "0909" or "Lan"
        if (!query) return res.json([]);

        // Simple Regex search on Phone OR Name
        const regex = new RegExp(query, 'i');
        const customers = await Customer.find({
            $or: [{ phone: regex }, { name: regex }]
        })
        .limit(10)
        .select('name phone totalVisits totalSpent notes loyaltyPoints'); // Select only needed fields

        res.json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Search Error' });
    }
};

// 2. Get Detail (History)
exports.getById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if(!customer) return res.status(404).json({message: 'Not found'});
        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error' });
    }
};

// 3. [INTERNAL] Sync Customer Stats (Call after Invoice/Booking)
exports.syncCustomerStats = async (data) => {
    try {
        // data = { phone, name, amount }
        if (!data.phone) return;

        let customer = await Customer.findOne({ phone: data.phone });

        if (!customer) {
            // New Customer
            customer = new Customer({
                phone: data.phone,
                name: data.name || 'Khách Vãng Lai',
                totalVisits: 1,
                totalSpent: data.amount || 0,
                lastVisit: new Date(),
                loyaltyPoints: Math.floor((data.amount || 0) / 100000) // 1 point per 100k
            });
        } else {
            // Returning Customer
            customer.totalVisits += 1;
            customer.totalSpent += (data.amount || 0);
            customer.lastVisit = new Date();
            customer.loyaltyPoints += Math.floor((data.amount || 0) / 100000);
            
            // Allow name update if provided
            if (data.name && data.name !== customer.name) {
                // Optional: strategy to update name or keep old
                // For now keep old or maybe update if name is longer?
            }
        }
        
        await customer.save();
        console.log(`[CRM] Synced Customer: ${customer.name} (${customer.phone})`);
        return customer;
    } catch (error) {
        console.error("[CRM] Sync Error:", error);
    }
};
