/**
 * UI-only flowchart for the Influencer / Entrepreneur journeys.
 *
 * Continue-here if this pass is incomplete:
 * 1. Walk both roles: post job → invite → accept → deposit → submit →
 *    revise → approve → release pay → rate → withdraw.
 * 2. Replace dispatchFlowchart() with GraphQL mutations; keep reducer tests
 *    as the contract.
 * 3. RISK: localStorage is not a ledger. Escrow must be atomic on the server
 *    before any real campaign.
 */
export type { FlowAction, FlowchartState, FlowEngagement, FlowInvite, FlowApplication, FlowPostedJob } from "./types";
export { FlowchartError } from "./types";
export { reduceFlowchart, createEmptyFlowchartState, getWalletBalance } from "./reducer";
export {
  dispatchFlowchart,
  loadFlowchartState,
  resetFlowchartState,
  createFlowId,
  FLOWCHART_STORAGE_KEY,
} from "./store";
export {
  findJobById,
  getAllJobs,
  getMarketplaceJobs,
  hasEntrepreneurDepositForJob,
  escrowAmountForJob,
} from "./jobs";
