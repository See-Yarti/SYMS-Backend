import { Application } from 'express';
import cors from 'cors';

class Cors {
  public static mount(_express: Application): Application {
    const allowedOrigins = ['http://localhost:5173'];
    _express.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Authorization', 'Set-Cookie'],
      }),
    );

    return _express;
  }
}

export default Cors;
