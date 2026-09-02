import { ValidationError } from "@/lib/errors";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "REPLIED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "WON"
  | "LOST"
  | "DORMANT";

export const ALLOWED_STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["CONTACTED", "REPLIED", "LOST", "DORMANT"],
  CONTACTED: ["REPLIED", "QUALIFIED", "LOST", "DORMANT"],
  REPLIED: ["QUALIFIED", "PROPOSAL", "LOST", "DORMANT"],
  QUALIFIED: ["PROPOSAL", "WON", "LOST", "DORMANT"],
  PROPOSAL: ["WON", "LOST", "DORMANT"],
  WON: ["DORMANT", "REPLIED"],
  LOST: ["NEW", "CONTACTED", "REPLIED"],
  DORMANT: ["NEW", "CONTACTED", "REPLIED"],
};

export function isValidStatusTransition(fromStatus: LeadStatus, toStatus: LeadStatus): boolean {
  if (fromStatus === toStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[fromStatus];
  return allowed ? allowed.includes(toStatus) : false;
}

export function validateStatusTransition(fromStatus: LeadStatus, toStatus: LeadStatus): void {
  if (!isValidStatusTransition(fromStatus, toStatus)) {
    throw new ValidationError(
      `Invalid lead status transition from '${fromStatus}' to '${toStatus}'. Allowed transitions are: ${ALLOWED_STATUS_TRANSITIONS[fromStatus].join(", ")}`
    );
  }
}

export function getAllowedNextStatuses(currentStatus: LeadStatus): LeadStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
}
