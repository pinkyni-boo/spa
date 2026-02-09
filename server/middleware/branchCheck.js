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

        // 2. BRANCH ADMIN / STAFF -> See ONLY their Branch
        // Note: Token has branchId: user.managedBranches?.[0]
        if (user.branchId) {
            req.branchQuery = { branchId: user.branchId };
            return next();
        }

        // 3. Fallback: If role is admin but no branch assigned?
        // For safety, return empty result or 403?
        // Let's allow but they will see nothing if we filter by a non-existent branch,
        // OR strict mode: 403.
        // Current logic: strict.
        return res.status(403).json({ 
            success: false, 
            message: 'Access Denied: No branch assigned to this account.' 
        });

    } catch (error) {
        console.error('Branch Check Error:', error);
        res.status(500).json({ success: false, message: 'Server error in branch check' });
    }
};
