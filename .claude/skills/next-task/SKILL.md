---
name: next-task
description: Pick up the next task from the CView plan (docs/plan), resolve open questions with the developer, implement it with tests, verify, and update its status. Use when the user says "next task", "continue the plan", or names a task ID like P1-T05.
---

# Next task

1. **Find the task.** Read `docs/plan/ROADMAP.md`, then the status table at the top of the current
   phase file. If the user named a task ID, use it. Otherwise take the first `todo` task whose dependencies are `done`.
   Read only that task's section.
2. **Check blockers.** If it depends on an open question (`Q-n` in `docs/DECISIONS.md`) or lists
   **Ask first** items, ask the developer now (AskUserQuestion, recommended option first). Record each
   answer as a new `D-n` entry and remove the resolved `Q-n`. Then rewrite the task's scope if the answer changed it.
3. **Plan briefly.** State in 3–6 bullets which files you'll create or change and which tests you'll write.
   If the plan involves any decision not covered by the docs, ask before coding.
4. **Implement** following `AGENTS.md` and the path rules that load for the files you touch.
5. **Test** at the right layer (`write-tests` skill). Run the single file, then `bun run typecheck`,
   `bun run lint`, `bun run test`, and the affected E2E specs.
6. **Close.** Set the task's status to `done` in the phase table (and in ROADMAP if the phase finished).
   Report what changed, the test results (honestly, including failures) and any follow-ups.
   **Stop.** Don't start the next task without the developer's go-ahead.
