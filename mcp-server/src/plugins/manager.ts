/**
 * Plugin Manager Implementation
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { EventEmitter } from 'events';
import { configManager } from '../config/index.js';
import { logger } from '../utils/logger.js';
import {
  IPlugin,
  IPluginManager,
  PluginInfo,
  PluginMetadata,
  PluginConfiguration,
  PluginContext,
  PluginRegistryEntry,
  PluginEvent,
  PluginEventData,
  PluginError,
  PluginLoadError,
  PluginConfigError,
  PluginRuntimeError,
  PluginStatistics,
} from '../types/plugin.js';
import { McpTool, McpResource } from '../types/mcp.js';

export class PluginManager extends EventEmitter implements IPluginManager {
  private static instance: PluginManager;
  private registry: Map<string, PluginRegistryEntry> = new Map();
  private loadedPlugins: Set<string> = new Set();
  private enabledPlugins: Set<string> = new Set();
  private pluginStats: Map<string, PluginStatistics> = new Map();

  private constructor() {
    super();
    this.setupEventHandlers();
  }

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  private setupEventHandlers(): void {
    // Handle plugin events
    this.on('plugin_loaded', (data: PluginEventData) => {
      logger.logPluginEvent({
        plugin: data.plugin,
        event: 'loaded',
        data: data.data,
      });
    });

    this.on('plugin_error', (data: PluginEventData) => {
      logger.logPluginEvent({
        plugin: data.plugin,
        event: 'error',
        error: data.error,
        data: data.data,
      });
    });
  }

  public async loadPlugin(pluginPath: string): Promise<IPlugin> {
    try {
      const absolutePath = resolve(pluginPath);
      const pluginUrl = pathToFileURL(absolutePath).href;

      // Check if plugin directory exists
      const pluginStat = await stat(absolutePath);
      if (!pluginStat.isDirectory()) {
        throw new Error(`Plugin path is not a directory: ${pluginPath}`);
      }

      // Load plugin metadata
      const metadata = await this.loadPluginMetadata(absolutePath);
      const pluginName = metadata.name;

      // Check if plugin is already loaded
      if (this.loadedPlugins.has(pluginName)) {
        throw new PluginLoadError(pluginName, new Error('Plugin already loaded'));
      }

      // Load plugin configuration
      const configuration = await this.loadPluginConfiguration(pluginName);

      // Import plugin module
      const pluginModulePath = join(absolutePath, 'index.js');
      const pluginModule = await import(pluginUrl + '/index.js');
      
      if (!pluginModule.default || typeof pluginModule.default !== 'function') {
        throw new PluginLoadError(pluginName, new Error('Plugin must export a default function'));
      }

      // Create plugin instance
      const plugin: IPlugin = pluginModule.default();
      
      // Validate plugin interface
      if (!plugin.metadata || !plugin.metadata.name) {
        throw new PluginLoadError(pluginName, new Error('Plugin must have valid metadata'));
      }

      // Create plugin context
      const context = this.createPluginContext(pluginName, configuration);

      // Create registry entry
      const registryEntry: PluginRegistryEntry = {
        plugin,
        info: {
          name: pluginName,
          version: metadata.version,
          description: metadata.description,
          enabled: configuration.enabled,
          loaded: true,
          metadata,
          configuration,
          tools: plugin.tools || [],
          resources: plugin.resources || [],
          loadTime: new Date(),
        },
        context,
        handlers: {
          tools: new Map(),
          resources: new Map(),
        },
      };

      // Register tool handlers
      if (plugin.tools && plugin.handleTool) {
        for (const tool of plugin.tools) {
          registryEntry.handlers.tools.set(tool.name, async (call) => {
            return await plugin.handleTool!(call, context);
          });
        }
      }

      // Register resource handlers
      if (plugin.resources && plugin.handleResource) {
        for (const resource of plugin.resources) {
          registryEntry.handlers.resources.set(resource.uri, async (uri) => {
            return await plugin.handleResource!(uri, context);
          });
        }
      }

      // Store in registry
      this.registry.set(pluginName, registryEntry);
      this.loadedPlugins.add(pluginName);

      // Initialize plugin statistics
      this.initializePluginStatistics(pluginName);

      // Call plugin onLoad hook
      if (plugin.onLoad) {
        await plugin.onLoad(context);
      }

      // Enable plugin if configured
      if (configuration.enabled) {
        await this.enablePlugin(pluginName);
      }

      // Emit event
      this.emit('plugin_loaded', {
        plugin: pluginName,
        timestamp: new Date(),
        data: { metadata, configuration },
      });

      logger.info(`Plugin loaded successfully: ${pluginName}`, { version: metadata.version });
      return plugin;

    } catch (error) {
      const pluginName = pluginPath.split('/').pop() || pluginPath;
      
      this.emit('plugin_error', {
        plugin: pluginName,
        timestamp: new Date(),
        data: { operation: 'load', path: pluginPath },
        error: error as Error,
      });

      throw new PluginLoadError(pluginName, error as Error);
    }
  }

  public async unloadPlugin(name: string): Promise<void> {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new PluginError(`Plugin not found: ${name}`, name);
    }

    try {
      // Disable plugin first
      if (this.enabledPlugins.has(name)) {
        await this.disablePlugin(name);
      }

      // Call plugin onUnload hook
      if (entry.plugin.onUnload) {
        await entry.plugin.onUnload(entry.context);
      }

      // Remove from registry
      this.registry.delete(name);
      this.loadedPlugins.delete(name);
      this.pluginStats.delete(name);

      logger.info(`Plugin unloaded: ${name}`);

    } catch (error) {
      throw new PluginRuntimeError(name, 'unload', error as Error);
    }
  }

  public async enablePlugin(name: string): Promise<void> {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new PluginError(`Plugin not found: ${name}`, name);
    }

    if (this.enabledPlugins.has(name)) {
      return; // Already enabled
    }

    try {
      // Call plugin onEnable hook
      if (entry.plugin.onEnable) {
        await entry.plugin.onEnable(entry.context);
      }

      // Mark as enabled
      this.enabledPlugins.add(name);
      entry.info.enabled = true;

      // Update statistics
      const stats = this.pluginStats.get(name);
      if (stats) {
        stats.enabled = true;
      }

      logger.info(`Plugin enabled: ${name}`);

    } catch (error) {
      throw new PluginRuntimeError(name, 'enable', error as Error);
    }
  }

  public async disablePlugin(name: string): Promise<void> {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new PluginError(`Plugin not found: ${name}`, name);
    }

    if (!this.enabledPlugins.has(name)) {
      return; // Already disabled
    }

    try {
      // Call plugin onDisable hook
      if (entry.plugin.onDisable) {
        await entry.plugin.onDisable(entry.context);
      }

      // Mark as disabled
      this.enabledPlugins.delete(name);
      entry.info.enabled = false;

      // Update statistics
      const stats = this.pluginStats.get(name);
      if (stats) {
        stats.enabled = false;
      }

      logger.info(`Plugin disabled: ${name}`);

    } catch (error) {
      throw new PluginRuntimeError(name, 'disable', error as Error);
    }
  }

  public getPlugin(name: string): IPlugin | undefined {
    const entry = this.registry.get(name);
    return entry?.plugin;
  }

  public listPlugins(): PluginInfo[] {
    return Array.from(this.registry.values()).map(entry => ({ ...entry.info }));
  }

  public async reloadPlugin(name: string): Promise<void> {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new PluginError(`Plugin not found: ${name}`, name);
    }

    const pluginPath = entry.info.metadata.repository || name;
    
    // Unload current plugin
    await this.unloadPlugin(name);
    
    // Load plugin again
    await this.loadPlugin(pluginPath);
  }

  // Plugin discovery and auto-loading
  public async discoverPlugins(directory?: string): Promise<string[]> {
    const config = configManager.getPluginConfig();
    const pluginDir = directory || config.directory;
    const discoveredPlugins: string[] = [];

    try {
      const entries = await readdir(pluginDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = join(pluginDir, entry.name);
          
          // Check if plugin has required files
          try {
            await stat(join(pluginPath, 'package.json'));
            await stat(join(pluginPath, 'index.js'));
            discoveredPlugins.push(pluginPath);
          } catch {
            // Skip directories without required files
          }
        }
      }

      return discoveredPlugins;

    } catch (error) {
      logger.warn(`Failed to discover plugins in directory: ${pluginDir}`, { error });
      return [];
    }
  }

  public async loadAllPlugins(): Promise<void> {
    const config = configManager.getPluginConfig();
    
    if (!config.enabled) {
      logger.info('Plugin system disabled');
      return;
    }

    const discoveredPlugins = await this.discoverPlugins();
    
    for (const pluginPath of discoveredPlugins) {
      try {
        await this.loadPlugin(pluginPath);
      } catch (error) {
        logger.error(`Failed to load plugin: ${pluginPath}`, { error });
      }
    }

    logger.info(`Plugin loading complete. Loaded ${this.loadedPlugins.size} plugins`);
  }

  // Utility methods
  private async loadPluginMetadata(pluginPath: string): Promise<PluginMetadata> {
    try {
      const packageJsonPath = join(pluginPath, 'package.json');
      const packageContent = await readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description || '',
        author: packageJson.author || '',
        license: packageJson.license || 'MIT',
        homepage: packageJson.homepage,
        repository: packageJson.repository?.url || packageJson.repository,
        keywords: packageJson.keywords || [],
        dependencies: packageJson.dependencies || {},
        engines: packageJson.engines || {},
      };

    } catch (error) {
      throw new Error(`Failed to load plugin metadata: ${error}`);
    }
  }

  private async loadPluginConfiguration(pluginName: string): Promise<PluginConfiguration> {
    // Default configuration
    const defaultConfig: PluginConfiguration = {
      enabled: true,
      priority: 1000,
      settings: {},
      timeout: 30000,
    };

    // TODO: Load from configuration file or database
    return defaultConfig;
  }

  private createPluginContext(pluginName: string, config: PluginConfiguration): PluginContext {
    return {
      config,
      logger: logger.child({ plugin: pluginName }),
      cache: {
        get: async (key: string) => {
          // TODO: Implement cache get
          return null;
        },
        set: async (key: string, value: any, ttl?: number) => {
          // TODO: Implement cache set
        },
        del: async (key: string) => {
          // TODO: Implement cache delete
        },
      },
      github: {
        getUser: async (username: string) => {
          // TODO: Implement GitHub user fetching through main service
          throw new Error('Not implemented');
        },
        getRepository: async (owner: string, repo: string) => {
          // TODO: Implement GitHub repository fetching through main service
          throw new Error('Not implemented');
        },
      },
      events: {
        emit: (event: string, data: any) => {
          this.emit(`plugin:${pluginName}:${event}`, data);
        },
        on: (event: string, handler: (...args: any[]) => void) => {
          this.on(`plugin:${pluginName}:${event}`, handler);
        },
        off: (event: string, handler: (...args: any[]) => void) => {
          this.off(`plugin:${pluginName}:${event}`, handler);
        },
      },
    };
  }

  private initializePluginStatistics(pluginName: string): void {
    this.pluginStats.set(pluginName, {
      name: pluginName,
      enabled: this.enabledPlugins.has(pluginName),
      loaded: this.loadedPlugins.has(pluginName),
      toolCalls: 0,
      resourceReads: 0,
      errors: 0,
      averageResponseTime: 0,
      lastActivity: null,
    });
  }

  // Statistics and monitoring
  public getPluginStatistics(name: string): PluginStatistics | undefined {
    return this.pluginStats.get(name);
  }

  public getAllStatistics(): PluginStatistics[] {
    return Array.from(this.pluginStats.values());
  }

  public updatePluginStatistics(name: string, update: Partial<PluginStatistics>): void {
    const stats = this.pluginStats.get(name);
    if (stats) {
      Object.assign(stats, update);
    }
  }

  // Tool and resource management
  public getPluginTools(name: string): McpTool[] {
    const entry = this.registry.get(name);
    return entry?.plugin.tools || [];
  }

  public getPluginResources(name: string): McpResource[] {
    const entry = this.registry.get(name);
    return entry?.plugin.resources || [];
  }

  public getAllTools(): McpTool[] {
    const tools: McpTool[] = [];
    for (const entry of this.registry.values()) {
      if (entry.info.enabled && entry.plugin.tools) {
        tools.push(...entry.plugin.tools);
      }
    }
    return tools;
  }

  public getAllResources(): McpResource[] {
    const resources: McpResource[] = [];
    for (const entry of this.registry.values()) {
      if (entry.info.enabled && entry.plugin.resources) {
        resources.push(...entry.plugin.resources);
      }
    }
    return resources;
  }

  // Health checks
  public async checkPluginHealth(): Promise<{ healthy: string[]; unhealthy: string[] }> {
    const healthy: string[] = [];
    const unhealthy: string[] = [];

    for (const [name, entry] of this.registry) {
      try {
        // Basic health check - plugin is loaded and enabled
        if (entry.info.loaded && entry.info.enabled) {
          healthy.push(name);
        } else {
          unhealthy.push(name);
        }
      } catch (error) {
        unhealthy.push(name);
        logger.error(`Plugin health check failed: ${name}`, { error });
      }
    }

    return { healthy, unhealthy };
  }
}

// Export singleton instance
export const pluginManager = PluginManager.getInstance();
export default pluginManager;
