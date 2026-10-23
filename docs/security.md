# Security model

## Protected boundary

The release protects a disposable fixture workspace from accidental broad automation. It focuses on
four risks: hidden mutation, filesystem escape, unbounded tools, and missing execution evidence.

## Controls

| Risk                    | Control                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| Hidden writes           | Tool metadata, plan preview, approval-required policy, snapshots |
| Parent path access      | Canonical root prefix check before every read and write          |
| Symbolic-link traversal | Symlinks excluded from walks and rejected as direct parents      |
| Arbitrary execution     | Finite adapter map; no shell, code, URL, or package input        |
| Stalled adapters        | Three-second timeout around every tool                           |
| Invalid lifecycle       | Explicit transition table and conflict responses                 |
| Missing evidence        | SQLite run records and per-tool audit events                     |
| Browser exposure        | API binds to `127.0.0.1`; CORS accepts loopback origins only     |

## Trust assumptions

The operator controls the local machine, dependencies, and fixture content. The tool implementations
are trusted application code. The operating system and Node.js runtime are outside the threat model.
SQLite and the runtime folder inherit local filesystem permissions.

## Non-goals

1ntern does not execute untrusted repositories, contain malicious processes, scan real secrets,
isolate operating-system resources, or provide multi-user authorization. Those capabilities would
require a separate worker sandbox, resource quotas, repository ingestion policy, secret redaction,
and stronger audit integrity.
