import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { ComplianceExport } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): ComplianceExport =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as ComplianceExport;

const NOW = "2026-05-27T08:00:00Z";

describe("analyze", () => {
  it("counts labels / policies / cases", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    expect(r.retentionLabels).toBe(2);
    expect(r.retentionPolicies).toBe(3);
    expect(r.cases).toBe(3);
  });

  it("flags missing-retention-coverage-for-workload as high when workload uncovered", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    // Teams policy is disabled → Teams is uncovered.
    const teamsGap = r.findings.find(
      (f) => f.code === "no-retention-coverage-for-workload" && f.subject === "Teams"
    );
    expect(teamsGap).toBeDefined();
    expect(teamsGap?.severity).toBe("high");
  });

  it("flags disabled retention policy", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    const d = r.findings.find((f) => f.code === "policy-disabled");
    expect(d).toBeDefined();
    expect(d?.subjectName).toContain("Teams");
  });

  it("flags label-without-disposition", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    const m = r.findings.find((f) => f.code === "label-without-disposition");
    expect(m?.subjectName).toBe("Marketing Drafts");
  });

  it("flags label-orphaned when isInUse=false", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    const o = r.findings.find((f) => f.code === "label-orphaned");
    expect(o?.subjectName).toBe("Marketing Drafts");
    expect(o?.severity).toBe("low");
  });

  it("flags case-without-custodians on active case", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    const nc = r.findings.find((f) => f.code === "case-without-custodians");
    expect(nc?.subjectName).toBe("Vendor dispute hold");
    expect(nc?.severity).toBe("high");
  });

  it("flags case-closed-with-error as high", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    const cwe = r.findings.find((f) => f.code === "case-closed-with-error");
    expect(cwe?.severity).toBe("high");
  });

  it("flags custodian-hold-error as high and -pending as medium", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    const err = r.findings.find((f) => f.code === "custodian-hold-error");
    const pen = r.findings.find((f) => f.code === "custodian-hold-pending");
    expect(err?.severity).toBe("high");
    expect(err?.custodian).toBe("carol@example.com");
    expect(pen?.severity).toBe("medium");
    expect(pen?.custodian).toBe("bob@example.com");
  });

  it("flags stale-case when active and lastModified > N days ago", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW, staleCaseAfterDays: 90 });
    const stale = r.findings.find((f) => f.code === "stale-case");
    expect(stale?.subjectName).toBe("Q4 audit collection");
    expect(stale?.severity).toBe("medium");
  });

  it("flags external-id-missing", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    const eid = r.findings.find((f) => f.code === "external-id-missing");
    expect(eid?.subjectName).toBe("Vendor dispute hold");
  });

  it("populates workloadsWithRetention and workloadsWithoutRetention", () => {
    const r = analyze(fixture("compliance.json"), { now: NOW });
    expect(r.workloadsWithRetention).toEqual(["Exchange", "OneDrive", "SharePoint"]);
    expect(r.workloadsWithoutRetention).toEqual(["Teams"]);
  });

  it("ok=true on a clean fixture", () => {
    const r = analyze(fixture("compliance-clean.json"), { now: NOW });
    expect(r.ok).toBe(true);
    expect(r.findings.filter((f) => f.severity === "high")).toEqual([]);
  });

  it("respects custom requiredWorkloads", () => {
    const r = analyze(fixture("compliance.json"), {
      now: NOW,
      requiredWorkloads: ["Exchange"]
    });
    expect(r.workloadsWithoutRetention).toEqual([]);
  });

  it("handles empty input shapes", () => {
    const r = analyze({}, { now: NOW });
    expect(r.retentionLabels).toBe(0);
    expect(r.retentionPolicies).toBe(0);
    expect(r.cases).toBe(0);
    expect(r.findings.filter((f) => f.severity === "high").length).toBe(
      r.workloadsWithoutRetention.length
    );
  });
});

describe("formatters", () => {
  it("toMarkdown ranks high findings first", () => {
    const md = toMarkdown(analyze(fixture("compliance.json"), { now: NOW }));
    expect(md).toContain("❌");
    expect(md.indexOf("🔴")).toBeLessThan(md.indexOf("🟡"));
  });

  it("toMarkdown renders ✅ with 'No findings.' on clean fleet", () => {
    const md = toMarkdown(analyze(fixture("compliance-clean.json"), { now: NOW }));
    expect(md).toContain("✅");
    expect(md).toContain("No findings.");
  });

  it("toSummary emits a one-liner", () => {
    const s = toSummary(analyze(fixture("compliance.json"), { now: NOW }));
    expect(s).toMatch(/policies/);
    expect(s).toMatch(/cases/);
  });
});
