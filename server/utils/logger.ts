import winston, { format } from 'winston';
import type { TransformableInfo } from 'logform';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf((info: TransformableInfo) => {
  const { timestamp, level, ...rest } = info;
  const ts = timestamp || new Date().toISOString();
  const message = typeof info.message === 'string' ? info.message : String(info.message);
  return `${ts} [${level}]: ${message} ${
    Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''
  }`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', 
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ) as winston.Logform.Format,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/exceptions.log' 
    })
  ]
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection at:', reason);
});
