import bodyParser from 'body-parser';
import { Application } from 'express';
import compress from 'compression';
import helmet from 'helmet';
import rateLimiter from 'express-rate-limit';
import Locals from '@/providers/Locals';
import session from 'express-session';
import Database from '@/providers/Database';
import reqIp from 'request-ip';

class Http {
  // Mounts all the defined middlewares in the application
  public static mount = (_express: Application): Application => {
    const { BODY_PARSER_LIMIT, MAX_RATE_LIMIT } = Locals.config();
    // Request IP Middleware to access the client ip address
    _express.use(reqIp.mw());
    // Body Parser configuration
    _express.use(
      bodyParser.json({
        limit: BODY_PARSER_LIMIT,
      }),
    );

    _express.use(
      bodyParser.urlencoded({
        limit: BODY_PARSER_LIMIT,
        parameterLimit: 10000,
        extended: true,
      }),
    );

    // Disable the x-powered-by header in response
    _express.disable('x-powered-by');

    // Helmet middleware for the security
    _express.use(
      helmet({
        noSniff: true,
        referrerPolicy: {
          policy: 'no-referrer',
        },
      }),
    );

    // Enables the compression for response
    _express.use(compress());

    // Rate Limiter
    _express.use(
      rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: MAX_RATE_LIMIT, // limit each IP to requests per windowMs
        message: 'Too many requests, please try again later.',
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        statusCode: 429,
      }),
    );

    // Trust the first proxy
    _express.set('trust proxy', 1);

    // Setup Session Middleware to store user session's
    _express.use(
      session({
        store: Database.getRedisSessionStore(),
        resave: false,
        saveUninitialized: false,
        name: Locals.config().SESSION_NAME,
        secret: Locals.config().SESSION_SECRET,
        cookie: {
          priority: 'high',
          maxAge: Locals.config().SESSION_MAX_AGE,
          domain: Locals.config().SESSION_DOMAIN,
          secure: Locals.config().NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'none',
          path: '/',
        },
      }),
    );

    return _express;
  };
}

export default Http;
