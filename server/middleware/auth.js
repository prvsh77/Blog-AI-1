import jwt from "jsonwebtoken";

// Verifies the admin session token issued by adminController.adminLogin.
// That token is signed with only { email } (there is no backing User document
// for the admin account, since admin credentials come from env vars), so this
// middleware checks the email claim instead of looking up a user by id.
const auth = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.json({
                success: false,
                message: "No authentication token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

        if (!decoded.email || decoded.email !== adminEmail) {
            return res.json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        req.admin = { email: decoded.email };

        next();

    } catch (error) {

        console.log("Invalid token:", error.message);

        return res.json({
            success: false,
            message: "Invalid or expired token"
        });

    }
};

export default auth;