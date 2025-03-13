import express, { NextFunction, Request, Response } from 'express';
import Locals from './Locals';
import { NotFoundError } from '@/utils/errors';
import ErrorHandler from '@/utils/errorHandler';
import Http from '@/middlewares/Http';
import apiRouter from '@/routes';
import WorkerManager from './Workers';
import Cors from '@/middlewares/Cors';
import { createServer } from 'http';
class Express {
  /**
   * Create a express object
   */
  public express: express.Application;
  public server: ReturnType<typeof createServer>;
  constructor() {
    this.express = express();
    this.server = createServer(this.express); 
    this.mountEnvVariables();
    this.mountMiddlewares();
    this.mountAPIRoutes();
  }

  private mountAPIRoutes(): void {
    this.express = this.express.use('/api', apiRouter);
  }

  private mountEnvVariables(): void {
    this.express = Locals.init(this.express);
  }

  private mountMiddlewares(): void {
    this.express = Http.mount(this.express);
    this.express = Cors.mount(this.express);
  }

  public async init() {
    const port = Locals.config().PORT;
    // Load all the workers before starting the server
    await WorkerManager.load();

    //  Not Found Error handling
    this.express.use((request: Request, response: Response, next: NextFunction) =>
      next(new NotFoundError(request.path)),
    );

    // Error handling middleware
    this.express.use(ErrorHandler.handle());

    // Start the server on the specified port
    this.server
      .listen(port, () => {
        return console.log(`Server :: Running @ 'http://localhost:${port}'`);
      })
      .on('error', (_error) => {
        return console.log('Error: ', _error.message);
      });
  }
}

export default new Express();
