// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";

import {
  caseRisks,
  dispositionPosture,
  payload,
  retentionLane,
  summary,
  verification
} from "./m365RetentionCaseOrchestratorService.js";

describe("m365RetentionCaseOrchestratorService", () => {
  test("summary reflects the sample Purview posture", () => {
    expect(summary()).toMatchObject({
      retentionPolicies: 3,
      retentionLabels: 2,
      cases: 3,
      uncoveredWorkloads: 1
    });
    expect(summary().highFindings).toBeGreaterThanOrEqual(3);
  });

  test("retention lane stays mapped to operators", () => {
    const lanes = retentionLane();
    expect(lanes).toHaveLength(5);
    expect(lanes.some((lane) => lane.lane === "Teams chat lane" && lane.owner === "Purview Operations")).toBe(true);
  });

  test("case risks sort high severity first", () => {
    const risks = caseRisks();
    expect(risks[0]?.severity).toBe("high");
    expect(risks.some((risk) => risk.code === "case-without-custodians")).toBe(true);
  });

  test("disposition posture and verification stay populated", () => {
    expect(dispositionPosture()).toHaveLength(5);
    expect(verification()).toHaveLength(5);
    expect(payload().sample).toBeDefined();
  });
});
