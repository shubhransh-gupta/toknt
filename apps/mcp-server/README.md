# Tokn't MCP Server

Expose Tokn't recall, compression, stats, and config to any MCP client (Claude Desktop, Cursor, etc.).

Closes [#15](https://github.com/shubhransh-gupta/toknt/issues/15) · [#26](https://github.com/shubhransh-gupta/toknt/issues/26).

## Tools

| Tool | Description |
|------|-------------|
| `toknt_recall` | Fetch content by `toknt://file\|output\|directory\|tool/<id>` |
| `toknt_stats` | Token savings from `~/.toknt/stats.json` |
| `toknt_config` | Current mode and cache stats |
| `toknt_compress` | Compress terminal/file/directory/tool output |

## Install (Cursor)

```bash
npm run build
toknt mcp install              # writes .cursor/mcp.json in cwd
toknt mcp install --global     # writes ~/.cursor/mcp.json
```

## Run

```bash
toknt mcp                      # start stdio server
toknt mcp start                # same as above
npx toknt-mcp                  # after npm publish / linked bin
```

## Claude Desktop config

Printed by `toknt mcp install`, or add manually:

```json
{
  "mcpServers": {
    "toknt": {
      "command": "node",
      "args": ["/absolute/path/to/@toknt/mcp-server/dist/index.js"]
    }
  }
}
```

## Cursor MCP config

After `toknt mcp install`, `.cursor/mcp.json` contains:

```json
{
  "mcpServers": {
    "toknt": {
      "command": "/path/to/node",
      "args": ["/path/to/apps/mcp-server/dist/index.js"]
    }
  }
}
```

## Compress example

Tool: `toknt_compress`

```json
{
  "type": "terminal_output",
  "content": "... large test log ..."
}
```

Returns optimized summary, recall URI, and strategy.
