# Changelog

## v1.0.0-prod — 2026-05-27

Production-readiness hardening on top of v0.1-shipped.

- Verified all CI gates pass on a clean `npm ci`: lint, typecheck, coverage (98.19% statements / 90.24% branches / 95% functions / 98.19% lines), build, demo, smoke, `npm audit --audit-level=high` (0 vulnerabilities).
- Confirmed AGPL-3.0-or-later licensing, `SECURITY.md`, `CODE_OF_CONDUCT.md`, weekly `dependabot.yml` for `npm` + `github-actions`.
- Confirmed CI workflow runs the Node 20 + 22 matrix and the production-status surfaces (CI / License / Deploy badges + `## Production status` block) are intact in the README.
- Live operator surface running at https://retention.kineticgain.com/ via the GitHub Pages deploy rail.
- No changes to source, README content, docs, or screenshots — those remain the v0.1-shipped surface from the build lane.

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
