import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { listProjects, listWorks, addWork, searchWorkByName } from "../../controller/auth/loginApis";
import { Link } from "react-router-dom";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MyTable from "../MyTable/MyTable";
import Select from "react-select";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated";

// ─── style tokens (mirrors AddTimesheet) ──────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition min-h-[48px] focus:border-sky-400 placeholder:text-slate-500";
const selectNativeCls = `${inputCls} appearance-none pr-10`;
const labelCls = "mb-2 block text-sm text-slate-300";
const errorCls = "mt-2 block text-xs text-rose-400";

const reactSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#0f172a",
    borderColor: state.isFocused ? "#38bdf8" : "#334155",
    boxShadow: state.isFocused ? "0 0 0 1px #38bdf8" : "none",
    borderRadius: "0.75rem",
    minHeight: 48,
    paddingLeft: 4,
    ":hover": { borderColor: state.isFocused ? "#38bdf8" : "#475569" },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "0.75rem",
    overflow: "hidden",
    zIndex: 30,
  }),
  menuList: (base) => ({ ...base, padding: 6, backgroundColor: "#0f172a" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#1e293b" : "#0f172a",
    color: "#e2e8f0",
    borderRadius: 10,
    cursor: "pointer",
  }),
  singleValue: (base) => ({ ...base, color: "#f8fafc" }),
  input: (base) => ({ ...base, color: "#f8fafc" }),
  placeholder: (base) => ({ ...base, color: "#64748b" }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: "#334155" }),
  dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const mapResponse = (works) =>
  works?.data?.map((work) => ({
    id: work.id,
    workName: work.workName,
    clientId: work.project?.client?.id,
    client: work.project?.client?.id,
    clientName: work.project?.client?.clientName,
    projectId: work.project?.id,
    project: work.project?.projectName,
    workLink: work.workLink,
    priority: work.priority,
    comments: work.comments,
    dueDate: work.dueDate ? new Date(work.dueDate) : "",
    dueDateStr: work.dueDate,
    currentStatus: work.currentStatus,
    hoursLimit: work.hoursLimit,
    estimatedHours: work.estimatedHours,
  }));

const formatDateDisplay = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Badges ───────────────────────────────────────────────────────────────────

function PriorityBadge({ value }) {
  const styles = {
    SuperUrgent: "bg-red-500/10 text-red-400 border border-red-500/20",
    SuperDuperUrgent: "bg-red-500/15 text-red-500 border border-red-500/20",
    Urgent: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    Normal: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };
  const key = value?.replace(/\s+/g, "") ?? "";
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[key] ?? "bg-slate-700/40 text-slate-400"}`}>
      {value || "Normal"}
    </span>
  );
}

function StatusBadge({ value }) {
  const styles = {
    Done: "bg-green-500/10 text-green-400 border border-green-500/20",
    New: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    InProgress: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    "On Hold": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[value] ?? "bg-slate-700/40 text-slate-400"}`}>
      {value || "—"}
    </span>
  );
}

// ─── WorkModal (modal shell + inline form) ────────────────────────────────────

const EMPTY_WORK_FORM = {
  id: "",
  workName: "",
  projectId: "",
  workLink: "",
  priority: "Normal",
  dueDate: "",
  currentStatus: "New",
  comments: "",
  hoursLimit: "",
  estimatedHours: "",
};

const buildForm = (rowData) => ({
  id: rowData?.id || "",
  workName: rowData?.workName || "",
  projectId: rowData?.projectId || "",
  workLink: rowData?.workLink || "",
  priority: rowData?.priority || "Normal",
  dueDate: rowData?.dueDateStr ? rowData.dueDateStr.slice(0, 10) : "",
  currentStatus: rowData?.currentStatus || "New",
  comments: rowData?.comments || "",
  hoursLimit: rowData?.hoursLimit ?? "",
  estimatedHours: rowData?.estimatedHours ?? "",
});

function WorkModal({ open, onClose, rowData, profile, onSaved }) {
  const isEdit = Boolean(rowData?.id);

  const [formData, setFormData] = useState(EMPTY_WORK_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // reset form whenever modal opens with new rowData
  useEffect(() => {
    if (!open) return;
    setFormData(buildForm(rowData));
    setFormErrors({});
  }, [open, rowData]);

  // load projects for the select
  useEffect(() => {
    if (!profile) return;
    listProjects(profile)
      .then((res) => setProjects(res?.data ?? []))
      .catch(console.error);
  }, [profile]);

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: `${p.client?.clientName ? p.client.clientName + " / " : ""}${p.projectName}`,
  }));

  const validate = (name, value) => {
    if (name === "workName") return !value ? "Work name is required" : "";
    if (name === "projectId") return !value ? "Select a project" : "";
    if (name === "currentStatus") return !value ? "Select status" : "";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: validate(name, value) }));
    setSubmitting(false);
  };

  const handleSelectChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: validate(name, value) }));
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const errors = {};
    ["workName", "projectId", "currentStatus"].forEach((k) => {
      const err = validate(k, formData[k]);
      if (err) errors[k] = err;
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill all required fields.");
      setSubmitting(false);
      return;
    }
    try {
      await addWork(formData, profile);
      toast.success(isEdit ? "Work updated!" : "Work added!");
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-[28px] border border-slate-700 bg-slate-950 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.6)] overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* modal header — mirrors AddTimesheet */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.32em] text-sky-400/80">
              Work form
            </p>
            <h2 className="text-2xl font-bold text-white">
              {isEdit ? "Edit work" : "Add work"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Close
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">

            {/* Work Name */}
            <label className="block md:col-span-2">
              <span className={labelCls}>Work Name <span className="text-rose-400">*</span></span>
              <input
                type="text"
                name="workName"
                value={formData.workName}
                onChange={handleChange}
                placeholder="Enter work name"
                className={inputCls}
              />
              {formErrors.workName && <span className={errorCls}>{formErrors.workName}</span>}
            </label>

            {/* Project */}
            <label className="block">
              <span className={labelCls}>Project <span className="text-rose-400">*</span></span>
              <Select
                options={projectOptions}
                value={projectOptions.find((o) => o.value === formData.projectId) || null}
                onChange={(sel) => handleSelectChange("projectId", sel?.value || "")}
                isSearchable
                placeholder="Search project..."
                styles={reactSelectStyles}
              />
              {formErrors.projectId && <span className={errorCls}>{formErrors.projectId}</span>}
            </label>

            {/* Priority */}
            <label className="block">
              <span className={labelCls}>Priority</span>
              <select name="priority" value={formData.priority} onChange={handleChange} className={selectNativeCls}>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Super Urgent">Super Urgent</option>
                <option value="Super Duper Urgent">Super Duper Urgent</option>
              </select>
            </label>

            {/* Work Link */}
            <label className="block">
              <span className={labelCls}>Work Link</span>
              <input
                type="text"
                name="workLink"
                value={formData.workLink}
                onChange={handleChange}
                placeholder="https://..."
                className={inputCls}
              />
            </label>

            {/* Due Date */}
            <label className="block">
              <span className={labelCls}>Due Date</span>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </label>

            {/* Status */}
            <label className="block">
              <span className={labelCls}>Status <span className="text-rose-400">*</span></span>
              <select name="currentStatus" value={formData.currentStatus} onChange={handleChange} className={selectNativeCls}>
                <option value="">Select status</option>
                <option value="New">New</option>
                <option value="InProgress">In Progress</option>
                <option value="Done">Done</option>
                <option value="On Hold">On Hold</option>
              </select>
              {formErrors.currentStatus && <span className={errorCls}>{formErrors.currentStatus}</span>}
            </label>

            {/* Hours Limit */}
            <label className="block">
              <span className={labelCls}>Hours Limit</span>
              <input
                type="number"
                name="hoursLimit"
                value={formData.hoursLimit}
                onChange={handleChange}
                placeholder="0"
                min={0}
                className={inputCls}
              />
            </label>

            {/* Estimated Hours */}
            <label className="block">
              <span className={labelCls}>Estimated Hours</span>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                placeholder="0"
                min={0}
                className={inputCls}
              />
            </label>

            {/* Comments */}
            <label className="block md:col-span-2">
              <span className={labelCls}>Comments</span>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Enter comments"
                rows={3}
                className={inputCls}
              />
            </label>
          </div>

          {/* footer — mirrors AddTimesheet */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEdit ? "Save changes" : "Add work"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── WorkGrid ─────────────────────────────────────────────────────────────────

const WorkGrid = (props) => {
  const [rows, setRows] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [open, setOpen] = useState(false);
  const [updateGrid, setUpdateGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [allWorks, setAllWorks] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const searchDebounceRef = useRef(null);

  const columns = [
    {
      header: "Client",
      accessor: "clientName",
      headerClassName: "min-w-[130px] whitespace-nowrap",
      cellClassName: "min-w-[130px] whitespace-nowrap",
      render: (value) => <span className="text-sm text-slate-300">{value || "—"}</span>,
    },
    {
      header: "Project",
      accessor: "project",
      headerClassName: "min-w-[160px] whitespace-nowrap",
      cellClassName: "min-w-[160px] whitespace-nowrap",
      render: (value) => <span className="text-sm text-slate-300">{value || "—"}</span>,
    },
    {
      header: "Work Name",
      accessor: "workName",
      headerClassName: "min-w-[260px] whitespace-normal",
      cellClassName: "min-w-[260px] whitespace-normal",
      render: (value, row) => (
        <a
          href={row.workLink}
          target="_blank"
          rel="noreferrer"
          className="text-sky-400 underline underline-offset-4 hover:text-sky-300 transition text-sm"
        >
          {value || "—"}
        </a>
      ),
    },
    {
      header: "Priority",
      accessor: "priority",
      render: (value) => <PriorityBadge value={value} />,
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      render: (value) => (
        <span className="text-sm text-slate-400 whitespace-nowrap">{formatDateDisplay(value)}</span>
      ),
    },
    {
      header: "Status",
      accessor: "currentStatus",
      render: (value) => <StatusBadge value={value} />,
    },
    {
      header: "Comments",
      accessor: "comments",
      headerClassName: "min-w-[160px] whitespace-normal",
      cellClassName: "min-w-[160px] whitespace-normal",
      render: (value) => <span className="text-sm text-slate-400">{value || "—"}</span>,
    },
    {
      header: "Hrs Limit",
      accessor: "hoursLimit",
      render: (value) => <span className="text-sm text-slate-400">{value ?? "—"}</span>,
    },
    {
      header: "Est. Hours",
      accessor: "estimatedHours",
      render: (value) => <span className="text-sm text-slate-400">{value ?? "—"}</span>,
    },
    {
      header: "Action",
      accessor: "actions",
      headerClassName: "whitespace-nowrap text-center",
      cellClassName: "whitespace-nowrap text-center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setRowData(row); setOpen(true); }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-300 transition hover:-translate-y-px hover:border-sky-300/45 hover:bg-sky-500/15 hover:text-sky-100"
          >
            <ModeEditOutlineIcon style={{ fontSize: 18 }} />
          </button>
          <Link
            to={{ pathname: "/tasks", state: { filterWork: row.workName } }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/25 bg-purple-500/10 text-purple-300 transition hover:-translate-y-px hover:border-purple-300/45 hover:bg-purple-500/15 hover:text-purple-100"
          >
            <VisibilityIcon style={{ fontSize: 18 }} />
          </Link>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const works = await listWorks(props.profile);
        setAllWorks(works);
        setRows(mapResponse(works));
      } catch (error) {
        console.error("Error fetching work data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (props?.profile) fetchData();
  }, [props?.profile, updateGrid]);

  const filteredRows =
    rows?.filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.workName?.toLowerCase().includes(q) ||
        r.clientName?.toLowerCase().includes(q) ||
        r.project?.toLowerCase().includes(q)
      );
    }) ?? [];

  useEffect(() => {
    // Clear previous debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new debounce timer (500ms)
    searchDebounceRef.current = setTimeout(async () => {
      const searchData = async () => {
        if (search && search.trim() !== "") {
          try {
            setLoading(true);
            const workData = await searchWorkByName(props.profile, search);
            setRows(mapResponse(workData));
          } catch (error) {
            console.error("Error fetching work data:", error);
          } finally {
            setLoading(false);
          }
        } else {
          !isFirstLoad && setRows(mapResponse(allWorks));
          setIsFirstLoad(false);
        }
      };
      searchData();
    }, 500);
  }, [search]);

  // cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);


  return (
    <>
      <ToastContainer position="top-center" theme="colored" />

      <div className="mt-3 md:mt-4 lg:mt-5 relative">

        <div className="pb-4 flex justify-between flex-row gap-3 mb-3">
          <h1 className="text-3xl md:text-4xl lg:text-5xl">Works</h1>
          <button
            onClick={() => { setRowData({}); setOpen(true); }}
            className="border-transparent bg-gradient-to-r from-amber-500 to-orange-600 text-amber-50 inline-flex min-h-[46px] items-center justify-center rounded-md border px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition hover:-translate-y-px"
          >
            + Add Work
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-3 mb-6">
          <input
            type="text"
            placeholder="Search work / project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:col-span-2 px-4 py-2 border rounded-xl bg-transparent outline-none border-slate-700 text-slate-300 placeholder:text-slate-600 text-sm"
          />
        </div>
        <div className="mb-4">
          <h6 className="text-lg">Total Works : {filteredRows.length}</h6>
        </div>

        <MyTable
          columns={columns}
          data={filteredRows}
          keyField="id"
          emptyText={loading ? "" : "No works found"}
        />

        {loading && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
            <ThoughtMateProgressLoaderAnimated />
          </div>
        )}
      </div>

      <WorkModal
        open={open}
        onClose={() => setOpen(false)}
        rowData={rowData}
        profile={props.profile}
        onSaved={() => setUpdateGrid((p) => !p)}
      />
    </>
  );
};

export default WorkGrid;