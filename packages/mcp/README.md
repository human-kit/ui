# @human-kit/mcp

An MCP server that gives the documentation of [`@human-kit/ui`](https://ui.human-kit.com) to a coding agent.

The server reads the docs of the version that your project installed, in `node_modules/@human-kit/ui/docs`. If that folder is not there, it reads the site, which shows the latest version.

## Tools

| Tool                 | What it does                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `list_components`    | Lists each page of the documentation by group, with a one-line description.                                        |
| `get_component_docs` | Gives the page of one component as markdown. Give `section` (for example `API reference`) to get only one section. |
| `search_docs`        | Finds the pages that contain some words, with the lines that contain them.                                         |

## Install

Claude Code:

```bash
claude mcp add human-kit -- npx -y @human-kit/mcp
```

Cursor (`.cursor/mcp.json`) and other clients with the same format:

```json
{
	"mcpServers": {
		"human-kit": { "command": "npx", "args": ["-y", "@human-kit/mcp"] }
	}
}
```

VS Code (`.vscode/mcp.json`):

```json
{
	"servers": {
		"human-kit": { "type": "stdio", "command": "npx", "args": ["-y", "@human-kit/mcp"] }
	}
}
```

The server looks for `node_modules` from its working directory up. If your client starts it in a different directory, add `--project <path>` to the arguments, or set `HUMAN_KIT_PROJECT`.

## License

MIT
