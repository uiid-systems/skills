# Implementation Plan: UIID skills repo split

Source specs: `capability-map.md`, `SPEC-repo-foundation.md`, `SPEC-graph-linear-project.md`, `SPEC-pr-review.md`, `SPEC-build-linear-project.md`

Tasks are tracked in the Linear project P-UI-15 "Skills repo split" (Design System team), one milestone per phase. The task list below is an index; the tickets hold the acceptance criteria.

## Overview

Create a public `uiid-systems/skills` repo, move the `uiid` plugin into it unchanged, cut design-system over to installing it, then generalize the skills one module at a time: the graph skill first as the POC, the review pair next, the build skill last.

## Architecture Decisions

- The whole plugin moves in one step (approved 2026-11-24). Moving one skill at a time would leave an installed `uiid` plugin and design-system's skills-dir `uiid` plugin clashing.
- The plugin lives at `plugins/uiid/` behind a root marketplace manifest, leaving room for more plugins.
- Each generalizing ticket ends with a tagged release; design-system bumps its pin in a small follow-up PR in its own repo.
- Repo-specific rules for the build skill live in a per-repo profile, defined by the build skill and read by triage for test commands.
- The CI review bot stays design-system's own workflow and reads `review-pr` from the pinned skills repo.

## Task List

### Phase 1: repo-foundation

1. UI-468: Create the skills repo with its scaffold
2. UI-469: Move the uiid plugin into the skills repo
3. UI-470: Add CI and branch protection
4. UI-471: Add release-please and cut v0.1.0
5. UI-472: Cut design-system over to the installed plugin

### Checkpoint: Foundation

- Fresh machine installs the plugin and lists all four skills
- The pane draws in a design-system session; the review bot posts on a test PR

### Phase 2: graph-linear-project and pr-review (parallel)

6. UI-473: Rename graph-project to graph-linear-project and drop design-system assumptions
7. UI-474: Add a local mode to review-pr with one shared comment format
8. UI-475: Let triage-findings read any posted review and the repo's own test commands

### Checkpoint: POC at work

- Graph a work project in the pane; run a local review on a work PR, post it, triage it

### Phase 3: build-linear-project

9. UI-476: Rename build-project to build-linear-project and read repo rules from a profile
10. UI-477: Fall back to AGENTS.md and offer to write a profile when a repo has none
11. UI-478: Add design-system's profile and bump its pin

### Checkpoint: Complete

- A design-system run behaves as before; a work run with its own profile opens a draft PR

## Risks and Mitigations

| Risk                                                                    | Impact | Mitigation                                                                               |
| ----------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| Installed and skills-dir `uiid` plugins clash during cutover            | High   | Delete design-system's copy in the same PR that adds the install                         |
| Review bot breaks when its skill path moves                             | High   | Cutover ticket repoints `claude-review.yml` and verifies on a test PR before merge       |
| Pinning a marketplace install to a tag is not supported the way assumed | Medium | Verify in UI-471 first; fall back to pinning the plugin version in the marketplace entry |
| Saved pane graph lost on rename                                         | Low    | Keep tool names and the stored `graph` key unchanged                                     |

## Open Questions

- Profile location (repo file vs user config) — decide in UI-476.
- Whether work uses `gh stack` — decide in UI-476.
