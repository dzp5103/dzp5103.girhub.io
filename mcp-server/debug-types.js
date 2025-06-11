/**
 * Debug script to validate type compatibility issues
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Check MCP SDK version and types
console.log('=== MCP SDK Debugging ===');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  console.log('MCP SDK Version:', packageJson.dependencies['@modelcontextprotocol/sdk']);
  
  // Try to import MCP SDK types
  const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
  console.log('MCP Server imported successfully');
  
  // Check for type definitions
  const mcpTypes = await import('@modelcontextprotocol/sdk/types.js');
  console.log('Available MCP SDK exports:', Object.keys(mcpTypes));
  
} catch (error) {
  console.error('MCP SDK Error:', error.message);
}

console.log('\n=== Octokit Types Debugging ===');
try {
  const { Octokit } = await import('@octokit/rest');
  console.log('Octokit imported successfully');
  
  // Create a test instance to check available methods
  const octokit = new Octokit({ auth: 'dummy' });
  console.log('Octokit instance created');
  
} catch (error) {
  console.error('Octokit Error:', error.message);
}

console.log('\n=== Type Compatibility Check ===');
try {
  // Check if the custom types can be loaded
  const mcpTypes = await import('./src/types/mcp.js');
  console.log('Custom MCP types loaded:', Object.keys(mcpTypes));
  
  const githubTypes = await import('./src/types/github.js');
  console.log('Custom GitHub types loaded:', Object.keys(githubTypes));
  
} catch (error) {
  console.error('Custom Types Error:', error.message);
}