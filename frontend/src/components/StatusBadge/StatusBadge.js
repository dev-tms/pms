import React from "react";
import {
  getEntityStatusStyle,
  getPriorityStyle,
  getRoleStyle,
  getTaskStatusLabel,
  getTaskStatusStyle,
} from "../../utils/statusStyles";

const badgeBaseClass = "app-badge";

export function StatusBadge({ value, type = "task", className = "" }) {
  if (type === "entity") {
    return (
      <span className={`${badgeBaseClass} ${getEntityStatusStyle(value)} ${className}`.trim()}>
        {value || "—"}
      </span>
    );
  }

  if (type === "role") {
    return (
      <span className={`${badgeBaseClass} ${getRoleStyle(value)} ${className}`.trim()}>
        {value || "—"}
      </span>
    );
  }

  if (type === "taskLead") {
    return (
      <span className={`${badgeBaseClass} ${getTaskStatusStyle(value && value === true ? "Yes" : "No")} ${className}`.trim()}>
        {value && value === true ? "Yes" : "No"}
      </span>
    );
  }

  const label = getTaskStatusLabel(value);
  return (
    <span className={`${badgeBaseClass} ${getTaskStatusStyle(value)} ${className}`.trim()}>
      {label}
    </span>
  );
}

export function PriorityBadge({ value, className = "" }) {
  return (
    <span className={`${badgeBaseClass} ${getPriorityStyle(value)} ${className}`.trim()}>
      {value || "Normal"}
    </span>
  );
}

export default StatusBadge;
