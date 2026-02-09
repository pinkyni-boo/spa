const jwt = require('jsonwebtoken');

// Secret key (Should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'miu_spa_secret_2024';

// Middleware: Verify Token
exports.verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        // Check if header exists
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        // Check format "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. Invalid token format.' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        console.error('Auth Error:', error.message);
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};

// Middleware: Check Role
exports.checkRole = (roles) => {
    return (req, res, next) => {
        // req.user is attached from verifyToken
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Requires one of roles: ${roles.join(', ')}` 
            });
        }
        next();
    };
};
