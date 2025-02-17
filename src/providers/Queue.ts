import { Queue as BullQueue, Worker, Job } from 'bullmq';
import Locals from './Locals';
import Logger from '@/utils/logger';
import Database from './Database';

export default class Queue {
  private static queues: Map<string, BullQueue> = new Map();

  /**
   * Initialize a queue dynamically
   * @param queueName - The name of the queue
   * @returns {BullQueue} - The created queue instance
   */
  public static getQueue(queueName: string): BullQueue {
    if (!this.queues.has(queueName)) {
      const queue = new BullQueue(queueName, {
        connection: Database.getRedisOptions('QUEUE'),
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: 500, // Keep only last 500 failed jobs
          attempts: Locals.config().QUEUE_FAILED_ATTEMPTS,
        },
      });

      this.queues.set(queueName, queue);
      Logger.info(`✅ Queue "${queueName}" initialized`);
    }

    return this.queues.get(queueName)!;
  }

  /**
   * Add a job to a queue
   * @param queueName - The queue name
   * @param jobName - Unique job identifier
   * @param data - Payload for the job
   * @param opts - Job options (optional)
   * @returns Promise<string> - The job ID
   */
  public static async addJob(queueName: string, jobName: string, data: any, opts?: object) {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, data, opts);
    Logger.info(`📌 Job "${jobName}" added to queue "${queueName}" with ID: ${job.id}`);
    return job.id; // Return job ID for tracking
  }

  /**
   * Get a job by ID from a queue
   * @param queueName - The queue name
   * @param jobId - The job ID in the queue
   * @returns Promise<Job | null>
   **/
  public static async getJob(queueName: string, jobId: string): Promise<Job | null> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    return job;
  }

  /**
   * Delete a job by ID from a queue
   * @param queueName - The queue name
   * @param jobId - The job ID in the queue
   * @returns Promise<void>
   **/
  public static async deleteJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      Logger.info(`🗑️ Job "${jobId}" removed from queue "${queueName}"`);
    } else {
      Logger.warn(`⚠️ Job "${jobId}" not found in queue "${queueName}"`);
    }
  }

  /**
   * Process jobs for a queue
   * @param queueName - The queue name
   * @param processFunction - Function to handle job processing
   */
  public static startWorker(queueName: string, processFunction: (job: Job) => Promise<void>) {
    const worker = new Worker(
      queueName,
      async (job) => {
        Logger.info(`🚀 Processing job "${job.name}" in queue "${queueName}"`);
        await processFunction(job);
      },
      { connection: Database.getRedisOptions('QUEUE') },
    );

    worker.on('failed', (job, err) => {
      Logger.error(`❌ Job "${job?.name}" failed`, err);
    });

    Logger.info(`🔧 Worker started for queue "${queueName}"`);
  }
}
