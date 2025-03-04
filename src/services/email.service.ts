import nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import fs from 'fs';
import path from 'path';
import Logger from '@/utils/logger';
import Locals from '@/providers/Locals';
import { BaseEmailJob, EmailType, EmailTypes } from '@/types/email.types';
import Handlebars from 'handlebars';

class EmailService {
  private transporter = nodemailer.createTransport({
    service: Locals.config().EMAIL_SERVICE,
    host: Locals.config().EMAIL_HOST,
    port: Locals.config().EMAIL_PORT,
    secure: true,
    pool: true,
    maxMessages: Infinity,
    maxConnections: 5,
    auth: {
      user: Locals.config().EMAIL_USER,
      pass: Locals.config().EMAIL_PASSWORD,
    },
  });

  /**
   * Reads and renders the email template by replacing placeholders with dynamic data.
   * @param templateName - The name of the email template
   * @param data - Object containing dynamic values to inject
   * @returns Rendered HTML string
   */
  private async renderTemplate<T extends EmailType>(templateName: T, data: Record<string, string>): Promise<string> {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Email template not found: ${templateName}`);
      }

      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      // ✅ Compile template with Handlebars
      const compiledTemplate = Handlebars.compile(templateSource);
      return compiledTemplate(data); // ✅ Dynamically injects data

    } catch (error) {
      Logger.error(`❌ Failed to render email template (${templateName}):`, error);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  /**
   * Sends an email with the given type and data.
   * @param job - Email job containing type, recipient, and data
   */
  public async sendEmail<T extends EmailType>(job: BaseEmailJob<T>): Promise<SMTPPool.SentMessageInfo | null> {
    try {
      const { to, type, data } = job;
      const templateHtml = await this.renderTemplate(type, data as Record<string, string>);

      const emailResponse = await this.transporter.sendMail({
        from: Locals.config().EMAIL_USER,
        to,
        subject: EmailTypes[type].subject,
        html: templateHtml,
      });

      Logger.info(`📨 Email sent successfully to: ${to} (ID: ${emailResponse.messageId})`);
      return emailResponse;
    } catch (error) {
      Logger.error(`❌ Failed to send email to ${job.to}:`, error);
      return null;
    }
  }
}

export default EmailService;
