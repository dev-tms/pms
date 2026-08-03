import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// ✅ Only APIs that actually exist in loginApis
import { taskPage, addTask, searchTasks } from "../../controller/auth/loginApis";
import taskStatus from "../../utils/TaskStatus";

// Reusable components
import WorkDetail from "../WorkDetail";
import MyTable, { ActionButtons } from "../MyTable/MyTable";
import TaskFormModal, { formatDateForInput } from "../TaskFormModal/TaskFormModal";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated";
import { dateMax, dateMin } from "../../utils";
import { PriorityBadge, StatusBadge } from "../StatusBadge/StatusBadge";

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatDateDisplay = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── mapResponse ──────────────────────────────────────────────────────────────

const mapResponse = (tasks, works) => {
  if (!tasks) return { doneTasks: [], unDoneTasks: [] };
  const doneTasks = [];
  const unDoneTasks = [];
  const unAssignedTasks = [];

  tasks.forEach((task) => {
    const row = {
      id: task.id,
      work: task.work,
      workName: task.work?.workName ?? "",
      clientName: task.work?.client?.clientName ?? works?.filter(w => w.id === task.work?.id)[0]?.project?.client?.clientName ?? "",
      workId: task.work?.id,
      priority: task.work?.priority ?? "",
      workLink: task.work?.workLink ?? "",
      taskName: task.taskName ?? "",
      workType: task.workType ?? "",
      assignedToName: task.assignedTo?.firstName ?? "",
      assignedToId: [task.assignedTo?.id] ?? [],
      qaName: task.qa?.firstName ?? "",
      qaId: task.qa?.id ?? "",
      assignedDate: task.assignedDate ? new Date(task.assignedDate) : "",
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : "",
      qaFeedbackLink: task.qaFeedbackLink ?? "",
      status: task.status ?? "",
      comments: task.comments ?? "",
    };
    task.status === "11" ? doneTasks.push(row) : unDoneTasks.push(row);
  });

  works?.forEach((work) => {
    if (work._count.tasks === 0) {
      unAssignedTasks.push({
        id: "_new" + work.id,
        work,
        workName: work?.workName ?? "",
        clientName: work?.client?.clientName ?? "",
        workId: work?.id,
        priority: work?.priority ?? "",
        workLink: work?.workLink ?? "",
        taskName: "", workType: "",
        assignedToName: "", assignedToId: [],
        qaName: "", qaId: "",
        assignedDate: new Date(), updatedAt: "",
        qaFeedbackLink: "", status: "1", comments: "",
      });
    }
  });
  console.log("Done tasks:", doneTasks);
  return { doneTasks, unDoneTasks: [...unAssignedTasks, ...unDoneTasks] };
};

// ─── EMPTY_FORM ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  id: "",
  workId: "",
  taskName: "",
  qaFeedbackLink: "",
  priority: "Normal",
  assignedDate: "",
  assignedToId: [],
  qaId: "",
  status: "",
  comments: "",
};

// ─── Avatar cell ──────────────────────────────────────────────────────────────

function AvatarCell({ name, bgClass = "bg-blue-600", textClass = "text-white" }) {
  if (!name) return <span className="text-slate-500 text-sm">—</span>;
  return (
    <div className="flex items-center gap-2">
      {name !== '-' && (
        <div className={`h-7 w-7 rounded-full ${bgClass} flex items-center justify-center ${textClass} text-sm font-bold shrink-0`}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-sm text-slate-300">{name}</span>
    </div>
  );
}

function WorkDetailModal({ open, work, task, employees, qas, onClose, setUpdateGrid, profile, updateGrid }) {
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-400/80 mb-1">Work detail</p>
            <h2 className="app-modal-title">{work?.workName ?? "—"}</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary shrink-0 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm transition"
          >
            Close
          </button>
        </div>
        <WorkDetail
          work={work}
          task={task}
          employees={employees}
          qas={qas}
          setOpen={onClose}
          setUpdateGrid={setUpdateGrid}
          profile={profile}
          updateGrid={updateGrid}
        />
      </div>
    </div>
  );
}


// ─── TaskGrid ─────────────────────────────────────────────────────────────────

const TaskGrid = (props) => {
  const [allData, setAllData] = useState({});
  const [rows, setRows] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [works, setWorks] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersNotQa, setUsersNotQa] = useState([]);
  const [qas, setQAs] = useState([]);
  const [updateGrid, setUpdateGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);



  // task form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formValues, setFormValues] = useState(EMPTY_FORM);

  // work detail modal
  const [workDetailOpen, setWorkDetailOpen] = useState(false);
  const [selectedWorkRow, setSelectedWorkRow] = useState(null);
  // filters
  const [search, setSearch] = useState("");
  const [workNameFilter, setWorkNameFilter] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState(new Date());

  // debouncer ref for search
  const searchDebounceRef = useRef(null);

  const location = useLocation();

  // cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  // pre-fill work name filter from router state
  useEffect(() => {
    if (location?.state?.filterWork) {
      setWorkNameFilter(location.state.filterWork);
      setSearch(location.state.filterWork);
    }
  }, [location.state?.filterWork]);

  // fetch tasks + works + users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!props?.profile) return;
        const res = await taskPage(props.profile, filterStartDate, filterEndDate);
        if (res?.data?.allTasks) {
          const mapped = mapResponse(res.data.allTasks, res.data.allWorks);
          setRows(mapped.unDoneTasks);
          setDoneTasks(mapped.doneTasks);
        }
        if (res?.data?.allWorks) setWorks(res.data.allWorks);
        if (res?.data?.allUsers) setUsers(res.data.allUsers);
        setAllData(res?.data || {});
      } catch (err) {
        console.error("Error fetching task data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [props.profile, updateGrid]);

  // split QA vs non-QA
  useEffect(() => {
    setQAs(users.filter((u) => u.role === "QA"));
    setUsersNotQa(users.filter((u) => u.role !== "QA"));
  }, [users]);

  // ── modal helpers ─────────────────────────────────────────────────────────

  const openAddModal = () => {
    setModalMode("add");
    setFormValues(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setModalMode("edit");
    setFormValues({
      id: row.id,
      workId: row.workId ?? "",
      taskName: row.taskName ?? "",
      qaFeedbackLink: row.qaFeedbackLink ?? "",
      priority: row.priority || "Normal",
      assignedDate: row.assignedDate ? formatDateForInput(row.assignedDate) : "",
      assignedToId: row.assignedToId ?? [],
      qaId: row.qaId ?? "",
      status: row.status ?? "",
      comments: row.comments ?? "",
    });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Uses `addTask` which exists in loginApis
  const handleFormSubmit = async () => {
    try {
      const payload = {
        id: formValues.id || undefined,
        workId: formValues.workId || undefined,
        taskName: formValues.taskName.trim() || "Untitled task",
        qaFeedbackLink: formValues.qaFeedbackLink?.trim() || "",
        priority: formValues.priority || "Normal",
        assignedDate: formValues.assignedDate || null,
        assignedToId: formValues.assignedToId || null,
        qaId: formValues.qaId || null,
        status: formValues.status || "1",
        comments: formValues.comments || "",
      };
      await addTask(payload, props.profile);
      setModalOpen(false);
      setFormValues(EMPTY_FORM);
      setUpdateGrid((p) => !p); // triggers data re-fetch
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  // ── columns ───────────────────────────────────────────────────────────────

  const columns = [
    {
      header: "Work name",
      accessor: "workName",
      headerClassName: "min-w-[200px] whitespace-normal",
      cellClassName: "min-w-[200px] whitespace-normal",
      render: (value, row) => (
        <button
          onClick={() => { setSelectedWorkRow(row); setWorkDetailOpen(true); }}
          className="text-left text-sky-400 underline underline-offset-4 hover:text-sky-300 transition text-base"
        >
          {value || "—"}
        </button>
      ),
    },
    {
      header: "Task name",
      accessor: "taskName",
      headerClassName: "min-w-[200px] whitespace-normal",
      cellClassName: "min-w-[200px] whitespace-normal",
      render: (value) => <span className="text-base text-slate-300">{value || "—"}</span>,
    },
    {
      header: "Priority",
      accessor: "priority",
      render: (value) => <PriorityBadge value={value} />,
    },
    {
      header: "Assigned date",
      accessor: "assignedDate",
      render: (value) => (
        <span className="text-base text-slate-400 whitespace-nowrap">{formatDateDisplay(value)}</span>
      ),
    },
    {
      header: "Updated",
      accessor: "updatedAt",
      render: (value) => (
        <span className="text-base text-slate-500 whitespace-nowrap">{formatDateDisplay(value)}</span>
      ),
    },
    {
      header: "Assigned to",
      accessor: "assignedToName",
      render: (value) => <AvatarCell name={value} bgClass="bg-blue-600" />,
    },
    {
      header: "QA",
      accessor: "qaName",
      render: (value) => <AvatarCell name={value} bgClass="bg-purple-600" />,
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => <StatusBadge value={value} />,
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

  // ── client-side filter ────────────────────────────────────────────────────

  const filterRows = (data) =>
    data.filter((r) => {
      const matchSearch =
        !search ||
        r.taskName?.toLowerCase().includes(search.toLowerCase()) ||
        r.workName?.toLowerCase().includes(search.toLowerCase());
      const matchWork =
        !workNameFilter ||
        r.workName?.toLowerCase().includes(workNameFilter.toLowerCase());
      return matchSearch && matchWork;
    });

  const filteredRows = useMemo(() => filterRows(rows), [rows, search, workNameFilter]);
  const filteredDoneTasks = useMemo(() => filterRows(doneTasks), [doneTasks, search, workNameFilter]);


  const handleSearch = async () => {

    // Clear previous debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new debounce timer (500ms)
    searchDebounceRef.current = setTimeout(async () => {
      if ((search && search.trim() !== '') || filterStartDate) {
        setLoading(true);
        try {
          await searchTasks(props.profile, search, filterStartDate).then(res => {
            if (res.status === 200) {
              const mapped = mapResponse(res.data.allTasks, res.data.allWorks);
              setRows(mapped.unDoneTasks);
              setDoneTasks(mapped.doneTasks);
            } else {
              alert('Error searching tasks. Please try again.');
            }
          }).catch(err => {
            console.error('Search error:', err);
            alert('Error searching tasks. Please try again.');
          });
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // if(!isFirstLoad) {
        const mapped = mapResponse(allData?.allTasks, allData?.allWorks);
        setRows(mapped.unDoneTasks);
        setDoneTasks(mapped.doneTasks);
        setIsFirstLoad(false);
        // }
      }
    }, 500);
  }

  useEffect(() => {
    handleSearch();

  }, [search, filterStartDate]);


  console.log('filteredRows', filteredRows)
  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer />

      {/* ── header + filters ─────────────────────────────────────────────── */}
      <div className="mt-3 md:mt-4 lg:mt-5">
        <div className="pb-4 flex justify-between flex-row gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h1 className="app-page-title">Tasks</h1>
          </div>

          {/* add button */}
          <button
            onClick={openAddModal}
            className="btn-primary inline-flex min-h-[46px] items-center justify-center rounded-md px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] no-underline transition disabled:cursor-not-allowed disabled:opacity-55 mr-3"
          >
            + Add task
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-3 w-full md:w-auto mb-6">
          {/* search */}
          <input
            type="text"
            placeholder="Search task / work..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input sm:col-span-2 px-4 py-2 border rounded-xl outline-none text-base"
          />
          {/* work name filter */}
          {/* <input
            type="text"
            placeholder="Filter by work name..."
            value={workNameFilter}
            onChange={(e) => setWorkNameFilter(e.target.value)}
            className="app-input px-4 py-2 border rounded-xl outline-none text-sm"
          /> */}
          {/* date from */}
          <input
            type="date"
            value={filterStartDate ? new Date(filterStartDate).toISOString().split("T")[0] : ""}
            max={dateMax()}
            min={dateMin(14)}
            onChange={(e) => setFilterStartDate(e.target.value ? new Date(e.target.value) : "")}
            className="app-input px-3 py-2 border rounded-xl outline-none text-base"
          />
        </div>
      </div>

      {/* ── active tasks table ────────────────────────────────────────────── */}
      <MyTable
        columns={columns}
        data={filteredRows}
        keyField="id"
        emptyText={loading ? "Loading tasks…" : "No active tasks found"}
      />

      {/* ── done tasks ───────────────────────────────────────────────────── */}
      <div className="mt-10 mb-6">
        <h2 className="app-section-title mb-3">
          Done Tasks
        </h2>
        <MyTable
          columns={columns}
          data={filteredDoneTasks}
          keyField="id"
          emptyText={loading ? "Loading…" : "No done tasks found"}
        />
      </div>

      {/* ── loading overlay ───────────────────────────────────────────────── */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <ThoughtMateProgressLoaderAnimated />
        </div>
      )}

      {/* ── Task add / edit modal (new design) ───────────────────────────── */}
      <TaskFormModal
        open={modalOpen}
        mode={modalMode}
        values={formValues}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        works={works}
        employees={usersNotQa}
        qas={qas}
        taskStatus={taskStatus}
      />

      {/* ── Work detail modal ─────────────────────────────────────────────── */}
      <WorkDetailModal
        open={workDetailOpen}
        work={selectedWorkRow?.work}
        task={selectedWorkRow}
        employees={usersNotQa}
        qas={qas}
        onClose={() => setWorkDetailOpen(false)}
        setUpdateGrid={setUpdateGrid}
        profile={props.profile}
        updateGrid={updateGrid}
      />
    </>
  );
};

export default TaskGrid;