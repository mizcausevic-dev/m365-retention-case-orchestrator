# Security Policy

`m365-retention-case-orchestrator` ships both an offline analyzer and a synthetic public dashboard surface. It reads JSON exports from Microsoft Graph compliance APIs (or synthetic data) and emits structured findings, route JSON, and prerendered HTML. No live Graph token storage, no remote fetch of tenant data, and no execution of user-supplied code is included.

The input contains custodian email addresses, case names, and matter IDs — all sensitive in your tenant. Be deliberate about where you store the input and the output.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/m365-retention-case-orchestrator/security/advisories/new)

Do not file public issues for security reports.
