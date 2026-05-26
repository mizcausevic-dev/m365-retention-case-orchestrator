// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze } from "../analyze.js";
import { dispositionPackets, retentionLanePackets, sampleCompliancePayload } from "../data/sampleCompliance.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-29T00:00:00Z";
const report = analyze(sampleCompliancePayload, {
  now: NOW,
  staleCaseAfterDays: 90
});

function severityRank(finding: Finding): number {
  return finding.severity === "high"
    ? 0
    : finding.severity === "medium"
      ? 1
      : finding.severity === "low"
        ? 2
        : 3;
}

export function summary() {
  return {
    retentionPolicies: report.retentionPolicies,
    retentionLabels: report.retentionLabels,
    cases: report.cases,
    uncoveredWorkloads: report.workloadsWithoutRetention.length,
    highFindings: report.findings.filter((finding) => finding.severity === "high").length,
    pendingOrErrorHolds: report.findings.filter(
      (finding) => finding.code === "custodian-hold-pending" || finding.code === "custodian-hold-error"
    ).length,
    recommendation:
      "Re-enable uncovered workloads, attach custodians, and complete label disposition rules before calling Purview posture audit-ready."
  };
}

export function retentionLane() {
  return retentionLanePackets.map((lane) => ({
    ...lane,
    relatedFindings: report.findings.filter((finding) => {
      if (lane.id === "retention-teams") {
        return finding.code === "no-retention-coverage-for-workload" && finding.subject === "Teams";
      }
      if (lane.id === "label-marketing") {
        return finding.subject === "label-marketing-incomplete";
      }
      if (lane.id === "case-vendor") {
        return finding.subject === "case-2026-002";
      }
      if (lane.id === "case-audit") {
        return finding.subject === "case-2025-001";
      }
      return true;
    }).length
  }));
}

export function caseRisks() {
  return [...report.findings]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => ({
      ...finding,
      owner:
        finding.code === "no-retention-coverage-for-workload" || finding.code === "policy-disabled"
          ? "Purview Operations"
          : finding.code === "label-without-disposition" || finding.code === "label-orphaned"
            ? "Content Compliance"
            : "eDiscovery Operations"
    }));
}

export function dispositionPosture() {
  return dispositionPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline analyzer and CLI, not static copy alone.",
    "Retention labels, policies, and cases are synthetic sample data only; no live tenant export is published.",
    "The control plane keeps workload coverage, disposition gaps, and matter posture visible for Purview, records, and legal-ops stakeholders.",
    "This surface demonstrates Microsoft 365 / Purview retention and eDiscovery operations, not a generic compliance keyword project.",
    "It composes cleanly with Entra and Intune proof for a recruiter-facing Microsoft admin lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    retentionLane: retentionLane(),
    caseRisks: caseRisks(),
    dispositionPosture: dispositionPosture(),
    verification: verification(),
    sample: sampleCompliancePayload
  };
}
