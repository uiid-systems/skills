import { expect, test } from "claude-code/testing";

import { layOut, toGraph, withChange } from "./graph";

const PANE = {
  plugin: "uiid",
  component: "Pane",
  requestId: "project-graph",
  props: {
    title: "Project graph",
    isFocused: false,
    bodyColumns: 44,
    placement: "dock",
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const;

const INPUT = {
  title: "Checkout rewrite",
  updated: "Nov 23, 8:50 PM",
  linkBase: "https://linear.app/acme/issue/",
  prBase: "https://github.com/acme/app/pull/",
  sections: [
    {
      heading: "Ready",
      tickets: [
        { id: "ENG-436", status: "in review", pr: 691 },
        { id: "ENG-466" },
      ],
    },
    {
      heading: "Blocked",
      tickets: [
        { id: "ENG-437", status: "building", waitsOn: ["ENG-436"] },
        { id: "ENG-438", waitsOn: ["ENG-437"] },
        { id: "ENG-441", waitsOn: ["ENG-437", "ENG-900"] },
        { id: "ENG-442", waitsOn: ["ENG-438", "ENG-441"] },
      ],
    },
    {
      heading: "After the Phase 5 checkpoint",
      isGate: true,
      tickets: [{ id: "ENG-444", waitsOn: ["ENG-442"] }],
    },
  ],
};

const drawing = (columns = 44): string[] => {
  const graph = toGraph(INPUT);
  if (graph === undefined) throw new Error("no graph");

  return layOut(graph, columns).map((row) => {
    if (row.kind === "ticket") return `${row.gutter}● ${row.ticket.id}`;
    if (row.kind === "heading") return `${row.gutter}${row.text}`;
    if (row.kind === "note") return `${row.gutter}  ${row.text}`;

    return row.gutter;
  });
};

test("each blocker's rail joins the tickets that wait on it", () => {
  expect(drawing()).toEqual([
    "      Ready",
    "╭─────● ENG-436",
    "│       5 tickets wait on this",
    "│     ● ENG-466",
    "│     ",
    "│     Blocked",
    "╰─┬───● ENG-437",
    "╭─┼───● ENG-438",
    "│ ╰─┬─● ENG-441",
    "│   │   waits on ENG-900",
    "╰─┬─┴─● ENG-442",
    "  │   ",
    "══╪═══After the Phase 5 checkpoint",
    "  │   ",
    "  ╰───● ENG-444",
  ]);
});

test("a merged ticket never carries the count of tickets waiting", () => {
  const graph = toGraph({
    sections: [
      {
        heading: "Phase 1",
        tickets: [
          { id: "ENG-1", status: "merged" },
          { id: "ENG-2", status: "merged", waitsOn: ["ENG-1"] },
        ],
      },
      {
        heading: "Ready",
        tickets: [
          { id: "ENG-3", waitsOn: ["ENG-2"] },
          { id: "ENG-4", waitsOn: ["ENG-3"] },
          { id: "ENG-5", waitsOn: ["ENG-4"] },
        ],
      },
    ],
  });
  if (graph === undefined) throw new Error("no graph");
  const rows = layOut(graph, 44);
  const noteAfter = (id: string): string | undefined => {
    const at = rows.findIndex(
      (row) => row.kind === "ticket" && row.ticket.id === id,
    );
    const next = rows[at + 1];

    return next?.kind === "note" ? next.text : undefined;
  };

  expect(noteAfter("ENG-1")).toBeUndefined();
  expect(noteAfter("ENG-2")).toBeUndefined();
  expect(noteAfter("ENG-3")).toBe("2 tickets wait on this");
});

test("a rail takes its blocker's status", () => {
  const graph = toGraph(INPUT);
  if (graph === undefined) throw new Error("no graph");
  const rows = layOut(graph, 44);

  expect(rows[1]?.marks).toEqual([
    { text: "╭", status: "in review" },
    { text: "─────" },
  ]);
  expect(rows[7]?.marks).toEqual([
    { text: "╭─" },
    { text: "┼", status: "building" },
    { text: "───" },
  ]);
});

test("a graph read back from the store is unchanged", () => {
  const graph = toGraph(INPUT);

  expect(toGraph(graph)).toEqual(graph);
});

test("input the pane cannot draw is dropped", () => {
  const graph = toGraph({
    title: "x",
    linkBase: "https://linear.app.example/acme/issue/",
    prBase: "https://example.com/pull/",
    sections: [
      {
        heading: "Ready",
        tickets: [
          {
            id: "eng-1",
            status: "exploded",
            pr: -2,
            waitsOn: ["ENG-1", "nope"],
          },
          { id: "not a ticket" },
          { id: "ENG-1" },
        ],
      },
    ],
  });

  expect(graph?.linkBase).toBe("");
  expect(graph?.prBase).toBe("");
  expect(graph?.sections[0]?.tickets).toEqual([{ id: "ENG-1", waitsOn: [] }]);
  expect(toGraph({ sections: [{ heading: "Ready", tickets: [] }] })).toBe(
    undefined,
  );
});

test("a change touches one ticket and keeps the rest", () => {
  const graph = toGraph(INPUT);
  if (graph === undefined) throw new Error("no graph");
  const changed = withChange(graph, "ENG-437", { status: "waiting", pr: 700 });

  expect(changed?.sections[1]?.tickets[0]).toEqual({
    id: "ENG-437",
    waitsOn: ["ENG-436"],
    pr: 700,
  });
  expect(changed?.sections[0]).toEqual(graph.sections[0]);
  expect(withChange(graph, "ENG-999", { pr: 1 })).toBe(undefined);
  expect(
    withChange(graph, "ENG-436", { status: "merged" })?.sections[0]?.tickets[0]
      ?.status,
  ).toBe("merged");
});

test("the pane draws what set_graph sent, then follows set_status", async ($, on) => {
  on("tool.register", () => ({ value: { tool: "mcp__uiid__set_graph" } }));
  let isPlaced = true;
  const opened: string[] = [];
  on("ui.open", (_, e) => {
    opened.push(e.id);

    return { value: { isPlaced: true } };
  });
  on("ui.close", (_, e) => {
    opened.push(`closed ${e.id}`);

    return { value: undefined };
  });
  on("skill.prompt", (_, e) => ({ text: e.text }));
  on("ui.panes", () => ({
    value: [
      {
        id: "project-graph",
        title: "Project graph",
        isShown: isPlaced,
        isFocused: false,
        isPlaced,
      },
    ],
  }));
  on("session.start", (_, e) => ({ cwd: e.cwd }));
  const kept = new Map<string, unknown>();
  on("store.get", (_, e) => ({ value: kept.get(e.key) }));
  on("store.set", (_, e) => {
    kept.set(e.key, e.value);

    return { value: undefined };
  });

  await $.session.start({ cwd: "/", surface: "terminal", isInteractive: true });

  await $.skill.prompt({
    skill: "uiid:build-project",
    text: "Build it.",
    frontmatter: {},
  });
  expect(opened).toEqual(["project-graph"]);
  expect(
    (
      await $.command.run({
        command: "uiid:toggle-graph",
        args: "",
        origin: { kind: "composer" },
        presentation: { isFullscreen: true, columns: 160 },
      })
    ).text,
  ).toBe("Project graph pane closed.");
  expect(opened).toEqual(["project-graph", "closed project-graph"]);

  for (const surface of ["terminal", "desktop"] as const) {
    const empty = await $.ui.mount({ ...PANE, surface });
    expect(
      await empty.find({
        type: "Text",
        text: /No project yet\. Run \/uiid:graph-linear-project\./,
      }),
    ).not.toBe(undefined);
    await empty.unmount();
  }

  const drawn = await $.tool.run({
    tool: "mcp__uiid__set_graph",
    tool_use_id: "call-1",
    ...INPUT,
  });
  expect(drawn.result).toBe("Drawn in the pane: 7 tickets.");
  expect(toGraph(kept.get("graph"))?.title).toBe("Checkout rewrite");

  const missing = await $.tool.run({
    tool: "mcp__uiid__set_status",
    tool_use_id: "call-2",
    ticket: "ENG-999",
    status: "building",
  });
  expect(missing.result).toMatch(/not in the graph/);

  await $.tool.run({
    tool: "mcp__uiid__set_status",
    tool_use_id: "call-3",
    ticket: "ENG-438",
    status: "needs you",
    note: "two files outside the allowlist",
  });

  const both = await Promise.all([
    $.tool.run({
      tool: "mcp__uiid__set_status",
      tool_use_id: "call-a",
      ticket: "ENG-441",
      status: "building",
    }),
    $.tool.run({
      tool: "mcp__uiid__set_status",
      tool_use_id: "call-b",
      ticket: "ENG-442",
      pr: 702,
    }),
  ]);
  expect(both.map((one) => one.result)).toEqual([
    "ENG-441 updated in the pane.",
    "ENG-442 updated in the pane.",
  ]);
  const blocked = toGraph(kept.get("graph"))?.sections[1]?.tickets;
  expect(blocked?.[2]?.status).toBe("building");
  expect(blocked?.[3]?.pr).toBe(702);

  const empty = await $.tool.run({
    tool: "mcp__uiid__set_status",
    tool_use_id: "call-c",
    ticket: "ENG-441",
    status: "exploded",
  });
  expect(empty.result).toMatch(/Nothing changed/);

  isPlaced = false;
  const unseen = await $.tool.run({
    tool: "mcp__uiid__set_status",
    tool_use_id: "call-d",
    ticket: "ENG-441",
    status: "waiting",
  });
  expect(unseen.result).toMatch(/not showing/);

  for (const surface of ["terminal", "desktop", "vscode", "mobile"] as const) {
    const ui = await $.ui.mount({ ...PANE, surface });

    expect(await ui.find({ type: "Text", text: /Checkout rewrite/ })).not.toBe(
      undefined,
    );
    expect(await ui.find({ type: "Text", text: /ENG-438 needs you/ })).not.toBe(
      undefined,
    );
    expect(
      await ui.find({ type: "Text", text: /two files outside the allowlist/ }),
    ).not.toBe(undefined);
    await ui.unmount();
  }
});
