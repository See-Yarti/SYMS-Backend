import Logger from '@/utils/logger';
import EmailWorker from '@/workers/EmailWorker';

class WorkerManager {
  private static workers = [EmailWorker];

  public static async load(): Promise<void> {
    const workerPromises = this.workers.map(async (worker) => {
      try {
        const workerInstance = new worker();
        workerInstance.mount();  // Mount the worker
        Logger.info(`✔️ Worker initialized: ${worker.name}`);
      } catch (error: any) {
        Logger.error(`❌ Failed to initialize worker: ${worker.name}, Error: ${error.message}`);
      }
    });

    await Promise.all(workerPromises);
    Logger.info('✔️ All workers loaded.');
  }
}

export default WorkerManager;
