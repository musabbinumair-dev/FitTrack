import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/env.js";

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.userId = decoded.userId || decoded.id || decoded._id;
    if (!req.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default auth;
