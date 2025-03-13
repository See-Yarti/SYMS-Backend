import { Application } from 'express';
import cors from 'cors';
import Locals from '@/providers/Locals';

class Cors {
  /**
   * Configures CORS middleware for the Express application
   */
  public static corsConfig: cors.CorsOptions = {
    origin: function (origin, callback) {
      if (!origin || Locals.config().CORS_ALLOWED_ORIGIN === origin) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization', 'Set-Cookie'],
  };

  /**
   * Mounts CORS middleware to the Express application
   * @param _express - Express application to mount middleware to
   * @returns - Modified Express application with CORS middleware
   */
  public static mount(_express: Application): Application {
    _express.use(cors(Cors.corsConfig));

    return _express;
  }
}

export default Cors;
