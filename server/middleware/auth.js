import jwt from "jsonwebtoken";

const auth = (req, res, next)=>{
    const token = req.headers.authorization;

    if (!token) {
        return res.json({ success: false, message: "No authentication token provided" });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_here");
        next();
    } catch (error) {
        console.log("invalid token:", error.message);
        return res.json({ success: false, message: "Invalid or expired token" });
    }
}

export default auth;