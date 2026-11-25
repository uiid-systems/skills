# Spec: graph-linear-project — V1

## Objective

Rename `uiid:graph-project` to `uiid:graph-linear-project` and remove every design-system assumption, so it graphs any Linear project from any repo. This is the POC: the first skill proven at work.

## Current coupling

- `P-UI-n` as the argument example and `UI-436`-style ids in examples.
- Cross-references to `uiid:build-project`.
- The pane's empty state says "Run /uiid:graph-project".
- Ticket links are restricted to `linear.app`; PR links take a `prBase`. Both already come from the call, not the repo.

## Changes

- Rename the skill folder, frontmatter `name`, and every reference (pane empty state, `register.tsx` tool descriptions, `build-project` mentions).
- Neutral examples: `ENG-123`, `P-ENG-4`, `acme/app`.
- The workspace slug and repo for links come from the Linear issue URLs and `gh repo view`, never a hard-coded org.
- References to the build skill use its new name `uiid:build-linear-project` (renamed in its own module; until then a one-line note says the build run is optional).

## Commands

```
Test:     claude plugin test plugins/uiid
Validate: claude plugin validate .
```

## Testing Strategy

- `register.test.tsx` covers layout, `set_graph` and `set_status`; update names, keep every case passing.
- Manual: graph one project in design-system and one at work; both draw in the pane with working ticket and PR links.

## Boundaries

- Always: keep tool names `set_graph` / `set_status` and the stored `graph` key, so a saved graph survives the update.
- Ask first: any change to the pane's layout or the status set.
- Never: put a workspace slug, team key or repo name in skill text or code.

## Success Criteria

- [ ] `grep -rn "graph-project\b\|P-UI\|UI-[0-9]\|uiid-systems" plugins/uiid` finds nothing outside changelogs.
- [ ] Plugin tests pass.
- [ ] In a work repo, `/uiid:graph-linear-project <project>` draws the project in the pane with links to the work Linear workspace and work GitHub repo.
- [ ] Without the pane, the same call prints the chat list.
- [ ] A release is tagged and design-system bumps its pin.

## Out of Scope (Deferred)

- Non-Linear trackers.
- Graphing several projects at once.

## Open Questions

None.
