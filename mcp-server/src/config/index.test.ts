/**
 * Configuration Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager } from './index.js';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = ConfigManager.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = ConfigManager.getInstance();
    const instance2 = ConfigManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should load configuration successfully', () => {
    const result = configManager.loadConfig();
    expect(result.isValid).toBe(true);
    expect(result.config).toBeDefined();
  });

  it('should return loaded configuration', () => {
    configManager.loadConfig();
    const config = configManager.getConfig();
    expect(config).toBeDefined();
    expect(config.server).toBeDefined();
    expect(config.github).toBeDefined();
    expect(config.database).toBeDefined();
  });

  it('should check if configuration is loaded', () => {
    expect(configManager.isLoaded()).toBe(false);
    configManager.loadConfig();
    expect(configManager.isLoaded()).toBe(true);
  });

  it('should get specific configuration sections', () => {
    configManager.loadConfig();
    
    const serverConfig = configManager.getServerConfig();
    expect(serverConfig).toBeDefined();
    expect(serverConfig.name).toBe('github-readme-transformer');

    const githubConfig = configManager.getGitHubConfig();
    expect(githubConfig).toBeDefined();
    expect(githubConfig.api).toBeDefined();

    const databaseConfig = configManager.getDatabaseConfig();
    expect(databaseConfig).toBeDefined();
    expect(databaseConfig.postgres).toBeDefined();
    expect(databaseConfig.redis).toBeDefined();
  });

  it('should check feature flags', () => {
    configManager.loadConfig();
    
    const features = configManager.getFeatureFlags();
    expect(features).toBeDefined();
    expect(typeof features.analytics).toBe('boolean');
    expect(typeof features.caching).toBe('boolean');
    expect(typeof features.pluginSystem).toBe('boolean');
  });

  it('should get environment variables', () => {
    const environment = configManager.getEnvironment();
    expect(environment).toBeDefined();
  });
});