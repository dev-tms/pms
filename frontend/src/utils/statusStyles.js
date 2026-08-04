import taskStatus from "./TaskStatus";

export const DEFAULT_BADGE_CLASS =
  "bg-slate-700/40 text-slate-400 border border-slate-600/20";

/** Shared task status colors — keyed by status id and label */
export const TASK_STATUS_STYLES = {
  "1": "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  "2": "bg-green-500/10 text-green-400 border border-green-500/20",
  "3": "bg-yellow-500/10 text-yellow-800 border border-yellow-500/20",
  "4": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "5": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "6": "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  "7": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  "8": "bg-red-500/10 text-red-400 border border-red-500/20",
  "9": "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  "10": "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  "11": "bg-green-500/10 text-green-400 border border-green-500/20",

  New: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  Assigned: "bg-green-500/10 text-green-400 border border-green-500/20",
  "In Progress": "bg-yellow-500/10 text-yellow-800 border border-yellow-500/20",
  InProgress: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  "In Progress + QA": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  QA: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "Feedback From QA": "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  "Waiting For Client Feedback": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  "On Hold": "bg-red-500/10 text-red-400 border border-red-500/20",
  "Sent To Client": "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  "Comments In Trello": "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  Done: "bg-green-500/10 text-green-400 border border-green-500/20",
  Yes: "bg-green-500/10 text-green-400 border border-green-500/20",
  No: "bg-gray-500/10 text-gray-400 border border-gray-500/20"
};

export const PRIORITY_STYLES = {
  Normal: "bg-yellow-500/10 text-yellow-800 border border-yellow-500/20",
  Urgent: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  SuperUrgent: "bg-red-500/10 text-red-400 border border-red-500/20",
  "Super Urgent": "bg-red-500/10 text-red-400 border border-red-500/20",
  SuperDuperUrgent: "bg-red-500/15 text-red-500 border border-red-500/20",
  "Super Duper Urgent": "bg-red-500/15 text-red-500 border border-red-500/20",
};

export const ENTITY_STATUS_STYLES = {
  Active: "bg-green-500/10 text-green-400 border border-green-500/20",
  Inactive: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export const ROLE_STYLES = {
  ADMIN: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  TL: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  QA: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  EMPLOYEE: "bg-slate-700/40 text-slate-400 border border-slate-600/20",
};

export const getTaskStatusLabel = (status) => {
  if (status == null || status === "") return "—";
  const match = taskStatus.find((item) => item.id + "" === status + "");
  return match?.value ?? status;
};

export const getTaskStatusStyle = (status) => {
  if (status == null || status === "") return DEFAULT_BADGE_CLASS;
  const key = String(status);
  const label = getTaskStatusLabel(status);
  return (
    TASK_STATUS_STYLES[key] ||
    TASK_STATUS_STYLES[label] ||
    TASK_STATUS_STYLES[label?.replace(/\s+/g, "")] ||
    DEFAULT_BADGE_CLASS
  );
};

export const getPriorityStyle = (value) => {
  if (!value) return DEFAULT_BADGE_CLASS;
  const normalized = String(value).replace(/\s+/g, "");
  return (
    PRIORITY_STYLES[value] ||
    PRIORITY_STYLES[normalized] ||
    DEFAULT_BADGE_CLASS
  );
};

export const getEntityStatusStyle = (value) =>
  ENTITY_STATUS_STYLES[value] || DEFAULT_BADGE_CLASS;

export const getRoleStyle = (value) =>
  ROLE_STYLES[value] || DEFAULT_BADGE_CLASS;
