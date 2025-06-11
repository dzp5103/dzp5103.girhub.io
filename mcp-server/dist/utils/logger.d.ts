/**
 * Logging Infrastructure
 */
import winston from 'winston';
export declare class Logger {
    private static instance;
    private winston;
    private constructor();
    static getInstance(): Logger;
    private createLogger;
    private parseSize;
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    http(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    logRequest(req: {
        method: string;
        url: string;
        ip?: string;
        userAgent?: string;
    }): void;
    logResponse(res: {
        statusCode: number;
        responseTime?: number;
    }): void;
    logGitHubAPICall(call: {
        endpoint: string;
        method: string;
        statusCode?: number;
        rateLimit?: any;
        responseTime?: number;
    }): void;
    logPluginEvent(event: {
        plugin: string;
        event: string;
        data?: any;
        error?: Error;
    }): void;
    logMCPEvent(event: {
        type: string;
        method?: string;
        tool?: string;
        resource?: string;
        duration?: number;
        error?: Error;
    }): void;
    logDatabaseEvent(event: {
        type: 'query' | 'connection' | 'error';
        database: 'postgres' | 'redis';
        query?: string;
        duration?: number;
        error?: Error;
    }): void;
    child(context: Record<string, any>): ChildLogger;
    getLogger(): winston.Logger;
    reconfigure(): void;
}
export declare class ChildLogger {
    private winston;
    private context;
    constructor(winston: winston.Logger, context: Record<string, any>);
    private log;
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    http(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}
export declare const logger: Logger;
export default logger;
