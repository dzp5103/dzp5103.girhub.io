/**
 * Configuration Types and Interfaces
 */

import { z } from 'zod';

// Server Configuration Schema
export const ServerConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  port: z.number().min(1).max(65535),
  host: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
});

// GitHub Configuration Schema
export const GitHubConfigSchema = z.object({
  api: z.object({
    baseUrl: z.string().url(),
    version: z.string(),
    timeout: z.number().positive(),
    retries: z.number().min(0),
    retryDelay: z.number().positive(),
  }),
  rateLimit: z.object({
    requestsPerHour: z.number().positive(),
    burstLimit: z.number().positive(),
    windowMs: z.number().positive(),
  }),
  cache: z.object({
    ttl: z.number().positive(),
    maxSize: z.number().positive(),
  }),
});

// Database Configuration Schema
export const DatabaseConfigSchema = z.object({
  postgres: z.object({
    host: z.string(),
    port: z.number().min(1).max(65535),
    database: z.string(),
    maxConnections: z.number().positive(),
    connectionTimeout: z.number().positive(),
  }),
  redis: z.object({
    host: z.string(),
    port: z.number().min(1).max(65535),
    database: z.number().min(0),
    keyPrefix: z.string(),
    defaultTTL: z.number().positive(),
  }),
});

// Logging Configuration Schema
export const LoggingConfigSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug']),
  format: z.enum(['json', 'simple']),
  maxFiles: z.number().positive(),
  maxSize: z.string(),
  datePattern: z.string(),
});

// Plugin Configuration Schema
export const PluginConfigSchema = z.object({
  enabled: z.boolean(),
  directory: z.string(),
  autoLoad: z.boolean(),
  timeout: z.number().positive(),
  maxConcurrent: z.number().positive(),
});

// Processing Configuration Schema
export const ProcessingConfigSchema = z.object({
  mode: z.enum(['hybrid', 'realtime', 'scheduled']),
  batchSize: z.number().positive(),
  maxRetries: z.number().min(0),
  retryDelay: z.number().positive(),
  scheduledProcessing: z.object({
    enabled: z.boolean(),
    cron: z.string(),
    timezone: z.string(),
  }),
});

// Security Configuration Schema
export const SecurityConfigSchema = z.object({
  enableCors: z.boolean(),
  corsOrigins: z.array(z.string()),
  helmet: z.object({
    enabled: z.boolean(),
  }),
  rateLimit: z.object({
    windowMs: z.number().positive(),
    max: z.number().positive(),
    message: z.string(),
  }),
});

// Feature Flags Schema
export const FeatureFlagsSchema = z.object({
  analytics: z.boolean(),
  caching: z.boolean(),
  realTimeProcessing: z.boolean(),
  scheduledProcessing: z.boolean(),
  pluginSystem: z.boolean(),
  webhooks: z.boolean(),
});

// Main Configuration Schema
export const ConfigSchema = z.object({
  server: ServerConfigSchema,
  github: GitHubConfigSchema,
  database: DatabaseConfigSchema,
  logging: LoggingConfigSchema,
  plugins: PluginConfigSchema,
  processing: ProcessingConfigSchema,
  security: SecurityConfigSchema,
  features: FeatureFlagsSchema,
});

// Type Inference
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type PluginConfig = z.infer<typeof PluginConfigSchema>;
export type ProcessingConfig = z.infer<typeof ProcessingConfigSchema>;
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Environment Variables Schema
export const EnvironmentSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PORT: z.string().optional(),
  POSTGRES_DB: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().optional(),
  NODE_ENV: z.enum(['development', 'staging', 'production']).optional(),
  SERVER_PORT: z.string().optional(),
  SERVER_HOST: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  LOG_FORMAT: z.enum(['json', 'simple']).optional(),
  JWT_SECRET: z.string().optional(),
  API_KEY: z.string().optional(),
  WEBHOOK_URL: z.string().optional(),
  ANALYTICS_API_KEY: z.string().optional(),
  ENABLE_ANALYTICS: z.string().optional(),
  ENABLE_CACHING: z.string().optional(),
  ENABLE_REAL_TIME_PROCESSING: z.string().optional(),
  ENABLE_SCHEDULED_PROCESSING: z.string().optional(),
  ENABLE_PLUGIN_SYSTEM: z.string().optional(),
  ENABLE_WEBHOOKS: z.string().optional(),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

// Configuration validation result
export interface ConfigValidationResult {
  isValid: boolean;
  config?: Config;
  errors?: string[];
}

// Runtime configuration state
export interface RuntimeConfig extends Config {
  environment: Environment;
  startTime: Date;
  version: string;
}