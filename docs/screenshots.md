# Screenshot evidence

## 01 — Approval boundary

```text
Screenshot:
01-approval-boundary.jpg

Page / Screen:
Mission control — write plan awaiting approval

Purpose:
Show that the operator can inspect the whole plan before a workspace mutation.

What the user can do:
Review four ordered tools, see which step needs approval, approve the write, or cancel the run.

Technical context:
AutomationPlanner orders the allowlisted adapters and ExecutionPolicy labels the Markdown write as approval_required. RunStateMachine prevents execution from awaiting_approval.

Result:
The user sees the read/write boundary before any file changes.
```

## 02 — Execution result

```text
Screenshot:
02-execution-result.jpg

Page / Screen:
Mission control — succeeded write plan

Purpose:
Confirm that the approved tools completed and a recovery action exists.

What the user can do:
Review every completed step, read the summary, and roll back the workspace.

Technical context:
AutomationRunner snapshots Markdown targets, executes each adapter under a timeout, persists per-tool audit events, and exposes rollback only after a valid terminal execution state.

Result:
Four guarded steps succeed and the changed files remain reversible.
```

## 03 — Audit trail

```text
Screenshot:
03-audit-trail.jpg

Page / Screen:
Audit trail

Purpose:
Make planning, approval, tool results, completion, and rollback inspectable.

What the user can do:
Read the latest durable event sequence and the detail emitted by each adapter.

Technical context:
SQLite stores ordered audit rows separately from the run projection; the dashboard API returns the latest local evidence.

Result:
The user can explain what ran and how the workspace returned to its original state.
```

## 04 — Policy model

```text
Screenshot:
04-policy-model.jpg

Page / Screen:
Execution policy

Purpose:
State the finite product boundary without hiding unsupported capabilities.

What the user can do:
Compare allowed, approval-required, and denied behavior.

Technical context:
Five concrete adapters implement one WorkspaceTool interface. Arbitrary commands and network tools do not exist in the runtime map.

Result:
The safety claim is tied to an enforceable architecture and explicit limits.
```

## 05 — Run history

```text
Screenshot:
05-run-history.jpg

Page / Screen:
Run history

Purpose:
Keep previous plans and terminal outcomes visible after navigation.

What the user can do:
Review intent, timestamp, completed tool count, and final status.

Technical context:
RunRepository persists lifecycle metadata and validated plan JSON in local SQLite.

Result:
The documentation hygiene run remains visible as rolled back.
```

## 06 — Responsive mission control

```text
Screenshot:
06-responsive-control.jpg

Page / Screen:
Mission control — mobile viewport

Purpose:
Verify that intent selection and product boundaries remain readable on a narrow screen.

What the user can do:
Read the product promise, inspect workspace metrics, choose a mission, and navigate from the fixed bottom bar.

Technical context:
Responsive CSS converts the desktop rail to four touch targets, stacks metrics and work panels, and preserves the complete planning entry point.

Result:
The primary flow remains usable at 390 by 844 pixels.
```
