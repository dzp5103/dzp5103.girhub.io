/**
 * Plugin System Types and Interfaces
 */
import { McpTool, McpResource, McpToolCall, McpToolResponse } from './mcp.js';
import { GitHubUserProfile, GitHubRepository } from './github.js';
export interface PluginMetadata {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    homepage?: string;
    repository?: string;
    keywords: string[];
    dependencies?: Record<string, string>;
    engines?: {
        node?: string;
    };
}
export interface PluginConfiguration {
    enabled: boolean;
    priority: number;
    settings: Record<string, any>;
    rateLimit?: {
        requests: number;
        windowMs: number;
    };
    timeout?: number;
}
export interface PluginContext {
    config: PluginConfiguration;
    logger: {
        info: (message: string, meta?: any) => void;
        warn: (message: string, meta?: any) => void;
        error: (message: string, meta?: any) => void;
        debug: (message: string, meta?: any) => void;
    };
    cache: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any, ttl?: number) => Promise<void>;
        del: (key: string) => Promise<void>;
    };
    github: {
        getUser: (username: string) => Promise<GitHubUserProfile>;
        getRepository: (owner: string, repo: string) => Promise<GitHubRepository>;
    };
    events: {
        emit: (event: string, data: any) => void;
        on: (event: string, handler: (...args: any[]) => void) => void;
        off: (event: string, handler: (...args: any[]) => void) => void;
    };
}
export type PluginEvent = 'user_profile_loaded' | 'repository_analyzed' | 'readme_generated' | 'content_processed' | 'error_occurred' | 'plugin_loaded' | 'plugin_unloaded';
export interface PluginEventData {
    plugin: string;
    timestamp: Date;
    data: any;
    error?: Error;
}
export interface PluginLifecycleHooks {
    onLoad?: (context: PluginContext) => Promise<void>;
    onUnload?: (context: PluginContext) => Promise<void>;
    onEnable?: (context: PluginContext) => Promise<void>;
    onDisable?: (context: PluginContext) => Promise<void>;
    onConfigChange?: (context: PluginContext, newConfig: PluginConfiguration) => Promise<void>;
}
export interface PluginToolHandler {
    (call: McpToolCall, context: PluginContext): Promise<McpToolResponse>;
}
export interface PluginResourceHandler {
    (uri: string, context: PluginContext): Promise<{
        content: string;
        mimeType?: string;
    }>;
}
export interface IPlugin extends PluginLifecycleHooks {
    metadata: PluginMetadata;
    tools?: McpTool[];
    resources?: McpResource[];
    handleTool?: PluginToolHandler;
    handleResource?: PluginResourceHandler;
    processUserProfile?: (profile: GitHubUserProfile, context: PluginContext) => Promise<any>;
    processRepository?: (repository: GitHubRepository, context: PluginContext) => Promise<any>;
    generateContent?: (data: any, context: PluginContext) => Promise<string>;
    validateConfig?: (config: PluginConfiguration) => boolean;
}
export interface IPluginManager {
    loadPlugin(path: string): Promise<IPlugin>;
    unloadPlugin(name: string): Promise<void>;
    enablePlugin(name: string): Promise<void>;
    disablePlugin(name: string): Promise<void>;
    getPlugin(name: string): IPlugin | undefined;
    listPlugins(): PluginInfo[];
    reloadPlugin(name: string): Promise<void>;
    on(event: PluginEvent, handler: (data: PluginEventData) => void): void;
    off(event: PluginEvent, handler: (data: PluginEventData) => void): void;
    emit(event: PluginEvent, data: PluginEventData): void;
}
export interface PluginInfo {
    name: string;
    version: string;
    description: string;
    enabled: boolean;
    loaded: boolean;
    error?: string;
    metadata: PluginMetadata;
    configuration: PluginConfiguration;
    tools: McpTool[];
    resources: McpResource[];
    loadTime?: Date;
    lastError?: {
        message: string;
        timestamp: Date;
        stack?: string;
    };
}
export interface PluginRegistryEntry {
    plugin: IPlugin;
    info: PluginInfo;
    context: PluginContext;
    handlers: {
        tools: Map<string, PluginToolHandler>;
        resources: Map<string, PluginResourceHandler>;
    };
}
export declare class PluginError extends Error {
    pluginName: string;
    code?: string | undefined;
    cause?: Error | undefined;
    constructor(message: string, pluginName: string, code?: string | undefined, cause?: Error | undefined);
}
export declare class PluginLoadError extends PluginError {
    constructor(pluginName: string, cause: Error);
}
export declare class PluginConfigError extends PluginError {
    constructor(pluginName: string, message: string);
}
export declare class PluginRuntimeError extends PluginError {
    constructor(pluginName: string, operation: string, cause: Error);
}
export interface PluginStatistics {
    name: string;
    enabled: boolean;
    loaded: boolean;
    toolCalls: number;
    resourceReads: number;
    errors: number;
    averageResponseTime: number;
    lastActivity: Date | null;
    memoryUsage?: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
}
