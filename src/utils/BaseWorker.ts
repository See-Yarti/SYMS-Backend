import Database from '@/providers/Database';
import { Job, Worker } from 'bullmq';

export default abstract class BaseWorker {
  protected connection: any;
  protected concurrency: number;

  constructor() {
    this.connection = Database.getRedisOptions('QUEUE');
    this.concurrency = 5;
  }

  // Abstract method that subclasses must implement
  abstract mount(): void;

  // Initialize the worker in a consistent way
  protected createWorker(queueName: string, jobProcessor: (job: Job) => Promise<void>): Worker {
    return new Worker(queueName, jobProcessor, {
      connection: this.connection,
      concurrency: this.concurrency,
    });
  }
}
