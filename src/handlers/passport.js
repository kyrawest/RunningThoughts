//For web-auth
import passport from "passport";
import User from "../models/userSchema.js";

//For mobile-auth
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import jwt from "jsonwebtoken";

//For web auth
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//For mobile auth
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, // add JWT_SECRET to your .env
    },
    async (payload, done) => {
      try {
        // payload.sub will be the user ID we put in the token
        const user = await User.findById(payload.sub);
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        done(err, false);
      }
    }
  )
);
