import {
  DEFAULT_REQUIRED_WORKLOADS,
  type CaseStatus,
  type ComplianceExport,
  type Finding,
  type OrchestrationOptions,
  type OrchestrationReport,
  type Workload
} from "./types.js";

const DAY_MS = 86_400_000;

const CASE_STATUSES: CaseStatus[] = [
  "unknown",
  "active",
  "pendingDelete",
  "closing",
  "closed",
  "closedWithError"
];

function emptyCaseCounts(): Record<CaseStatus, number> {
  const out = {} as Record<CaseStatus, number>;
  for (const s of CASE_STATUSES) out[s] = 0;
  return out;
}

export function analyze(input: ComplianceExport, opts: OrchestrationOptions = {}): OrchestrationReport {
  const now = opts.now ? new Date(opts.now) : new Date();
  const staleAfter = (opts.staleCaseAfterDays ?? 90) * DAY_MS;
  const requiredWorkloads = opts.requiredWorkloads ?? DEFAULT_REQUIRED_WORKLOADS;

  const labels = input.retentionLabels ?? [];
  const policies = input.retentionPolicies ?? [];
  const cases = input.cases ?? [];
  const findings: Finding[] = [];

  // ─── retention coverage by workload ───────────────────────────────────────
  const covered = new Set<Workload>();
  for (const p of policies) {
    if (p.isEnabled === false) {
      findings.push({
        code: "policy-disabled",
        severity: "medium",
        message: `Retention policy is disabled — its workloads are uncovered.`,
        subject: p.id,
        subjectName: p.displayName
      });
      continue;
    }
    for (const w of p.workloads ?? []) covered.add(w);
  }
  const uncovered: Workload[] = [];
  for (const w of requiredWorkloads) {
    if (!covered.has(w)) {
      uncovered.push(w);
      findings.push({
        code: "no-retention-coverage-for-workload",
        severity: "high",
        message: `No enabled retention policy covers ${w}.`,
        subject: w
      });
    }
  }

  // ─── label quality ────────────────────────────────────────────────────────
  for (const l of labels) {
    if (!l.retentionDuration?.totalDays || !l.behaviorDuringRetentionPeriod) {
      findings.push({
        code: "label-without-disposition",
        severity: "medium",
        message: `Label "${l.displayName}" has no retention duration or behavior.`,
        subject: l.id,
        subjectName: l.displayName
      });
    }
    if (l.isInUse === false) {
      findings.push({
        code: "label-orphaned",
        severity: "low",
        message: `Label "${l.displayName}" exists but is not applied to any policy or location.`,
        subject: l.id,
        subjectName: l.displayName
      });
    }
  }

  // ─── case lifecycle ───────────────────────────────────────────────────────
  const casesByStatus = emptyCaseCounts();
  for (const c of cases) {
    if (c.status in casesByStatus) casesByStatus[c.status] += 1;

    if (!c.externalId) {
      findings.push({
        code: "external-id-missing",
        severity: "low",
        message: `Case "${c.displayName}" has no externalId — matter reconciliation will be manual.`,
        subject: c.id,
        subjectName: c.displayName
      });
    }

    if (c.status === "closedWithError") {
      findings.push({
        code: "case-closed-with-error",
        severity: "high",
        message: `Case "${c.displayName}" closed with error — review before purge.`,
        subject: c.id,
        subjectName: c.displayName
      });
    }

    if ((c.custodians ?? []).length === 0 && (c.status === "active" || c.status === "closing")) {
      findings.push({
        code: "case-without-custodians",
        severity: "high",
        message: `Active case "${c.displayName}" has no custodians attached.`,
        subject: c.id,
        subjectName: c.displayName
      });
    }

    if (c.status === "active") {
      const lastModified = new Date(c.lastModifiedDateTime ?? c.createdDateTime);
      if (now.getTime() - lastModified.getTime() > staleAfter) {
        findings.push({
          code: "stale-case",
          severity: "medium",
          message: `Case "${c.displayName}" has been active with no activity since ${lastModified.toISOString().slice(0, 10)}.`,
          subject: c.id,
          subjectName: c.displayName
        });
      }
    }

    for (const cu of c.custodians ?? []) {
      if (cu.holdStatus === "error") {
        findings.push({
          code: "custodian-hold-error",
          severity: "high",
          message: `Hold failed for custodian ${cu.email} on case "${c.displayName}".`,
          subject: c.id,
          subjectName: c.displayName,
          custodian: cu.email
        });
      } else if (cu.holdStatus === "pending") {
        findings.push({
          code: "custodian-hold-pending",
          severity: "medium",
          message: `Hold still pending for custodian ${cu.email} on case "${c.displayName}".`,
          subject: c.id,
          subjectName: c.displayName,
          custodian: cu.email
        });
      }
    }
  }

  const ok = !findings.some((f) => f.severity === "high");

  return {
    generatedAt: now.toISOString(),
    retentionLabels: labels.length,
    retentionPolicies: policies.length,
    cases: cases.length,
    workloadsWithRetention: [...covered].sort(),
    workloadsWithoutRetention: uncovered.sort(),
    casesByStatus,
    findings,
    ok
  };
}
