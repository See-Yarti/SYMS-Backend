import { TUserSession } from '@/types/user.types';
import { Application } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Locals from './Locals';
import User from '@/models/user.model';
class PassportStrategies {
  // Mounts all the defined passport strategies in the application
  public static mountAllStrategies() {
    passport.use(this.GoogleStrategy());
  }

  // Google Strategy
  private static GoogleStrategy() {
    return new GoogleStrategy(
      {
        clientID: Locals.config().GOOGLE_CLIENT_ID,
        clientSecret: Locals.config().GOOGLE_CLIENT_SECRET,
        callbackURL: Locals.config().GOOGLE_CALLBACK_URL,
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
          if (!email) {
            return done(null, false, { message: 'Incorrect email.' });
          }
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
          }
          const storageData: TUserSession = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          };
          return done(null, storageData);
        } catch (error) {
          return done(error);
        }
      },
    );
  }
}

class Passport {
  public mount(_express: Application): Application {
    // passport configuration
    _express.use(passport.initialize());
    _express.use(passport.session());
    PassportStrategies.mountAllStrategies();
    this.configureSerialization();
    return _express;
  }

  public configureSerialization() {
    // Serialization configuration
    passport.serializeUser((user: Express.User, done) => {
      console.log('Serialize User', user);
      done(null, user);
    });
    // Deserialization configuration
    passport.deserializeUser(async (user: any, done) => {
      console.log('Deserialize User', user);
      try {
        const isDeserializeUser = await User.findById(user.id);
        if (!isDeserializeUser) return done(null, false);
        const deserializeUser: TUserSession = {
          id: isDeserializeUser.id,
          email: isDeserializeUser.email,
          firstName: isDeserializeUser.firstName,
          lastName: isDeserializeUser.lastName,
        };
        done(null, deserializeUser);
      } catch (error) {
        done(error, null);
      }
    });
  }
}
export default new Passport();
