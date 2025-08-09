# MCP Server Integration (MongoDB, n8n, Brave Search, Website Screenshots)

This scaffold enables Model Context Protocol (MCP) servers to be auto-launched by your MCP client and validated in CI.

References in this repo:
- ENHANCED_MCP_README.md (system overview)
- ENHANCED_MCP_INTEGRATION_PHASE.md (health/validation/orchestration)
- ENHANCED_MCP_AUTOMATION_REPORT.md (validation & deployment)
- COMPLETE_MCP_CANDIDATES_REGISTRY.md, MCP_CANDIDATES_IMPLEMENTATION.md (implemented candidates)

Quick Start
1) Local secrets (optional):
```
cp .env.mcp.example .env.mcp && edit .env.mcp
```
2) Configure your MCP client to auto-run servers:
- Open client MCP configuration and mirror mcp/servers.example.json entries.
- Ensure the client inherits env vars (launch from a shell that exported them or configure OS env).
3) CI secrets: Add repo secrets for N8N_BASE_URL, N8N_API_KEY, MONGODB_URI, MONGODB_DB, BRAVE_API_KEY, BROWSERBASE_API_KEY (as applicable).
4) Validate locally:
```
./scripts/mcp/healthcheck.sh
node scripts/mcp/probes/probe-n8n.js
node scripts/mcp/probes/probe-mongodb.js
```

Servers
- MongoDB MCP: read-only by default; writes gated by scripts/mcp/guards/require-prod-approval.sh
- n8n MCP: control workflows; requires N8N_BASE_URL and N8N_API_KEY
- Brave Search MCP: requires BRAVE_API_KEY
- Website Screenshots MCP: set SCREENSHOT_ENGINE=browserbase|playwright and provide matching env vars

Production DB Safety (Sequential Thinking)
See docs/mcp/production-db-ops.md for the step-by-step gate.