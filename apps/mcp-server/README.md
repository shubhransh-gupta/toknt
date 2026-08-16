# Tokn't MCP Server

Expose Tokn't recall, stats, and config to any MCP client (Claude Desktop, Cursor, etc.).

Closes [#15](https://github.com/shubhransh-gupta/toknt/issues/15).

## Tools

| Tool | Description |
|------|-------------|
| `toknt_recall` | Fetch content by `toknt://file\|output\|directory\|tool/<id>` |
| `toknt_stats` | Token savings from `~/.toknt/stats.json` |
| `toknt_config` | Current mode and cache stats |

## Run

```bash
npm run build -w @toknt/mcp-server
toknt mcp
# or
node apps/mcp-server/dist/index.js
```

## Claude Desktop config

```json
{
  "mcpServers": {
    "toknt": {
      "command": "node",
      "args": ["/absolute/path/to/toknt/apps/mcp-server/dist/index.js"]
    }
  }
}
```

## Cursor MCP config

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "toknt": {
      "command": "node",
      "args": ["apps/mcp-server/dist/index.js"]
    }
  }
}
```
