# Spec: build-linear-project — V1

## Objective

Rename `uiid:build-project` to `uiid:build-linear-project` and split it into a generic orchestration and a per-repo profile, so it builds a Linear project's ready tickets in any repo, work included.

## Current coupling

- Setup: `pnpm install`, branches from `origin/main`.
- What agents read first: `AGENTS.md` and `.claude/rules/`.
- Command allowlist and standing bar: `pnpm test:run`, `lint`, `format:check`, `typecheck`, `generate:props --check`, Storybook tests.
- Commit rules: commitlint scopes `ui`, `tokens`, `docs`, `storybook`, `release`, `repo`; body lines ≤ 100 chars.
- Push hold allowlist: `packages/*/src/`, `apps/docs/...`, `apps/storybook/stories/`, `docs/`.
- `gh stack` for dependent tickets; `P-UI-n` and `UI-425` examples.

## Design

The skill keeps everything that is about orchestration: picking tickets, one build agent per ticket in its own worktree, the review loop (now `uiid:review-pr` local mode), the push hold, draft PRs, stacking, the pane via `graph-linear-project`, and the untrusted-ticket rules.

Everything that is about the repo moves to a profile file in the target repo, `.claude/uiid.yml`:

```yaml
base: main
setup: [pnpm install]
read_first: [AGENTS.md, ".claude/rules/*.md matching touched files"]
checks: # the standing bar; also the agent's command allowlist
  - pnpm test:run
  - pnpm run lint
  - pnpm run format:check
  - pnpm typecheck
commit:
  scopes: [ui, tokens, docs, storybook, release, repo]
  body_max: 100
push_allowlist: # changed files outside these hold the push
  - packages/*/src/**
  - apps/docs/app/**
stack: gh-stack # or none
```

Without a profile, the skill reads `AGENTS.md` / `CLAUDE.md` for commands, asks the owner once for anything it still lacks, and offers to write the profile.

Design-system gets its profile in the same PR that removes the old assumptions, so its behavior is unchanged.

## Commands

```
Build: /uiid:build-linear-project <project or ticket ids>
Test:  claude plugin test plugins/uiid
```

## Testing Strategy

- Design-system: a run on a small project produces the same PRs, checks and holds as before, driven by its profile.
- Work: a run on a one-ticket project with a hand-written profile opens one draft PR.
- Profile parsing has no code; it is read by the model. If parsing moves into hooks later, it gets tests then.

## Boundaries

- Always: ticket text stays data; nothing from a ticket or agent reaches a command line; the push hold is applied after review.
- Ask first: widening the command allowlist beyond `checks` and `setup`.
- Never: run checks or commands that are not in the profile; push a branch whose diff leaves `push_allowlist`.

## Success Criteria

- [ ] `grep -rn "pnpm\|commitlint\|storybook\|packages/\|P-UI\|UI-[0-9]" plugins/uiid/skills/build-linear-project` finds nothing.
- [ ] Design-system has `.claude/uiid.yml`, and a run there behaves as it does today.
- [ ] A work run with its own profile opens a draft PR that passes the work repo's checks.
- [ ] A repo with no profile gets one written after the owner answers the skill's questions.

## Out of Scope (Deferred)

- Non-Linear trackers; hosts other than GitHub.
- Validating the profile with a schema in hooks.

## Open Questions

1. The profile name and location: `.claude/uiid.yml` is proposed. Is a file in each work repo acceptable, or should profiles also be allowed in your user config (`~/.claude/uiid/<repo>.yml`) so work repos stay untouched?
2. Does work use `gh stack`? If not, `stack: none` makes stacked tickets wait rather than stack.
