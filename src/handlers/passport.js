//For web-auth
import passport from "passport";
import User from "../models/userSchema.js";
import ShortcutToken from "../models/shortcutTokenSchema.js";

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
        // payload.id will be the user ID we put in the token
        const user = await User.findById(payload.id);
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

const extractTokenFromHeader = (req) => {
  if (!req || !req.headers) return null;

  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer (.+)$/);
  if (match && match[1]) {
    return match[1]; // raw JWT string
  }

  return null;
};

//Create revocable tokens for use in shortcuts
passport.use(
  "shortcut-jwt",
  new JwtStrategy(
    {
      jwtFromRequest: extractTokenFromHeader,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true, // <-- enables access to `req`
    },
    async (req, payload, done) => {
      // note first param is now `req`
      try {
        // Only allow Shortcut tokens
        if (payload.type !== "shortcut" || payload.scope !== "create:note") {
          return done(null, false);
        }

        // Extract raw token from the same request
        const rawToken = extractTokenFromHeader(req);

        // Lookup token in DB for revocation
        const tokenRecord = await ShortcutToken.findOne({
          token: rawToken,
          revoked: false,
        });

        if (!tokenRecord) {
          return done(null, false);
        }

        // Attach userId to req.user
        return done(null, tokenRecord.userId);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

export default passport;
