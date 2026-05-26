// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ComplianceExport } from "../types.js";

export interface RetentionLanePacket {
  id: string;
  lane: string;
  owner: string;
  focus: string;
  status: "green" | "yellow" | "red";
  nextAction: string;
  note: string;
}

export interface DispositionPacket {
  packetId: string;
  lane: string;
  owner: string;
  completenessScore: number;
  status: "red" | "yellow" | "green";
  blocker: string;
  launchWindowHours: number;
  decisionNote: string;
}

export const sampleCompliancePayload: ComplianceExport = {
  retentionLabels: [
    {
      id: "label-finance",
      displayName: "Finance Records",
      retentionTrigger: "dateCreated",
      retentionDuration: { totalDays: 2555 },
      behaviorDuringRetentionPeriod: "retainAsRegulatoryRecord",
      actionAfterRetentionPeriod: "startDispositionReview",
      isInUse: true
    },
    {
      id: "label-marketing-incomplete",
      displayName: "Marketing Drafts",
      retentionTrigger: "dateLabeled",
      isInUse: false
    }
  ],
  retentionPolicies: [
    {
      id: "pol-exchange",
      displayName: "Exchange long-term retention",
      workloads: ["Exchange"],
      retentionDays: 2555,
      action: "retain",
      isEnabled: true
    },
    {
      id: "pol-spo-onedrive",
      displayName: "SharePoint + OneDrive retention",
      workloads: ["SharePoint", "OneDrive"],
      retentionDays: 2555,
      action: "retain",
      isEnabled: true
    },
    {
      id: "pol-teams-disabled",
      displayName: "Teams chat retention",
      workloads: ["Teams"],
      retentionDays: 365,
      action: "retain",
      isEnabled: false
    }
  ],
  cases: [
    {
      id: "case-2025-001",
      displayName: "Q4 audit collection",
      status: "active",
      createdDateTime: "2025-10-12T00:00:00Z",
      lastModifiedDateTime: "2025-12-01T00:00:00Z",
      externalId: "MATTER-1234",
      custodians: [
        { id: "cust-1", email: "alice@example.com", holdStatus: "applied" },
        { id: "cust-2", email: "bob@example.com", holdStatus: "pending" }
      ]
    },
    {
      id: "case-2026-002",
      displayName: "Vendor dispute hold",
      status: "active",
      createdDateTime: "2026-05-10T00:00:00Z",
      lastModifiedDateTime: "2026-05-22T00:00:00Z",
      custodians: []
    },
    {
      id: "case-2025-003",
      displayName: "M&A diligence",
      status: "closedWithError",
      createdDateTime: "2025-04-01T00:00:00Z",
      closedDateTime: "2025-09-15T00:00:00Z",
      externalId: "MATTER-9090",
      custodians: [
        { id: "cust-3", email: "carol@example.com", holdStatus: "error" }
      ]
    }
  ]
};

export const retentionLanePackets: RetentionLanePacket[] = [
  {
    id: "retention-finance",
    lane: "Finance retention lane",
    owner: "Records Governance",
    focus: "Exchange retention + regulated record labels",
    status: "green",
    nextAction: "Archive current coverage proof and keep the regulated-record label posture visible for audit.",
    note: "This lane is the clean baseline: enabled retention and active label discipline."
  },
  {
    id: "retention-sites",
    lane: "SharePoint + OneDrive content lane",
    owner: "Collaboration Platform",
    focus: "Document retention coverage",
    status: "green",
    nextAction: "Maintain current coverage and track future label adoption against real content classes.",
    note: "Workload coverage is healthy, but disposition evidence still needs regular review."
  },
  {
    id: "retention-teams",
    lane: "Teams chat lane",
    owner: "Purview Operations",
    focus: "Teams chat retention policy",
    status: "red",
    nextAction: "Re-enable Teams retention and attach change-proof before assuming workload coverage is restored.",
    note: "Disabled policy means the workload is effectively uncovered."
  },
  {
    id: "label-marketing",
    lane: "Marketing label quality",
    owner: "Content Compliance",
    focus: "Draft label disposition settings",
    status: "yellow",
    nextAction: "Define duration + retention behavior and either assign the label or retire it cleanly.",
    note: "The label exists, but disposition is incomplete and the label is currently orphaned."
  },
  {
    id: "case-vendor",
    lane: "Vendor dispute case lane",
    owner: "eDiscovery Operations",
    focus: "Active matter without custodians",
    status: "red",
    nextAction: "Attach custodians and external matter ID before the case becomes an audit-time blind spot.",
    note: "Active case posture is risky because hold ownership is still undefined."
  }
];

export const dispositionPackets: DispositionPacket[] = [
  {
    packetId: "RT-12",
    lane: "Teams chat retention",
    owner: "Purview Operations",
    completenessScore: 54,
    status: "red",
    blocker: "Teams retention policy exists but is disabled, leaving a required workload uncovered",
    launchWindowHours: 18,
    decisionNote: "Do not present Teams governance as healthy until the policy is re-enabled and validated."
  },
  {
    packetId: "RT-18",
    lane: "Vendor dispute matter",
    owner: "eDiscovery Operations",
    completenessScore: 58,
    status: "red",
    blocker: "Active case still has no custodians and no external matter reconciliation ID",
    launchWindowHours: 14,
    decisionNote: "Matter posture is not launch-safe until custodians and case ownership are attached."
  },
  {
    packetId: "RT-27",
    lane: "Marketing label disposition",
    owner: "Content Compliance",
    completenessScore: 69,
    status: "yellow",
    blocker: "Label has no retention duration or behavior and is not currently in use",
    launchWindowHours: 28,
    decisionNote: "Either complete the label settings or retire it before teams assume it is active policy."
  },
  {
    packetId: "RT-36",
    lane: "Q4 audit collection",
    owner: "Legal Hold Operations",
    completenessScore: 76,
    status: "yellow",
    blocker: "One custodian hold is still pending and the case has become stale",
    launchWindowHours: 22,
    decisionNote: "Keep the matter active, but clear the pending hold and stale-activity risk before disposition review."
  },
  {
    packetId: "RT-41",
    lane: "Finance records baseline",
    owner: "Records Governance",
    completenessScore: 96,
    status: "green",
    blocker: "No active blocker",
    launchWindowHours: 72,
    decisionNote: "This lane is safe to use as the healthy reference packet for Purview retention proof."
  }
];
