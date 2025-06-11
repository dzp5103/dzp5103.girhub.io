/**
 * Model Context Protocol (MCP) Types and Interfaces
 */
export interface McpServerConfig {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
}
export interface McpTool {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, any>;
        required?: string[];
    };
}
export interface McpResource {
    uri: string;
    name: string;
    description: string;
    mimeType?: string;
}
export interface McpToolCall {
    name: string;
    arguments: Record<string, any>;
}
export interface McpToolResponse {
    content: Array<{
        type: "text" | "image" | "resource";
        text?: string;
        data?: string;
        mimeType?: string;
    }>;
    isError?: boolean;
}
export interface McpResourceContent {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
}
export interface McpServerCapabilities {
    logging?: {};
    prompts?: {
        listChanged?: boolean;
    };
    resources?: {
        subscribe?: boolean;
        listChanged?: boolean;
    };
    tools?: {
        listChanged?: boolean;
    };
    [k: string]: unknown;
}
export interface McpClientCapabilities {
    experimental?: Record<string, any>;
    sampling?: {};
}
export interface McpInitializeRequest {
    protocolVersion: string;
    capabilities: McpClientCapabilities;
    clientInfo: {
        name: string;
        version: string;
    };
}
export interface McpInitializeResponse {
    protocolVersion: string;
    capabilities: McpServerCapabilities;
    serverInfo: {
        name: string;
        version: string;
    };
}
export type McpRequest = {
    method: "initialize";
    params: McpInitializeRequest;
} | {
    method: "tools/list";
    params?: {};
} | {
    method: "tools/call";
    params: McpToolCall;
} | {
    method: "resources/list";
    params?: {};
} | {
    method: "resources/read";
    params: {
        uri: string;
    };
} | {
    method: "prompts/list";
    params?: {};
} | {
    method: "prompts/get";
    params: {
        name: string;
        arguments?: Record<string, any>;
    };
};
export type McpResponse = {
    result: McpInitializeResponse;
} | {
    result: {
        tools: McpTool[];
    };
} | {
    result: McpToolResponse;
} | {
    result: {
        resources: McpResource[];
    };
} | {
    result: McpResourceContent;
} | {
    error: {
        code: number;
        message: string;
        data?: any;
    };
};
export declare enum McpErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
    ServerError = -32000
}
export interface McpServerState {
    initialized: boolean;
    clientInfo?: {
        name: string;
        version: string;
    };
    capabilities: McpServerCapabilities;
    activeConnections: number;
    startTime: Date;
}
export interface McpEvent {
    type: 'tool_call' | 'resource_read' | 'error' | 'connection' | 'disconnect';
    timestamp: Date;
    data: any;
}
export interface IMcpServer {
    initialize(request: McpInitializeRequest): Promise<McpInitializeResponse>;
    listTools(): Promise<McpTool[]>;
    callTool(request: McpToolCall): Promise<McpToolResponse>;
    listResources(): Promise<McpResource[]>;
    readResource(uri: string): Promise<McpResourceContent>;
    start(): Promise<void>;
    stop(): Promise<void>;
    on(event: string, listener: Function): void;
    emit(event: string, ...args: any[]): void;
}
