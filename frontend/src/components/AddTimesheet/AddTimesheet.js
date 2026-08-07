import React, { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import toastMessages from "../../utils/ToastMassages";
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { addTimesheet, listTasks } from "../../controller/auth/loginApis";
import taskStatus from "../../utils/TaskStatus";
import Select from "react-select";
import { selectStyles } from "../../utils/index";
import { PlusIcon, Trash2Icon } from "lucide-react";


const AddTimesheet = (props) => {
  console.log("timesheet props", props)
  const isEditMode = Boolean(props.timesheet?._id);
  const inputCls =
    "app-input w-full rounded-xl border px-4 py-3 text-base outline-none transition min-h-[48px] focus:border-sky-400";
  const selectCls =
    `${inputCls} appearance-none pr-10`;
  const labelCls = "app-label mb-2 block text-base";
  const errorCls = "mt-2 block text-base text-rose-400";


  const dateFormat = (dateString) => {
    let date = new Date(dateString);
    let mm = ('0' + (date.getMonth() + 1)).slice(-2)
    let dd = ('0' + (date.getDate())).slice(-2);
    return date.getFullYear() + '-' + mm + '-' + dd;
  };
  const getHoursFromMills = (mills) => {
    return parseInt(mills / (1000 * 60 * 60)) || 0;
  }

  const getMinutesFromMills = (mills) => {
    // return (parseInt(mills) - ((parseInt(mills) / (1000*60*60)) * (1000*60*60))) / (1000*60);
    return parseInt((parseInt(mills) % (1000 * 60 * 60)) / (1000 * 60)) || 0;
  }


  const history = useHistory();

  const [formData, setFormData] = useState({
    id: props.timesheet?._id || "",
    status: props.timesheet?.status || "",
    taskType: props.timesheet?.taskType || (props.timesheet?.workName === "Morning Meeting" ? 'New Change' : ""),
    action: props.timesheet?.action || (props.timesheet?.workName === "Morning Meeting" ? 'Meeting' : ""),
    links: props.timesheet?.links || "",
    comments: props.timesheet?.comments || (props.timesheet?.workName === "Morning Meeting" ? 'Morning Meeting' : ""),
    timeSpentMills: props.timesheet?.timeSpentMills || "",
    timeSpentHours: getHoursFromMills(props.timesheet?.timeSpentMills) || 0,
    timeSpentMinutes: getMinutesFromMills(props.timesheet?.timeSpentMills) || 0,
    approvedHoursMills: props.timesheet?.approvedHoursMills || "",
    approvedHours: getHoursFromMills(props.timesheet?.approvedHoursMills) || 0,
    approvedMinutes: getMinutesFromMills(props.timesheet?.approvedHoursMills) || 0,
    workId: props.timesheet?.workId || "",
    workName: props.timesheet?.workName || "",
    taskId: props.timesheet?.taskId || "",
    assignedToId: props.timesheet?.assignedToId || "",
    qaId: props.timesheet?.qaId || "",
    executionDate: props.timesheet?.executionDate ? dateFormat(props.timesheet?.executionDate) : dateFormat(new Date().toISOString()),
    hoursStatus: props.timesheet?.hoursStatus || 0
  });
  const [actionEntries, setActionEntries] = useState([
    {
      action: props.timesheet?.action || (props.timesheet?.workName === "Morning Meeting" ? 'Meeting' : ""),
      timeSpentHours: getHoursFromMills(props.timesheet?.timeSpentMills) || 0,
      timeSpentMinutes: getMinutesFromMills(props.timesheet?.timeSpentMills) || 0,
    },
  ]);
  const [formErrors, setFormErrors] = useState({
    status: "",
    taskType: "",
    action: "",
    links: "",
    comments: "",
    timeSpentMills: "",
    approvedHours: "",
    workId: "",
    taskId: "",
    assignedToId: "",
    qaId: "",
    executionDate: '',
    hoursStatus: 0
  });
  const [taskList, setTaskList] = useState([]);
  const [submittingForm, setSubmittingForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasks = await listTasks(props.profile);
        let filteredTasks = tasks?.data || [];

        if (props?.addTimesheetToUser) {
          filteredTasks = filteredTasks.filter(
            (task) => props.addTimesheetToUser === task.assignedTo?.id
          );
        }

        filteredTasks = filteredTasks.sort((a, b) =>
          a.taskName.localeCompare(b.taskName)
        );
        setTaskList(filteredTasks || []);
      } catch (error) {
        console.error("Error fetching task data:", error);
      }
    };
    fetchData();
  }, [props.profile])

  useEffect(() => {
    console.log(formErrors);
  }, [formErrors]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'timeSpentHours') {
      let nameMills = 'timeSpentMills';
      let mills = parseInt(value) * (1000 * 60 * 60) + (formData.timeSpentMinutes ? formData.timeSpentMinutes * (1000 * 60) : 0);
      setFormData((prevFormData) => { return { ...prevFormData, ...{ [nameMills]: mills, [name]: value } } });
      setFormErrors((prevFormData) => { return { ...prevFormData, ...{ [nameMills]: validationErrorMessage(e) } } });
    } else if (name === 'timeSpentMinutes') {
      let nameMills = 'timeSpentMills';
      let mills = parseInt(value) * (1000 * 60) + (formData.timeSpentHours ? formData.timeSpentHours * (1000 * 60 * 60) : 0);
      setFormData((prevFormData) => { return { ...prevFormData, ...{ [nameMills]: mills, [name]: value } } });
      setFormErrors((prevFormData) => { return { ...prevFormData, ...{ [nameMills]: validationErrorMessage(e) } } });
    } else if (name === 'approvedHours') {
      let nameMills = 'approvedHoursMills';
      let mills = parseInt(value) * (1000 * 60 * 60) + (formData.approvedMinutes ? formData.approvedMinutes * (1000 * 60) : 0);
      setFormData((prevFormData) => { return { ...prevFormData, ...{ [nameMills]: mills, [name]: value } } });
      setFormErrors((prevFormData) => { return { ...prevFormData, ...{ [nameMills]: validationErrorMessage(e) } } });
    } else if (name === 'approvedMinutes') {
      let nameMills = 'approvedHoursMills';
      let mills = parseInt(value) * (1000 * 60) + (formData.approvedHours ? formData.approvedHours * (1000 * 60 * 60) : 0);
      setFormData((prevFormData) => { return { ...prevFormData, ...{ [nameMills]: mills, [name]: value } } });
      setFormErrors((prevFormData) => { return { ...prevFormData, ...{ [nameMills]: validationErrorMessage(e) } } });
    } else if (name === 'taskId') {
      let workList = taskList.filter(task => task.id === value);
      let taskData = { 'workId': workList[0]?.work?.id, [name]: value };
      if (workList[0]?.assignedTo) {
        taskData.assignedToId = workList[0]?.assignedTo?.id;
      }
      if (workList[0]?.qa) {
        taskData.qaId = workList[0]?.qa?.id;
      }
      setFormData((prevFormData) => { return { ...prevFormData, ...taskData } });
      setFormErrors((prevFormData) => { return { ...prevFormData, ...{ [name]: validationErrorMessage(e) } } });
    } else {
      setFormData({ ...formData, [name]: value });
      setFormErrors({ ...formErrors, [name]: validationErrorMessage(e) });
    }
    setSubmittingForm(false);
  };

  const handleTaskChange = (value) => {
    let workList = taskList.filter(task => task.id === value);
    let taskData = { 'workId': workList[0]?.work?.id, "taskId": value };
    if (workList[0]?.assignedTo) {
      taskData.assignedToId = workList[0]?.assignedTo?.id;
    }
    if (workList[0]?.qa) {
      taskData.qaId = workList[0]?.qa?.id;
    }
    setFormData((prevFormData) => { return { ...prevFormData, ...taskData } });
    setFormErrors({ ...formErrors, "taskId": validationErrorMessage({ target: { name: "taskId", value } }) });
    setSubmittingForm(false);
  };

  const formattedTaskOptions = taskList.map(task => ({
    value: task.id,
    label: task.work?.workName + ' / ' + task.taskName
  }));

  const validationErrorMessage = (event) => {
    const { name, value } = event.target;
    let error = "";
    switch (name) {
      case "status":
        error = value.length < 1 ? "Select Status" : "";
        break;
      case "taskType":
        error = value.length < 1 ? "Select Task Type" : "";
        break;
      case "action":
        error = value.length < 1 ? "Select Action" : "";
        break;
      case "comments":
        error = value.length < 1 ? "Write Comment" : "";
        break;
      case "timeSpentMills":
        error = value.length < 1 ? "Select Time Spent" : "";
        break;
      case "taskId":
        error = value.length < 1 ? "Select Task" : "";
        break;
      case "executionDate":
        error = value.length < 1 ? "Select Date" : "";
        break;

      default:
        break;
    }
    return error;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmittingForm(true);

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      const fakeEvent = { target: { name: key, value: formData[key] || "" } };
      newErrors[key] = validationErrorMessage(fakeEvent);
    });
    setFormErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err.length > 0);
    if (hasErrors) {
      toast.error(toastMessages.fillAllFields);
      setSubmittingForm(false);
      return;
    }

    let response = await addTimesheet(formData, props.profile);
    console.log(response);
    toast.success(toastMessages.saveTimesheetSuccess);
    history.push('/timesheets');
    props.setUpdateGrid(!props.updateGrid);
    props.setOpen(false);
    setSubmittingForm(false);

  };

  const handleBack = async (event) => {
    event.preventDefault();
    if (props.setOpen) {
      props.setOpen(false);
    } else {
      history.push('/timesheets');
    }
  }

  const generateMinutesOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i += 5) {
      options.push(
        <option key={i} value={i}>
          {i < 10 ? `0${i}` : i}
        </option>
      );
    }
    return options;
  };

  useEffect(() => {
    const totalMills = actionEntries.reduce((sum, entry) => {
      const hoursMills = (parseInt(entry.timeSpentHours) || 0) * (1000 * 60 * 60);
      const minutesMills = (parseInt(entry.timeSpentMinutes) || 0) * (1000 * 60);
      return sum + hoursMills + minutesMills;
    }, 0);

    setFormData((prev) => ({
      ...prev,
      timeSpentMills: totalMills,
      // keep first entry's action as the primary "action" field for backward compatibility
      action: actionEntries[0]?.action || "",
      actions: actionEntries, // send the full breakdown too, in case the backend wants it
    }));
  }, [actionEntries]);

  const handleActionEntryChange = (index, field, value) => {
    setActionEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setSubmittingForm(false);
  };

  const handleAddAction = () => {
    setActionEntries((prev) => [
      ...prev,
      { action: "", timeSpentHours: 0, timeSpentMinutes: 0 },
    ]);
  };

  const handleRemoveAction = (index) => {
    setActionEntries((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div className="w-full">
      <div className="app-modal w-full max-w-5xl rounded-[28px] border p-6 overflow-y-auto max-h-[90vh]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-sm uppercase tracking-[0.32em] text-sky-400/80">
              Timesheet form
            </p>
            <h2 className="app-modal-title">
              {isEditMode ? "Edit timesheet" : "Add timesheet"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary shrink-0 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-base transition"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Task <span className="text-rose-400">*</span></span>
              <Select
                name="taskId"
                options={formattedTaskOptions}
                value={formattedTaskOptions.find(o => o.value === formData.taskId) || null}
                onChange={(selected) => handleTaskChange(selected?.value || "")}
                isSearchable
                placeholder="Search task..."
                styles={selectStyles}
                className="rounded:md"
              />
              {formErrors.taskId && <span className={errorCls}>{formErrors.taskId}</span>}
            </label>

            <label className="block">
              <span className={labelCls}>Status <span className="text-rose-400">*</span></span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="">Select status</option>
                {taskStatus.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </select>
              {formErrors.status && <span className={errorCls}>{formErrors.status}</span>}
            </label>

            <label className="block">
              <span className={labelCls}>Task Type <span className="text-rose-400">*</span></span>
              <select
                name="taskType"
                value={formData.taskType}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="">Select task type</option>
                <option value="New Task">New Task</option>
                <option value="New Change">New Change</option>
                <option value="Feedback">Feedback</option>
              </select>
              {formErrors.taskType && <span className={errorCls}>{formErrors.taskType}</span>}
            </label>

            <label className="block">
              <span className={labelCls}>Timesheet Date <span className="text-rose-400">*</span></span>
              <input
                type="date"
                name="executionDate"
                value={formData.executionDate}
                onChange={handleChange}
                className={inputCls + ""}
              />
              {formErrors.executionDate && <span className={errorCls}>{formErrors.executionDate}</span>}
            </label>

            <label className="block md:col-span-2">
              <span className={labelCls}>Links</span>
              <textarea
                name="links"
                value={formData.links}
                onChange={handleChange}
                placeholder="Enter links"
                rows={3}
                className={inputCls}
              />
              {formErrors.links && <span className={errorCls}>{formErrors.links}</span>}
            </label>

            <label className="block md:col-span-2">
              <span className={labelCls}>Comments <span className="text-rose-400">*</span></span>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Enter comments"
                rows={3}
                className={inputCls}
              />
              {formErrors.comments && <span className={errorCls}>{formErrors.comments}</span>}
            </label>

            <div className="md:col-span-2 space-y-4">
              {actionEntries.map((entry, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-2 items-start">
                  <label className="block">
                    <span className={labelCls}>
                      Action {index === 0 && <span className="text-rose-400">*</span>}
                    </span>
                    <select
                      name={`action-${index}`}
                      value={entry.action}
                      onChange={(e) => handleActionEntryChange(index, "action", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select action</option>
                      <option value="Development">Development</option>
                      <option value="R&D">R&amp;D</option>
                      <option value="Training">Training</option>
                      <option value="Tech Discussion">Tech Discussion</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Others">Others</option>
                    </select>
                    {index === 0 && formErrors.action && <span className={errorCls}>{formErrors.action}</span>}
                  </label>

                  <div className="block">
                    <span className={labelCls}>
                      Time Spent {index === 0 && <span className="text-rose-400">*</span>}
                    </span>
                    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                      <select
                        value={entry.timeSpentHours}
                        onChange={(e) => handleActionEntryChange(index, "timeSpentHours", e.target.value)}
                        className={selectCls}
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{i < 10 ? `0${i}` : i}</option>
                        ))}
                      </select>
                      <span className="text-slate-400">:</span>
                      <select
                        value={entry.timeSpentMinutes}
                        onChange={(e) => handleActionEntryChange(index, "timeSpentMinutes", e.target.value)}
                        className={selectCls}
                      >
                        {generateMinutesOptions()}
                      </select>

                      {index === actionEntries.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleAddAction}
                          className="text-slate-400"
                        >
                          <PlusIcon className="text-sky-400 hover:text-sky-500 border border-sky-400 h-10 w-10 p-2 rounded-full transition" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveAction(index)}
                          className="text-rose-400 hover:text-rose-500 border border-rose-400 h-10 w-10 p-2 rounded-full transition flex items-center justify-center"
                        >
                          <Trash2Icon size={18} />
                        </button>
                      )}
                    </div>
                    {index === 0 && formErrors.timeSpentMills && <span className={errorCls}>{formErrors.timeSpentMills}</span>}
                  </div>
                </div>
              ))}
            </div>

            {(props?.profile?.role === 'ADMIN' || props?.profile?.role === 'TL') && (
              <div className="block">
                <span className={labelCls}>Approved Hours</span>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <select name="approvedHours" value={formData.approvedHours} onChange={handleChange} className={selectCls}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i < 10 ? `0${i}` : i}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400">:</span>
                  <select name="approvedMinutes" value={formData.approvedMinutes} onChange={handleChange} className={selectCls}>
                    {generateMinutesOptions()}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 app-divider border-t pt-5">
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-base transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingForm}
              className="btn-primary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditMode ? "Save changes" : "Add timesheet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTimesheet;
