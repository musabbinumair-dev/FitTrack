import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from "./env.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase();
      if (!email) return done(new Error("No email from Google"), null);

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
          name: profile.displayName || username,
          username,
          email,
          passwordHash: "",
          avatarUrl: profile.photos?.[0]?.value || "",
        });
      } else if (!user.avatarUrl && profile.photos?.[0]?.value) {
        user.avatarUrl = profile.photos[0].value;
        await user.save();
      }

      const accessToken = jwt.sign({ userId: user._id }, JWT_ACCESS_SECRET, { expiresIn: "1h" });
      const newRefreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

      user.refreshTokens.push(newRefreshToken);
      await user.save();

      return done(null, { user, accessToken, refreshToken: newRefreshToken });
    } catch (err) {
      return done(err, null);
    }
  }
);