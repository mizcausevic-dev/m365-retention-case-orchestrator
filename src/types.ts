// Operator surface for Microsoft 365 Purview retention + eDiscovery cases.
//
// Inputs reflect Microsoft Graph compliance APIs:
//   - retention labels / policies under /security/labels/retentionLabels
//   - eDiscovery (Premium) cases under /security/cases/ediscoveryCases
// Reference: https://learn.microsoft.com/en-us/graph/api/resources/security-ediscoverycase

export type Workload = "Exchange" | "SharePoint" | "OneDrive" | "Teams" | "Yammer" | "Devices" | string;

export type RetentionAction = "retain" | "deleteAndRetain" | "doNotRetain" | "retainAsRecord" | "retainAsRegulatoryRecord";
export type DispositionTrigger = "dateLabeled" | "dateCreated" | "dateModified" | "dateOfEvent" | "none";

export interface RetentionLabel {
  id: string;
  displayName: string;
  description?: string;
  defaultRecordBehavior?: "startLocked" | "startUnlocked";
  retentionTrigger?: DispositionTrigger;
  retentionDuration?: { totalDays?: number };
  behaviorDuringRetentionPeriod?: RetentionAction;
  actionAfterRetentionPeriod?: "none" | "delete" | "startDispositionReview" | "relabel";
  isInUse?: boolean;
}

export interface RetentionPolicy {
  id: string;
  displayName: string;
  workloads: Workload[];
  /** Total days of retention for the simple form; durations vary per workload in real Graph data. */
  retentionDays?: number;
  action?: RetentionAction;
  isEnabled?: boolean;
}

export type CaseStatus = "unknown" | "active" | "pendingDelete" | "closing" | "closed" | "closedWithError";

export interface EDiscoveryCustodian {
  id: string;
  email: string;
  status?: "active" | "released" | "discoverable" | "indexing" | "advanced" | "applyingHold" | "removingHold" | "indexingError" | "holdError";
  holdStatus?: "applied" | "notApplied" | "pending" | "error";
}

export interface EDiscoveryCase {
  id: string;
  displayName: string;
  status: CaseStatus;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  closedDateTime?: string;
  externalId?: string;
  custodians?: EDiscoveryCustodian[];
}

export interface ComplianceExport {
  retentionLabels?: RetentionLabel[];
  retentionPolicies?: RetentionPolicy[];
  cases?: EDiscoveryCase[];
}

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "no-retention-coverage-for-workload"
  | "label-without-disposition"
  | "label-orphaned"
  | "policy-disabled"
  | "case-without-custodians"
  | "stale-case"
  | "case-closed-with-error"
  | "custodian-hold-error"
  | "custodian-hold-pending"
  | "external-id-missing";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  /** Subject identifier — label id, policy id, or case id depending on the rule. */
  subject: string;
  subjectName?: string;
  custodian?: string;
}

export interface OrchestrationReport {
  generatedAt: string;
  retentionLabels: number;
  retentionPolicies: number;
  cases: number;
  workloadsWithRetention: Workload[];
  workloadsWithoutRetention: Workload[];
  casesByStatus: Record<CaseStatus, number>;
  findings: Finding[];
  ok: boolean;
}

export interface OrchestrationOptions {
  now?: string;
  /** Workloads we expect to have at least one enabled retention policy. */
  requiredWorkloads?: Workload[];
  /** A case is `stale-case` when active for more days than this without modification. Default 90. */
  staleCaseAfterDays?: number;
}

export const DEFAULT_REQUIRED_WORKLOADS: Workload[] = ["Exchange", "SharePoint", "OneDrive", "Teams"];
