# Spec: repo-foundation — V1

## Objective

Create `uiid-systems/skills`, set it up to the bar below, and make it the only home of the `uiid` plugin. Design-system stops carrying `.claude/skills/uiid/` and installs the plugin from the new repo instead. Skills move verbatim here; generalizing them is the later modules' work.

## Tech Stack

- Claude Code plugin: `.claude-plugin/plugin.json`, skills, commands, and a hooks module (`hooks/register.tsx`, run on the Claude Code mod runtime, imports `claude-code`)
- Marketplace manifest at `.claude-plugin/marketplace.json` listing the one plugin
- Tests on `claude-code/testing`, run by `claude plugin test`
- oxfmt for formatting (matches design-system), release-please for versions, commitlint for PR titles

## Commands

```
Validate:  claude plugin validate .
Test:      claude plugin test plugins/uiid
Format:    pnpm format:check   (oxfmt --check)
Install:   claude plugin marketplace add uiid-systems/skills
           claude plugin install uiid@uiid-skills
```

## Project Structure

```
.claude-plugin/marketplace.json   → marketplace listing the uiid plugin
plugins/uiid/.claude-plugin/plugin.json
plugins/uiid/skills/<name>/SKILL.md
plugins/uiid/commands/
plugins/uiid/hooks/               → register.tsx, graph.ts, tests beside them
plugins/uiid/types/
spec/                             → these specs, moved from design-system
.github/workflows/                → ci.yml, pr-title.yml, release-please.yml
README.md, LICENSE, AGENTS.md, CLAUDE.md (@AGENTS.md)
```

`plugins/<name>/` leaves room for more plugins without restructuring; `mcp` and `recipes` get their own repos.

## Code Style

Follow design-system's: TypeScript in hooks, prose never hard-wrapped, conventional-commit PR titles with imperative mood. Skill files follow the existing `SKILL.md` frontmatter (`name`, `description`, optional `argument-hint`).

## Testing Strategy

- CI on every PR: `claude plugin validate .`, `claude plugin test plugins/uiid`, `oxfmt --check`, PR title check.
- The existing `hooks/register.test.tsx` moves unchanged and must pass in the new repo before design-system deletes its copy.

## Boundaries

- Always: move files with history-free copies but cite the design-system PR in the commit; keep the plugin name `uiid`.
- Ask first: adding a dependency, changing skill behavior (that belongs to later modules), touching design-system workflows beyond the review bot's skill path.
- Never: keep a copy of the plugin in both repos after cutover; put home-network details or personal data in the public repo.

## Success Criteria

- [ ] `uiid-systems/skills` is public with a README (install, pin, update), LICENSE, branch protection on `main` requiring CI.
- [ ] CI runs validate, plugin tests, format check and PR title check, and passes on `main`.
- [ ] release-please cuts a tagged release (`v0.1.0`) and bumps `version` in `plugin.json` and `marketplace.json`.
- [ ] A fresh machine installs the plugin with the two commands above and lists all four `uiid:` skills and `/uiid:toggle-graph`.
- [ ] Design-system has no `.claude/skills/uiid/`; it installs the plugin from the marketplace at a pinned release, and `AGENTS.md` and `architecture.md` say so.
- [ ] Design-system's `claude-review.yml` checks out `uiid-systems/skills` at the pinned tag and reads `review-pr` from there; a review run on a test PR posts a comment.
- [ ] The project graph pane still opens and draws in a design-system session after cutover.

## Out of Scope (Deferred)

- Renaming or generalizing any skill (later modules).
- Skill evals (`claude plugin eval`): not in V1.
- Dependabot or Renovate for the pinned tag in design-system: bump by hand, like agent-skills today.

## Open Questions

1. Resolved 2026-11-24: the whole plugin moves verbatim here; `graph-linear-project` is the POC for generalizing.
2. How does design-system pin the version: a `ref` on the marketplace source in project settings, or the plugin version in the marketplace entry? Verify against Claude Code docs during implementation.
3. Does `agent-skills` need to be declared as a dependency anywhere, or is "install it too" in the README enough?
