import React, { useEffect, useState } from "react";
import { listUsers, register } from "../../controller/auth/loginApis.js";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import toastMessages from "../../utils/ToastMassages.js";
import MyTable from "../MyTable/MyTable";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated.js";
import { StatusBadge } from "../StatusBadge/StatusBadge";

// ─── style tokens (shared across all grids) ───────────────────────────────────

const inputCls =
  "app-input w-full rounded-xl border px-4 py-3 text-base outline-none transition min-h-[48px] focus:border-sky-400";
const selectCls = `${inputCls} appearance-none pr-10`;
const labelCls = "app-label mb-2 block text-base";
const errorCls = "mt-2 block text-base text-rose-400";

// ─── helpers ──────────────────────────────────────────────────────────────────

const mapResponse = (contacts) => {
  contacts?.data?.sort((a, b) => a.firstName.localeCompare(b.firstName));
  return contacts?.data?.map((contact, index) => ({
    recordId: contact.id,
    id: contact.id,
    no: index,
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    role: contact.role,
    status: contact.status,
    TLName: contact.TL ? contact.TL.firstName + " " + contact.TL?.lastName : "",
    TLId: contact.TL?.id,
    password: "",
    password_old: contact.password,
  }));
};

// ─── Badges ───────────────────────────────────────────────────────────────────

function RoleBadge({ value }) {
  return <StatusBadge value={value} type="role" />;
}

// ─── empty form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "EMPLOYEE",
  status: "Active",
  TLId: "",
  password: "",
};

const buildForm = (row) => ({
  id: row?.id ?? "",
  firstName: row?.firstName ?? "",
  lastName: row?.lastName ?? "",
  email: row?.email ?? "",
  role: row?.role ?? "EMPLOYEE",
  status: row?.status ?? "Active",
  TLId: row?.TLId ?? "",
  password: "",
});

// ─── ContactFormModal ─────────────────────────────────────────────────────────

function ContactFormModal({ open, mode, values, TLs, onChange, onClose, onSubmit, submitting }) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) setErrors({});
  }, [open]);

  const validate = () => {
    const e = {};
    if (!values.firstName?.trim()) e.firstName = "First name is required";
    if (!values.email?.trim()) e.email = "Email is required";
    if (!values.role) e.role = "Role is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    onSubmit(values);
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
        {/* header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-base uppercase tracking-[0.32em] text-sky-400/80">
              Contact form
            </p>
            <h2 className="app-heading text-2xl font-bold">
              {mode === "edit" ? "Edit contact" : "Add contact"}
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

        {/* form grid */}
        <div className="grid gap-4 md:grid-cols-2">

          {/* First Name */}
          <label className="block">
            <span className={labelCls}>First Name <span className="text-rose-400">*</span></span>
            <input
              type="text"
              value={values.firstName ?? ""}
              placeholder="Enter first name"
              onChange={(e) => onChange("firstName", e.target.value)}
              className={inputCls}
            />
            {errors.firstName && <span className={errorCls}>{errors.firstName}</span>}
          </label>

          {/* Last Name */}
          <label className="block">
            <span className={labelCls}>Last Name</span>
            <input
              type="text"
              value={values.lastName ?? ""}
              placeholder="Enter last name"
              onChange={(e) => onChange("lastName", e.target.value)}
              className={inputCls}
            />
          </label>

          {/* Email */}
          <label className="block">
            <span className={labelCls}>Email <span className="text-rose-400">*</span></span>
            <input
              type="email"
              value={values.email ?? ""}
              placeholder="Enter email"
              onChange={(e) => onChange("email", e.target.value)}
              className={inputCls}
            />
            {errors.email && <span className={errorCls}>{errors.email}</span>}
          </label>

          {/* Role */}
          <label className="block">
            <span className={labelCls}>Role <span className="text-rose-400">*</span></span>
            <select
              value={values.role ?? ""}
              onChange={(e) => onChange("role", e.target.value)}
              className={selectCls}
            >
              <option value="">Select role</option>
              {["ADMIN", "TL", "QA", "EMPLOYEE"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.role && <span className={errorCls}>{errors.role}</span>}
          </label>

          {/* Status */}
          <label className="block">
            <span className={labelCls}>Status</span>
            <select
              value={values.status ?? "Active"}
              onChange={(e) => onChange("status", e.target.value)}
              className={selectCls}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          {/* TL */}
          <label className="block">
            <span className={labelCls}>Team Lead</span>
            <select
              value={values.TLId ?? ""}
              onChange={(e) => onChange("TLId", e.target.value)}
              className={selectCls}
            >
              <option value="">Select TL</option>
              {TLs.map((tl) => (
                <option key={tl.id} value={tl.id}>
                  {tl.firstName} {tl.lastName}
                </option>
              ))}
            </select>
          </label>

          {/* Password */}
          <label className="block md:col-span-2">
            <span className={labelCls}>Password {mode === "add" && <span className="text-rose-400">*</span>}</span>
            <input
              type="password"
              value={values.password ?? ""}
              placeholder={mode === "edit" ? "Leave blank to keep current password" : "Enter password"}
              onChange={(e) => onChange("password", e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        {/* footer */}
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
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === "edit" ? "Save changes" : "Add contact"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DataGridTable (Contacts) ─────────────────────────────────────────────────

const DataGridTable = (props) => {
  const [rows, setRows] = useState([]);
  const [TLs, setTLs] = useState([]);
  const [updateGrid, setUpdateGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formValues, setFormValues] = useState(EMPTY_FORM);

  // ── filtered rows ────────────────────────────────────────────────────────

  const filteredRows = rows?.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.firstName?.toLowerCase().includes(q) ||
      r.lastName?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.role?.toLowerCase().includes(q)
    );
  });

  console.log('filteredRows contacts', filteredRows)
  // ── columns ──────────────────────────────────────────────────────────────

  const columns = [
    {
      header: "First Name",
      accessor: "firstName",
      headerClassName: "min-w-[140px] whitespace-nowrap",
      cellClassName: "min-w-[140px] whitespace-nowrap",
      render: (value) => <span className="text-base text-slate-200 font-medium">{value || "—"}</span>,
    },
    {
      header: "Last Name",
      accessor: "lastName",
      headerClassName: "min-w-[140px] whitespace-nowrap",
      cellClassName: "min-w-[140px] whitespace-nowrap",
      render: (value) => <span className="text-base text-slate-300">{value || "—"}</span>,
    },
    {
      header: "Email",
      accessor: "email",
      headerClassName: "min-w-[220px] whitespace-nowrap",
      cellClassName: "min-w-[220px] whitespace-nowrap",
      render: (value) => <span className="text-base text-slate-400">{value || "—"}</span>,
    },
    {
      header: "Role",
      accessor: "role",
      render: (value) => <RoleBadge value={value} />,
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => <StatusBadge value={value} type="entity" />,
    },
    {
      header: "Team Leader",
      accessor: "TLName",
      headerClassName: "min-w-[150px] whitespace-nowrap",
      cellClassName: "min-w-[150px] whitespace-nowrap",
      render: (value) => <span className="text-base text-slate-400">{value?.trim() || "—"}</span>,
    },
    {
      header: "Action",
      accessor: "actions",
      headerClassName: "whitespace-nowrap text-center",
      cellClassName: "whitespace-nowrap text-center",
      render: (_, row) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => openEditModal(row)}
            className="btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-xl border transition"
          >
            <ModeEditOutlineIcon style={{ fontSize: 18 }} />
          </button>
        </div>
      ),
    },
  ];

  // ── modal helpers ────────────────────────────────────────────────────────

  const openAddModal = () => {
    setFormValues(EMPTY_FORM);
    setModalMode("add");
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setFormValues(buildForm(row));
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // ── save (same logic as original handleSave) ─────────────────────────────

  const handleSave = async (modifiedRow) => {
    console.log("Updating User", modifiedRow)
    setLoading(true);
    const requiredFields = {
      firstName: "Please Enter First Name",
      email: "Please Enter Email",
      role: "Please Select Role",
    };
    for (const [field, message] of Object.entries(requiredFields)) {
      if (!modifiedRow[field] || modifiedRow[field].toString().trim() === "") {
        toast.error(message);
        setLoading(false);
        return;
      }
    }
    try {
      const response = await register(modifiedRow, props.profile);
      if (response?.status === 200) {
        toast.success(modifiedRow.id ? toastMessages.updateUserSuccess : toastMessages.addUserSuccess);
        setModalOpen(false);
      } else {
        toast.error(toastMessages.internalServerError);
      }
    } catch (err) {
      toast.error(toastMessages.internalServerError);
    } finally {
      setLoading(false);
    }
    setUpdateGrid((p) => !p);
  };

  // ── fetch ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await listUsers(props.profile);
        if (userData?.data) setRows(mapResponse(userData));
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (props?.profile) fetchData();
  }, [props.profile, updateGrid]);

  // derive TL list from rows (same as original)
  useEffect(() => {
    try {
      setTLs(rows.filter((u) => u.role === "TL"));
    } catch (error) {
      console.error("Error fetching TLs:", error);
    }
  }, [rows]);

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <section className="relative mt-3 md:mt-4 lg:mt-5">
      <ToastContainer position="top-center" theme="colored" />

      {/* top bar */}
      <div className="pb-4 flex justify-between gap-3 mb-3 flex-col sm:flex-row">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">Contacts</h1>

        <div className="flex items-center gap-3 flex-col sm:flex-row">
          {/* search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="app-input w-full sm:w-64 px-4 py-2 border rounded-xl outline-none text-sm"
          />

          {/* add button */}
          <button
            type="button"
            onClick={openAddModal}
            className="btn-primary inline-flex min-h-[46px] w-full sm:w-fit items-center justify-center rounded-md px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-55"
          >
            + Add contact
          </button>
        </div>
      </div>

      {/* table */}
      <MyTable
        columns={columns}
        data={filteredRows}
        keyField="id"
        emptyText={loading ? "Loading contacts…" : "No contacts found"}
      />

      {/* modal */}
      <ContactFormModal
        open={modalOpen}
        mode={modalMode}
        values={formValues}
        TLs={TLs}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        submitting={loading}
      />

      {/* loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <ThoughtMateProgressLoaderAnimated />
        </div>
      )}
    </section>
  );
};

export default DataGridTable;