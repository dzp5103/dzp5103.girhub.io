# GitHub README Transformer MCP Server

A Model Context Protocol (MCP) server for transforming GitHub profile READMEs with advanced features including plugin system, rate limiting, and comprehensive GitHub API integration.

## Features

- **MCP Protocol Compliance**: Fully compliant with the Model Context Protocol specification
- **GitHub API Integration**: Comprehensive GitHub API client with rate limiting and request queuing
- **Plugin System**: Extensible plugin architecture for custom transformations
- **Multi-tier Caching**: Redis and PostgreSQL caching for optimal performance
- **Rate Limiting**: Supports 5,000 requests/hour per user with intelligent queuing
- **TypeScript**: Full TypeScript support with strict type checking
- **Configuration Management**: YAML-based configuration with environment overrides
- **Comprehensive Logging**: Structured logging with multiple output formats
- **Health Monitoring**: Built-in health checks and monitoring

## Architecturrd

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MCP Client    │◄──►│   MCP Server    │◄──►│  GitHub API     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Plugin System   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Cache Layer     │
                    │ (Redis/PostgreSQL) │
                    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- TypeScript 5.0 or higher
- Redis (optional, for caching)
- PostgreSQL (optional, for persistence)

### Installation

1. **Clone and navigate to the MCP server directory:**
   ```bash
   cd mcp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

### Development Mode

For development with hot reloading:

```bash
npm run dev
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# GitHub API Configuration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY=your_github_app_private_key

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=github_readme_transformer
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Server Configuration
NODE_ENV=development
SERVER_PORT=3001
LOG_LEVEL=info
```

### Configuration File

The server uses YAML configuration files in the `config/` directory:

- `default.yaml` - Default configuration
- Environment-specific overrides via environment variables

## Available Tools

The MCP server provides the following tools:

### `get_github_user_profile`

Get comprehensive GitHub user profile information including repositories, stats, and activity.

**Parameters:**
- `username` (string, required): GitHub username to fetch profile for

**Example:**
```json
{
  "name": "get_github_user_profile",
  "arguments": {
    "username": "octocat"
  }
}
```

### `get_github_repository`

Get detailed GitHub repository information including stats, languages, and contributors.

**Parameters:**
- `owner` (string, required): Repository owner username
- `repo` (string, required): Repository name

**Example:**
```json
{
  "name": "get_github_repository",
  "arguments": {
    "owner": "octocat",
    "repo": "Hello-World"
  }
}
```

### `get_github_user_repositories`

Get list of repositories for a GitHub user.

**Parameters:**
- `username` (string, required): GitHub username
- `type` (string, optional): Type of repositories (`all`, `owner`, `member`)
- `sort` (string, optional): Sort order (`created`, `updated`, `pushed`, `full_name`)
- `per_page` (number, optional): Number of repositories per page (max 100)

### `get_server_health`

Get server health status and statistics.

**Parameters:** None

## Available Resources

### `config://server`

Current server configuration in JSON format.

### `github://rate-limit`

Current GitHub API rate limit status.

## Plugin System

The server supports a plugin system for extending functionality. Plugins are loaded from the `plugins/` directory.

### Plugin Structure

```typescript
export default function createPlugin(): IPlugin {
  return {
    metadata: {
      name: 'my-plugin',
      version: '1.0.0',
      description: 'My custom plugin',
      author: 'Your Name',
      license: 'MIT',
    },
    tools: [
      // Define custom tools
    ],
    resources: [
      // Define custom resources
    ],
    async onLoad(context) {
      // Plugin initialization
    },
    async handleTool(call, context) {
      // Handle tool calls
    },
    async handleResource(uri, context) {
      // Handle resource reads
    },
  };
}
```

## API Documentation

### GitHub Client

The GitHub client provides comprehensive GitHub API integration:

```typescript
import { createGitHubClient } from './services/github.js';

const client = createGitHubClient({
  token: 'your_token',
});

// Get user profile
const profile = await client.getUserProfile('username');

// Get repository stats
const repoStats = await client.getRepositoryStats('owner', 'repo');
```

### Rate Limiting

The server implements intelligent rate limiting:

- 5,000 requests per hour per user
- Burst limit of 100 requests
- Request queuing for excess traffic
- Exponential backoff for retries

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

```
mcp-server/
├── config/                 # Configuration files
│   └── default.yaml
├── src/
│   ├── config/             # Configuration management
│   ├── mcp/                # MCP server implementation
│   ├── plugins/            # Plugin system
│   ├── services/           # External service clients
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── index.ts            # Main entry point
├── plugins/                # Plugin directory
├── logs/                   # Log files (production)
├── dist/                   # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper tests
4. Run linting and tests: `npm run lint && npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation and examples
- Review the configuration options

## Roadmap

- [ ] Advanced analytics and metrics
- [ ] Webhook support for real-time updates
- [ ] Additional visualization plugins
- [ ] Performance optimizations
- [ ] Enhanced caching strategies
- [ ] Distributed deployment support
