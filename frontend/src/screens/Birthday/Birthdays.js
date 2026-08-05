import React, { useEffect, useMemo, useState } from 'react';
import { Cake, CalendarDays, Search, Users } from 'lucide-react';
import MyTable from '../../components/MyTable/MyTable';
import { listUsers } from '../../controller/auth/loginApis';
import { connect } from 'react-redux';

const mapEmployees = (employees) => {
  return employees.data?.filter((employee) => employee.status === 'Active').map((employee) => ({
    id: employee.id,
    name: employee.firstName + ' ' + employee.lastName,
    department: employee.role,
    designation: employee.designation,
    birthDate: employee.birthDate ? formatBirthDate(employee.birthDate) : '',
    rawBirthDate: employee.birthDate || '',
  }));
}

const EMPTY_EMPLOYEE = {
  id: '',
  name: '',
  department: '',
  designation: '',
  birthDate: '',
  rawBirthDate: '',
};

const formatBirthDate = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
};

const parseBirthDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getNextBirthdayDate = (birthDateValue) => {
  const birthDate = parseBirthDate(birthDateValue);
  if (!birthDate) return null;

  const today = new Date();
  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (nextBirthday < today && nextBirthday.toDateString() !== today.toDateString()) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }

  return nextBirthday;
};

const getBirthdaySortValue = (employee) => {
  const nextBirthday = getNextBirthdayDate(employee.rawBirthDate ?? employee.birthDate);
  return nextBirthday ? nextBirthday.getTime() : Number.MAX_SAFE_INTEGER;
};

const getUpcomingCount = (employees) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  return employees.filter((employee) => {
    const birthDate = parseBirthDate(employee.rawBirthDate ?? employee.birthDate);
    return birthDate?.getMonth() === currentMonth;
  }).length;
};

const getNextBirthday = (employees) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const upcomingBirthdays = employees.filter((employee) => {
    const birthDate = parseBirthDate(employee.rawBirthDate ?? employee.birthDate);
    return (
      birthDate &&
      birthDate.getMonth() === currentMonth &&
      birthDate.getDate() >= currentDate
    );
  });

  if (upcomingBirthdays.length === 0) {
    return "-";
  }

  upcomingBirthdays.sort((a, b) => getBirthdaySortValue(a) - getBirthdaySortValue(b));

  return formatBirthDate(upcomingBirthdays[0].rawBirthDate ?? upcomingBirthdays[0].birthDate).split(' ').slice(0, 2).join(' ');
}

function BirthdayFormModal({ open, mode, values, onChange, onClose, onSubmit }) {
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
            <p className="text-sm uppercase tracking-[0.32em] text-sky-300/80">Employee Birthday</p>
            <h2 className="mt-2 app-modal-title">
              {mode === 'edit' ? 'Edit employee birthday' : 'Add employee birthday'}
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
          {[
            ['Employee Name', 'name', 'text'],
            ['Department', 'department', 'text'],
            ['Designation', 'designation', 'text'],
          ].map(([label, field, type]) => (
            <label key={field} className="block">
              <span className="app-label mb-2 block text-sm">{label}</span>
              <input
                type={type}
                value={values[field]}
                onChange={(event) => onChange(field, event.target.value)}
                className="app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400"
              />
            </label>
          ))}

          <label className="block">
            <span className="app-label mb-2 block text-sm">Birth Date</span>
            <input
              type="date"
              value={values.birthDate}
              onChange={(event) => onChange('birthDate', event.target.value)}
              className="app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400"
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
            {mode === 'edit' ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

const Birthdays = ({ profile, theme }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formValues, setFormValues] = useState(EMPTY_EMPLOYEE);

  useEffect(() => {
    async function fetchProfile() {
      if (profile) {
        const employeeList = await listUsers(profile);
        if (employeeList) {
          setEmployees(mapEmployees(employeeList));
        } else {
          setEmployees(mapEmployees({ data: [profile] }));
        }
      }
    }
    fetchProfile();
  }, [profile]);

  const columns = [
    {
      header: 'Employee',
      accessor: 'name',
      headerClassName: 'min-w-[220px] whitespace-normal',
      cellClassName: 'min-w-[220px] whitespace-normal',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/15 text-sm font-bold ${theme === 'light' ? 'bg-sky-500/15 text-sky-800' : 'bg-sky-500/15 text-sky-200'}`}>
            {value?.charAt(0)}
          </div>
          <div>
            <p className="app-heading font-medium">{value}</p>
            <p className="text-sm text-slate-400">{row.designation}</p>
          </div>
        </div>
      ),
    },
    { header: 'Role', accessor: 'department' },
    {
      header: 'Birthday',
      accessor: 'birthDate',
      render: (value) => (
        <span className={`rounded-full bg-pink-500/10 px-3 py-1 text-sm font-medium ${theme === 'light' ? 'bg-pink-500/10 text-pink-800' : 'bg-pink-500/10 text-pink-200'}`}>
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
  ];

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const keyword = search.toLowerCase();
      return (
        !keyword ||
        employee.name.toLowerCase().includes(keyword) ||
        employee.department?.toLowerCase().includes(keyword) ||
        employee.designation?.toLowerCase().includes(keyword)
      );
    });
  }, [employees, search]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => getBirthdaySortValue(a) - getBirthdaySortValue(b));
  }, [filteredEmployees]);

  /* const openAddModal = () => {
    setModalMode('add');
    setFormValues(EMPTY_EMPLOYEE);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setModalMode('edit');
    setFormValues(employee);
    setModalOpen(true);
  }; */

  /* const handleDelete = (employeeId) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId));
  }; */

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const normalizedEmployee = {
      ...formValues,
      id: formValues.id || `employee-${Date.now()}`,
      name: formValues.name.trim() || 'Unnamed Employee',
      department: formValues.department.trim() || '-',
      designation: formValues.designation.trim() || '-',
      birthDate: formValues.birthDate ? formatBirthDate(formValues.birthDate) : '',
      rawBirthDate: formValues.birthDate || '',
    };

    setEmployees((prev) =>
      modalMode === 'edit'
        ? prev.map((employee) => (employee.id === normalizedEmployee.id ? normalizedEmployee : employee))
        : [normalizedEmployee, ...prev]
    );

    setModalOpen(false);
    setFormValues(EMPTY_EMPLOYEE);
  };

  return (
    <section className="py-4 md:py-6 lg:py-8">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800/80 app-panel p-5 md:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 app-panel" />

        <div className="relative z-10">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-pink-300">Celebrations</p>
              <h1 className="mt-3 app-page-title">Employees Birthdays</h1>

            </div>
            {/* <button
              type="button"
              onClick={openAddModal}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
            >
              <Plus size={16} />
              Add Employee Birthday
            </button> */}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="app-card rounded-[24px] border p-5">
              <div className="inline-flex rounded-2xl bg-pink-500 p-2 text-pink-200"><Users size={18} /></div>
              <p className="mt-4 app-heading text-3xl font-bold">{employees.length}</p>
              <p className="app-muted mt-2 text-sm">Total employees listed</p>
            </div>
            <div className="app-card rounded-[24px] border p-5">
              <div className="inline-flex rounded-2xl bg-sky-500 p-2 text-sky-200"><CalendarDays size={18} /></div>
              <p className="mt-4 app-heading text-3xl font-bold">{getUpcomingCount(employees)}</p>
              <p className="app-muted mt-2 text-sm">Birthdays this month</p>
            </div>
            <div className="app-card rounded-[24px] border p-5">
              <div className="inline-flex rounded-2xl bg-rose-500 p-2 text-rose-200"><Cake size={18} /></div>
              <p className="mt-4 app-heading text-3xl font-bold">
                {employees.length ? getNextBirthday(employees) : '-'}
              </p>
              <p className="app-muted mt-2 text-sm">Next row birthday snapshot</p>
            </div>
          </div>

          <div className="app-card mt-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by employee, department, or role"
                  className="app-input w-full rounded-2xl border px-11 py-3 text-sm outline-none transition focus:border-pink-400"
                />
              </div>

            </div>

            <div className="mt-5">
              <MyTable
                columns={columns}
                data={sortedEmployees}
                keyField="id"
                caption=""
                emptyText="No birthday records found"
              />
            </div>
          </div>
        </div>
      </div>

      <BirthdayFormModal
        open={modalOpen}
        mode={modalMode}
        values={formValues}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

const mapStateToProps = (state) => ({
  profile: state.session.user?.user,
});

export default connect(mapStateToProps)(Birthdays);
