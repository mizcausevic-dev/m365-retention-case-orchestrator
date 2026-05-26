import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  caseRisks,
  dispositionPosture,
  payload,
  retentionLane,
  summary,
  verification
} from "../src/services/m365RetentionCaseOrchestratorService.js";
import {
  renderCaseRisks,
  renderDispositionPosture,
  renderDocs,
  renderOverview,
  renderRetentionLane,
  renderVerification
} from "../src/services/render.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "site");

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, "api", "dashboard"), { recursive: true });
fs.copyFileSync(path.join(root, "CNAME"), path.join(outputDir, "CNAME"));

const pages: Record<string, string> = {
  "index.html": renderOverview(),
  [path.join("retention-lane", "index.html")]: renderRetentionLane(),
  [path.join("case-risks", "index.html")]: renderCaseRisks(),
  [path.join("disposition-posture", "index.html")]: renderDispositionPosture(),
  [path.join("verification", "index.html")]: renderVerification(),
  [path.join("docs", "index.html")]: renderDocs()
};

for (const [relativePath, html] of Object.entries(pages)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, "utf8");
}

const apiPayloads: Record<string, unknown> = {
  [path.join("api", "dashboard", "summary.json")]: summary(),
  [path.join("api", "retention-lane.json")]: retentionLane(),
  [path.join("api", "case-risks.json")]: caseRisks(),
  [path.join("api", "disposition-posture.json")]: dispositionPosture(),
  [path.join("api", "verification.json")]: verification(),
  [path.join("api", "sample.json")]: payload()
};

for (const [relativePath, data] of Object.entries(apiPayloads)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}
