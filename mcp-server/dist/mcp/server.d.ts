/**
 * Core MCP Server Implementation
 */
import { ServerCapabilitiesSchema, ToolSchema, ResourceSchema } from '@modelcontextprotocol/sdk/types.js';
import { EventEmitter } from 'events';
import { GitHubClient } from '../services/github.js';
type McpTool = typeof ToolSchema._type;
type McpResource = typeof ResourceSchema._type;
type McpServerCapabilities = typeof ServerCapabilitiesSchema._type;
interface McpToolCall {
    name: string;
    arguments: Record<string, any>;
}
interface McpToolResponse {
    content: Array<{
        type: "text" | "image" | "resource";
        text?: string;
        data?: string;
        mimeType?: string;
    }>;
    isError?: boolean;
}
interface McpResourceContent {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
}
interface McpServerState {
    initialized: boolean;
    clientInfo?: {
        name: string;
        version: string;
    };
    capabilities: McpServerCapabilities;
    activeConnections: number;
    startTime: Date;
}
interface IMcpServer {
    initialize(request: any): Promise<any>;
    listTools(): Promise<McpTool[]>;
    callTool(request: McpToolCall): Promise<McpToolResponse>;
    listResources(): Promise<McpResource[]>;
    readResource(uri: string): Promise<McpResourceContent>;
    start(): Promise<void>;
    stop(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
}
export declare class McpServer extends EventEmitter implements IMcpServer {
    private server;
    private transport;
    private githubClient;
    private state;
    private tools;
    private resources;
    private toolHandlers;
    private resourceHandlers;
    constructor();
    private getServerCapabilities;
    private setupServerHandlers;
    private registerCoreTools;
    private registerCoreResources;
    registerTool(tool: McpTool, handler: (call: McpToolCall) => Promise<McpToolResponse>): void;
    registerResource(resource: McpResource, handler: (uri: string) => Promise<McpResourceContent>): void;
    unregisterTool(name: string): void;
    unregisterResource(uri: string): void;
    initialize(request: any): Promise<any>;
    listTools(): Promise<McpTool[]>;
    callTool(request: McpToolCall): Promise<McpToolResponse>;
    listResources(): Promise<McpResource[]>;
    readResource(uri: string): Promise<McpResourceContent>;
    start(): Promise<void>;
    stop(): Promise<void>;
    getState(): McpServerState;
    getGitHubClient(): GitHubClient;
}
export declare function createMcpServer(): McpServer;
export {};
