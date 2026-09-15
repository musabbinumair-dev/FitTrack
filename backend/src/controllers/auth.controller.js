import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ENABLE_OTP, DISABLE_OTP } from "../config/env.js";

// OTP is temporarily disabled for production phase; registration and login are direct.
const resetTokenStore = new Map();

async function register(req, res) {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, username, email, passwordHash });

    const accessToken = jwt.sign({ userId: newUser._id }, JWT_ACCESS_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId: newUser._id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    const user = await User.findById(newUser._id);

    res.status(201).json({ message: "Account created successfully", accessToken, refreshToken, user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Please enter username/email and password" });
    }

    const userWithPassword = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }]
    }).select("+passwordHash");
    if (!userWithPassword) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    const accessToken = jwt.sign({ userId: userWithPassword._id }, JWT_ACCESS_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId: userWithPassword._id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

    userWithPassword.refreshTokens.push(refreshToken);
    await userWithPassword.save();

    const user = await User.findById(userWithPassword._id);

    res.json({ message: "Login successful", accessToken, refreshToken, user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign({ userId: user._id }, JWT_ACCESS_SECRET, { expiresIn: "1h" });

    res.json({ message: "New access token created", accessToken });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) {
      return res.status(400).json({ message: "Already logged out" });
    }

    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    const resetToken = jwt.sign({ userId: user._id.toString() }, JWT_ACCESS_SECRET, { expiresIn: "1h" });
    resetTokenStore.set(resetToken, { userId: user._id.toString(), expiresAt: Date.now() + 3600000 });

    console.log(`PASSWORD RESET TOKEN for ${user.email}: ${resetToken}`);

    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const stored = resetTokenStore.get(token);
    if (!stored || stored.userId !== decoded.userId || stored.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.userId, { passwordHash });

    resetTokenStore.delete(token);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const userWithPassword = await User.findById(req.userId).select("+passwordHash");
    if (!userWithPassword) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, userWithPassword.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.userId, { passwordHash });

    userWithPassword.refreshTokens = [];
    await userWithPassword.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export { register, login, refresh, logout, forgotPassword, resetPassword, changePassword };