import User from "../models/User.js";

export async function requireAdmin(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access restricted. Only users with role: 'admin' can access admin resources."
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authorization check failed", error: error.message });
  }
}

export default requireAdmin;
