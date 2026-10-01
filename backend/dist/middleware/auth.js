import { extractToken, verifyToken } from '../utils/auth.js';
import { queryOne } from '../db/index.js';
export async function authMiddleware(req, res, next) {
    const token = extractToken(req.headers.authorization);
    if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication token required' });
    }
    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    const dbUser = await queryOne('SELECT is_active, is_blocked FROM users WHERE id = ?', [payload.userId]);
    if (!dbUser) {
        return res.status(401).json({ success: false, error: 'User account not found' });
    }
    if (!dbUser.is_active) {
        return res.status(403).json({ success: false, error: 'Account deactivated' });
    }
    if (dbUser.is_blocked) {
        return res.status(403).json({ success: false, error: 'Account blocked. Contact administrator.' });
    }
    req.user = payload;
    next();
}
export function roleMiddleware(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
            });
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map