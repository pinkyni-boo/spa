// Middleware to enforce Data Isolation
// Injects 'req.branchQuery' based on User Role

exports.branchCheck = (req, res, next) => {
    try {
        const user = req.user; // Attached by verifyToken

        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // 1. OWNER / SUPER ADMIN -> See ALL
        if (user.role === 'owner' || user.role === 'super_admin') {
            req.branchQuery = {}; // No filter
            return next();
        }

        // 2. ADMIN with multiple managed branches -> filter by $in
        if (user.managedBranches && user.managedBranches.length > 0) {
            req.branchQuery = { branchId: { $in: user.managedBranches } };
            return next();
        }

        // 3. Fallback: single branchId (backward compat with old tokens)
        if (user.branchId) {
            req.branchQuery = { branchId: user.branchId };
            return next();
        }

        // 4. No branch assigned -> strict deny
        return res.status(403).json({ 
            success: false, 
            message: 'Access Denied: No branch assigned to this account.' 
        });

    } catch (error) {
        console.error('Branch Check Error:', error);
        res.status(500).json({ success: false, message: 'Server error in branch check' });
    }
};
