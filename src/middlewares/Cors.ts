import { Application } from 'express';
import cors from 'cors';
import Locals from '@/providers/Locals';

class Cors {
  public static mount(_express: Application): Application {
    // cors configuration
    _express.use(
      cors({
        origin: Locals.config().CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        maxAge: 600, // cache the pre flight request for 10 minutes (600 seconds)
        optionsSuccessStatus: 204, // allow GET requests with valid credentials
      }),
    );

    return _express;
  }
}
export default Cors;
