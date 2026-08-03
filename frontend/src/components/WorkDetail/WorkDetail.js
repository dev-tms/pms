import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getWorkById } from "../../controller/auth/loginApis";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated";

// ─── small read-only field ────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">
        {label}
      </span>
      <div className="app-input rounded-2xl border px-4 py-3 text-sm min-h-[46px] flex items-center">
        {children || <span className="text-slate-600">—</span>}
      </div>
    </div>
  );
}

// ─── priority badge ───────────────────────────────────────────────────────────

function PriorityBadge({ value }) {
  const styles = {
    SuperUrgent: "bg-red-500/10 text-red-400 border border-red-500/20",
    "Super Urgent": "bg-red-500/10 text-red-400 border border-red-500/20",
    SuperDuperUrgent: "bg-red-500/15 text-red-500 border border-red-500/20",
    "Super Duper Urgent": "bg-red-500/15 text-red-500 border border-red-500/20",
    Urgent: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    Normal: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };
  if (!value) return <span className="text-slate-600">—</span>;
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${styles[value] ?? "bg-slate-700/40 text-slate-400"}`}>
      {value}
    </span>
  );
}

// ─── WorkDetail ───────────────────────────────────────────────────────────────

const WorkDetail = (props) => {
  const history = useHistory();

  const [formData, setFormData] = useState({
    id: props.work?.id || "",
    workName: props.work?.workName || "",
    clientName: props.task?.clientName || "",
    projectName: props.work?.project?.projectName || "",
    workLink: props.work?.workLink || "",
    priority: props.work?.priority || "",
    dueDate: props.work?.dueDateStr ? props.work.dueDateStr.split("T")[0] : "",
    comments: props.work?.comments || "",
    hoursLimit: props.work?.hoursLimit || "",
    estimatedHours: props.work?.estimatedHours || "",
    currentStatus: props.work?.currentStatus || "",
  });

  const [loading, setLoading] = useState(false);

  // fetch fresh work detail
  useEffect(() => {
    const fetchData = async () => {
      if (!formData.id) return;
      try {
        setLoading(true);
        const res = await getWorkById(props.profile, formData.id);
        if (res?.data?.id) {
          const d = res.data;
          setFormData((prev) => ({
            ...prev,
            workName: d.workName ?? prev.workName,
            projectName: d.project?.projectName ?? prev.projectName,
            workLink: d.workLink ?? prev.workLink,
            priority: d.priority ?? prev.priority,
            comments: d.comments ?? prev.comments,
            hoursLimit: d.hoursLimit ?? prev.hoursLimit,
            estimatedHours: d.estimatedHours ?? prev.estimatedHours,
            dueDate: d.dueDateStr ? d.dueDateStr.split("T")[0] : prev.dueDate,
          }));
        }
      } catch (err) {
        console.error("Error fetching work detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [props.profile]);

  const handleClose = (e) => {
    e.preventDefault();
    if (props.setOpen) {
      props.setOpen(false);
    } else {
      history.goBack();
    }
  };

  return (
    <div>
      {/* ── header ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        {formData.clientName && (<div>
          <p className="text-xs uppercase tracking-[0.32em] text-sky-400/80 mb-1">
            Client
          </p>
          <h2 className="app-heading text-2xl font-bold">
            {formData.clientName || "Client details"}
          </h2>
        </div>)}

        {/* work link icon button */}
        {formData.workLink && (
          <a
            href={formData.workLink}
            target="_blank"
            rel="noreferrer"
            className="app-btn-ghost shrink-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:border-sky-500 hover:text-sky-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            Open work
          </a>
        )}
      </div>

      {/* ── loading state ── */}
      {/* {loading ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <ThoughtMateProgressLoaderAnimated />
        </div>
      ) : ( */}
        <>
          {/* ── fields grid ── */}
          <div className="grid gap-4 md:grid-cols-2">

            <Field label="Project">
              {formData.projectName}
            </Field>

            <Field label="Work name">
              {formData.workName}
            </Field>

            <Field label="Priority">
              <PriorityBadge value={formData.priority} />
            </Field>

            <Field label="Current status">
              {formData.currentStatus}
            </Field>

            <Field label="Hours limit">
              {formData.hoursLimit}
            </Field>

            <Field label="Estimated hours">
              {formData.estimatedHours}
            </Field>

            <Field label="Due date">
              {formData.dueDate
                ? new Date(formData.dueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : null}
            </Field>

            {/* work link — full width */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">
                Work link
              </span>
              <div className="app-input rounded-2xl border px-4 py-3 min-h-[46px] flex items-center">
                {formData.workLink ? (
                  <a
                    href={formData.workLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-sky-400 underline underline-offset-4 hover:text-sky-300 transition break-all"
                  >
                    {formData.workLink}
                  </a>
                ) : (
                  <span className="text-slate-600 text-sm">—</span>
                )}
              </div>
            </div>

            {/* comments — full width */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">
                Comments
              </span>
              <div className="app-input rounded-2xl border px-4 py-3 text-sm min-h-[60px]">
                {formData.comments || <span className="text-slate-600">—</span>}
              </div>
            </div>
          </div>

          {/* ── footer ── */}
          <div className="mt-6 flex justify-end gap-3 app-divider border-t pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="app-btn-ghost rounded-2xl border px-5 py-3 text-sm transition"
            >
              Close
            </button>
          </div>
        </>
      {/* )} */}
    </div>
  );
};

export default WorkDetail;