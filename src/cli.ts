#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { analyze } from "./analyze.js";
import { toMarkdown, toSummary } from "./format.js";
import type { ComplianceExport, OrchestrationOptions } from "./types.js";

type Format = "json" | "markdown" | "summary";

interface Args {
  input?: string;
  format: Format;
  now?: string;
  staleCaseAfterDays?: number;
  requiredWorkloads?: string[];
  failOnHigh: boolean;
  out?: string;
  help: boolean;
}

const FORMATS: Format[] = ["json", "markdown", "summary"];

function parseArgs(argv: string[]): Args {
  const args: Args = { format: "json", failOnHigh: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a === "--format") {
      const v = argv[++i] as Format;
      if (!FORMATS.includes(v)) throw new Error(`--format must be one of: ${FORMATS.join(", ")}`);
      args.format = v;
    } else if (a === "--now") args.now = argv[++i];
    else if (a === "--stale-case-after-days") args.staleCaseAfterDays = Number(argv[++i]);
    else if (a === "--required-workloads") {
      const v = argv[++i];
      args.requiredWorkloads = v.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (a === "--fail-on-high") args.failOnHigh = true;
    else if (a === "--out") args.out = argv[++i];
    else if (!a.startsWith("-")) args.input = a;
    else throw new Error(`Unknown option: ${a}`);
  }
  return args;
}

const HELP = `m365-retention-case-orchestrator — Microsoft 365 retention + eDiscovery posture

Usage:
  m365-retention-case <export.json>
      [--format json|markdown|summary]
      [--now <iso>]
      [--stale-case-after-days 90]
      [--required-workloads Exchange,SharePoint,OneDrive,Teams]
      [--fail-on-high] [--out FILE]

Input shape:
  {
    "retentionLabels":   [...],
    "retentionPolicies": [...],
    "cases":             [...]
  }

Each section is optional — pass only what you've captured.

Exit code:
  0 — no high findings (or --fail-on-high not set)
  1 — high finding AND --fail-on-high set
  2 — usage / I/O error`;

export function run(argv: string[]): number {
  let args: Args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }
  if (args.help || !args.input) {
    process.stdout.write(`${HELP}\n`);
    return args.help ? 0 : 2;
  }

  let payload: ComplianceExport;
  try {
    payload = JSON.parse(readFileSync(args.input, "utf8")) as ComplianceExport;
  } catch (e) {
    process.stderr.write(`error reading input: ${(e as Error).message}\n`);
    return 2;
  }

  const opts: OrchestrationOptions = {};
  if (args.now) opts.now = args.now;
  if (args.staleCaseAfterDays !== undefined) opts.staleCaseAfterDays = args.staleCaseAfterDays;
  if (args.requiredWorkloads) opts.requiredWorkloads = args.requiredWorkloads;

  const report = analyze(payload, opts);

  let out: string;
  if (args.format === "json") out = JSON.stringify(report, null, 2);
  else if (args.format === "markdown") out = toMarkdown(report);
  else out = toSummary(report);

  if (args.out) writeFileSync(args.out, `${out}\n`, "utf8");
  else process.stdout.write(`${out}\n`);

  if (args.failOnHigh && !report.ok) return 1;
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write(`fatal: ${(e as Error).message}\n`);
    process.exit(2);
  }
}
