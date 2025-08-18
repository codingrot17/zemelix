const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const JWT_SECRET =
    process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production";

function generateTokens(user) {
    const payload = {
        userId: user._id,
        role: user.role,
        email: user.email
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
}

function auth(requiredRoles = []) {
    return async (req, res, next) => {
        try {
            const header = req.header("Authorization");
            if (!header || !header.startsWith("Bearer ")) {
                return res.status(401).json({ error: "Access token required" });
            }

            const token = header.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            // Check if user still exists and is active
            const user = await UserModel.findById(decoded.userId);
            if (!user || !user.isActive) {
                return res
                    .status(401)
                    .json({ error: "User not found or inactive" });
            }

            // Check role permissions
            if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
                return res
                    .status(403)
                    .json({ error: "Insufficient permissions" });
            }

            req.user = decoded;
            next();
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ error: "Token expired" });
            }
            return res.status(401).json({ error: "Invalid token" });
        }
    };
}

// Role-specific middleware
const adminOnly = () => auth(["admin"]);
const sellerOrAdmin = () => auth(["seller", "admin"]);
const customerOrSeller = () => auth(["customer", "seller"]);
const allRoles = () => auth(["admin", "seller", "customer"]);

module.exports = {
    auth,
    adminOnly,
    sellerOrAdmin,
    customerOrSeller,
    allRoles,
    generateTokens,
    JWT_SECRET
};
