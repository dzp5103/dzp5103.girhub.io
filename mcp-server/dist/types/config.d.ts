/**
 * Configuration Types and Interfaces
 */
import { z } from 'zod';
export declare const ServerConfigSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    port: z.ZodNumber;
    host: z.ZodString;
    environment: z.ZodEnum<["development", "staging", "production"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: string;
    port: number;
    host: string;
    environment: "development" | "staging" | "production";
}, {
    name: string;
    version: string;
    port: number;
    host: string;
    environment: "development" | "staging" | "production";
}>;
export declare const GitHubConfigSchema: z.ZodObject<{
    api: z.ZodObject<{
        baseUrl: z.ZodString;
        version: z.ZodString;
        timeout: z.ZodNumber;
        retries: z.ZodNumber;
        retryDelay: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        version: string;
        baseUrl: string;
        timeout: number;
        retries: number;
        retryDelay: number;
    }, {
        version: string;
        baseUrl: string;
        timeout: number;
        retries: number;
        retryDelay: number;
    }>;
    rateLimit: z.ZodObject<{
        requestsPerHour: z.ZodNumber;
        burstLimit: z.ZodNumber;
        windowMs: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        requestsPerHour: number;
        burstLimit: number;
        windowMs: number;
    }, {
        requestsPerHour: number;
        burstLimit: number;
        windowMs: number;
    }>;
    cache: z.ZodObject<{
        ttl: z.ZodNumber;
        maxSize: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        ttl: number;
        maxSize: number;
    }, {
        ttl: number;
        maxSize: number;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export declare const DatabaseConfigSchema: z.ZodObject<{
    postgres: z.ZodObject<{
        host: z.ZodString;
        port: z.ZodNumber;
        database: z.ZodString;
        maxConnections: z.ZodNumber;
        connectionTimeout: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        port: number;
        host: string;
        database: string;
        maxConnections: number;
        connectionTimeout: number;
    }, {
        port: number;
        host: string;
        database: string;
        maxConnections: number;
        connectionTimeout: number;
    }>;
    redis: z.ZodObject<{
        host: z.ZodString;
        port: z.ZodNumber;
        database: z.ZodNumber;
        keyPrefix: z.ZodString;
        defaultTTL: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        port: number;
        host: string;
        database: number;
        keyPrefix: string;
        defaultTTL: number;
    }, {
        port: number;
        host: string;
        database: number;
        keyPrefix: string;
        defaultTTL: number;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export declare const LoggingConfigSchema: z.ZodObject<{
    level: z.ZodEnum<["error", "warn", "info", "debug"]>;
    format: z.ZodEnum<["json", "simple"]>;
    maxFiles: z.ZodNumber;
    maxSize: z.ZodString;
    datePattern: z.ZodString;
}, "strip", z.ZodTypeAny, {
    maxSize: string;
    level: "error" | "warn" | "info" | "debug";
    format: "json" | "simple";
    maxFiles: number;
    datePattern: string;
}, {
    maxSize: string;
    level: "error" | "warn" | "info" | "debug";
    format: "json" | "simple";
    maxFiles: number;
    datePattern: string;
}>;
export declare const PluginConfigSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    directory: z.ZodString;
    autoLoad: z.ZodBoolean;
    timeout: z.ZodNumber;
    maxConcurrent: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    enabled: boolean;
    directory: string;
    autoLoad: boolean;
    maxConcurrent: number;
}, {
    timeout: number;
    enabled: boolean;
    directory: string;
    autoLoad: boolean;
    maxConcurrent: number;
}>;
export declare const ProcessingConfigSchema: z.ZodObject<{
    mode: z.ZodEnum<["hybrid", "realtime", "scheduled"]>;
    batchSize: z.ZodNumber;
    maxRetries: z.ZodNumber;
    retryDelay: z.ZodNumber;
    scheduledProcessing: z.ZodObject<{
        enabled: z.ZodBoolean;
        cron: z.ZodString;
        timezone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        cron: string;
        timezone: string;
    }, {
        enabled: boolean;
        cron: string;
        timezone: string;
    }>;
}, "strip", z.ZodTypeAny, {
    retryDelay: number;
    mode: "hybrid" | "realtime" | "scheduled";
    batchSize: number;
    maxRetries: number;
    scheduledProcessing: {
        enabled: boolean;
        cron: string;
        timezone: string;
    };
}, {
    retryDelay: number;
    mode: "hybrid" | "realtime" | "scheduled";
    batchSize: number;
    maxRetries: number;
    scheduledProcessing: {
        enabled: boolean;
        cron: string;
        timezone: string;
    };
}>;
export declare const SecurityConfigSchema: z.ZodObject<{
    enableCors: z.ZodBoolean;
    corsOrigins: z.ZodArray<z.ZodString, "many">;
    helmet: z.ZodObject<{
        enabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
    }, {
        enabled: boolean;
    }>;
    rateLimit: z.ZodObject<{
        windowMs: z.ZodNumber;
        max: z.ZodNumber;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        windowMs: number;
        max: number;
    }, {
        message: string;
        windowMs: number;
        max: number;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export declare const FeatureFlagsSchema: z.ZodObject<{
    analytics: z.ZodBoolean;
    caching: z.ZodBoolean;
    realTimeProcessing: z.ZodBoolean;
    scheduledProcessing: z.ZodBoolean;
    pluginSystem: z.ZodBoolean;
    webhooks: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    scheduledProcessing: boolean;
    analytics: boolean;
    caching: boolean;
    realTimeProcessing: boolean;
    pluginSystem: boolean;
    webhooks: boolean;
}, {
    scheduledProcessing: boolean;
    analytics: boolean;
    caching: boolean;
    realTimeProcessing: boolean;
    pluginSystem: boolean;
    webhooks: boolean;
}>;
export declare const ConfigSchema: z.ZodObject<{
    server: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        port: z.ZodNumber;
        host: z.ZodString;
        environment: z.ZodEnum<["development", "staging", "production"]>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        port: number;
        host: string;
        environment: "development" | "staging" | "production";
    }, {
        name: string;
        version: string;
        port: number;
        host: string;
        environment: "development" | "staging" | "production";
    }>;
    github: z.ZodObject<{
        api: z.ZodObject<{
            baseUrl: z.ZodString;
            version: z.ZodString;
            timeout: z.ZodNumber;
            retries: z.ZodNumber;
            retryDelay: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            version: string;
            baseUrl: string;
            timeout: number;
            retries: number;
            retryDelay: number;
        }, {
            version: string;
            baseUrl: string;
            timeout: number;
            retries: number;
            retryDelay: number;
        }>;
        rateLimit: z.ZodObject<{
            requestsPerHour: z.ZodNumber;
            burstLimit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            requestsPerHour: number;
            burstLimit: number;
            windowMs: number;
        }, {
            requestsPerHour: number;
            burstLimit: number;
            windowMs: number;
        }>;
        cache: z.ZodObject<{
            ttl: z.ZodNumber;
            maxSize: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            ttl: number;
            maxSize: number;
        }, {
            ttl: number;
            maxSize: number;
        }>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>;
    database: z.ZodObject<{
        postgres: z.ZodObject<{
            host: z.ZodString;
            port: z.ZodNumber;
            database: z.ZodString;
            maxConnections: z.ZodNumber;
            connectionTimeout: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            port: number;
            host: string;
            database: string;
            maxConnections: number;
            connectionTimeout: number;
        }, {
            port: number;
            host: string;
            database: string;
            maxConnections: number;
            connectionTimeout: number;
        }>;
        redis: z.ZodObject<{
            host: z.ZodString;
            port: z.ZodNumber;
            database: z.ZodNumber;
            keyPrefix: z.ZodString;
            defaultTTL: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            port: number;
            host: string;
            database: number;
            keyPrefix: string;
            defaultTTL: number;
        }, {
            port: number;
            host: string;
            database: number;
            keyPrefix: string;
            defaultTTL: number;
        }>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>;
    logging: z.ZodObject<{
        level: z.ZodEnum<["error", "warn", "info", "debug"]>;
        format: z.ZodEnum<["json", "simple"]>;
        maxFiles: z.ZodNumber;
        maxSize: z.ZodString;
        datePattern: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        maxSize: string;
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        maxFiles: number;
        datePattern: string;
    }, {
        maxSize: string;
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        maxFiles: number;
        datePattern: string;
    }>;
    plugins: z.ZodObject<{
        enabled: z.ZodBoolean;
        directory: z.ZodString;
        autoLoad: z.ZodBoolean;
        timeout: z.ZodNumber;
        maxConcurrent: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        enabled: boolean;
        directory: string;
        autoLoad: boolean;
        maxConcurrent: number;
    }, {
        timeout: number;
        enabled: boolean;
        directory: string;
        autoLoad: boolean;
        maxConcurrent: number;
    }>;
    processing: z.ZodObject<{
        mode: z.ZodEnum<["hybrid", "realtime", "scheduled"]>;
        batchSize: z.ZodNumber;
        maxRetries: z.ZodNumber;
        retryDelay: z.ZodNumber;
        scheduledProcessing: z.ZodObject<{
            enabled: z.ZodBoolean;
            cron: z.ZodString;
            timezone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            cron: string;
            timezone: string;
        }, {
            enabled: boolean;
            cron: string;
            timezone: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        retryDelay: number;
        mode: "hybrid" | "realtime" | "scheduled";
        batchSize: number;
        maxRetries: number;
        scheduledProcessing: {
            enabled: boolean;
            cron: string;
            timezone: string;
        };
    }, {
        retryDelay: number;
        mode: "hybrid" | "realtime" | "scheduled";
        batchSize: number;
        maxRetries: number;
        scheduledProcessing: {
            enabled: boolean;
            cron: string;
            timezone: string;
        };
    }>;
    security: z.ZodObject<{
        enableCors: z.ZodBoolean;
        corsOrigins: z.ZodArray<z.ZodString, "many">;
        helmet: z.ZodObject<{
            enabled: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
        }, {
            enabled: boolean;
        }>;
        rateLimit: z.ZodObject<{
            windowMs: z.ZodNumber;
            max: z.ZodNumber;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            windowMs: number;
            max: number;
        }, {
            message: string;
            windowMs: number;
            max: number;
        }>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>;
    features: z.ZodObject<{
        analytics: z.ZodBoolean;
        caching: z.ZodBoolean;
        realTimeProcessing: z.ZodBoolean;
        scheduledProcessing: z.ZodBoolean;
        pluginSystem: z.ZodBoolean;
        webhooks: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        scheduledProcessing: boolean;
        analytics: boolean;
        caching: boolean;
        realTimeProcessing: boolean;
        pluginSystem: boolean;
        webhooks: boolean;
    }, {
        scheduledProcessing: boolean;
        analytics: boolean;
        caching: boolean;
        realTimeProcessing: boolean;
        pluginSystem: boolean;
        webhooks: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    database: {
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
    server: {
        name: string;
        version: string;
        port: number;
        host: string;
        environment: "development" | "staging" | "production";
    };
    github: {
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
    logging: {
        maxSize: string;
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        maxFiles: number;
        datePattern: string;
    };
    plugins: {
        timeout: number;
        enabled: boolean;
        directory: string;
        autoLoad: boolean;
        maxConcurrent: number;
    };
    processing: {
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
    security: {
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
    features: {
        scheduledProcessing: boolean;
        analytics: boolean;
        caching: boolean;
        realTimeProcessing: boolean;
        pluginSystem: boolean;
        webhooks: boolean;
    };
}, {
    database: {
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
    server: {
        name: string;
        version: string;
        port: number;
        host: string;
        environment: "development" | "staging" | "production";
    };
    github: {
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
    logging: {
        maxSize: string;
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        maxFiles: number;
        datePattern: string;
    };
    plugins: {
        timeout: number;
        enabled: boolean;
        directory: string;
        autoLoad: boolean;
        maxConcurrent: number;
    };
    processing: {
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
    security: {
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
    features: {
        scheduledProcessing: boolean;
        analytics: boolean;
        caching: boolean;
        realTimeProcessing: boolean;
        pluginSystem: boolean;
        webhooks: boolean;
    };
}>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type PluginConfig = z.infer<typeof PluginConfigSchema>;
export type ProcessingConfig = z.infer<typeof ProcessingConfigSchema>;
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export declare const EnvironmentSchema: z.ZodObject<{
    GITHUB_TOKEN: z.ZodOptional<z.ZodString>;
    GITHUB_APP_ID: z.ZodOptional<z.ZodString>;
    GITHUB_APP_PRIVATE_KEY: z.ZodOptional<z.ZodString>;
    GITHUB_WEBHOOK_SECRET: z.ZodOptional<z.ZodString>;
    POSTGRES_HOST: z.ZodOptional<z.ZodString>;
    POSTGRES_PORT: z.ZodOptional<z.ZodString>;
    POSTGRES_DB: z.ZodOptional<z.ZodString>;
    POSTGRES_USER: z.ZodOptional<z.ZodString>;
    POSTGRES_PASSWORD: z.ZodOptional<z.ZodString>;
    REDIS_HOST: z.ZodOptional<z.ZodString>;
    REDIS_PORT: z.ZodOptional<z.ZodString>;
    REDIS_PASSWORD: z.ZodOptional<z.ZodString>;
    REDIS_DB: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodOptional<z.ZodEnum<["development", "staging", "production"]>>;
    SERVER_PORT: z.ZodOptional<z.ZodString>;
    SERVER_HOST: z.ZodOptional<z.ZodString>;
    LOG_LEVEL: z.ZodOptional<z.ZodEnum<["error", "warn", "info", "debug"]>>;
    LOG_FORMAT: z.ZodOptional<z.ZodEnum<["json", "simple"]>>;
    JWT_SECRET: z.ZodOptional<z.ZodString>;
    API_KEY: z.ZodOptional<z.ZodString>;
    WEBHOOK_URL: z.ZodOptional<z.ZodString>;
    ANALYTICS_API_KEY: z.ZodOptional<z.ZodString>;
    ENABLE_ANALYTICS: z.ZodOptional<z.ZodString>;
    ENABLE_CACHING: z.ZodOptional<z.ZodString>;
    ENABLE_REAL_TIME_PROCESSING: z.ZodOptional<z.ZodString>;
    ENABLE_SCHEDULED_PROCESSING: z.ZodOptional<z.ZodString>;
    ENABLE_PLUGIN_SYSTEM: z.ZodOptional<z.ZodString>;
    ENABLE_WEBHOOKS: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    GITHUB_TOKEN?: string | undefined;
    GITHUB_APP_ID?: string | undefined;
    GITHUB_APP_PRIVATE_KEY?: string | undefined;
    GITHUB_WEBHOOK_SECRET?: string | undefined;
    POSTGRES_HOST?: string | undefined;
    POSTGRES_PORT?: string | undefined;
    POSTGRES_DB?: string | undefined;
    POSTGRES_USER?: string | undefined;
    POSTGRES_PASSWORD?: string | undefined;
    REDIS_HOST?: string | undefined;
    REDIS_PORT?: string | undefined;
    REDIS_PASSWORD?: string | undefined;
    REDIS_DB?: string | undefined;
    NODE_ENV?: "development" | "staging" | "production" | undefined;
    SERVER_PORT?: string | undefined;
    SERVER_HOST?: string | undefined;
    LOG_LEVEL?: "error" | "warn" | "info" | "debug" | undefined;
    LOG_FORMAT?: "json" | "simple" | undefined;
    JWT_SECRET?: string | undefined;
    API_KEY?: string | undefined;
    WEBHOOK_URL?: string | undefined;
    ANALYTICS_API_KEY?: string | undefined;
    ENABLE_ANALYTICS?: string | undefined;
    ENABLE_CACHING?: string | undefined;
    ENABLE_REAL_TIME_PROCESSING?: string | undefined;
    ENABLE_SCHEDULED_PROCESSING?: string | undefined;
    ENABLE_PLUGIN_SYSTEM?: string | undefined;
    ENABLE_WEBHOOKS?: string | undefined;
}, {
    GITHUB_TOKEN?: string | undefined;
    GITHUB_APP_ID?: string | undefined;
    GITHUB_APP_PRIVATE_KEY?: string | undefined;
    GITHUB_WEBHOOK_SECRET?: string | undefined;
    POSTGRES_HOST?: string | undefined;
    POSTGRES_PORT?: string | undefined;
    POSTGRES_DB?: string | undefined;
    POSTGRES_USER?: string | undefined;
    POSTGRES_PASSWORD?: string | undefined;
    REDIS_HOST?: string | undefined;
    REDIS_PORT?: string | undefined;
    REDIS_PASSWORD?: string | undefined;
    REDIS_DB?: string | undefined;
    NODE_ENV?: "development" | "staging" | "production" | undefined;
    SERVER_PORT?: string | undefined;
    SERVER_HOST?: string | undefined;
    LOG_LEVEL?: "error" | "warn" | "info" | "debug" | undefined;
    LOG_FORMAT?: "json" | "simple" | undefined;
    JWT_SECRET?: string | undefined;
    API_KEY?: string | undefined;
    WEBHOOK_URL?: string | undefined;
    ANALYTICS_API_KEY?: string | undefined;
    ENABLE_ANALYTICS?: string | undefined;
    ENABLE_CACHING?: string | undefined;
    ENABLE_REAL_TIME_PROCESSING?: string | undefined;
    ENABLE_SCHEDULED_PROCESSING?: string | undefined;
    ENABLE_PLUGIN_SYSTEM?: string | undefined;
    ENABLE_WEBHOOKS?: string | undefined;
}>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export interface ConfigValidationResult {
    isValid: boolean;
    config?: Config;
    errors?: string[];
}
export interface RuntimeConfig extends Config {
    environment: Environment;
    startTime: Date;
    version: string;
}
