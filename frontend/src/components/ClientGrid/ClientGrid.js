import React, { useEffect, useState } from "react";
import { listClients, addClient } from "../../controller/auth/loginApis";
import { ToastContainer, toast } from "react-toastify";
import toastMessages from "../../utils/ToastMassages";
import MyTable, { ActionButtons } from "../MyTable/MyTable";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated";

const mapResponse = (clients) => {
  clients?.data?.sort((a, b) => a.clientName.localeCompare(b.clientName));
  return clients?.data?.map((client) => ({
    id: client.id,
    clientId: client.id,
    clientName: client.clientName,
  }));
};

// ─── Modal ────────────────────────────────────────────────────────────────────
function ClientFormModal({ open, mode, values, onChange, onClose, onSubmit }) {
  if (!open) return null;

  const inputCls =
    "w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 placeholder:text-slate-500";
  const labelCls = "mb-2 block text-sm text-slate-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[28px] border border-slate-700 bg-slate-950 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.32em] text-sky-400/80">
              Client form
            </p>
            <h2 className="text-2xl font-bold text-white">
              {mode === "edit" ? "Edit client" : "Add client"}
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

        {/* Field */}
        <div className="grid gap-4">
          <label className="block">
            <span className={labelCls}>Client name</span>
            <input
              type="text"
              value={values.clientName ?? ""}
              placeholder="Enter client name"
              onChange={(e) => onChange("clientName", e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 px-5 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-md bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            {mode === "edit" ? "Save changes" : "Add client"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty form ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  id: "",
  clientId: "",
  clientName: "",
};

// ─── Main component ───────────────────────────────────────────────────────────
const ClientGrid = (props) => {
  const [rows, setRows] = useState([]);
  const [updateGrid, setUpdateGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filteredRows = rows?.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return row.clientName?.toLowerCase().includes(q);
  });

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      header: "Client Name",
      accessor: "clientName",
      headerClassName: "min-w-[280px] whitespace-normal",
      cellClassName: "min-w-[280px] whitespace-normal",
      render: (value) => (
        <span className="text-sm text-slate-200">{value || "—"}</span>
      ),
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

  // ── Modal helpers ──────────────────────────────────────────────────────────
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

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    if (!formValues.clientName?.trim()) {
      toast.error("Please Enter Client Name");
      setLoading(false);
      return;
    }
    const response = await addClient(formValues, props.profile);
    if (response.status === 200 || response.status === 201) {
      toast.success(toastMessages.addClientSuccess);
      setModalOpen(false);
    } else {
      toast.error(toastMessages.serverError);
    }
    setUpdateGrid((prev) => !prev);
    setLoading(false);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clients = await listClients(props.profile);
        setRows(mapResponse(clients));
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [props.profile, updateGrid]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="relative mt-3 md:mt-4 lg:mt-5">
      <ToastContainer position="top-center" theme="colored" />

      {/* Top bar */}
      <div className="pb-4 flex justify-between gap-3 mb-3 flex-col sm:flex-row">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl">Clients</h1>
        </div>

        <div className="flex items-center gap-3 flex-col sm:flex-row">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full sm:w-64 rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 placeholder:text-slate-500"
          />

          {/* Add button */}
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex min-h-[46px] items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-amber-50 no-underline shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55 w-full sm:w-fit "
          >
            + Add client
          </button>
        </div>
      </div>

      {/* Table */}
      <MyTable
        columns={columns}
        data={filteredRows}
        keyField="id"
        emptyText={loading ? "Loading clients..." : "No clients found"}
      />

      {/* Modal */}
      <ClientFormModal
        open={modalOpen}
        mode={modalMode}
        values={formValues}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <ThoughtMateProgressLoaderAnimated />
        </div>
      )}
    </section>
  );
};

export default ClientGrid;