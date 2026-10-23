# Security policy

## Supported release

The local portfolio release `1.0.x` receives security fixes.

## Product boundary

1ntern accepts only the intent identifiers and tool adapters shipped in this repository. It does not
accept shell text, executable code, URLs, credentials, or caller-selected filesystem roots through
the browser API.

The configured workspace root must contain disposable local material. The product resolves every
tool path against that root, rejects path escape, ignores symbolic links while walking, and binds
the API to loopback. Write execution requires a valid approval state and captures a rollback
snapshot before the first mutating adapter runs.

## Reporting

Open a private GitHub security advisory with a minimal reproduction. Do not include real secrets,
private source code, or personal data. Public issues are appropriate for ordinary non-sensitive
bugs.

## Remaining limits

The local database is not encrypted and its audit records are not cryptographically immutable. The
workspace guard is a product boundary for supported maintenance tasks, not an operating-system
sandbox for hostile code. See [docs/security.md](docs/security.md) for the threat model.
