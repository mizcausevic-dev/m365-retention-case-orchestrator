# Security Policy

`m365-retention-case-orchestrator` is a pure-transform library and CLI: it reads JSON exports from Microsoft Graph compliance APIs (or synthetic data) and emits a structured findings report. No network listener, no remote fetch, no Graph token storage, no execution of user-supplied code.

The input contains custodian email addresses, case names, and matter IDs — all sensitive in your tenant. Be deliberate about where you store the input and the output.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/m365-retention-case-orchestrator/security/advisories/new)

Do not file public issues for security reports.
