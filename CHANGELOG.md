# Changelog

## v0.1.0 — 2026-05-27

- Initial release: operator surface for Microsoft 365 Purview retention policies and eDiscovery cases.
- Added a public dashboard surface with overview, retention-lane, case-risks, disposition-posture, verification, and docs routes.
- Added prerendered GitHub Pages packaging for `retention.kineticgain.com` with `CNAME`, `robots.txt`, `sitemap.xml`, and OG/meta injection at deploy time.
- Added synthetic README proof screenshots and `docs/KINETIC_GAIN_EMBEDDED.md` tie-back packaging.
- Reads a combined JSON envelope `{ retentionLabels, retentionPolicies, cases }` — each section is optional.
- 10 finding codes covering retention-coverage gaps by workload, disabled policies, labels without disposition or orphaned, cases without custodians, closed-with-error cases, custodian hold errors/pending, stale active cases, and missing externalId for matter reconciliation.
- Configurable required-workloads list (default: Exchange, SharePoint, OneDrive, Teams).
- Library API: `analyze(input, opts)` → `OrchestrationReport`; `toMarkdown(report)` + `toSummary(report)` formatters.
- CLI: `m365-retention-case <export.json>` with `--format json|markdown|summary`, `--now <iso>`, `--stale-case-after-days N`, `--required-workloads ...`, `--fail-on-high`, `--out FILE`.
- Cloud Identity / Microsoft 365 lane (Wave 11) — completes the Microsoft trio with `entra-access-review-control-plane` and `intune-device-compliance-ops`.
- Node 20/22 CI (lint, typecheck, coverage, build, demo, smoke, prerender, `npm audit`), AGPL-3.0-or-later, Dependabot.
