---
name: plan-to-issues
description: Split this repo's plan.md into GitHub issues with gh, one per unit of work, after a human has reviewed the split. Use when a plan is ready and has no issues yet.
---

# plan-to-issues

Turns `plan.md` into GitHub issues that workers can pick up cold. Easiest with `gh`, authenticated,
in a shell this agent can run.

## Steps

1. Read `plan.md`, `AGENTS.md` and `docs/adr/`.
2. Draft the split as a table: title · plan section · scope · done when · blocked by.
   One issue per unit of work.
3. **Stop and show the table to the human.** Publish nothing until they approve it.
4. Every issue carries the shape in "What every issue carries" below. Ask the human only for
   what that section doesn't cover, and write their answer into it.
5. Create each issue in dependency order, so blocked-by can cite real numbers:

   ```sh
   gh issue create --title "<title>" --body-file <tmp.md>
   ```

6. Record every issue URL from gh's output (not from memory) and reply with the list.

Closing one, with the closing comment from AGENTS.md:

```sh
gh issue close <n> -c "<closing comment>"
```

A commit with `closes #n` closes the issue when it reaches the default branch, and then
`gh issue close -c` posts nothing. After such a push, post the closing comment with
`gh issue comment <n> -b "<closing comment>"`.

## What every issue carries

Set by the human on 2026-11-02 (plan morning-digest, issues #1–#8). Body, in this order:

```md
Source: plan.md § <n>

## Scope
<what is in this issue, from the plan>

## Done when
<the plan's done condition, word for word>

## Blocked by
<#n, or —; say when work can start earlier than its done check>
```

- The first line is always `Source: plan.md § <n>`, with the section number as the plan writes
  it (`1`, `2a`).
- Label: `plan:<plan name from plan.md's frontmatter>`, for example `plan:morning-digest`.
- A step that waits on someone else (a review, a reply) is done when they have acted, not when
  you have sent it. Write its done condition as their action, for example "the reviewer has
  looked at the preview", and keep it open until then. The clean-up after it is blocked by it.

## No `gh`

Steps 1–4 hold either way. GitHub reachable another way (a connector, the REST API, the web UI):
the same issues, made that way. GitHub issues out of reach altogether: write them as files in
`docs/issues/`, format in ADR 0004, then commit and push.

## Don'ts

- Don't paste the whole plan into one issue, and don't keep issues only in chat.
- Don't invent sections the plan doesn't have. If the plan is unclear, ask.
