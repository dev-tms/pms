import React, { useEffect, useState, useRef } from "react";
import { addProject, listClients, listProjects, searchProjects } from "../../controller/auth/loginApis";
import { ToastContainer, toast } from "react-toastify";
import toastMessages from "../../utils/ToastMassages";
import MyTable, { ActionButtons } from "../MyTable/MyTable";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated";
import { StatusBadge } from "../StatusBadge/StatusBadge";

const mapResponse = (projects) => {
  projects?.data?.sort((a, b) => a.projectName.localeCompare(b.projectName));
  return projects?.data?.map((project) => ({
    id: project.id,
    projectName: project.projectName,
    technology: project.technology,
    status: project.status,
    comments: project.comments,
    clientId: project.clientId,
  }));
};

function ProjectFormModal({ open, mode, values, onChange, onClose, onSubmit, clients }) {
  if (!open) return null;

  const inputCls =
    "app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400 min-h-[53px]";
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-sm uppercase tracking-[0.32em] text-sky-400/80">
              Project form
            </p>
            <h2 className="app-modal-title">
              {mode === "edit" ? "Edit project" : "Add project"}
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Project name</span>
            <input
              type="text"
              value={values.projectName ?? ""}
              placeholder="Enter project name"
              onChange={(e) => onChange("projectName", e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Client</span>
            <select
              value={values.clientId ?? ""}
              onChange={(e) => onChange("clientId", e.target.value)}
              className={inputCls}
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.clientName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelCls}>Technology</span>
            <input
              type="text"
              value={values.technology ?? ""}
              placeholder="e.g. React, Node.js"
              onChange={(e) => onChange("technology", e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Status</span>
            <select
              value={values.status ?? "Active"}
              onChange={(e) => onChange("status", e.target.value)}
              className={inputCls}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className={labelCls}>Comments</span>
            <textarea
              rows={3}
              value={values.comments ?? ""}
              placeholder="Any comments..."
              onChange={(e) => onChange("comments", e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 app-divider border-t pt-5">
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
            {mode === "edit" ? "Save changes" : "Add project"}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  id: "",
  projectName: "",
  clientId: "",
  technology: "",
  status: "Active",
  comments: "",
};

const ProjectGrid = (props) => {
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [updateGrid, setUpdateGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // debouncer ref for search
  const searchDebounceRef = useRef(null);

  const columns = [
    {
      header: "Project",
      accessor: "projectName",
      headerClassName: "min-w-[220px] whitespace-normal",
      cellClassName: "min-w-[220px] whitespace-normal text-slate-200",
      render: (value) => <span className="text-sm text-slate-200">{value || "—"}</span>,
    },
    {
      header: "Client",
      accessor: "clientId",
      headerClassName: "min-w-[180px] whitespace-normal",
      cellClassName: "min-w-[180px] whitespace-normal text-slate-300",
      render: (value) => clients.find((client) => client.id === value)?.clientName ?? value ?? "—",
    },
    {
      header: "Technology",
      accessor: "technology",
      headerClassName: "min-w-[220px] whitespace-normal",
      cellClassName: "min-w-[220px] whitespace-normal text-slate-300",
    },
    {
      header: "Status",
      accessor: "status",
      cellClassName: "whitespace-nowrap",
      render: (value) => <StatusBadge value={value} type="entity" />,
    },
    {
      header: "Comments",
      accessor: "comments",
      headerClassName: "min-w-[240px] whitespace-normal",
      cellClassName: "min-w-[240px] whitespace-normal text-slate-300",
    },
    {
      header: "Action",
      accessor: "actions",
      headerClassName: "whitespace-nowrap text-center",
      cellClassName: "whitespace-nowrap text-center",
      render: (_, row) => (
        <div className="flex justify-center">
          <ActionButtons row={row} onEdit={openEditModal} />
        </div>
      ),
    },
  ];

  const openAddModal = () => {
    setFormValues(EMPTY_FORM);
    setModalMode("add");
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setFormValues({ ...row });
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    if (!formValues.projectName?.trim()) {
      toast.error("Please Enter Project Name");
      setLoading(false);
      return;
    }
    if (!formValues.clientId?.trim()) {
      toast.error("Please Enter Client");
      setLoading(false);
      return;
    }
    const response = await addProject(formValues, props.profile);
    if (response.status === 200 || response.status === 201) {
      toast.success(toastMessages.addProjectSuccess);
      setModalOpen(false);
    } else {
      toast.error(toastMessages.serverError);
    }
    setUpdateGrid((prev) => !prev);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectsData = await listProjects(props.profile);
        const projectsArray = projectsData || [];
        setProjects(projectsArray);
        setRows(mapResponse(projectsArray));
        const clientsRes = await listClients(props.profile);
        setClients(clientsRes?.data || []);
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [props.profile, updateGrid]);

  useEffect(() => {
    console.log('searchQuery', searchQuery);
    // Clear previous debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new debounce timer (500ms)
    searchDebounceRef.current = setTimeout(async () => {
      const searchData = async () => {
        console.log('searchQuery-2', searchQuery);
        if (searchQuery && searchQuery.trim() !== "") {
          console.log('searchQuery-3', searchQuery);
          try {
            setLoading(true);
            const projectsData = await searchProjects(props.profile, searchQuery);
            setRows(mapResponse(projectsData));
          } catch (error) {
            console.error("Error fetching project data:", error);
          } finally {
            setLoading(false);
          }
        } else {
          console.log('searchQuery-4', searchQuery);
          !isFirstLoad && setRows(mapResponse(projects));
          setIsFirstLoad(false);
        }
      };
      searchData();
    }, 500);
  }, [searchQuery]);

  // cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const filteredRows = rows?.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.projectName?.toLowerCase().includes(q) ||
      row.technology?.toLowerCase().includes(q) ||
      row.status?.toLowerCase().includes(q) ||
      row.comments?.toLowerCase().includes(q) ||
      clients.find((c) => c.id === row.clientId)?.clientName?.toLowerCase().includes(q)
    );
  });

  console.log('filteredRows', filteredRows?.length)

  return (
    <section className="relative mt-3 md:mt-4 lg:mt-5">
      <ToastContainer position="top-center" theme="colored" />

      <div className="pb-4 flex justify-between gap-3 mb-3 flex-col sm:flex-row">
        <div className="flex items-center gap-2">
          <h1 className="app-page-title">Projects</h1>
        </div>

        <div className="flex items-center gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="app-input rounded-md border px-4 py-3 text-sm outline-none transition focus:border-sky-400 w-full sm:w-64"
          />
          <button
            type="button"
            onClick={openAddModal}
            className="btn-primary inline-flex min-h-[46px] w-full sm:w-fit items-center justify-center rounded-md px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-55"
          >
            + Add project
          </button>
        </div>
      </div>
      <div className="mb-4">
        <h6 className="text-lg">Total Projects : {filteredRows?.length}</h6>
      </div>

      <MyTable
        columns={columns}
        data={filteredRows}
        keyField="id"
        emptyText={loading ? "Loading projects..." : "No projects found"}
      />

      <ProjectFormModal
        open={modalOpen}
        mode={modalMode}
        values={formValues}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        clients={clients}
      />

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <ThoughtMateProgressLoaderAnimated />
        </div>
      )}
    </section>
  );
};

export default ProjectGrid;
