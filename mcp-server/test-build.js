/**
 * Simple build test to verify the MCP server can be imported and initialized
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testBuild() {
  try {
    console.log('🔍 Testing MCP Server build...');
    
    // Test configuration loading
    console.log('📋 Testing configuration...');
    const { configManager } = await import('./src/config/index.js');
    const configResult = configManager.loadConfig();
    
    if (!configResult.isValid) {
      console.error('❌ Configuration validation failed:', configResult.errors);
      process.exit(1);
    }
    
    console.log('✅ Configuration loaded successfully');
    
    // Test GitHub service
    console.log('🐙 Testing GitHub service...');
    const { createGitHubClient } = await import('./src/services/github.js');
    const githubClient = createGitHubClient();
    console.log('✅ GitHub client created successfully');
    
    // Test MCP server
    console.log('🚀 Testing MCP server...');
    const { createMcpServer } = await import('./src/mcp/server.js');
    const mcpServer = createMcpServer();
    console.log('✅ MCP server created successfully');
    
    // Test plugin manager
    console.log('🔌 Testing plugin manager...');
    const { pluginManager } = await import('./src/plugins/manager.js');
    console.log('✅ Plugin manager loaded successfully');
    
    console.log('🎉 All components loaded successfully!');
    console.log('');
    console.log('📊 Build Summary:');
    console.log('- Configuration: ✅ Working');
    console.log('- GitHub Service: ✅ Working');
    console.log('- MCP Server: ✅ Working');
    console.log('- Plugin System: ✅ Working');
    console.log('');
    console.log('🚀 The MCP server is ready to run!');
    
  } catch (error) {
    console.error('❌ Build test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testBuild();