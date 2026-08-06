import React, { useState, useRef, useEffect } from "react";
import { selectStyles } from "../../utils";
import Select from "react-select";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

// ─── date helpers (exported so TaskGrid can reuse) ────────────────────────────

export const formatDateForInput = (value) => {
  if (!value || value === "-") return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

// ─── TaskFormModal ────────────────────────────────────────────────────────────
/**
 * Props:
 *  open           boolean
 *  mode           "add" | "edit"
 *  values         object  (see EMPTY_FORM in TaskGrid)
 *  onChange       (field, value) => void
 *  onClose        () => void
 *  onSubmit       () => void
 *  works          array of { id, workName }
 *  employees      array of { id, firstName, lastName }
 *  qas            array of { id, firstName, lastName }
 *  taskStatus     array of { id, value }  — from utils/TaskStatus
 */
export default function TaskFormModal({
  open,
  mode,
  values,
  onChange,
  onClose,
  onSubmit,
  works = [],
  employees = [],
  qas = [],
  taskStatus = [],
  allTasks = [],
}) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdown]);

  if (!open) return null;

  const normalizedTaskName = (values.taskName || "").trim().toLowerCase();
  const taskLeadRecord = allTasks.find(
    (task) =>
      task.isTaskLead &&
      (task.taskName || "").trim().toLowerCase() === normalizedTaskName &&
      (!values.workId || !task.workId || task.workId === values.workId)
  );

  const getUserNameByIds = (ids = []) => {
    const user = employees.find((emp) => ids.includes(emp.id));
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  };

  // Same task name → show the shared lead name on every assignee's edit popup
  const taskLeadName =
    taskLeadRecord?.assignedToName ||
    getUserNameByIds(taskLeadRecord?.assignedToId || []) ||
    (values.isTaskLead ? getUserNameByIds(values.assignedToId || []) : "") ||
    "";

  const formattedWorkOptions = works.map(work => ({
    value: work.id,
    label: work?.workName
  }));

  const formattedQaOptions = qas.map(qa => ({
    value: qa.id,
    label: `${qa.firstName || ''} ${qa.lastName || ''}`.trim()
  }));

  const formattedEmployeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
  }));

  const formattedTaskStatusOptions = taskStatus.map(status => ({
    value: status.id,
    label: status.value
  }));

  const formattedTaskLeadOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" }
  ];

  const formattedPriorityOptions = [
    { value: "Normal", label: "Normal" },
    { value: "Urgent", label: "Urgent" },
    { value: "Super Urgent", label: "Super urgent" },
    { value: "Super Duper Urgent", label: "Super duper urgent" },
  ];

  const handleToggleEmployee = (employeeId) => {
    const currentIds = Array.isArray(values.assignedToId) ? values.assignedToId : [];
    const newIds = currentIds.includes(employeeId)
      ? currentIds.filter((id) => id !== employeeId)
      : [...currentIds, employeeId];
    onChange("assignedToId", newIds);
  };

  const handleSelectEmployee = (employeeId) => {
    const newIds = [employeeId];
    onChange("assignedToId", newIds);
  };

  const inputCls = "app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400";
  const labelCls = "app-label mb-2 block text-sm";

  return (
    <div
      className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="app-modal w-full max-w-3xl rounded-[28px] border p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── header ── */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-400/80 mb-1">
              Task form
            </p>
            <h2 className="app-modal-title">
              {mode === "edit" ? "Edit task" : "Add task"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary shrink-0 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm transition"
          >
            Close
          </button>
        </div>

        {/* ── fields grid ── */}
        <div className="grid gap-4 md:grid-cols-2">

          {/* Work */}
          <label className="block">
            <span className={labelCls}>Work</span>
            <Select
              name="workId"
              value={formattedWorkOptions.find(o => o.value === values.workId) || null}
              onChange={(selected) => onChange("workId", selected?.value || "")}
              options={formattedWorkOptions}
              isSearchable
              styles={selectStyles}
              className="rounded:md"
            >
              <option value="">Select work</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.workName}
                </option>
              ))}
            </Select>
          </label>

          {/* Task name */}
          <label className="block">
            <span className={labelCls}>Task name</span>
            <input
              type="text"
              value={values.taskName ?? ""}
              placeholder="Enter task name"
              onChange={(e) => onChange("taskName", e.target.value)}
              className={inputCls}
            />
          </label>

          {(!values.id.startsWith('_new') && values.id !== '') && (
            <label className="block">
              <span className={labelCls}>Assigned to</span>
              <Select
                value={formattedEmployeeOptions.find(o => o.value === values.assignedToId[0]) || null} //{values.assignedToId ?? ""}
                onChange={(e) => handleSelectEmployee(e?.value)}
                styles={selectStyles}
                className="rounded:md"
                options={formattedEmployeeOptions}
              >
                <option value="">Select assignee</option>
                {employees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {(u.firstName ?? "") + " " + (u.lastName ?? "")}
                  </option>
                ))}
              </Select>
            </label>)}
          {(values.id.startsWith('_new') || values.id === '') && (
            <label className="block">
              <span className={labelCls}>Assigned to</span>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(!openDropdown);
                    if (openDropdown) setEmployeeSearch("");
                  }}
                  className={`h-[48px] app-input relative w-full rounded-2xl border text-left overflow-hidden flex items-center justify-between gap-2 flex-nowrap px-4 py-3 text-sm transition ${openDropdown
                    ? "border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.2)]"
                    : ""
                    } focus:outline-none`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {Array.isArray(values.assignedToId) && values.assignedToId.length > 0 ? (
                      <div className="flex flex-nowrap gap-2 overflow-x-auto">
                        {employees
                          .filter((u) => values.assignedToId.includes(u.id))
                          .map((employee) => (
                            <span
                              key={employee.id}
                              className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/40 text-sky-500 px-2.5 py-1 rounded-lg text-sm font-medium whitespace-nowrap"
                            >
                              {`${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim().split(" ")[0]}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleEmployee(employee.id);
                                }}
                                className="hover:text-sky-200 transition ml-0.5"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                      </div>
                    ) : (
                      <span style={{ color: "var(--app-placeholder)" }}>Select assignees...</span>
                    )}
                  </div>
                  <span className={`absolute right-2 flex-shrink-0 transition-transform duration-200 ${openDropdown ? "rotate-180" : ""}`}>
                    <ChevronDown width={20} />
                  </span>
                </button>

                {openDropdown && (
                  <div className="app-card absolute top-full left-0 right-0 mt-2 border rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-1" onClick={(e) => e.stopPropagation()}>
                    {/* Header with select all */}
                    {employees.length > 1 && (
                      <div className="app-divider px-4 py-3 border-b flex items-center justify-between gap-2">
                        <span className="app-muted text-sm uppercase tracking-wider font-semibold">Employees ({values.assignedToId?.length || 0})</span>
                        {values.assignedToId?.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChange("assignedToId", []);
                            }}
                            className="app-muted text-sm transition hover:underline"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    )}

                    {/* Search input */}
                    <div className="px-4 py-2 border-b" style={{ borderBottomColor: "var(--app-border)" }}>
                      <div className="relative">
                        <input
                          type="text"
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Search by name..."
                          autoFocus
                          className="app-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
                        />
                        {employeeSearch && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmployeeSearch("");
                            }}
                            className="app-muted absolute right-2 top-1/2 -translate-y-1/2 text-sm hover:text-sky-300"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-64 overflow-y-auto">
                      {(() => {
                        const filteredEmployees = employees.filter((employee) => {
                          const fullName = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim().toLowerCase();
                          return fullName.includes(employeeSearch.trim().toLowerCase());
                        });

                        if (employees.length === 0) {
                          return (
                            <div className="app-muted px-4 py-6 text-center text-sm">
                              No employees available
                            </div>
                          );
                        }

                        if (filteredEmployees.length === 0) {
                          return (
                            <div className="app-muted px-4 py-6 text-center text-sm">
                              No employees match "{employeeSearch}"
                            </div>
                          );
                        }

                        return filteredEmployees.map((employee, index) => {
                          const isSelected = Array.isArray(values.assignedToId) && values.assignedToId.includes(employee.id);
                          return (
                            <label
                              key={employee.id}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition duration-150 ${isSelected
                                ? "bg-sky-500/10 border-l-2 border-sky-500"
                                : "border-l-2 border-transparent"
                                } ${index !== filteredEmployees.length - 1 ? "border-b" : ""}`}
                              style={
                                index !== filteredEmployees.length - 1
                                  ? { borderBottomColor: "var(--app-border)" }
                                  : undefined
                              }
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.backgroundColor = "var(--app-nav-hover-bg)";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleEmployee(employee.id)}
                                className="w-4 h-4 rounded accent-sky-500 cursor-pointer flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm font-medium ${isSelected ? "text-sky-500" : "app-muted"}`}>
                                  {`${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim()}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="text-sky-400 text-sm flex-shrink-0">✓</span>
                              )}
                            </label>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </label>)}

          {/* QA */}
          <label className="block">
            <span className={labelCls}>QA</span>
            <Select
              value={formattedQaOptions.find(o => o.value === values.qaId) || null}//{values.qaId ?? ""}
              onChange={(e) => onChange("qaId", e.value)}
              styles={selectStyles}
              className="rounded:md"
              options={formattedQaOptions}
            >

            </Select>
          </label>

          {/* Priority */}
          <label className="block">
            <span className={labelCls}>Priority</span>
            <Select
              value={formattedPriorityOptions.find(o => o.value === values.priority) || null}//{values.priority ?? "Normal"}
              onChange={(e) => onChange("priority", e.value)}
              styles={selectStyles}
              className="rounded:md"
              options={formattedPriorityOptions}
            >
              <option value="Normal">Normal</option>
              <option value="Super Urgent">Super urgent</option>
              <option value="Super Duper Urgent">Super duper urgent</option>
            </Select>
          </label>

          {/* Status */}
          <label className="block">
            <span className={labelCls}>Status</span>
            <Select
              value={formattedTaskStatusOptions.find(o => o.value === values.status) || null} //{values.status ?? ""}
              onChange={(e) => onChange("status", e.value)}
              styles={selectStyles}
              className="rounded:md"
              options={formattedTaskStatusOptions}
            >
              <option value="">Select status</option>
              {taskStatus.map((s) => (
                <option key={s.id} value={s.id + ""}>
                  {s.value}
                </option>
              ))}
            </Select>
          </label>

          {/* Assigned date */}
          <label className="block">
            <span className={labelCls}>Assigned date</span>
            <input
              type="date"
              value={formatDateForInput(values.assignedDate)}
              onChange={(e) => onChange("assignedDate", e.target.value)}
              className={inputCls}
            />
          </label>

          {/* QA feedback link */}
          <label className="block">
            <span className={labelCls}>QA feedback link</span>
            <input
              type="url"
              value={values.qaFeedbackLink ?? ""}
              placeholder="https://..."
              onChange={(e) => onChange("qaFeedbackLink", e.target.value)}
              className={inputCls}
            />
          </label>

          {/* Comments — full width */}
          <label className="block">
            <span className={labelCls}>Comments</span>
            <input
              type="text"
              value={values.comments ?? ""}
              placeholder="Any comments..."
              onChange={(e) => onChange("comments", e.target.value)}
              className={inputCls}
            />
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Task Lead */}
            <label className="block flex-1">
              <span className={labelCls}>Task Lead</span>
              <Select
                value={formattedTaskLeadOptions.find(o => o.value === values.isTaskLead) || null}
                onChange={(e) => {
                  const wantsLead = e.value;

                  // Block turning this task into a lead if another task with the
                  // same name (and work) already has a lead assigned.
                  if (
                    wantsLead &&
                    taskLeadRecord &&
                    taskLeadRecord.id !== values.id
                  ) {
                    toast.error(
                      `"${values.taskName}" already has a task lead: ${taskLeadName}. ` + `Remove that assignment first before setting a new one.`
                    );
                    return;
                  }

                  onChange("isTaskLead", wantsLead);
                }}
                styles={selectStyles}
                className="rounded:md"
                options={formattedTaskLeadOptions}
              />
            </label>
            {/* {mode === "edit" && ( */}
            <label className="block flex-1">
              <span className={labelCls}>Task Lead Name</span>
              <div className={`${inputCls} flex items-center text-slate-400 min-h-[48px]`}>
                {taskLeadName || "No task lead assigned"}
              </div>
            </label>
            {/* )} */}
          </div>
        </div>

        {/* ── footer ── */}
        <div className="app-divider mt-6 flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="btn-primary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === "edit" ? "Save changes" : "Add task"}
          </button>
        </div>
      </div>
    </div>
  );
}