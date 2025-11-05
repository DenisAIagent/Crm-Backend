import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.userId).select('-password');

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update user info if needed
          user.profilePicture = profile.photos[0]?.value || user.profilePicture;
          user.lastLogin = new Date();
          user.loginCount += 1;
          user.lastActivity = new Date();
          await user.save();

          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findByEmail(profile.emails[0].value);

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.profilePicture = profile.photos[0]?.value || user.profilePicture;
          user.isVerified = true;
          user.lastLogin = new Date();
          user.loginCount += 1;
          user.lastActivity = new Date();
          await user.save();

          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0]?.value,
          isVerified: true,
          role: 'agent', // Default role for OAuth users
          permissions: User.getPermissionsByRole('agent'),
          lastLogin: new Date(),
          loginCount: 1
        });

        return done(null, user);

      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;