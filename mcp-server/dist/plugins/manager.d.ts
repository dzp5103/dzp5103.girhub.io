/**
 * Plugin Manager Implementation
 */
import { EventEmitter } from 'events';
import { IPlugin, IPluginManager, PluginInfo, PluginStatistics } from '../types/plugin.js';
import { McpTool, McpResource } from '../types/mcp.js';
export declare class PluginManager extends EventEmitter implements IPluginManager {
    private static instance;
    private registry;
    private loadedPlugins;
    private enabledPlugins;
    private pluginStats;
    private constructor();
    static getInstance(): PluginManager;
    private setupEventHandlers;
    loadPlugin(pluginPath: string): Promise<IPlugin>;
    unloadPlugin(name: string): Promise<void>;
    enablePlugin(name: string): Promise<void>;
    disablePlugin(name: string): Promise<void>;
    getPlugin(name: string): IPlugin | undefined;
    listPlugins(): PluginInfo[];
    reloadPlugin(name: string): Promise<void>;
    discoverPlugins(directory?: string): Promise<string[]>;
    loadAllPlugins(): Promise<void>;
    private loadPluginMetadata;
    private loadPluginConfiguration;
    private createPluginContext;
    private initializePluginStatistics;
    getPluginStatistics(name: string): PluginStatistics | undefined;
    getAllStatistics(): PluginStatistics[];
    updatePluginStatistics(name: string, update: Partial<PluginStatistics>): void;
    getPluginTools(name: string): McpTool[];
    getPluginResources(name: string): McpResource[];
    getAllTools(): McpTool[];
    getAllResources(): McpResource[];
    checkPluginHealth(): Promise<{
        healthy: string[];
        unhealthy: string[];
    }>;
}
export declare const pluginManager: PluginManager;
export default pluginManager;
