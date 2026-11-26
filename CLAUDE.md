@AGENTS.md

## Claude Code specifics
- Use `AskUserQuestion` for developer decisions (golden rule 1). Put the recommended option first.
- Path-scoped rules live in `.claude/rules/` and load automatically for matching files. Don't read them up front.
- Skills (`.claude/skills/`):
  - `next-task`: pick up, implement and close the next plan task
  - `add-cv-section`: add a new CV section end to end (schema, store, form, PDF, tests)
  - `add-pdf-template`: add a new PDF template
  - `write-tests`: choose the test layer and write tests in project style
- For wide codebase searches, use the Explore agent instead of reading many files into context.
