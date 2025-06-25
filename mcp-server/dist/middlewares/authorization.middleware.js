"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(403).json({ error: 'Insufficient permissions. User role not found.' });
            return;
        }
        const hasPermission = requiredRoles.includes(req.user.role);
        if (!hasPermission) {
            res.status(403).json({ error: 'Insufficient permissions.' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
