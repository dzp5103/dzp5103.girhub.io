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
const consoleFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.colorize({ all: true }), winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
}));
// Custom format for file output
const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());
export class Logger {
    static instance;
    winston;
    constructor() {
        this.winston = this.createLogger();
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    createLogger() {
        try {
            const config = configManager.getLoggingConfig();
            const isProduction = configManager.getServerConfig().environment === 'production';
            const transports = [
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
                transports.push(new winston.transports.File({
                    filename: join(logDir, 'error.log'),
                    level: 'error',
                    format: fileFormat,
                    maxsize: this.parseSize(config.maxSize),
                    maxFiles: config.maxFiles,
                }));
                // Combined log file
                transports.push(new winston.transports.File({
                    filename: join(logDir, 'combined.log'),
                    format: fileFormat,
                    maxsize: this.parseSize(config.maxSize),
                    maxFiles: config.maxFiles,
                }));
                // HTTP access log
                transports.push(new winston.transports.File({
                    filename: join(logDir, 'access.log'),
                    level: 'http',
                    format: fileFormat,
                    maxsize: this.parseSize(config.maxSize),
                    maxFiles: config.maxFiles,
                }));
            }
            return winston.createLogger({
                level: config.level,
                levels: customLevels.levels,
                format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })),
                transports,
                exitOnError: false,
            });
        }
        catch (error) {
            // Fallback logger if configuration fails
            return winston.createLogger({
                level: 'info',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                transports: [
                    new winston.transports.Console({
                        format: consoleFormat,
                    }),
                ],
            });
        }
    }
    parseSize(size) {
        const match = size.match(/^(\d+)(KB|MB|GB)?$/i);
        if (!match)
            return 10 * 1024 * 1024; // Default 10MB
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
    error(message, meta) {
        this.winston.error(message, meta);
    }
    warn(message, meta) {
        this.winston.warn(message, meta);
    }
    info(message, meta) {
        this.winston.info(message, meta);
    }
    http(message, meta) {
        this.winston.log('http', message, meta);
    }
    debug(message, meta) {
        this.winston.debug(message, meta);
    }
    // Structured logging methods
    logRequest(req) {
        this.http('HTTP Request', {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.userAgent,
        });
    }
    logResponse(res) {
        this.http('HTTP Response', {
            statusCode: res.statusCode,
            responseTime: res.responseTime,
        });
    }
    logGitHubAPICall(call) {
        this.info('GitHub API Call', call);
    }
    logPluginEvent(event) {
        if (event.error) {
            this.error(`Plugin Event: ${event.plugin} - ${event.event}`, {
                plugin: event.plugin,
                event: event.event,
                error: event.error.message,
                stack: event.error.stack,
                data: event.data,
            });
        }
        else {
            this.info(`Plugin Event: ${event.plugin} - ${event.event}`, {
                plugin: event.plugin,
                event: event.event,
                data: event.data,
            });
        }
    }
    logMCPEvent(event) {
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
        }
        else {
            this.info(`MCP Event: ${event.type}`, {
                type: event.type,
                method: event.method,
                tool: event.tool,
                resource: event.resource,
                duration: event.duration,
            });
        }
    }
    logDatabaseEvent(event) {
        if (event.error) {
            this.error(`Database Event: ${event.database} - ${event.type}`, {
                type: event.type,
                database: event.database,
                query: event.query,
                duration: event.duration,
                error: event.error.message,
                stack: event.error.stack,
            });
        }
        else {
            this.debug(`Database Event: ${event.database} - ${event.type}`, {
                type: event.type,
                database: event.database,
                query: event.query,
                duration: event.duration,
            });
        }
    }
    // Child logger for specific contexts
    child(context) {
        return new ChildLogger(this.winston, context);
    }
    // Get underlying winston instance
    getLogger() {
        return this.winston;
    }
    // Reconfigure logger (useful for dynamic config changes)
    reconfigure() {
        this.winston = this.createLogger();
    }
}
// Child logger for specific contexts
export class ChildLogger {
    winston;
    context;
    constructor(winston, context) {
        this.winston = winston;
        this.context = context;
    }
    log(level, message, meta) {
        const combinedMeta = { ...this.context, ...meta };
        this.winston.log(level, message, combinedMeta);
    }
    error(message, meta) {
        this.log('error', message, meta);
    }
    warn(message, meta) {
        this.log('warn', message, meta);
    }
    info(message, meta) {
        this.log('info', message, meta);
    }
    http(message, meta) {
        this.log('http', message, meta);
    }
    debug(message, meta) {
        this.log('debug', message, meta);
    }
}
// Export singleton instance
export const logger = Logger.getInstance();
export default logger;
