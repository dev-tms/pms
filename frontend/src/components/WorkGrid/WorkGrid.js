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
import { PriorityBadge, StatusBadge } from "../StatusBadge/StatusBadge";
import { selectStyles } from "../../utils";

// ─── style tokens (mirrors AddTimesheet) ──────────────────────────────────────

const inputCls =
  "app-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition min-h-[48px] focus:border-sky-400";
const selectNativeCls = `${inputCls} appearance-none pr-10`;
const labelCls = "app-label mb-2 block text-sm";
const errorCls = "mt-2 block text-sm text-rose-400";

const reactSelectStyles = selectStyles; // theme-aware shared styles

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
      className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="app-modal w-full max-w-3xl rounded-[28px] border p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* modal header — mirrors AddTimesheet */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-sm uppercase tracking-[0.32em] text-sky-400/80">
              Work form
            </p>
            <h2 className="app-modal-title">
              {isEdit ? "Edit work" : "Add work"}
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
                className={`${inputCls}`}
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
          <div className="mt-6 flex justify-end gap-3 app-divider border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
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
            className="btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-xl border transition"
          >
            <ModeEditOutlineIcon style={{ fontSize: 18 }} />
          </button>
          <Link
            to={{ pathname: "/tasks", state: { filterWork: row.workName } }}
            className="btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-xl border transition"
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
          <h1 className="app-page-title">Works</h1>
          <button
            onClick={() => { setRowData({}); setOpen(true); }}
            className="btn-primary inline-flex min-h-[46px] items-center justify-center rounded-md px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] transition"
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
            className="app-input sm:col-span-2 px-4 py-2 border rounded-xl outline-none text-sm"
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