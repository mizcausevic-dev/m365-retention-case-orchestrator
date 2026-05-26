# m365-retention-case-orchestrator

Operator surface for **Microsoft 365 Purview** retention policies and eDiscovery cases. Reads Microsoft Graph compliance JSON exports and surfaces the things that get a tenant into trouble at audit time.

> Status: v0.1.0 — Node 20/22 supported, library + CLI. Cloud Identity lane (Wave 11).

## What it flags

| Code | Severity | Rule |
|---|---|---|
| `no-retention-coverage-for-workload` | 🔴 | A required workload (Exchange / SharePoint / OneDrive / Teams) has no enabled retention policy. |
| `case-without-custodians` | 🔴 | Active eDiscovery case has no custodians attached. |
| `case-closed-with-error` | 🔴 | Case closed in error — review before purge. |
| `custodian-hold-error` | 🔴 | Legal hold failed for a custodian on an open case. |
| `policy-disabled` | 🟠 | Retention policy exists but is disabled. |
| `label-without-disposition` | 🟠 | Retention label has no duration or behavior. |
| `custodian-hold-pending` | 🟠 | Hold still pending on an open case. |
| `stale-case` | 🟠 | Active case with no activity past the configured window. |
| `label-orphaned` | 🟡 | Label exists but is not in use. |
| `external-id-missing` | 🟡 | Case has no externalId — matter reconciliation is manual. |

## CLI

```
npx m365-retention-case <export.json>
    [--format json|markdown|summary]
    [--now <iso>]
    [--stale-case-after-days 90]
    [--required-workloads Exchange,SharePoint,OneDrive,Teams]
    [--fail-on-high] [--out FILE]
```

Input shape:
```json
{
  "retentionLabels":   [ ... ],
  "retentionPolicies": [ ... ],
  "cases":             [ ... ]
}
```

Each section is optional — pass only what you've captured.

## Capturing the input

Use the Graph CLI / REST to dump each surface:

```bash
az rest --method GET --uri "https://graph.microsoft.com/beta/compliance/retentionLabels" > retentionLabels.json
az rest --method GET --uri "https://graph.microsoft.com/beta/security/cases/ediscoveryCases?\$expand=custodians" > cases.json
```

…then merge into a single `{ retentionLabels, retentionPolicies, cases }` payload.

## Library

```ts
import { analyze, toMarkdown } from "m365-retention-case-orchestrator";

const report = analyze(payload, {
  requiredWorkloads: ["Exchange", "SharePoint", "OneDrive", "Teams"],
  staleCaseAfterDays: 90
});

if (!report.ok) console.error(`${report.findings.filter(f => f.severity === "high").length} high findings`);
console.log(toMarkdown(report));
```

## Composes with

- [**`entra-access-review-control-plane`**](https://github.com/mizcausevic-dev/entra-access-review-control-plane) — Microsoft Entra access reviews.
- [**`intune-device-compliance-ops`**](https://github.com/mizcausevic-dev/intune-device-compliance-ops) — Intune device compliance.

Together they form the Wave 11 Cloud Identity / Microsoft 365 trio.

## Develop

```
npm install
npm run lint && npm run typecheck && npm run coverage && npm run build
npm run demo
```

## License

[AGPL-3.0-or-later](LICENSE)
