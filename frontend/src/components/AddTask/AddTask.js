import React, { useEffect, useState } from "react";
import { Form, Button, Container, Dropdown } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./style.scss";
import toastMessages from "../../utils/ToastMassages";
import taskStatus from "../../utils/TaskStatus";
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { addTask } from "../../controller/auth/loginApis";
import RequiredLabel from "../RequiredLabel/RequiredLabel";
import Select from "react-select";
import { selectStyles } from "../../utils/index";


const AddTask = (props) => {
  const history = useHistory();

  const [formData, setFormData] = useState({
    id: props.task?.id && !props.task?.id.startsWith('_new') ? props.task?.id : "",
    workName: props.task?.workName || "",
    clientName: props.task?.clientName || "",
    workId: props.task?.workId || "",
    priority: props.task?.priority || "",
    workLink: props.task?.workLink || "",
    taskName: props.task?.taskName || "",
    workType: props.task?.workType || "",
    assignedToName: props.task?.assignedToName || "",
    assignedToId: [props.task?.assignedToId] || [],
    qaName: props.task?.qaName || "",
    qaId: props.task?.qaId || "",
    assignedDate: props.task?.assignedDate || new Date(),
    qaFeedbackLink: props.task?.qaFeedbackLink || "",
    status: props.task?.status || "",
    comments: props.task?.comments || ""
  });
  const [formErrors, setFormErrors] = useState({
    workId: "",
    taskName: "",
    assignedDate: "",
    assignedToId: "",
    qaId: "",
    qaFeedbackLink: "",
    status: "",
  });
  const [workList, setWorkList] = useState([]);
  const [qaList, setQAList] = useState(props.qas);
  const [userList, setUserList] = useState(props.employees);
  const [submittingForm, setSubmittingForm] = useState(false);
  const labelCls = "mb-2 block text-sm text-slate-300";
  const errorCls = "mt-2 block text-xs text-rose-400";

  const sortByField = (arr, field) => [...arr].sort((a, b) => a[field].localeCompare(b[field]));

  useEffect(() => {
    if (props?.works) {
      setWorkList(sortByField(props.works, "workName"));
    }
  }, [props?.works]);

  useEffect(() => {
    if (props?.qas) {
      setQAList(sortByField(props.qas, "firstName"));
    }
    if (props?.employees) {
      setUserList(sortByField(props.employees, "firstName"));
    }
  }, [props?.qas, props?.employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name === "assignedToId") {
      const values = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({ ...formData, [name]: values });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setFormErrors({ ...formErrors, [name]: validationErrorMessage(e) });
    setSubmittingForm(false);
  };

  const handleWorkChange = (value) => {
    setFormData({ ...formData, "workId": value });
    setFormErrors({ ...formErrors, "workId": validationErrorMessage({target: {name: "workId", value}}) });
    setSubmittingForm(false);
  };

  const validateForm = () => {
    let valid = true;
    Object.values(formErrors).forEach((error) => {
      if (error.length > 0) {
        valid = false;
      }
    });
    return valid;
  };

  const validationErrorMessage = (event) => {
    const { name, value } = event.target;
    let error = "";
    switch (name) {
      case "taskName":
        error = value.length < 1 ? "Enter Task Name" : "";
        break;
      case "workId":
        error = value.length < 1 ? "Select Work" : "";
        break;
      case "assignedToId":
        error = value.length < 1 ? "Select Assignee" : "";
        break;
      case "status":
        error = value.length < 1 ? "Select Status" : "";
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

    if ( validateForm(formErrors) ) {
      let response = await addTask(formData, props.profile);
      console.log(response);
      toast.success(toastMessages.addWorkSuccess);
      // history.push('/works');
      props.setUpdateGrid(!props.updateGrid);
      props.setOpen(false);
      setSubmittingForm(false);
    } else {
      toast.error(toastMessages.fillAllFields);
      console.error(
        "Form submission aborted due to validation errors or empty fields."
      );
      setSubmittingForm(false);
    }
  };

  const handleBack = async (event) => {
    event.preventDefault();
    if(props.setOpen) {
      props.setOpen(false);
    } else {
      history.goBack();
    }
  }

  function MultiSelectWithCheckbox() {

    const toggleUser = (id) => {
      setFormData((prev) => ({
        ...prev,
        assignedToId: prev.assignedToId.includes(id)
          ? prev.assignedToId.filter((userId) => userId !== id) // remove
          : [...prev.assignedToId, id],                         // add
      }));
    };

    const selectedNames = userList
      .filter((u) => formData.assignedToId.includes(u.id))
      .map((u) => (u.firstName ? u.firstName : '')+' '+(u.lastName ? u.lastName : ''))
      .join(", ");

    return (
      <Dropdown autoClose="outside">
        <Dropdown.Toggle variant="secondary">
          {selectedNames || "Select Employees"}
        </Dropdown.Toggle>

        <Dropdown.Menu style={{ padding: "0.5rem 1rem" }}>
          {userList.map((option) => (
            <Form.Check
              key={option.id}
              type="checkbox"
              label={(option.firstName ? option.firstName : '')+' '+(option.lastName ? option.lastName : '')}
              checked={formData.assignedToId.includes(option.id)}
              onChange={() => toggleUser(option.id)}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  const formattedWorkOptions = workList.map(work => ({
    value: work.id,
    label: work.workName
  }));

  return (
    <div className="main detail-page add_task">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center user-form-container ">
              <div style={{ width: "1200px" }} className="user-form-wrapper">
                <div className="heading-wrapper">
                  <h1>{props.task?.id ? 'Edit' : 'Add'} Task Details</h1>
                </div>
                <form onSubmit={handleSubmit} className="user-form">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className={labelCls}>Work <span className="text-rose-400">*</span></span>
                      <Select
                        name="workId"
                        options={formattedWorkOptions}
                        value={formattedWorkOptions.find(o => o.value === formData.workId) || null}
                        onChange={(selected) => handleWorkChange(selected?.value || "")}
                        isSearchable
                        placeholder="Search work..."
                        styles={selectStyles}
                        className="rounded:md"
                      />
                      {formErrors.workId && <span className={errorCls}>{formErrors.workId}</span>}
                  </label>
                    <Form.Group controlId="formBasicReferralName" className="pb-lg-3 pb-sm-0 row">
                      {/* <div className='col-lg-6 col-sm-12 pb-sm-2'>
                        <RequiredLabel>Work</RequiredLabel>
                        <Select
                          name="workId"
                          options={formattedWorkOptions}
                          value={formattedWorkOptions.find(o => o.value === formData.workId)}
                          onChange={selected => handleWorkChange(selected.value)}
                          isSearchable
                          placeholder="Search Work..."
                          styles={selectStyles}
                          className="rounded:md"
                        />
                        {formErrors.workId && (
                          <Form.Text className="text-danger">
                            {formErrors.workId}
                          </Form.Text>
                        )}
                      </div> */}
                      <div className="col-lg-6 col-sm-12 pb-sm-2">
                        <RequiredLabel>Task Name</RequiredLabel>
                        <Form.Control
                          type="text"
                          name="taskName"
                          value={formData.taskName}
                          onChange={handleChange}
                          placeholder="Enter Task Name"
                        />
                        {formErrors.taskName && (
                          <Form.Text className="text-danger">
                            {formErrors.taskName}
                          </Form.Text>
                        )}
                      </div>
                    </Form.Group>

                    <Form.Group className="pb-lg-3 pb-sm-0 row">
                      <div className="col-lg-6 col-sm-12 pb-sm-2">
                        <RequiredLabel>Assigned To</RequiredLabel>
                        {formData.id !== "" ? <Form.Control
                          name="assignedToId"
                          as="select"
                          value={formData.assignedToId[0] || ""}
                          onChange={handleChange}
                          placeholder="Select Employee"
                        >
                          <option value="">Select Employee</option>
                          {userList.map((option) => {
                            return (
                              <option key={(option.firstName ? option.firstName : '')+' '+(option.lastName ? option.lastName : '')} value={option.id}>
                                {(option.firstName ? option.firstName : '')+' '+(option.lastName ? option.lastName : '')}
                              </option>
                            );
                          })}
                        </Form.Control> : <MultiSelectWithCheckbox/>}
                        
                        {formErrors.assignedToId && (
                          <Form.Text className="text-danger">
                            {formErrors.assignedToId}
                          </Form.Text>
                        )}
                      </div>
                      <div className="col-lg-6 col-sm-12 pb-sm-2">
                        <Form.Label>QA</Form.Label>
                        <Form.Control
                          as="select"
                          name="qaId"
                          value={formData.qaId}
                          onChange={handleChange}
                          placeholder="Select Priority"
                        >
                          <option value="">Select QA</option>
                          {qaList.map((option) => {
                            return (
                              <option key={(option.firstName ? option.firstName : '')+' '+(option.lastName ? option.lastName : '')} value={option.id}>
                                {(option.firstName ? option.firstName : '')+' '+(option.lastName ? option.lastName : '')}
                              </option>
                            );
                          })}
                        </Form.Control>
                        {formErrors.qaId && (
                          <Form.Text className="text-danger">
                            {formErrors.qaId}
                          </Form.Text>
                        )}
                      </div>
                      
                    </Form.Group>
                    <Form.Group className="pb-lg-3 pb-sm-0 row">
                      <div className="col-lg-6 col-sm-12 pb-sm-2">
                        <Form.Label>QA Feedback Link</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="qaFeedbackLink"
                          value={formData.qaFeedbackLink}
                          onChange={handleChange}
                          placeholder="Enter QA Feedback Link"
                          rows={3}
                        />
                        {formErrors.qaFeedbackLink && (
                          <Form.Text className="text-danger">
                            {formErrors.qaFeedbackLink}
                          </Form.Text>
                        )}
                      </div>
                      <div className='col-lg-6 col-sm-12 pb-sm-2'>
                        <RequiredLabel>Status</RequiredLabel>
                        <Form.Control
                          as="select"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          placeholder="Select Status"
                        >
                          {taskStatus.map((option) => {
                            return (
                              <option key={option.value} value={option.id}>
                                {option.value}
                              </option>
                            );
                          })}
                        </Form.Control>
                        {formErrors.status && (
                          <Form.Text className="text-danger">
                            {formErrors.status}
                          </Form.Text>
                        )}
                      </div>
                    </Form.Group>
                    <Form.Group className="pb-lg-3 pb-sm-0 row">
                      <div className="col-lg-6 col-sm-12 pb-sm-2">
                        <Form.Label>Comments</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="comments"
                          value={formData.comments}
                          onChange={handleChange}
                          placeholder="Enter Comments"
                          rows={3}
                        />
                      </div>
                    </Form.Group>
                  </div>
                  <div className="d-flex form-row align-items-center justify-content-center btn-wrapper">
                    <div className="col-auto">
                      <Button variant="primary" type="cancle" onClick={handleBack}>
                        Cancel
                      </Button>
                    </div>

                    <div className="col-auto">
                      <Button variant={"primary "+(submittingForm ? 'disabled' : '')} type="submit">
                        Save
                      </Button>
                    </div>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
