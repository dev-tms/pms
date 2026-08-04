import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ExternalLink } from "lucide-react";
import {
  addUsefullLink,
  deleteUsefullLink,
  listUsefullLinks,
} from "../../controller/auth/loginApis";
import toastMessages from "../../utils/ToastMassages";
import MyTable, { ActionButtons } from "../MyTable/MyTable";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated";

const mapResponse = (response) => {
  const links = Array.isArray(response?.data) ? [...response.data] : [];
  links.sort((a, b) => (a.label || "").localeCompare(b.label || ""));
  return links.map((item) => ({
    id: item.id,
    label: item.label || "",
    link: item.link || "",
  }));
};

function UsefulLinkFormModal({ open, mode, values, onChange, onClose, onSubmit }) {
  if (!open) return null;

  const inputCls =
    "app-input w-full rounded-md border px-4 py-3 text-sm outline-none transition focus:border-sky-400";
  const labelCls = "app-label mb-2 block text-sm";

  return (
    <div
      className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="app-modal w-full max-w-lg rounded-[28px] border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-sm uppercase tracking-[0.32em] text-sky-400/80">
              Useful link form
            </p>
            <h2 className="app-modal-title">
              {mode === "edit" ? "Edit useful link" : "Add useful link"}
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

        <div className="grid gap-4">
          <label className="block">
            <span className={labelCls}>Label</span>
            <input
              type="text"
              value={values.label ?? ""}
              placeholder="Enter label"
              onChange={(e) => onChange("label", e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Link</span>
            <input
              type="url"
              value={values.link ?? ""}
              placeholder="https://..."
              onChange={(e) => onChange("link", e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 app-divider border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary inline-flex items-center justify-center rounded-md border px-5 py-3 text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="btn-primary inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition"
          >
            {mode === "edit" ? "Save changes" : "Add link"}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  id: "",
  label: "",
  link: "",
};

const UsefulLinksGrid = ({ profile }) => {
  const [rows, setRows] = useState([]);
  const [updateGrid, setUpdateGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRows = rows?.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.label?.toLowerCase().includes(q) ||
      row.link?.toLowerCase().includes(q)
    );
  });

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
    if (!formValues.label?.trim()) {
      toast.error("Please enter a label");
      return;
    }
    if (!formValues.link?.trim()) {
      toast.error("Please enter a link");
      return;
    }

    setLoading(true);
    const payload = {
      label: formValues.label.trim(),
      link: formValues.link.trim(),
    };
    if (modalMode === "edit" && formValues.id) {
      payload.id = formValues.id;
    }
    console.log("usefull links payload", payload)
    const response = await addUsefullLink(payload, profile);
    if (response?.status === 200 || response?.status === 201) {
      toast.success(toastMessages.addUsefullLinkSuccess);
      setModalOpen(false);
      setUpdateGrid((prev) => !prev);
    } else {
      const message =
        response?.data?.message ||
        response?.data?.errors ||
        toastMessages.genericError;
      toast.error(typeof message === "string" ? message : toastMessages.genericError);
    }
    setLoading(false);
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    const confirmed = window.confirm(`Delete "${row.label}"?`);
    if (!confirmed) return;

    setLoading(true);
    const response = await deleteUsefullLink(row.id);
    if (response?.status === 200 || response?.status === 201) {
      toast.success(toastMessages.deleteUsefullLinkSuccess);
      setUpdateGrid((prev) => !prev);
    } else {
      toast.error(toastMessages.genericError);
    }
    setLoading(false);
  };

  const handleOpenLink = (row) => {
    if (!row?.link) {
      toast.error("No link available");
      return;
    }
    const url = /^https?:\/\//i.test(row.link) ? row.link : `https://${row.link}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const columns = [
    {
      header: "Label",
      accessor: "label",
      headerClassName: "min-w-[220px] whitespace-normal",
      cellClassName: "min-w-[220px] whitespace-normal",
      render: (value) => <span>{value || "—"}</span>,
    },
    {
      header: "Link",
      accessor: "link",
      headerClassName: "min-w-[320px] whitespace-normal",
      cellClassName: "min-w-[320px] whitespace-normal",
      render: (value, row) =>
        value ? (
          <button
            type="button"
            onClick={() => handleOpenLink(row)}
            className="font-medium text-blue-400 underline underline-offset-4 transition hover:text-blue-300 break-all text-left"
          >
            {value}
          </button>
        ) : (
          "—"
        ),
    },
    {
      header: "Action",
      accessor: "actions",
      headerClassName: "whitespace-nowrap text-center",
      cellClassName: "whitespace-nowrap text-center",
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenLink(row)}
            className="btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl border transition"
            title="Open link"
            aria-label="Open link in new tab"
          >
            <ExternalLink size={16} />
          </button>
          <ActionButtons row={row} onEdit={openEditModal} onDelete={handleDelete} />
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await listUsefullLinks();
        setRows(mapResponse(response));
      } catch (error) {
        console.error("Error fetching useful links:", error);
        toast.error(toastMessages.genericError);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [updateGrid]);

  return (
    <section className="relative mt-3 md:mt-4 lg:mt-5">
      <ToastContainer position="top-center" theme="colored" />

      <div className="pb-4 flex justify-between gap-3 mb-3 flex-col sm:flex-row">
        <div className="flex items-center gap-2">
          <h1 className="app-page-title">Useful Links</h1>
        </div>

        <div className="flex items-center gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search label / link..."
            className="app-input w-full sm:w-64 rounded-md border px-4 py-3 text-sm outline-none transition focus:border-sky-400"
          />
          <button
            type="button"
            onClick={openAddModal}
            className="btn-primary inline-flex min-h-[46px] w-full sm:w-fit items-center justify-center rounded-md px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] no-underline transition"
          >
            + Add link
          </button>
        </div>
      </div>

      <MyTable
        columns={columns}
        data={filteredRows}
        keyField="id"
        emptyText={loading ? "Loading useful links..." : "No useful links found"}
      />

      <UsefulLinkFormModal
        open={modalOpen}
        mode={modalMode}
        values={formValues}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
      />

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <ThoughtMateProgressLoaderAnimated />
        </div>
      )}
    </section>
  );
};

export default UsefulLinksGrid;
