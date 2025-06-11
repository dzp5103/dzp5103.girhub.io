/**
 * Configuration Management System
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';
import YAML from 'yaml';
import { ConfigSchema, EnvironmentSchema } from '../types/config.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class ConfigManager {
    static instance;
    _config = null;
    _environment = {};
    constructor() {
        this.loadEnvironment();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    /**
     * Load environment variables
     */
    loadEnvironment() {
        // Load .env file if it exists
        dotenvConfig({ path: join(__dirname, '../../.env') });
        // Parse environment variables
        this._environment = {
            GITHUB_TOKEN: process.env.GITHUB_TOKEN,
            GITHUB_APP_ID: process.env.GITHUB_APP_ID,
            GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,
            GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
            POSTGRES_HOST: process.env.POSTGRES_HOST,
            POSTGRES_PORT: process.env.POSTGRES_PORT,
            POSTGRES_DB: process.env.POSTGRES_DB,
            POSTGRES_USER: process.env.POSTGRES_USER,
            POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
            REDIS_HOST: process.env.REDIS_HOST,
            REDIS_PORT: process.env.REDIS_PORT,
            REDIS_PASSWORD: process.env.REDIS_PASSWORD,
            REDIS_DB: process.env.REDIS_DB,
            NODE_ENV: process.env.NODE_ENV,
            SERVER_PORT: process.env.SERVER_PORT,
            SERVER_HOST: process.env.SERVER_HOST,
            LOG_LEVEL: process.env.LOG_LEVEL,
            LOG_FORMAT: process.env.LOG_FORMAT,
            JWT_SECRET: process.env.JWT_SECRET,
            API_KEY: process.env.API_KEY,
            WEBHOOK_URL: process.env.WEBHOOK_URL,
            ANALYTICS_API_KEY: process.env.ANALYTICS_API_KEY,
            ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
            ENABLE_CACHING: process.env.ENABLE_CACHING,
            ENABLE_REAL_TIME_PROCESSING: process.env.ENABLE_REAL_TIME_PROCESSING,
            ENABLE_SCHEDULED_PROCESSING: process.env.ENABLE_SCHEDULED_PROCESSING,
            ENABLE_PLUGIN_SYSTEM: process.env.ENABLE_PLUGIN_SYSTEM,
            ENABLE_WEBHOOKS: process.env.ENABLE_WEBHOOKS,
        };
        // Validate environment
        const envValidation = EnvironmentSchema.safeParse(this._environment);
        if (!envValidation.success) {
            console.warn('Environment validation warnings:', envValidation.error.errors);
        }
    }
    /**
     * Load configuration from YAML file
     */
    loadConfig(configPath) {
        try {
            // Default config path
            const defaultConfigPath = join(__dirname, '../../config/default.yaml');
            const finalConfigPath = configPath || defaultConfigPath;
            // Read and parse YAML file
            const yamlContent = readFileSync(finalConfigPath, 'utf8');
            const rawConfig = YAML.parse(yamlContent);
            // Apply environment overrides
            const mergedConfig = this.applyEnvironmentOverrides(rawConfig);
            // Validate configuration
            const validation = ConfigSchema.safeParse(mergedConfig);
            if (!validation.success) {
                return {
                    isValid: false,
                    errors: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
                };
            }
            // Create runtime configuration
            this._config = {
                ...validation.data,
                environment: this._environment,
                startTime: new Date(),
                version: this.getVersion()
            };
            return {
                isValid: true,
                config: this._config
            };
        }
        catch (error) {
            return {
                isValid: false,
                errors: [`Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`]
            };
        }
    }
    /**
     * Apply environment variable overrides to configuration
     */
    applyEnvironmentOverrides(config) {
        const overridden = { ...config };
        // Server overrides
        if (this._environment.NODE_ENV) {
            overridden.server.environment = this._environment.NODE_ENV;
        }
        if (this._environment.SERVER_PORT) {
            overridden.server.port = parseInt(this._environment.SERVER_PORT, 10);
        }
        if (this._environment.SERVER_HOST) {
            overridden.server.host = this._environment.SERVER_HOST;
        }
        // Database overrides
        if (this._environment.POSTGRES_HOST) {
            overridden.database.postgres.host = this._environment.POSTGRES_HOST;
        }
        if (this._environment.POSTGRES_PORT) {
            overridden.database.postgres.port = parseInt(this._environment.POSTGRES_PORT, 10);
        }
        if (this._environment.POSTGRES_DB) {
            overridden.database.postgres.database = this._environment.POSTGRES_DB;
        }
        if (this._environment.REDIS_HOST) {
            overridden.database.redis.host = this._environment.REDIS_HOST;
        }
        if (this._environment.REDIS_PORT) {
            overridden.database.redis.port = parseInt(this._environment.REDIS_PORT, 10);
        }
        if (this._environment.REDIS_DB) {
            overridden.database.redis.database = parseInt(this._environment.REDIS_DB, 10);
        }
        // Logging overrides
        if (this._environment.LOG_LEVEL) {
            overridden.logging.level = this._environment.LOG_LEVEL;
        }
        if (this._environment.LOG_FORMAT) {
            overridden.logging.format = this._environment.LOG_FORMAT;
        }
        // Feature flag overrides
        if (this._environment.ENABLE_ANALYTICS) {
            overridden.features.analytics = this._environment.ENABLE_ANALYTICS === 'true';
        }
        if (this._environment.ENABLE_CACHING) {
            overridden.features.caching = this._environment.ENABLE_CACHING === 'true';
        }
        if (this._environment.ENABLE_REAL_TIME_PROCESSING) {
            overridden.features.realTimeProcessing = this._environment.ENABLE_REAL_TIME_PROCESSING === 'true';
        }
        if (this._environment.ENABLE_SCHEDULED_PROCESSING) {
            overridden.features.scheduledProcessing = this._environment.ENABLE_SCHEDULED_PROCESSING === 'true';
        }
        if (this._environment.ENABLE_PLUGIN_SYSTEM) {
            overridden.features.pluginSystem = this._environment.ENABLE_PLUGIN_SYSTEM === 'true';
        }
        if (this._environment.ENABLE_WEBHOOKS) {
            overridden.features.webhooks = this._environment.ENABLE_WEBHOOKS === 'true';
        }
        return overridden;
    }
    /**
     * Get current configuration
     */
    getConfig() {
        if (!this._config) {
            const result = this.loadConfig();
            if (!result.isValid || !result.config) {
                throw new Error('Configuration not loaded or invalid');
            }
        }
        return this._config;
    }
    /**
     * Get environment variables
     */
    getEnvironment() {
        return this._environment;
    }
    /**
     * Check if configuration is loaded
     */
    isLoaded() {
        return this._config !== null;
    }
    /**
     * Reload configuration
     */
    reload(configPath) {
        this._config = null;
        this.loadEnvironment();
        return this.loadConfig(configPath);
    }
    /**
     * Get application version
     */
    getVersion() {
        try {
            const packagePath = join(__dirname, '../../package.json');
            const packageContent = readFileSync(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);
            return packageJson.version || '1.0.0';
        }
        catch (error) {
            return '1.0.0';
        }
    }
    /**
     * Get specific configuration section
     */
    getServerConfig() {
        return this.getConfig().server;
    }
    getGitHubConfig() {
        return this.getConfig().github;
    }
    getDatabaseConfig() {
        return this.getConfig().database;
    }
    getLoggingConfig() {
        return this.getConfig().logging;
    }
    getPluginConfig() {
        return this.getConfig().plugins;
    }
    getProcessingConfig() {
        return this.getConfig().processing;
    }
    getSecurityConfig() {
        return this.getConfig().security;
    }
    getFeatureFlags() {
        return this.getConfig().features;
    }
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature) {
        return this.getConfig().features[feature];
    }
    /**
     * Get GitHub credentials
     */
    getGitHubCredentials() {
        return {
            token: this._environment.GITHUB_TOKEN,
            appId: this._environment.GITHUB_APP_ID,
            privateKey: this._environment.GITHUB_APP_PRIVATE_KEY,
            webhookSecret: this._environment.GITHUB_WEBHOOK_SECRET,
        };
    }
    /**
     * Get database credentials
     */
    getDatabaseCredentials() {
        return {
            postgres: {
                host: this._environment.POSTGRES_HOST,
                port: this._environment.POSTGRES_PORT,
                database: this._environment.POSTGRES_DB,
                username: this._environment.POSTGRES_USER,
                password: this._environment.POSTGRES_PASSWORD,
            },
            redis: {
                host: this._environment.REDIS_HOST,
                port: this._environment.REDIS_PORT,
                password: this._environment.REDIS_PASSWORD,
                database: this._environment.REDIS_DB,
            }
        };
    }
}
// Export singleton instance
export const configManager = ConfigManager.getInstance();
export default configManager;
