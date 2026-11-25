# UIID skills

Claude Code plugins for working with Linear projects and pull requests. They started in the [UIID design system](https://github.com/uiid-systems/design-system) and are being made to work in any repo that uses Linear and GitHub.

## Plugins

| Plugin | What it does                                                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uiid` | Graphs a Linear project's tickets in dependency order, builds its ready tickets in parallel with one draft PR each, and reviews and triages pull requests. |

## Install

Install the latest release in Claude Code:

```
/plugin install uiid --marketplace uiid-systems/skills
```

### Pin a version

Pin the marketplace to a release tag, and every plugin in it resolves from that tag:

```
claude plugin marketplace add uiid-systems/skills#v0.1.0 --scope project
claude plugin install uiid@uiid-skills --scope project
```

That records the pin in the repo's `.claude/settings.json`, which a team can commit:

```json
{
  "extraKnownMarketplaces": {
    "uiid-skills": {
      "source": {
        "source": "github",
        "repo": "uiid-systems/skills",
        "ref": "v0.1.0"
      }
    }
  },
  "enabledPlugins": {
    "uiid@uiid-skills": true
  }
}
```

`ref` takes a tag, a branch or a full commit SHA. Use a SHA when the pin must never move.

### Update

Change `ref` to the new tag, then run:

```
claude plugin marketplace update uiid-skills
claude plugin update uiid@uiid-skills
```

Run `/reload-plugins` in any open session. Releases and their changelogs are on the [releases page](https://github.com/uiid-systems/skills/releases).

## Requirements

- Claude Code
- The [agent-skills](https://github.com/addyosmani/agent-skills) plugin, for the reviewer subagents
- The Linear MCP connector and the `gh` CLI

## License

MIT
