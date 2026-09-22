import type { ApprovalStatus, ComplaintStatus, DoubtStatus } from "@/types";

/**
 * Single source of truth for how a status or priority is presented.
 *
 * Four pages previously kept their own copy of these maps and had drifted
 * apart — IN_PROGRESS was cyan on three screens and violet on a fourth, labels
 * differed ("Escalated To Super Admin" vs "Escalated to SuperAdmin"), and every
 * copy's dark-mode half was broken. A tone name is all a page needs now; the
 * light and dark rendering lives in the `.cc-badge` rules in index.css.
 */
export type Tone =
  | "neutral"
  | "info"
  | "progress"
  | "warn"
  | "danger"
  | "success"
  | "escalate";

export const toneClass = (tone: Tone) => `cc-tone-${tone}`;

/** Ready-made class strings, for call sites that build a pill inline. */
export const badgeClass = (tone: Tone) => `cc-badge cc-tone-${tone}`;
export const dotClass = (tone: Tone) => `cc-dot cc-tone-${tone}`;

type Meta = { tone: Tone; label: string };

export const COMPLAINT_STATUS: Record<ComplaintStatus, Meta> = {
  RAISED: { tone: "warn", label: "Raised" },
  ASSIGNED: { tone: "info", label: "Assigned" },
  IN_PROGRESS: { tone: "progress", label: "In Progress" },
  PENDING_CONFIRMATION: { tone: "neutral", label: "Awaiting Confirmation" },
  ESCALATED_TO_SUPERADMIN: { tone: "escalate", label: "Escalated" },
  RESOLVED: { tone: "success", label: "Resolved" },
};

/** Order used for status filter strips and stat rows. */
export const COMPLAINT_STATUS_ORDER: ComplaintStatus[] = [
  "RAISED",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_CONFIRMATION",
  "ESCALATED_TO_SUPERADMIN",
  "RESOLVED",
];

/** Priority runs 1 (low) to 5 (critical); anything else falls back to neutral. */
export const PRIORITY: Record<number, Meta> = {
  1: { tone: "neutral", label: "P1 · Low" },
  2: { tone: "info", label: "P2 · Minor" },
  3: { tone: "warn", label: "P3 · Medium" },
  4: { tone: "warn", label: "P4 · High" },
  5: { tone: "danger", label: "P5 · Critical" },
};

export const priorityMeta = (p: number | null | undefined): Meta =>
  PRIORITY[p ?? 0] ?? { tone: "neutral", label: `P${p ?? "?"}` };

export const DOUBT_STATUS: Record<DoubtStatus, Meta> = {
  OPEN: { tone: "warn", label: "Open" },
  ANSWERED: { tone: "info", label: "Answered" },
  RESOLVED: { tone: "success", label: "Resolved" },
};

export const APPROVAL_STATUS: Record<ApprovalStatus, Meta> = {
  PENDING: { tone: "warn", label: "Pending" },
  APPROVED: { tone: "success", label: "Approved" },
  REJECTED: { tone: "danger", label: "Rejected" },
};

export const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
};
