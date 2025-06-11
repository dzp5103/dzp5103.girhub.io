/**
 * Logging Infrastructure
 */

import winston from 'winston';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { configManager } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

// Add colors to winston
winston.addColors(customLevels.colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export class Logger {
  private static instance: Logger;
  private winston: winston.Logger;

  private constructor() {
    this.winston = this.createLogger();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogger(): winston.Logger {
    try {
      const config = configManager.getLoggingConfig();
      const isProduction = configManager.getServerConfig().environment === 'production';

      const transports: winston.transport[] = [
        // Console transport
        new winston.transports.Console({
          level: config.level,
          format: isProduction ? fileFormat : consoleFormat,
        }),
      ];

      // File transports for production
      if (isProduction) {
        const logDir = join(__dirname, '../../logs');
        
        // Error log file
        transports.push(
          new winston.transports.File({
            filename: join(logDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: this.parseSize(config.maxSize),
            maxFiles: config.maxFiles,
          })
        );

        // Combined log file
        transports.push(
          new winston.transports.File({
            filename: join(logDir, 'combined.log'),
            format: fileFormat,
            maxsize: this.parseSize(config.maxSize),
            maxFiles: config.maxFiles,
          })
        );

        // HTTP access log
        transports.push(
          new winston.transports.File({
            filename: join(logDir, 'access.log'),
            level: 'http',
            format: fileFormat,
            maxsize: this.parseSize(config.maxSize),
            maxFiles: config.maxFiles,
          })
        );
      }

      return winston.createLogger({
        level: config.level,
        levels: customLevels.levels,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
        ),
        transports,
        exitOnError: false,
      });

    } catch (error) {
      // Fallback logger if configuration fails
      return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ],
      });
    }
  }

  private parseSize(size: string): number {
    const match = size.match(/^(\d+)(KB|MB|GB)?$/i);
    if (!match) return 10 * 1024 * 1024; // Default 10MB

    const value = parseInt(match[1], 10);
    const unit = (match[2] || 'MB').toUpperCase();

    switch (unit) {
      case 'KB':
        return value * 1024;
      case 'MB':
        return value * 1024 * 1024;
      case 'GB':
        return value * 1024 * 1024 * 1024;
      default:
        return value;
    }
  }

  // Logging methods
  public error(message: string, meta?: any): void {
    this.winston.error(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  public http(message: string, meta?: any): void {
    this.winston.log('http', message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  // Structured logging methods
  public logRequest(req: { method: string; url: string; ip?: string; userAgent?: string }): void {
    this.http('HTTP Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.userAgent,
    });
  }

  public logResponse(res: { statusCode: number; responseTime?: number }): void {
    this.http('HTTP Response', {
      statusCode: res.statusCode,
      responseTime: res.responseTime,
    });
  }

  public logGitHubAPICall(call: { 
    endpoint: string; 
    method: string; 
    statusCode?: number; 
    rateLimit?: any;
    responseTime?: number;
  }): void {
    this.info('GitHub API Call', call);
  }

  public logPluginEvent(event: {
    plugin: string;
    event: string;
    data?: any;
    error?: Error;
  }): void {
    if (event.error) {
      this.error(`Plugin Event: ${event.plugin} - ${event.event}`, {
        plugin: event.plugin,
        event: event.event,
        error: event.error.message,
        stack: event.error.stack,
        data: event.data,
      });
    } else {
      this.info(`Plugin Event: ${event.plugin} - ${event.event}`, {
        plugin: event.plugin,
        event: event.event,
        data: event.data,
      });
    }
  }

  public logMCPEvent(event: {
    type: string;
    method?: string;
    tool?: string;
    resource?: string;
    duration?: number;
    error?: Error;
  }): void {
    if (event.error) {
      this.error(`MCP Event: ${event.type}`, {
        type: event.type,
        method: event.method,
        tool: event.tool,
        resource: event.resource,
        duration: event.duration,
        error: event.error.message,
        stack: event.error.stack,
      });
    } else {
      this.info(`MCP Event: ${event.type}`, {
        type: event.type,
        method: event.method,
        tool: event.tool,
        resource: event.resource,
        duration: event.duration,
      });
    }
  }

  public logDatabaseEvent(event: {
    type: 'query' | 'connection' | 'error';
    database: 'postgres' | 'redis';
    query?: string;
    duration?: number;
    error?: Error;
  }): void {
    if (event.error) {
      this.error(`Database Event: ${event.database} - ${event.type}`, {
        type: event.type,
        database: event.database,
        query: event.query,
        duration: event.duration,
        error: event.error.message,
        stack: event.error.stack,
      });
    } else {
      this.debug(`Database Event: ${event.database} - ${event.type}`, {
        type: event.type,
        database: event.database,
        query: event.query,
        duration: event.duration,
      });
    }
  }

  // Child logger for specific contexts
  public child(context: Record<string, any>): ChildLogger {
    return new ChildLogger(this.winston, context);
  }

  // Get underlying winston instance
  public getLogger(): winston.Logger {
    return this.winston;
  }

  // Reconfigure logger (useful for dynamic config changes)
  public reconfigure(): void {
    this.winston = this.createLogger();
  }
}

// Child logger for specific contexts
export class ChildLogger {
  constructor(
    private winston: winston.Logger,
    private context: Record<string, any>
  ) {}

  private log(level: string, message: string, meta?: any): void {
    const combinedMeta = { ...this.context, ...meta };
    this.winston.log(level, message, combinedMeta);
  }

  public error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  public info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  public http(message: string, meta?: any): void {
    this.log('http', message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
export default logger;