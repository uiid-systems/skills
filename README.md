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

## Repo profile

`uiid:build-linear-project` reads everything about the repo it builds in from a profile at `.claude/uiid.yml`, committed with the repo. `uiid:triage-findings` also reads its `checks` for the tests to run when one exists. The skill reads the profile from the checkout it runs in, never from a build agent's worktree.

```yaml
# .claude/uiid.yml
base: main
setup:
  - npm ci
read_first:
  - AGENTS.md
  - docs/architecture.md
  - the docs/ page for any feature the ticket touches
checks:
  - npm test
  - npm run lint
  - npm run typecheck
  - run: npm run test:e2e
    when: [src/pages/**]
commands:
  - npm run lint -- --fix
  - npm run format
  - npm run build
commit:
  scopes: [app, api, docs, repo]
  body_max: 100
push_allowlist:
  - src/**
  - docs/**
  - README.md
stack: none
```

| Field             | Required | What it holds                                                                                                                                                                                  |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`            | yes      | The branch tickets build from and pull requests target.                                                                                                                                        |
| `setup`           | yes      | Commands that prepare a fresh worktree, run in order.                                                                                                                                          |
| `read_first`      | yes      | Files every build agent reads before it starts. An entry may describe files rather than name them.                                                                                             |
| `checks`          | yes      | The standing bar every build must pass. Each entry is a command, or a `run` command with a `when` list of path globs that makes it part of the bar only when the diff touches a matching file. |
| `commands`        | no       | Other commands an agent may run that are not part of the bar, such as a fixer or a build.                                                                                                      |
| `commit.scopes`   | no       | The conventional commit scopes allowed. Without it, any scope or none.                                                                                                                         |
| `commit.body_max` | no       | The longest a commit body line may be, in characters. Without it, no limit.                                                                                                                    |
| `push_allowlist`  | yes      | Path globs. A build whose diff changes a file outside them is held for the owner instead of pushed.                                                                                            |
| `stack`           | yes      | `gh-stack` builds a ticket on a blocker from the same run and joins their pull requests with `gh stack`. `none` leaves the ticket until its blocker's pull request merges.                     |

`setup`, `checks` and `commands`, with local `git`, are the only commands a build agent runs, so add a command there before a ticket needs it. A dependency manifest or lockfile, a `*.config.*` file, a CI workflow, an `AGENTS.md`, a `CLAUDE.md` and the profile itself are always held, whatever `push_allowlist` says. Keep the allowlist to files that are safe to run in CI on a draft pull request: that holds only while those jobs have no secret and a read-only token.

## Requirements

- Claude Code
- The [agent-skills](https://github.com/addyosmani/agent-skills) plugin, for the reviewer subagents
- The Linear MCP connector and the `gh` CLI

## License

MIT
