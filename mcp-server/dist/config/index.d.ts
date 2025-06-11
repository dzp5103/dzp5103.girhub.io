/**
 * Configuration Management System
 */
import { Environment, ConfigValidationResult, RuntimeConfig } from '../types/config.js';
export declare class ConfigManager {
    private static instance;
    private _config;
    private _environment;
    private constructor();
    static getInstance(): ConfigManager;
    /**
     * Load environment variables
     */
    private loadEnvironment;
    /**
     * Load configuration from YAML file
     */
    loadConfig(configPath?: string): ConfigValidationResult;
    /**
     * Apply environment variable overrides to configuration
     */
    private applyEnvironmentOverrides;
    /**
     * Get current configuration
     */
    getConfig(): RuntimeConfig;
    /**
     * Get environment variables
     */
    getEnvironment(): Environment;
    /**
     * Check if configuration is loaded
     */
    isLoaded(): boolean;
    /**
     * Reload configuration
     */
    reload(configPath?: string): ConfigValidationResult;
    /**
     * Get application version
     */
    private getVersion;
    /**
     * Get specific configuration section
     */
    getServerConfig(): {
        name: string;
        version: string;
        port: number;
        host: string;
        environment: "development" | "staging" | "production";
    };
    getGitHubConfig(): {
        api: {
            version: string;
            baseUrl: string;
            timeout: number;
            retries: number;
            retryDelay: number;
        };
        rateLimit: {
            requestsPerHour: number;
            burstLimit: number;
            windowMs: number;
        };
        cache: {
            ttl: number;
            maxSize: number;
        };
    };
    getDatabaseConfig(): {
        postgres: {
            port: number;
            host: string;
            database: string;
            maxConnections: number;
            connectionTimeout: number;
        };
        redis: {
            port: number;
            host: string;
            database: number;
            keyPrefix: string;
            defaultTTL: number;
        };
    };
    getLoggingConfig(): {
        maxSize: string;
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        maxFiles: number;
        datePattern: string;
    };
    getPluginConfig(): {
        timeout: number;
        enabled: boolean;
        directory: string;
        autoLoad: boolean;
        maxConcurrent: number;
    };
    getProcessingConfig(): {
        retryDelay: number;
        mode: "hybrid" | "realtime" | "scheduled";
        batchSize: number;
        maxRetries: number;
        scheduledProcessing: {
            enabled: boolean;
            cron: string;
            timezone: string;
        };
    };
    getSecurityConfig(): {
        rateLimit: {
            message: string;
            windowMs: number;
            max: number;
        };
        enableCors: boolean;
        corsOrigins: string[];
        helmet: {
            enabled: boolean;
        };
    };
    getFeatureFlags(): {
        scheduledProcessing: boolean;
        analytics: boolean;
        caching: boolean;
        realTimeProcessing: boolean;
        pluginSystem: boolean;
        webhooks: boolean;
    };
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature: keyof RuntimeConfig['features']): boolean;
    /**
     * Get GitHub credentials
     */
    getGitHubCredentials(): {
        token: string | undefined;
        appId: string | undefined;
        privateKey: string | undefined;
        webhookSecret: string | undefined;
    };
    /**
     * Get database credentials
     */
    getDatabaseCredentials(): {
        postgres: {
            host: string | undefined;
            port: string | undefined;
            database: string | undefined;
            username: string | undefined;
            password: string | undefined;
        };
        redis: {
            host: string | undefined;
            port: string | undefined;
            password: string | undefined;
            database: string | undefined;
        };
    };
}
export declare const configManager: ConfigManager;
export default configManager;
