import cluster from 'cluster';
import os from 'os';
import path from 'path';
import dotenv from 'dotenv';
import Express from './Express';
import Logger from '@/utils/logger';
import Database from './Database';
import Locals from './Locals';
import Socket from './Socket';

class App {
  public loadConfigurations(): void {
    const envFile = `.env.${process.env.NODE_ENV}`;
    dotenv.config({ path: path.join(__dirname, '..', '..', '/secrets', envFile) });
  }

  public loadDatabase(): void {
    Database.init();
  }

  private startServer(): void {
    Logger.info('Booting the server...');
    this.loadConfigurations();
    Express.init();
    Socket.init(Express.server);
  }

  private startCluster(): void {
    const cpuCount = os.cpus().length;

    Logger.info(`Starting ${cpuCount} worker processes...`);

    // Fork workers
    Array.from({ length: cpuCount }).forEach(() => cluster.fork());

    cluster.on('online', (worker) => 
      Logger.info(`Worker ${worker.process.pid} is online.`)
    );

    cluster.on('exit', (worker, code, signal) => {
      Logger.error(`Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}). Restarting...`);
      cluster.fork(); // Restart worker on failure
    });

    // Handle global errors
    process.on('uncaughtException', (err) => Logger.error(err.message));
    process.on('warning', (warn) => Logger.warn(warn.message));
  }

  public run(): void {
    if (cluster.isPrimary && Locals.config().NODE_ENV === 'production') {
      this.startCluster();
    } else {
      this.loadDatabase();
      this.startServer();
    }
  }
}

export default new App();
