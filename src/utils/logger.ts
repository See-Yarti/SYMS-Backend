import winston from 'winston';
import 'winston-daily-rotate-file';

// Create a transport for daily rotating log files
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

// Create a transport for logging to the console
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
});

const Logger = winston.createLogger({
  level: 'info', // Default logging level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level} :: ${message}`;
    }),
  ),
  transports: [
    consoleTransport,
    dailyRotateFileTransport,
  ],
});

export default Logger;
