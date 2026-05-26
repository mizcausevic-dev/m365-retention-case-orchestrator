// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";

import {
  renderCaseRisks,
  renderDispositionPosture,
  renderDocs,
  renderOverview,
  renderRetentionLane,
  renderVerification
} from "./render.js";

describe("render", () => {
  test("overview contains control-plane framing", () => {
    expect(renderOverview()).toContain("Purview retention, label disposition");
  });

  test("detail pages expose their lane names", () => {
    expect(renderRetentionLane()).toContain("Retention Lane");
    expect(renderCaseRisks()).toContain("Case Risks");
    expect(renderDispositionPosture()).toContain("Disposition Posture");
    expect(renderVerification()).toContain("Verification");
    expect(renderDocs()).toContain("Offline Graph export analysis");
  });
});
