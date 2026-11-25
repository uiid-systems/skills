# AI Agent Guidelines

This repo is a Claude Code plugin marketplace. `.claude-plugin/marketplace.json` lists the plugins, and each plugin lives in `plugins/{name}/`.

## Layout

```
.claude-plugin/marketplace.json   → the marketplace and its plugins
plugins/{name}/.claude-plugin/plugin.json
plugins/{name}/skills/{skill}/SKILL.md
plugins/{name}/commands/          → slash commands
plugins/{name}/hooks/             → the hooks module and its tests
spec/                             → specs and plans
```

## Commands

| Task                          | Command                             |
| ----------------------------- | ----------------------------------- |
| Install dependencies          | `pnpm install`                      |
| Validate manifests and skills | `claude plugin validate .`          |
| Run a plugin's tests          | `claude plugin test plugins/{name}` |
| Format                        | `pnpm format`                       |
| Check formatting              | `pnpm format:check`                 |

## Rules

- Skills must work in any repo. Never write a repo, org, workspace slug, team key or package manager into a skill; read it from the repo the skill runs in.
- Never hard-wrap prose in markdown. A paragraph is one line.
- Tests sit beside the hooks code as `*.test.ts(x)` and import from `claude-code/testing`.
- PR titles follow conventional commits in imperative mood.
- This repo is public. Keep personal details, credentials and anything about private networks out of it.
