# UIID skills

Claude Code plugins for working with Linear projects and pull requests. They started in the [UIID design system](https://github.com/uiid-systems/design-system) and are being made to work in any repo that uses Linear and GitHub.

## Plugins

| Plugin | What it does                                                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uiid` | Graphs a Linear project's tickets in dependency order, builds its ready tickets in parallel with one draft PR each, and reviews and triages pull requests. |

## Install

In Claude Code:

```
/plugin install uiid --marketplace uiid-systems/skills
```

Pinning a version lands with the first release.

## Requirements

- Claude Code
- The [agent-skills](https://github.com/addyosmani/agent-skills) plugin, for the reviewer subagents
- The Linear MCP connector and the `gh` CLI

## License

MIT
