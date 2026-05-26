// SPDX-License-Identifier: AGPL-3.0-or-later

import express from "express";
import { fileURLToPath } from "node:url";

import {
  caseRisks,
  dispositionPosture,
  payload,
  retentionLane,
  summary,
  verification
} from "./services/m365RetentionCaseOrchestratorService.js";
import {
  renderCaseRisks,
  renderDispositionPosture,
  renderDocs,
  renderOverview,
  renderRetentionLane,
  renderVerification
} from "./services/render.js";

const app = express();
const port = Number(process.env.PORT ?? 5513);
const host = process.env.HOST || "0.0.0.0";

app.get("/", (_req, res) => res.type("html").send(renderOverview()));
app.get("/retention-lane", (_req, res) => res.type("html").send(renderRetentionLane()));
app.get("/case-risks", (_req, res) => res.type("html").send(renderCaseRisks()));
app.get("/disposition-posture", (_req, res) => res.type("html").send(renderDispositionPosture()));
app.get("/verification", (_req, res) => res.type("html").send(renderVerification()));
app.get("/docs", (_req, res) => res.type("html").send(renderDocs()));

app.get("/api/dashboard/summary", (_req, res) => res.json(summary()));
app.get("/api/retention-lane", (_req, res) => res.json(retentionLane()));
app.get("/api/case-risks", (_req, res) => res.json(caseRisks()));
app.get("/api/disposition-posture", (_req, res) => res.json(dispositionPosture()));
app.get("/api/verification", (_req, res) => res.json(verification()));
app.get("/api/sample", (_req, res) => res.json(payload()));

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] !== undefined && currentFile === process.argv[1];

if (invokedDirectly) {
  app.listen(port, host, () => {
    console.log(`M365 Retention Case Orchestrator listening on http://${host}:${port}`);
  });
}

export default app;
