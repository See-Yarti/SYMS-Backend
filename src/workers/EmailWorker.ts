import EmailService from '@/services/email.service';
import { EmailJobData } from '@/types/email.types';
import BaseWorker from '@/utils/BaseWorker';
import { Worker, Job } from 'bullmq';

export default class EmailWorker extends BaseWorker {
  private worker: Worker | null = null;
  private emailService = new EmailService();

  mount(): void {
    if (!this.worker) {
      this.worker = this.createWorker('emailQueue', async (job: Job<EmailJobData>) => {
        try {
          await this.emailService.sendEmail(job.data);
        } catch (error) {
          console.error('Error processing email job:', error);
          throw error;
        }
      });
    }
  }
}
