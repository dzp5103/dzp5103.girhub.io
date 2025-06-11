/**
 * Main Entry Point for GitHub README Transformer MCP Server
 */
import { configManager } from './config/index.js';
import { logger } from './utils/logger.js';
import { createMcpServer } from './mcp/server.js';
import { pluginManager } from './plugins/manager.js';
async function main() {
    try {
        // Load configuration
        logger.info('Loading configuration...');
        const configResult = configManager.loadConfig();
        if (!configResult.isValid) {
            logger.error('Configuration validation failed', { errors: configResult.errors });
            process.exit(1);
        }
        const config = configManager.getConfig();
        logger.info('Configuration loaded successfully', {
            environment: config.server.environment,
            version: config.server.version,
        });
        // Initialize plugin system if enabled
        if (config.features.pluginSystem) {
            logger.info('Initializing plugin system...');
            await pluginManager.loadAllPlugins();
            const pluginStats = pluginManager.getAllStatistics();
            logger.info('Plugin system initialized', {
                loadedPlugins: pluginStats.filter(p => p.loaded).length,
                enabledPlugins: pluginStats.filter(p => p.enabled).length,
            });
        }
        // Create and start MCP server
        logger.info('Starting MCP server...');
        const mcpServer = createMcpServer();
        // Register additional tools from plugins
        if (config.features.pluginSystem) {
            const pluginTools = pluginManager.getAllTools();
            const pluginResources = pluginManager.getAllResources();
            logger.info('Registering plugin tools and resources', {
                tools: pluginTools.length,
                resources: pluginResources.length,
            });
        }
        // Setup graceful shutdown
        const shutdown = async () => {
            logger.info('Shutting down server...');
            try {
                await mcpServer.stop();
                logger.info('MCP server stopped successfully');
            }
            catch (error) {
                logger.error('Error stopping MCP server', { error });
            }
            process.exit(0);
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        process.on('SIGQUIT', shutdown);
        // Start the server
        await mcpServer.start();
        logger.info('GitHub README Transformer MCP Server started successfully', {
            name: config.server.name,
            version: config.server.version,
            environment: config.server.environment,
        });
    }
    catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
        reason,
        promise: promise.toString(),
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error });
    process.exit(1);
});
// Start the application
main().catch((error) => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
});
