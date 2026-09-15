import { CLIENT_ORIGIN, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config/env.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export function googleAuthStart(req, res) {
  const { scope = "profile email" } = req.query;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(authUrl);
}

export async function googleAuthCallback(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.CLIENT_ORIGIN || "http://localhost:3001"}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${process.env.CLIENT_ORIGIN || "http://localhost:3001"}/login?error=${encodeURIComponent("No authorization code")}`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("Google token exchange failed:", tokens);
      return res.redirect(`${process.env.CLIENT_ORIGIN || "http://localhost:3001"}/login?error=${encodeURIComponent("Token exchange failed")}`);
    }

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userInfoResponse.json();

    const email = profile.email?.toLowerCase();
    if (!email) {
      return res.redirect(`${process.env.CLIENT_ORIGIN || "http://localhost:3001"}/login?error=${encodeURIComponent("No email from Google")}`);
    }

    let user = await User.findOne({ email });
    if (!user) {
      const usernameBase = email.split("@")[0];
      let username = usernameBase;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${usernameBase}${counter}`;
        counter++;
      }

      user = await User.create({
        name: profile.name || username,
        username,
        email,
        passwordHash: "",
        avatarUrl: profile.picture || "",
      });
    } else if (!user.avatarUrl && profile.picture) {
      user.avatarUrl = profile.picture;
      await user.save();
    }

    const accessToken = jwt.sign({ userId: user._id }, JWT_ACCESS_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

    user.refreshTokens.push(refreshToken);
    await user.save();

    const frontendUrl = process.env.CLIENT_ORIGIN || "http://localhost:3001";
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google callback error:", err);
    res.redirect(`${process.env.CLIENT_ORIGIN || "http://localhost:3001"}/login?error=${encodeURIComponent("Authentication failed")}`);
  }
}

export function googleAuthStartDemo(req, res) {
  res.status(400).json({ message: "Google OAuth not configured in demo mode" });
}