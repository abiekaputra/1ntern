# Testing strategy

## Automated layers

| Layer         | Evidence                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| Domain        | Read, write, denied policy decisions; plan order; lifecycle transitions  |
| API           | Read-only execution, approval rejection, approve/write/rollback, cancel  |
| Browser       | User-visible approval flow, execution result, rollback, audit, mobile UI |
| Static        | Prettier, oxlint, strict TypeScript, file and directory limits           |
| Supply safety | Committed-secret pattern scan and frozen lockfile in CI                  |

## Important failure cases

- A write plan submitted directly to execute returns a conflict and leaves the workspace untouched.
- An unsupported intent cannot create a run.
- An approved plan can still be cancelled before any adapter executes.
- A snapshot is required before rollback becomes available.
- Illegal state transitions throw before persistence changes.

## Commands

```bash
pnpm test
pnpm test:e2e
pnpm quality
```

Browser tests reset an isolated SQLite database and fixture root, build the production packages,
start loopback API and preview processes, and exercise Chromium through the interface.
