import jwt from "jsonwebtoken";

// Admin tokens from adminController.adminLogin are signed with only { email }
// (no backing User document; admin credentials come from env vars), so we check
// the email claim instead of looking up a user by id. Returns null if not admin.
export const getAdminEmail = (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        return decoded.email && decoded.email === adminEmail ? decoded.email : null;
    } catch (error) {
        console.log("Invalid token:", error.message);
        return null;
    }
};

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.json({
            success: false,
            message: "No authentication token provided"
        });
    }

    const email = getAdminEmail(authHeader);
    if (!email) {
        return res.json({
            success: false,
            message: "Invalid or expired token"
        });
    }

    req.admin = { email };
    next();
};

export default auth;
