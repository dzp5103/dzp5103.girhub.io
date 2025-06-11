/**
 * Core MCP Server Implementation
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { EventEmitter } from 'events';
import { configManager } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { createGitHubClient } from '../services/github.js';
export class McpServer extends EventEmitter {
    server;
    transport;
    githubClient;
    state;
    tools = new Map();
    resources = new Map();
    toolHandlers = new Map();
    resourceHandlers = new Map();
    constructor() {
        super();
        try {
            logger.info('McpServer constructor starting...');
            const config = configManager.getServerConfig();
            logger.info('Server config loaded', { name: config.name, version: config.version });
            // Initialize server state
            this.state = {
                initialized: false,
                capabilities: this.getServerCapabilities(),
                activeConnections: 0,
                startTime: new Date(),
            };
            logger.info('Server state initialized');
            // Initialize MCP server
            logger.info('Creating MCP Server instance...');
            this.server = new Server({
                name: config.name,
                version: config.version,
            }, {
                capabilities: this.state.capabilities,
            });
            logger.info('MCP Server instance created successfully');
            // Initialize transport
            logger.info('Creating StdioServerTransport...');
            this.transport = new StdioServerTransport();
            logger.info('StdioServerTransport created successfully');
            // Initialize GitHub client
            logger.info('Creating GitHub client...');
            this.githubClient = createGitHubClient();
            logger.info('GitHub client created successfully');
            logger.info('Setting up server handlers...');
            this.setupServerHandlers();
            logger.info('Server handlers setup complete');
            logger.info('Registering core tools...');
            this.registerCoreTools();
            logger.info('Core tools registered');
            logger.info('Registering core resources...');
            this.registerCoreResources();
            logger.info('Core resources registered');
            logger.info('McpServer constructor completed successfully');
        }
        catch (error) {
            logger.error('Failed to construct McpServer', {
                error: error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : undefined,
                errorType: typeof error,
                errorConstructor: error?.constructor?.name
            });
            throw error;
        }
    }
    getServerCapabilities() {
        return {
            tools: {
                listChanged: true,
            },
            resources: {
                subscribe: false,
                listChanged: true,
            },
            logging: {},
        };
    }
    setupServerHandlers() {
        // Handle tool list requests
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            logger.logMCPEvent({
                type: 'tools_list',
                method: 'tools/list',
            });
            return {
                tools: Array.from(this.tools.values()),
            };
        });
        // Handle tool call requests
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const startTime = Date.now();
            try {
                logger.logMCPEvent({
                    type: 'tool_call',
                    method: 'tools/call',
                    tool: request.params.name,
                });
                const handler = this.toolHandlers.get(request.params.name);
                if (!handler) {
                    throw new Error(`Tool not found: ${request.params.name}`);
                }
                const result = await handler({
                    name: request.params.name,
                    arguments: request.params.arguments || {},
                });
                const duration = Date.now() - startTime;
                logger.logMCPEvent({
                    type: 'tool_call_success',
                    tool: request.params.name,
                    duration,
                });
                // Add tools property for MCP SDK v0.5.0 compatibility
                return {
                    ...result,
                    tools: Array.from(this.tools.values()),
                };
            }
            catch (error) {
                const duration = Date.now() - startTime;
                logger.logMCPEvent({
                    type: 'tool_call_error',
                    tool: request.params.name,
                    duration,
                    error: error,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        },
                    ],
                    isError: true,
                    tools: Array.from(this.tools.values()),
                };
            }
        });
        // Handle resource list requests
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            logger.logMCPEvent({
                type: 'resources_list',
                method: 'resources/list',
            });
            return {
                resources: Array.from(this.resources.values()),
            };
        });
        // Handle resource read requests
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const startTime = Date.now();
            try {
                logger.logMCPEvent({
                    type: 'resource_read',
                    method: 'resources/read',
                    resource: request.params.uri,
                });
                const handler = this.resourceHandlers.get(request.params.uri);
                if (!handler) {
                    throw new Error(`Resource not found: ${request.params.uri}`);
                }
                const result = await handler(request.params.uri);
                const duration = Date.now() - startTime;
                logger.logMCPEvent({
                    type: 'resource_read_success',
                    resource: request.params.uri,
                    duration,
                });
                // Add tools property for MCP SDK v0.5.0 compatibility
                return {
                    ...result,
                    tools: Array.from(this.tools.values()),
                };
            }
            catch (error) {
                const duration = Date.now() - startTime;
                logger.logMCPEvent({
                    type: 'resource_read_error',
                    resource: request.params.uri,
                    duration,
                    error: error,
                });
                throw error;
            }
        });
    }
    registerCoreTools() {
        // GitHub User Profile Tool
        this.registerTool({
            name: 'get_github_user_profile',
            description: 'Get comprehensive GitHub user profile information including repositories, stats, and activity',
            inputSchema: {
                type: 'object',
                properties: {
                    username: {
                        type: 'string',
                        description: 'GitHub username to fetch profile for',
                    },
                },
                required: ['username'],
            },
        }, async (call) => {
            const { username } = call.arguments;
            try {
                const profile = await this.githubClient.getUserProfile(username);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(profile, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
        // GitHub Repository Tool
        this.registerTool({
            name: 'get_github_repository',
            description: 'Get detailed GitHub repository information including stats, languages, and contributors',
            inputSchema: {
                type: 'object',
                properties: {
                    owner: {
                        type: 'string',
                        description: 'Repository owner username',
                    },
                    repo: {
                        type: 'string',
                        description: 'Repository name',
                    },
                },
                required: ['owner', 'repo'],
            },
        }, async (call) => {
            const { owner, repo } = call.arguments;
            try {
                const repoStats = await this.githubClient.getRepositoryStats(owner, repo);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(repoStats, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                throw new Error(`Failed to get repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
        // GitHub User Repositories Tool
        this.registerTool({
            name: 'get_github_user_repositories',
            description: 'Get list of repositories for a GitHub user',
            inputSchema: {
                type: 'object',
                properties: {
                    username: {
                        type: 'string',
                        description: 'GitHub username',
                    },
                    type: {
                        type: 'string',
                        enum: ['all', 'owner', 'member'],
                        description: 'Type of repositories to fetch',
                    },
                    sort: {
                        type: 'string',
                        enum: ['created', 'updated', 'pushed', 'full_name'],
                        description: 'Sort order for repositories',
                    },
                    per_page: {
                        type: 'number',
                        description: 'Number of repositories per page (max 100)',
                        minimum: 1,
                        maximum: 100,
                    },
                },
                required: ['username'],
            },
        }, async (call) => {
            const { username, type, sort, per_page } = call.arguments;
            try {
                const repositories = await this.githubClient.getUserRepositories(username, {
                    type: type,
                    sort: sort,
                    per_page: per_page,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(repositories, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                throw new Error(`Failed to get repositories: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
        // Server Health Tool
        this.registerTool({
            name: 'get_server_health',
            description: 'Get server health status and statistics',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        }, async () => {
            const config = configManager.getConfig();
            const githubHealthy = await this.githubClient.isHealthy();
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.state.startTime.getTime(),
                server: {
                    name: config.server.name,
                    version: config.server.version,
                    environment: config.server.environment,
                },
                connections: this.state.activeConnections,
                github: {
                    healthy: githubHealthy,
                },
                features: config.features,
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(health, null, 2),
                    },
                ],
            };
        });
    }
    registerCoreResources() {
        // Server configuration resource
        this.registerResource({
            uri: 'config://server',
            name: 'Server Configuration',
            description: 'Current server configuration',
            mimeType: 'application/json',
        }, async () => {
            const config = configManager.getConfig();
            return {
                uri: 'config://server',
                mimeType: 'application/json',
                text: JSON.stringify(config, null, 2),
            };
        });
        // GitHub rate limit resource
        this.registerResource({
            uri: 'github://rate-limit',
            name: 'GitHub Rate Limit',
            description: 'Current GitHub API rate limit status',
            mimeType: 'application/json',
        }, async () => {
            try {
                const rateLimit = await this.githubClient.getRateLimit();
                return {
                    uri: 'github://rate-limit',
                    mimeType: 'application/json',
                    text: JSON.stringify(rateLimit, null, 2),
                };
            }
            catch (error) {
                throw new Error(`Failed to get rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Public API methods
    registerTool(tool, handler) {
        this.tools.set(tool.name, tool);
        this.toolHandlers.set(tool.name, handler);
        logger.info(`Tool registered: ${tool.name}`);
    }
    registerResource(resource, handler) {
        this.resources.set(resource.uri, resource);
        this.resourceHandlers.set(resource.uri, handler);
        logger.info(`Resource registered: ${resource.uri}`);
    }
    unregisterTool(name) {
        this.tools.delete(name);
        this.toolHandlers.delete(name);
        logger.info(`Tool unregistered: ${name}`);
    }
    unregisterResource(uri) {
        this.resources.delete(uri);
        this.resourceHandlers.delete(uri);
        logger.info(`Resource unregistered: ${uri}`);
    }
    // IMcpServer interface implementation
    async initialize(request) {
        this.state.initialized = true;
        this.state.clientInfo = request.clientInfo;
        logger.info('MCP Server initialized', { clientInfo: request.clientInfo });
        return {
            protocolVersion: '2024-11-05',
            capabilities: this.state.capabilities,
            serverInfo: {
                name: configManager.getServerConfig().name,
                version: configManager.getServerConfig().version,
            },
        };
    }
    async listTools() {
        return Array.from(this.tools.values());
    }
    async callTool(request) {
        const handler = this.toolHandlers.get(request.name);
        if (!handler) {
            throw new Error(`Tool not found: ${request.name}`);
        }
        return await handler(request);
    }
    async listResources() {
        return Array.from(this.resources.values());
    }
    async readResource(uri) {
        const handler = this.resourceHandlers.get(uri);
        if (!handler) {
            throw new Error(`Resource not found: ${uri}`);
        }
        return await handler(uri);
    }
    async start() {
        try {
            logger.info('Attempting to connect MCP server to stdio transport...');
            await this.server.connect(this.transport);
            this.state.activeConnections = 1;
            logger.info('MCP Server started successfully');
            this.emit('started');
        }
        catch (error) {
            logger.error('Failed to start MCP Server', {
                error: error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : undefined,
                errorType: typeof error,
                errorConstructor: error?.constructor?.name
            });
            this.emit('error', error);
            throw error;
        }
    }
    async stop() {
        try {
            await this.server.close();
            this.state.activeConnections = 0;
            logger.info('MCP Server stopped');
            this.emit('stopped');
        }
        catch (error) {
            logger.error('Failed to stop MCP Server', { error });
            this.emit('error', error);
            throw error;
        }
    }
    getState() {
        return { ...this.state };
    }
    getGitHubClient() {
        return this.githubClient;
    }
}
// Export singleton factory
export function createMcpServer() {
    return new McpServer();
}
