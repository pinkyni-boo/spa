const ActionLog = require('../models/ActionLog');
const User = require('../models/User');

const ActionLogController = {
    // 1. HELPER: Create Log (Internal Use)
    createLog: async (req, user, action, targetType, targetId, targetName = '', details = {}) => {
        try {
            if (!user) return; // Silent fail if no user (e.g. system task)

            // Extract User Info
            const userId = user._id || user.id;
            let displayName = user.username || user.name || null;
            const role = user.role || 'unknown';

            // If token doesn't have username (old tokens), look up from DB
            if (!displayName && userId) {
                try {
                    const dbUser = await User.findById(userId).select('username name').lean();
                    if (dbUser) displayName = dbUser.username || dbUser.name || 'Unknown';
                } catch (_) {}
            }
            if (!displayName) displayName = 'Unknown';

            // Extract Request Info
            const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown') : 'system';
            const userAgent = req ? req.headers['user-agent'] : 'system';

            // Extract Branch — priority: explicit query > branchCheck middleware > user token
            let branchId = null;
            if (req && req.query && req.query.branchId) branchId = req.query.branchId;
            if (req && req.branchQuery && req.branchQuery.branchId) branchId = req.branchQuery.branchId;
            if (!branchId && user.branchId) {
                // Handle both old tokens (object {_id,name}) and new tokens (plain ID string)
                branchId = user.branchId?._id || user.branchId;
            }

            const newLog = new ActionLog({
                user: userId,
                displayName,
                role,
                action,
                targetType,
                targetId,
                targetName,
                details,
                ip,
                userAgent,
                branchId
            });

            await newLog.save();
            // console.log(`[AUDIT] Action: ${action} by ${displayName}`);
        } catch (error) {
            console.error('[AUDIT ERROR] Failed to save log:', error);
        }
    },

    // 2. API: Get Logs (Admin Only)
    getLogs: async (req, res) => {
        try {
            const { page = 1, limit = 20, userId, action, targetType, startDate, endDate } = req.query;

            const query = {};

            // Filters
            if (userId) query.user = userId;
            if (action) query.action = action;
            if (targetType) query.targetType = targetType;
            
            // Date Range
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = new Date(startDate);
                if (endDate) query.timestamp.$lte = new Date(endDate);
            }

            // Role Check: If user is simple staff, they can't see logs (handled by route middleware usually)
            // But if we want extra safety:
            // if (req.user.role !== 'admin' && req.user.role !== 'owner') return res.status(403).json({ success: false, message: 'Unauthorized' });

            const logs = await ActionLog.find(query)
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .populate('user', 'username role')
                .populate('branchId', 'name');

            const total = await ActionLog.countDocuments(query);

            res.json({
                success: true,
                logs,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

module.exports = ActionLogController;
