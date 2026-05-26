import { caseRisks, retentionLane, summary } from "../src/services/m365RetentionCaseOrchestratorService.js";

console.log("m365-retention-case-orchestrator demo");
console.log(JSON.stringify(summary(), null, 2));
console.log(
  JSON.stringify(
    retentionLane().map((lane) => ({
      lane: lane.lane,
      owner: lane.owner,
      status: lane.status
    })),
    null,
    2
  )
);
console.log(JSON.stringify(caseRisks().slice(0, 3), null, 2));
