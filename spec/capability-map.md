# Capability Map: UIID skills repo split

Move the `uiid` Claude Code plugin out of `uiid-systems/design-system` into a public `uiid-systems/skills` repo, so its Linear and review skills install on any machine (work included) at a pinned version.

## Intent (confirmed 2026-11-24)

- Outcome: a public `uiid-systems/skills` repo holding the `uiid` plugin, installed on any machine at a pinned version.
- User: the owner, on design-system, other personal repos and work repos. All use Linear and GitHub.
- Success: at work, install the plugin and graph a project, build tickets and run a local review (optionally posted in the shared format), with no design-system files or assumptions. Design-system keeps working, installing the plugin from the new repo.
- Constraint: production-ready repo (CI, plugin tests, release-please tags, branch protection, install README). A skill never lives in both repos at once.
- Out of scope: a portable CI review bot (stays design-system's own workflow), skill evals, npm publishing, a docs site, other trackers or hosts, the `mcp` and `recipes` repos.

## Modules

| Module id              | Responsibility                                                                                                                            | Depends on                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `repo-foundation`      | Create and set up the repo; move the plugin into it; design-system installs it from there                                                 | —                                   |
| `graph-linear-project` | Rename `graph-project` and remove every design-system assumption; prove it at work (the POC)                                              | `repo-foundation`                   |
| `pr-review`            | Make `review-pr` and `triage-findings` portable: local review anywhere, one shared comment format, design-system's CI bot as one consumer | `repo-foundation`                   |
| `build-linear-project` | Rename `build-project` and move repo-specific rules into a per-repo profile                                                               | `graph-linear-project`, `pr-review` |

Build order: `repo-foundation` → `graph-linear-project`, `pr-review` (parallel) → `build-linear-project`

Specs: `SPEC-repo-foundation.md`, `SPEC-graph-linear-project.md`, `SPEC-pr-review.md`, `SPEC-build-linear-project.md`

## Interfaces between modules

- Plugin name `uiid` is fixed. Skill ids are `uiid:<skill>`; graph tools are `mcp__uiid__set_graph` and `mcp__uiid__set_status`.
- `graph-linear-project` owns the pane and its tools. `build-linear-project` calls them and never draws on its own.
- `pr-review` owns the review comment format and its round marker. `triage-findings` and design-system's CI bot read that format; neither redefines it.
- `build-linear-project` reads the per-repo profile defined in its own spec. Other skills may read the same profile for test commands (triage does), but only `build-linear-project` defines its shape.
