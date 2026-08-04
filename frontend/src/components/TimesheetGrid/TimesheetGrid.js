import React, { useEffect, useRef, useState } from "react";
import { approveHours, getTimesheetPage, listUsers, updateHoursStatus } from "../../controller/auth/loginApis";
import { Link } from "react-router-dom";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { AddUpdateTimesheet } from "../../screens/AddUpdateTimesheet/AddUpdateTimesheet";
import { toast } from 'react-toastify';
import toastMessages from "../../utils/ToastMassages";
import ConfirmDialog from "../ConfirmDialog";
import { dateMax, dateMin, timeToMills } from "../../utils"
import MyTable from "../MyTable/MyTable";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import 'react-toastify/dist/ReactToastify.css';

const filterLabelClassName = "app-label mb-0 text-sm font-semibold uppercase tracking-[0.5px]";
const filterInputClassName = "app-input w-full min-w-[240px] rounded-md border px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/15 h-[50px]";
const ghostActionButtonClassName = "btn-secondary inline-flex min-h-[46px] items-center justify-center rounded-md border px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] no-underline transition disabled:cursor-not-allowed disabled:opacity-55";
const primaryActionButtonClassName = "btn-primary inline-flex min-h-[46px] items-center justify-center rounded-md px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] no-underline transition disabled:cursor-not-allowed disabled:opacity-55";
const secondaryActionButtonClassName = primaryActionButtonClassName;
const warningActionButtonClassName = primaryActionButtonClassName;
const iconButtonClassName = "btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl border transition";
const totalsCardClassName = "app-card mt-5 ml-auto w-full max-w-full sm:max-w-fit rounded-md border shadow-[0_14px_34px_rgba(2,6,23,0.08)]";


const calculateHours = (mills) => {
  if (!mills || mills === 0) return '00';
  let value = parseInt(mills / (1000 * 60 * 60));
  return value < 10 ? `0${value}` : `${value}`;
}
const calculateMinutes = (mills) => {
  if (!mills || mills === 0) return '00';
  let value = parseInt(mills % (1000 * 60 * 60)) / (1000 * 60);
  return value < 10 ? `0${value}` : `${value}`;
}

const mapResponse = (timesheets, tasks, works, loggedInUser, executionDateFilter, selectedUser) => {

  let clientByWorkId = {};
  works?.forEach((work) => {
    clientByWorkId[work.id] = work?.project?.client?.clientName;
  });
  let sheets = timesheets?.map((timesheet, index) => {
    let sheet = {
      id: timesheet.id,
      _id: timesheet.id,
      status: timesheet.status,
      taskType: timesheet.taskType,
      action: timesheet.action,
      links: timesheet.links,
      comments: timesheet.comments,
      timeSpentMills: timesheet.timeSpentMills,
      timeSpentHours: calculateHours(timesheet.timeSpentMills),
      timeSpentMinutes: calculateMinutes(timesheet.timeSpentMills),
      approvedHoursMills: timesheet.approvedHoursMills,
      approvedHours: calculateHours(timesheet.approvedHoursMills),
      approvedMinutes: calculateMinutes(timesheet.approvedHoursMills),
      workName: timesheet.work?.workName,
      workId: timesheet.work?.id,
      clientName: clientByWorkId[timesheet.work?.id],
      taskName: timesheet.task?.taskName,
      taskId: timesheet.task?.id,
      assignedToName: timesheet.assignedTo?.firstName + ' ' + timesheet.assignedTo?.lastName,
      assignedToId: timesheet.assignedTo?.id,
      qaName: timesheet.qa?.firstName + ' ' + timesheet.qa?.lastName,
      qaId: timesheet.qa?.id,
      executionDate: timesheet.executionDate ? new Date(timesheet.executionDate) : '',
      hoursStatus: timesheet.hoursStatus
    };
    return sheet;
  });

  let hierarchicalData = [];
  // if(sheets && sheets.length > 0) {
  hierarchicalData = Object.values(
    sheets.reduce((acc, obj) => {
      const executionDate = obj.executionDate;
      if (!acc[executionDate]) {
        acc[executionDate] = { executionDate, assignedTo: [] };
      }

      let assignedUser = acc[executionDate].assignedTo.find(user => user.id === obj.assignedToId);
      if (!assignedUser) {
        assignedUser = { id: obj.assignedToId, name: obj.assignedToName, tasks: [] };
        acc[executionDate].assignedTo.push(assignedUser);
      }
      assignedUser.tasks.push(obj);
      let hoursStatus = 0;
      assignedUser.timeSpentMills = 0;
      assignedUser.approvedHoursMills = 0;
      assignedUser.tasks.forEach((task) => {
        assignedUser.timeSpentMills += task.timeSpentMills;
        assignedUser.approvedHoursMills += task.approvedHoursMills;
        if (hoursStatus < task.hoursStatus) {
          hoursStatus = task.hoursStatus;
        }
      })
      assignedUser.hoursStatus = hoursStatus;

      return acc;
    }, {})
  );

  // if(loggedInUser.role !== 'ADMIN') {
  let isTodayForTasks = false;
  hierarchicalData.forEach((item) => {
    if (dateTimeFormatDate(item.executionDate) === "Today" && dateTimeFormatDate(executionDateFilter) === "Today" && (selectedUser === '' || selectedUser === loggedInUser.id)) {
      isTodayForTasks = true;
      let unfilledTimesheetTasks = [];
      item?.assignedTo[0]?.tasks?.forEach((task) => {
        // today.push(item);
        unfilledTimesheetTasks.push(task.taskId);
      });
      let userIndex = -1;
      item?.assignedTo?.forEach((assignedUser, ui) => {
        if (assignedUser.id === loggedInUser.id) {
          userIndex = ui;
        }
      });
      if (userIndex < 0) {
        if (!item?.assignedTo) { item.assignedTo = []; }
        item?.assignedTo.push({ hoursStatus: 0, id: loggedInUser.id, name: loggedInUser.firstName + ' ' + loggedInUser.lastName, tasks: [] });
        userIndex = item?.assignedTo.length - 1;
      }
      tasks?.forEach((task, index) => {
        if (!unfilledTimesheetTasks.includes(task.id)) {
          let sheet = {
            id: index,
            _id: '',
            status: task?.status,
            taskType: '',
            action: '',
            links: '',
            comments: '',
            timeSpentHours: '00',
            timeSpentMinutes: '00',
            approvedHours: '00',
            approvedMinutes: '00',
            timeSpentMills: 0,
            approvedHoursMills: 0,
            workName: task.work?.workName,
            workId: task.work?.id,
            clientName: clientByWorkId[task.work?.id],
            taskName: task?.taskName,
            taskId: task?.id,
            assignedToName: task.assignedTo?.firstName + ' ' + task.assignedTo?.lastName,
            assignedToId: task.assignedTo?.id,
            qaName: task.qa?.firstName + ' ' + task.qa?.lastName,
            qaId: task.qa?.id,
            executionDate: new Date()
          };
          if (sheet.assignedToId === loggedInUser.id && ((task.status === '11' && dateTimeFormatDate(task.updatedAt) === "Today") || task.status !== '11' || task?.work?.workName === 'Morning Meeting'))
            item?.assignedTo[userIndex]?.tasks.push(sheet);
        }
      });
    }
  });
  if (!isTodayForTasks && dateTimeFormatDate(executionDateFilter) === "Today" && (selectedUser === '' || selectedUser === loggedInUser.id)) {
    let todaySheets = { executionDate: new Date(), assignedTo: [{ hoursStatus: 0, id: loggedInUser.id, name: loggedInUser.firstName + ' ' + loggedInUser.lastName, tasks: [] }] }
    tasks?.forEach((task, index) => {
      let sheet = {
        id: index,
        _id: '',
        status: task?.status,
        taskType: '',
        action: '',
        links: '',
        comments: '',
        timeSpentHours: '00',
        timeSpentMinutes: '00',
        approvedHours: '00',
        approvedMinutes: '00',
        timeSpentMills: 0,
        approvedHoursMills: 0,
        workName: task.work?.workName,
        workId: task.work?.id,
        clientName: clientByWorkId[task.work?.id],
        taskName: task?.taskName,
        taskId: task?.id,
        assignedToName: task.assignedTo?.firstName + ' ' + task.assignedTo?.lastName,
        assignedToId: task.assignedTo?.id,
        qaName: task.qa?.firstName + ' ' + task.qa?.lastName,
        qaId: task.qa?.id,
        executionDate: new Date()
      };
      if (task.assignedTo.id === loggedInUser.id && ((task.status === '11' && dateTimeFormatDate(task.updatedAt) === "Today") || task.status !== '11' || task?.work?.workName === 'Morning Meeting'))
        todaySheets?.assignedTo[0]?.tasks.push(sheet);
    });
    hierarchicalData.push(todaySheets);
  }
  hierarchicalData.sort((a, b) => new Date(b.executionDate).toISOString().localeCompare(new Date(a.executionDate).toISOString()));
  // }
  // }

  hierarchicalData.forEach(record => {
    record.assignedTo.sort((a, b) => {
      // ✅ If either a or b is the target ID, keep it at the top
      if (a.id === loggedInUser.id && b.id !== loggedInUser.id) return -1;
      if (b.id === loggedInUser.id && a.id !== loggedInUser.id) return 1;

      // ✅ Otherwise, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  });
  console.log('hierarchicalData', hierarchicalData);
  return { hierarchicalData };
};

const formatDate = (dateStr) => {
  let date = new Date();
  let Y = date.getFullYear();
  let M = (date.getMonth() + 1).toString().padStart(2, '0');
  let D = (date.getDate()).toString().padStart(2, '0');
  if (`${Y}-${M}-${D}` === dateStr) {
    return 'Today';
  } else {
    return dateStr;
  }
}

const dateTimeFormatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = {
    weekday: 'short', // "Mon", 'long' => "Monday"
    day: '2-digit',   // "16"
    month: 'short',   // "Dec"
    year: 'numeric'   // "2024"
  };
  const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);
  const today = new Date();
  if (today.getDate() === date.getDate() && today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear()) {
    return "Today"
  }
  return formattedDate;
}

const TimesheetGrid = (props) => {
  const [rowData, setRowData] = useState(null);
  const [open, setOpen] = useState(false);
  const [updateGrid, setUpdateGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hierarchicalData, setHierarchicalData] = useState([]);
  const [executionDate, setExecutionDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState(props?.profile?.id || '');
  const isFirstLoadRef = useRef(true);
  const [fetchRecords, setFetchRecords] = useState(false);
  const [addTimesheetToUser, setAddTimesheetToUser] = useState(props?.profile?.id);

  // const [users, setUsers] = useState([]);
  const [usersForFilter, setUsersForFilter] = useState([]);

  const closeModal = () => {
    setOpen(false);
  };

  const renderHourBadge = (value, variant) => {
    const toneClassName = variant === "approved"
      ? "border border-rose-500/20 bg-rose-500/15 text-rose-300"
      : variant === "submitted"
        ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
        : "border border-slate-600/40 bg-slate-700/40 text-slate-300";

    return (
      <div className={`w-full rounded-md px-3 py-2 text-center text-sm font-bold tracking-[0.04em] ${toneClassName}`}>
        {value}
      </div>
    );
  };


  const getTableColumns = ({ canEdit, showApprovedHours }) => {
    const columns = [
      {
        header: "Client",
        accessor: "clientName",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[100px] whitespace-normal text-slate-200",
      },
      {
        header: "Work",
        accessor: "workName",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[220px] whitespace-normal text-slate-200",
      },
      {
        header: "Task",
        accessor: "taskName",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[220px] whitespace-normal text-slate-200",
      },
      {
        header: "Status",
        accessor: "status",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[150px] whitespace-normal text-slate-200",
        render: (value) => <StatusBadge value={value} />,
      },
      {
        header: "Task Type",
        accessor: "taskType",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[110px] whitespace-normal text-slate-200",
      },
      {
        header: "Action",
        accessor: "action",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[120px] whitespace-normal text-slate-200",
      },
      {
        header: "Links",
        accessor: "links",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[180px] whitespace-normal text-slate-200",
        render: (value) => value && value !== "-" ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue-400 underline underline-offset-4 transition hover:text-blue-300 break-all"
          >
            {value}
          </a>
        ) : "-",
      },
      {
        header: "Comments",
        accessor: "comments",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[200px] whitespace-normal text-slate-200",
      },
      {
        header: "Time Spent",
        accessor: "timeSpent",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[140px] whitespace-nowrap",
        render: (_, row) => (
          renderHourBadge(
            row.timeSpentHours + ':' + row.timeSpentMinutes,
            row.hoursStatus === 1 ? "submitted" : "default"
          )
        ),
      },
    ];

    if (showApprovedHours) {
      columns.push({
        header: "Approved Hours",
        accessor: "approvedHours",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[140px] whitespace-nowrap",
        render: (_, row) => (
          renderHourBadge(
            row.approvedHours + ':' + row.approvedMinutes,
            row.hoursStatus === 2 ? "approved" : "default"
          )
        ),
      });
    }

    if (canEdit) {
      columns.push({
        header: "Action",
        accessor: "edit",
        headerClassName: "text-slate-300",
        cellClassName: "min-w-[80px] whitespace-nowrap",
        render: (_, row) => (
          (!row.hoursStatus || row.hoursStatus === 0 || props?.profile?.role === 'ADMIN' || props?.profile?.role === 'TL') && row?.hoursStatus !== 2 ? (
            <button
              type="button"
              className={iconButtonClassName}
              onClick={() => {
                setOpen(true);
                setRowData(row);
                setAddTimesheetToUser(row.assignedToId);
              }}
            >
              <ModeEditOutlineIcon className="action_icon" />
            </button>
          ) : "-"
        ),
      });
    }

    return columns;
  };

  const updateUserTasks = (data, executionDate, userId, updater) => {
    return data.map(day => {
      if (dateTimeFormatDate(day.executionDate) !== executionDate) return day;

      return {
        ...day,
        assignedTo: day.assignedTo.map(user => {
          if (user.id !== userId) return user;

          const updatedTasks = user.tasks.map(updater);
          const newHoursStatus = Math.max(...updatedTasks.map(t => t.hoursStatus || 0));
          user.timeSpentMills = 0;
          user.approvedHoursMills = 0;
          user.tasks.forEach((task) => {
            user.timeSpentMills += task.timeSpentMills;
            user.approvedHoursMills += task.approvedHoursMills;
          })

          return { ...user, tasks: updatedTasks, hoursStatus: newHoursStatus };
        })
      };
    });
  };

  // ---- Submit Timesheet Hours ----
  const submitTimesheetHours = async (e) => {
    const [dateKey, userId] = e?.target?.id.split('__');
    setLoading(true);

    try {
      const submittedIds = [];
      let updatedData = updateUserTasks(hierarchicalData, dateKey, userId, (t) => {
        if (t._id && !t.hoursStatus) {
          submittedIds.push(t.id);
          return { ...t, hoursStatus: 1 };
        }
        return t;
      });

      if (submittedIds.length === 0) {
        toast.warn(toastMessages.noTimesheetHourToSubmit);
        return;
      }

      const response = await updateHoursStatus({ timesheetIds: submittedIds, status: 1 }, props.profile);
      if (response?.data) {
        setHierarchicalData(updatedData);
        toast.success(`${toastMessages.saveTimesheetHourSubmissionSuccess} For ${response.data.count} sheet(s).`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error submitting timesheet hours.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Copy Timesheet Hours ----
  const copyTimesheetHours = async (e) => {
    const [dateKey, userId] = e?.target?.id.split('__');
    setLoading(true);

    try {
      let copied = false;
      let updatedData = updateUserTasks(hierarchicalData, dateKey, userId, (t) => {
        if (t._id && (t.hoursStatus === 1 || t.hoursStatus === 2 || t.hoursStatus === 0)) { // remove 0 and 2 after testing
          copied = true;
          return {
            ...t,
            approvedHours: t.timeSpentHours,
            approvedMinutes: t.timeSpentMinutes,
            approvedHoursMills: timeToMills(t.timeSpentHours, t.timeSpentMinutes)
          };
        }
        return t;
      });

      if (!copied) {
        toast.warn(toastMessages.noTimesheetHourToCopy);
      } else {
        setHierarchicalData(updatedData);
        toast.success(toastMessages.copyTimesheetHourSuccess);
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Error copying timesheet hours.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Approve Timesheet Hours ----
  const approveTimesheetHours = async (e) => {
    const [dateKey, userId] = e?.target?.id.split('__');
    setLoading(true);

    try {
      const sheetsToApprove = [];
      let updatedData = updateUserTasks(hierarchicalData, dateKey, userId, (t) => {
        if (t._id && (t.hoursStatus === 1 || t.hoursStatus === 2 || t.hoursStatus === 0) && t.approvedHoursMills > 0) { // remove 2 after testing
          sheetsToApprove.push(t);
          return { ...t, hoursStatus: 2 };
        }
        return t;
      });

      if (sheetsToApprove.length === 0) {
        toast.warn(toastMessages.noTimesheetHourToApprove);
        return;
      }

      const response = await approveHours({ timesheets: sheetsToApprove, status: 2 }, props.profile);
      if (response?.data) {
        setHierarchicalData(updatedData);
        toast.success(`${toastMessages.saveTimesheetHourApprovedSuccess} For ${response.data.count} sheet(s).`);
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Error approving timesheet hours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (executionDate === undefined || executionDate === "") {
      setExecutionDate(new Date());
    }
    if (!isFirstLoadRef.current) {
      const timer = setTimeout(() => {
        setFetchRecords(prev => !prev);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [executionDate, selectedUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await getTimesheetPage(props.profile, executionDate, selectedUser);
        console.log("responseeeeee", response);
        const { taskList = [], workList = [], timesheets = [] } = response?.data || {};
        // console.log("timesheets", timesheets);
        let data = mapResponse(timesheets, taskList, workList, props.profile, executionDate, isFirstLoadRef.current ? props?.profile?.id : selectedUser);
        setHierarchicalData(data?.hierarchicalData);

        const userList = await listUsers(props.profile);
        let developerList = userList?.data.filter(user => user.role !== 'QA');
        developerList.sort((a, b) => a.firstName.localeCompare(b.firstName));
        if (props?.profile?.role !== 'ADMIN') {
          setUsersForFilter(developerList.filter(user => user.role !== 'ADMIN' && (user.TLId === props?.profile?.id || user.id === props?.profile?.id)));
        } else {
          setUsersForFilter(developerList);
        }

        isFirstLoadRef.current = false;
      } catch (error) {
        console.error("Error fetching Timesheet data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (props?.profile) {
      fetchData();
    }
  }, [props.profile, updateGrid, fetchRecords]);

  return (
    <section className="relative mt-3 md:mt-4 lg:mt-5">
      <div className=" sm:mb-7 flex justify-between flex-col sm:flex-row  max-[880px]:pb-5 ">
        <div>
          <h1 className="app-page-title mb-3">
            Timesheet
          </h1>
        </div>
        <form className="flex w-full flex-wrap sm:items-end sm:justify-end gap-4 ">
          <label htmlFor="filterDate" className="flex min-w-full sm:min-w-[240px] flex-col gap-2">
            <span className={filterLabelClassName}>Filter by Date</span>
            <input
              id="filterDate"
              type="date"
              name="filterDate"
              min={dateMin(14)}
              max={dateMax()}
              className={filterInputClassName}
              value={executionDate.toISOString().split('T')[0]}
              onChange={(e) => setExecutionDate(e.target.value === "" ? new Date() : new Date(e.target.value))}
            />
          </label>
          {(props?.profile?.role === 'ADMIN' || props?.profile?.role === 'TL') && <label htmlFor="filterUser" className="flex min-w-full sm:min-w-[240px] flex-col gap-2">
            <span className={filterLabelClassName}>Filter by Employee</span>
            <select
              id="filterUser"
              name="selectedUser"
              className={`${filterInputClassName} appearance-none pr-10`}
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Employees</option>
              {usersForFilter.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </label>}
        </form>
      </div>

      <>
        {hierarchicalData.map((sheet, index) => (
          <div key={index}>
            <div className="mb-4 text-center">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight ">{dateTimeFormatDate(sheet.executionDate)}</h1>
            </div>
            {sheet.assignedTo.map((user, index2) => (
              <div key={index - index2} className={index2 > 0 ? "mt-14" : ""}>
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-4 max-[783px]:items-start">
                    <div><h2 className="m-0 text-[25px] leading-none ">{user.name}</h2></div>
                    <div className="flex flex-wrap justify-end gap-3 max-[783px]:w-full max-[783px]:justify-start " dataval={dateTimeFormatDate(sheet.executionDate)}>
                      {dateTimeFormatDate(sheet.executionDate) === 'Today' && <Link
                        className={ghostActionButtonClassName}
                        onClick={() => {
                          setOpen(true);
                          setRowData({});
                          setAddTimesheetToUser(user.id);
                        }}
                        to={{
                          state: {},
                        }}
                      >
                        Add
                      </Link>}
                      {/* dateTimeFormatDate(sheet.executionDate) === 'Today' && */ user.tasks?.length > 0 && user.hoursStatus === 0 && <ConfirmDialog
                        buttonName="SUBMIT HOURS"
                        buttonClassName={primaryActionButtonClassName}
                        id={dateTimeFormatDate(sheet.executionDate) + "__" + user.id}
                        title="Confirm Submit Hours"
                        message="Are you sure you want to submit hours?"
                        onConfirm={submitTimesheetHours}
                        disabled={loading}
                      />}
                      {(props?.profile?.role === 'ADMIN' || props?.profile?.role === 'TL') && user.tasks?.length > 0 && (user.hoursStatus === 1 || user.hoursStatus === 2) && <button  /* remove user.hoursStatus === 2 after testing */
                        onClick={copyTimesheetHours}
                        id={dateTimeFormatDate(sheet.executionDate) + "__" + user.id}
                        disabled={loading}
                        className={secondaryActionButtonClassName}
                        type="button"
                      >
                        Copy Hours
                      </button>}
                      {(props?.profile?.role === 'ADMIN' || props?.profile?.role === 'TL') && user.tasks?.length > 0 && (user.hoursStatus === 1 || user.hoursStatus === 2) && <ConfirmDialog   /* remove user.hoursStatus === 2 after testing */
                        buttonName="APPROVE HOURS"
                        buttonClassName={warningActionButtonClassName}
                        id={dateTimeFormatDate(sheet.executionDate) + "__" + user.id}
                        title="Confirm Approve Hours"
                        message="Are you sure you want to approve hours?"
                        onConfirm={approveTimesheetHours}
                        disabled={loading}
                      />}
                    </div>
                  </div>
                  <MyTable
                    columns={getTableColumns({
                      canEdit: formatDate(dateTimeFormatDate(sheet.executionDate)) === 'Today' || ((props?.profile?.role === 'ADMIN' || props?.profile?.role === 'TL') && user.hoursStatus !== 2),
                      showApprovedHours: props?.profile?.role === 'ADMIN' || props?.profile?.role === 'TL',
                    })}
                    data={user.tasks}
                    keyField="id"
                    emptyText={loading ? "Loading timesheets..." : "No timesheet records found"}
                  />
                </div>
                {/* <div className="flex justify-end">
                  <div className={totalsCardClassName}>
                    <div className="m-0 flex flex-col justify-between text-base font-bold sm:flex-row">
                      <div className="min-w-full flex-1  text-left text-[15px] text-slate-200 sm:min-w-[280px] sm:border-r sm:border-slate-700/70 sm:text-center">
                        {"Total Time Spent -  " + calculateHours(user.timeSpentMills) + ":" + calculateMinutes(user.timeSpentMills)}
                      </div>
                      <div className="min-w-full flex-1  text-left text-[15px] text-slate-200 sm:min-w-[280px] sm:text-center">
                        {"Total Time Approved -  " + calculateHours(user.approvedHoursMills) + ":" + calculateMinutes(user.approvedHoursMills)}
                      </div>
                    </div>
                  </div>
                </div> */}
                <div className="flex justify-end">
                  <div className={totalsCardClassName}>
                    <div className="m-0 flex flex-col justify-between text-base font-bold sm:flex-row ">
                      <div className="min-w-full flex-1 px-4 py-3 text-left text-[15px] text-slate-200 sm:min-w-[280px] sm:border-r sm:border-slate-700/70 sm:text-center">
                        {"Total Time Spent -  " + calculateHours(user.timeSpentMills) + ":" + calculateMinutes(user.timeSpentMills)}
                      </div>
                      <div className="min-w-full flex-1 px-4 py-3 text-left text-[15px] text-slate-200 sm:min-w-[280px] sm:text-center">
                        {"Total Time Approved -  " + calculateHours(user.approvedHoursMills) + ":" + calculateMinutes(user.approvedHoursMills)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {hierarchicalData.length === 0 && !loading && <div className="pt-5 text-center text-slate-400">No Records Found</div>}
        {loading && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <ThoughtMateProgressLoaderAnimated />
        </div>}
      </>
      {open && (
        <div
          className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AddUpdateTimesheet
              rowData={rowData}
              setOpen={setOpen}
              profile={props.profile}
              addTimesheetToUser={addTimesheetToUser}
              setUpdateGrid={setUpdateGrid}
              updateGrid={updateGrid}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default TimesheetGrid;
