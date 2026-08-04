import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Search, UserCheck } from 'lucide-react';
import MyTable, { ActionButtons } from '../../components/MyTable/MyTable';
import { connect } from 'react-redux';
import { addLeave, listLeaves, listUsers } from '../../controller/auth/loginApis';
import { toast } from 'react-toastify';

const mapEmployees = (leaves) => {
  if (!leaves?.data) return [];
  return leaves?.data?.map((leave) => ({
    id: leave.id,
    employeeName: leave.appliedBy?.firstName + ' ' + leave.appliedBy?.lastName || 'Unknown Employee',
    appliedBy: leave.appliedBy?.id || '',
    leaveFrom: leave.leaveFrom ? leave.leaveFrom.split('T')[0] : '',
    leaveTo: leave.leaveTo ? leave.leaveTo.split('T')[0] : '',
    numberOfLeaves: leave.numberOfLeaves || 1,
    approvedByName: (leave.approvedLeaveBy?.firstName || '-') + ' ' + (leave.approvedLeaveBy?.lastName || ''),
    approvedLeaveBy: leave.approvedLeaveBy?.id || '',
    status: leave.status || 'Applied',
  }));
};

const EMPTY_LEAVE = {
  id: '',
  appliedBy: '',
  leaveFrom: '',
  leaveTo: '',
  numberOfLeaves: 1,
  approvedLeaveBy: '',
};

const formatLeaveDate = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getMonthKey = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
};

function LeaveFormModal({ open, mode, values, onChange, onClose, onSubmit, employeeOptions, approverOptions, profile }) {
  if (!open) return null;
  return (
    <div
      className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="app-modal w-full max-w-3xl rounded-[28px] border p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-300/80">Leave Form</p>
            <h2 className="mt-2 app-modal-title">
              {mode === 'edit' ? 'Edit leave record' : 'Add leave record'}
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="app-label mb-2 block text-sm">Employee Name</span>
            <select
              value={profile?.role === "ADMIN" || profile?.role === "TL" ? values.appliedBy : profile?.id || values.appliedBy}
              disabled={!(profile?.role === "ADMIN" || profile?.role === "TL")}
              onChange={(event) => onChange('appliedBy', event.target.value)}
              className="app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400 min-h-[53px]"
            >
              <option value="">Select employee</option>
              {employeeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          {(profile?.role === "ADMIN" || profile?.role === "TL") && (
            <label className="block">
              <span className="app-label mb-2 block text-sm">Approved By</span>
              <select
                value={values.approvedLeaveBy}
                onChange={(event) => onChange('approvedLeaveBy', event.target.value)}
                className="app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400 min-h-[53px]"
              >
                <option value="">Select approver</option>
                {approverOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>)}

          <label className="block">
            <span className="app-label mb-2 block text-sm">Leave From</span>
            <input
              type="date"
              value={values.leaveFrom}
              onChange={(event) => onChange('leaveFrom', event.target.value)}
              className="app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400 min-h-[53px]"
            />
          </label>

          <label className="block">
            <span className="app-label mb-2 block text-sm">Leave To</span>
            <input
              type="date"
              value={values.leaveTo}
              onChange={(event) => onChange('leaveTo', event.target.value)}
              className="app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400 min-h-[53px]"
            />
          </label>

          <label className="block">
            <span className="app-label mb-2 block text-sm">Number of Leaves</span>
            <input
              type="number"
              min="1"
              value={values.numberOfLeaves}
              onChange={(event) => onChange('numberOfLeaves', event.target.value)}
              className="app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400 min-h-[53px]"
            />
          </label>

          {(profile?.role === "ADMIN" || profile?.role === "TL") && (
            <label className="block">
              <span className="app-label mb-2 block text-sm">Status</span>
              <select
                value={values.status}
                onChange={(event) => onChange('status', event.target.value)}
                className="app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400 min-h-[53px]"
              >
                <option value="Applied">Applied</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>)}
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
            {mode === 'edit' ? 'Save changes' : 'Add leave'}
          </button>
        </div>
      </div>
    </div>
  );
}

const Leaves = ({ profile, theme }) => {
  // console.log("theme from leaves", theme);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formValues, setFormValues] = useState(EMPTY_LEAVE);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [columns, setColumns] = useState([
    {
      header: 'Employee Name',
      accessor: 'employeeName',
      headerClassName: 'min-w-[220px] whitespace-normal',
      cellClassName: 'min-w-[220px] whitespace-normal',
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/15 text-sm font-bold text-sky-200 ${theme === 'light' ? 'bg-sky-500/15 text-sky-800' : 'bg-sky-500/15 text-sky-300'}`}>
            {value?.charAt(0)}
          </div>
          <p className="app-heading font-medium">{value}</p>
        </div>
      ),
    },
    {
      header: 'Leave From',
      accessor: 'leaveFrom',
      render: (value) => (
        <span className={`rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium  ${theme === 'light' ? 'bg-amber-500/10 text-amber-800' : 'bg-amber-500/10 text-amber-200'}`}>
          {formatLeaveDate(value)}
        </span>
      ),
    },
    {
      header: 'Leave To',
      accessor: 'leaveTo',
      render: (value) => (
        <span className={`rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium  ${theme === 'light' ? 'bg-cyan-500/10 text-cyan-800' : 'bg-cyan-500/10 text-cyan-200'}`}>
          {formatLeaveDate(value)}
        </span>
      ),
    },
    { header: 'Number Of Leaves', accessor: 'numberOfLeaves' },
    { header: 'Approved By', accessor: 'approvedByName' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span className={`rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium ${theme === 'light' ? 'bg-cyan-500/10 text-cyan-800' : 'bg-cyan-500/10 text-cyan-200'}`}>
          {value}
        </span>
      ),
    },
    /* {
      header: 'Action',
      accessor: 'actions',
      headerClassName: 'whitespace-nowrap text-center',
      cellClassName: 'whitespace-nowrap text-center',
      render: (_, row) => (
        <div className="flex justify-center">
          <ActionButtons row={row} onEdit={() => openEditModal(row)} onDelete={() => handleDelete(row.id)} />
        </div>
      ),
    }, */
  ]);

  useEffect(() => {
    async function fetchProfile() {
      if (profile) {
        const leaves = await listLeaves(profile);
        if (leaves) {
          setLeaveRecords(mapEmployees(leaves));
        }
        const emp = await listUsers(profile);
        if (emp?.data) {
          setEmployees(emp.data);
        }
      }
    }
    fetchProfile();

    setColumns(prevColumns => {
      return profile && (profile.role === 'ADMIN' || profile.role === 'TL') && !prevColumns.find(c => c.accessor === "actions") ? [
        ...prevColumns,
        {
          header: 'Action',
          accessor: 'actions',
          headerClassName: 'whitespace-nowrap text-center',
          cellClassName: 'whitespace-nowrap text-center',
          render: (_, row) => (
            <div className="flex justify-center">
              <ActionButtons row={row} onEdit={() => openEditModal(row)} /* onDelete={() => handleDelete(row.id)} */ />
            </div>
          ),
        }] : columns
    });
  }, [profile, refreshFlag]);

  const employeeOptions = useMemo(() => {
    return employees?.filter((emp) => emp.role !== 'ADMIN').map((emp) => ({ id: emp.id, name: emp.firstName + ' ' + emp.lastName }));
  }, [employees]);

  const approverOptions = useMemo(() => {
    return employees?.filter((emp) => emp.role === 'ADMIN' || emp.role === 'TL').map((emp) => ({ id: emp.id, name: emp.firstName + ' ' + emp.lastName }));
  }, [employees]);

  const filteredRecords = useMemo(() => {
    const keyword = search.toLowerCase();
    return leaveRecords.filter((record) => {
      return (
        !keyword ||
        record.employeeName.toLowerCase().includes(keyword) ||
        record.approvedByName.toLowerCase().includes(keyword)
      );
    });
  }, [leaveRecords, search]);

  const groupedByMonth = useMemo(() => {
    return filteredRecords.reduce((accumulator, record) => {
      const monthKey = getMonthKey(record.leaveFrom

      );
      if (!accumulator[monthKey]) {
        accumulator[monthKey] = [];
      }
      accumulator[monthKey].push(record);
      return accumulator;
    }, {});
  }, [filteredRecords]);

  const monthSections = useMemo(() => {
    return Object.entries(groupedByMonth).sort((first, second) => {
      const firstDate = new Date(first[1][0]?.leaveFrom || 0).getTime();
      const secondDate = new Date(second[1][0]?.leaveTo || 0).getTime();
      return secondDate - firstDate;
    });
  }, [groupedByMonth]);



  const openAddModal = () => {
    setModalMode('add');
    setFormValues(EMPTY_LEAVE);
    setModalOpen(true);
    if (profile?.role !== "ADMIN" && profile?.role !== "TL") {
      setFormValues((prev) => ({ ...prev, appliedBy: profile?.id || '' }));
    }
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setFormValues({
      ...record,
      numberOfLeaves: String(record.numberOfLeaves),
    });
    setModalOpen(true);
  };

  /* const handleDelete = (recordId) => {
    setLeaveRecords((prev) => prev.filter((record) => record.id !== recordId));
  }; */

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const normalizedRecord = {
      ...formValues,
      id: formValues.id,
      appliedBy: formValues.appliedBy,
      leaveFrom: formValues.leaveFrom || '',
      leaveTo: formValues.leaveTo || formValues.leaveFrom || '',
      numberOfLeaves: Number(formValues.numberOfLeaves) || 1,
      approvedBy: formValues.approvedBy,
    };

    const newLeave = await addLeave(normalizedRecord, profile);
    if (newLeave.status === 200) {
      toast.success('Leave record added successfully');
    } else {
      toast.error('Failed to add leave record');
    }
    setModalOpen(false);
    setFormValues(EMPTY_LEAVE);
    setRefreshFlag(!refreshFlag);
  };

  return (
    <section className=" py-4 md:py-6  lg:py-8">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800/80 app-panel p-5 md:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 app-panel" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Time Off</p>
              <h1 className="mt-3 app-page-title">Leave Management</h1>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
            >
              <Plus size={16} />
              Add Leave
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-slate-800/80 app-panel p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
              <div className="inline-flex rounded-2xl bg-sky-500/12 p-2 text-sky-200"><CalendarDays size={18} /></div>
              <p className="mt-4 app-heading text-3xl font-bold">{leaveRecords.length}</p>
              <p className="mt-2 text-sm text-slate-400">Total leave records</p>
            </div>
            <div className="rounded-[26px] border border-slate-800/80 app-panel p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
              <div className="inline-flex rounded-2xl bg-amber-500/12 p-2 text-amber-200"><UserCheck size={18} /></div>
              <p className="mt-4 app-heading text-3xl font-bold">{filteredRecords.length}</p>
              <p className="mt-2 text-sm text-slate-400">Visible after filtering</p>
            </div>
          </div>

          <div className="mt-8 bg-transparent">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between  bg-transparent">
              <div className="relative w-full md:max-w-md">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by employee or approver"
                  className="app-input w-full rounded-2xl border px-11 py-3 text-sm outline-none transition focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {monthSections.length === 0 ? (
              <div className="rounded-[30px] border border-slate-800/80 app-panel p-8 text-center text-sm text-slate-400 shadow-[0_20px_45px_rgba(2,6,23,0.22)]">
                No leave records found.
              </div>
            ) : (
              monthSections.map(([month, records]) => (
                <div key={month} className="rounded-[30px] border border-slate-800/80 app-panel p-4 shadow-[0_20px_45px_rgba(2,6,23,0.22)] md:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3 app-divider border-b pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">Monthly Leave Table</p>
                      <h2 className="mt-2 app-modal-title">{month}</h2>
                    </div>
                    <span className={`rounded-2xl px-4 py-2 text-sm font-medium ${theme === 'light' ? 'text-sky-800' : 'text-sky-200'}`}>
                      {records.length} records
                    </span>
                  </div>
                  <MyTable
                    columns={columns}
                    data={records}
                    keyField="id"
                    caption=""
                    emptyText="No leave records for this month"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <LeaveFormModal
        open={modalOpen}
        mode={modalMode}
        values={formValues}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        employeeOptions={employeeOptions}
        approverOptions={approverOptions}
        profile={profile}
      />
    </section>
  );
};

const mapStateToProps = (state) => ({
  profile: state.session.user?.user,
});

export default connect(mapStateToProps)(Leaves);
