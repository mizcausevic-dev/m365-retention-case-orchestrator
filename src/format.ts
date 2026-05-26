import type { FindingSeverity, OrchestrationReport } from "./types.js";

const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  high: "🔴 high",
  medium: "🟠 medium",
  low: "🟡 low",
  info: "ℹ️  info"
};

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3
};

export function toMarkdown(report: OrchestrationReport): string {
  const lines: string[] = [];
  lines.push(report.ok ? `# Microsoft 365 retention & case posture ✅` : `# Microsoft 365 retention & case posture ❌`);
  lines.push(``);
  lines.push(`Generated: \`${report.generatedAt}\``);
  lines.push(``);
  lines.push(`## Coverage`);
  lines.push(``);
  lines.push(`- Retention labels: **${report.retentionLabels}**`);
  lines.push(`- Retention policies: **${report.retentionPolicies}**`);
  lines.push(`- eDiscovery cases: **${report.cases}**`);
  lines.push(``);
  lines.push(
    `- Workloads with retention: ${report.workloadsWithRetention.length ? report.workloadsWithRetention.join(", ") : "_none_"}`
  );
  lines.push(
    `- Workloads **without** retention: ${report.workloadsWithoutRetention.length ? report.workloadsWithoutRetention.join(", ") : "_none_"}`
  );
  lines.push(``);
  lines.push(`## Cases by status`);
  lines.push(``);
  lines.push(`| active | closing | closed | closedWithError | pendingDelete |`);
  lines.push(`|---:|---:|---:|---:|---:|`);
  lines.push(
    `| ${report.casesByStatus.active} | ${report.casesByStatus.closing} | ${report.casesByStatus.closed} | ${report.casesByStatus.closedWithError} | ${report.casesByStatus.pendingDelete} |`
  );

  const ranked = [...report.findings].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
  );
  if (ranked.length > 0) {
    lines.push(``);
    lines.push(`## Findings (${ranked.length})`);
    lines.push(``);
    lines.push(`| severity | code | subject | message |`);
    lines.push(`|---|---|---|---|`);
    for (const f of ranked) {
      lines.push(
        `| ${SEVERITY_LABEL[f.severity]} | \`${f.code}\` | ${f.subjectName ?? f.subject} | ${f.message} |`
      );
    }
  } else {
    lines.push(``);
    lines.push(`No findings.`);
  }
  return lines.join("\n");
}

export function toSummary(report: OrchestrationReport): string {
  const counts: Record<FindingSeverity, number> = { high: 0, medium: 0, low: 0, info: 0 };
  for (const f of report.findings) counts[f.severity] += 1;
  return `${report.retentionPolicies} policies · ${report.retentionLabels} labels · ${report.cases} cases · ${counts.high} high · ${counts.medium} medium (${report.ok ? "ok" : "fail"})`;
}
