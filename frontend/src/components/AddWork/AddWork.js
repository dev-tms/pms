import React, { useEffect, useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./style.scss";
import 'react-toastify/dist/ReactToastify.css';
import toastMessages from "../../utils/ToastMassages";
import { ToastContainer, toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { addWork, listProjects } from "../../controller/auth/loginApis";
import RequiredLabel from "../RequiredLabel/RequiredLabel";
import Select from "react-select";


const AddWork = (props) => {
  const history = useHistory();

  const [formData, setFormData] = useState({
    id: props.work?.id || '',
    workName: props.work?.workName || "",
    clientId: props.work?.clientId || "",
    clientName: props.work?.clientName || "",
    projectId: props.work?.projectId || "",
    workLink: props.work?.workLink || "",
    priority: props.work?.priority || "",
    dueDate: props.work?.dueDateStr? props.work?.dueDateStr.split('T')[0] : "",
    comments: props.work?.comments || "",
    currentStatus: props.work?.currentStatus || "",
    hoursLimit: props.work?.hoursLimit || "",
    estimatedHours: props.work?.estimatedHours || "",
  });
  const [formErrors, setFormErrors] = useState({
    workName: "",
    clientId: "",
    clientName: "",
    projectId: "",
    workLink: "",
    priority: "",
    dueDate: "",
    comments: "",
    currentStatus: "",
    hoursLimit: "",
    estimatedHours: "",
  });
  const [projectList, setProjetList] = useState([]);
  const [submittingForm, setSubmittingForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projects = await listProjects(props.profile);
        const sortedProjects = [...projects?.data].sort((a, b) =>
          a.projectName.localeCompare(b.projectName)
        );
        setProjetList(sortedProjects);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchData();
  }, [props.profile])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: validationErrorMessage(e) });
    setSubmittingForm(false);
  };

  const handleProjectChange = (value) => {
    setFormData({ ...formData, "projectId": value });
    setFormErrors({ ...formErrors, "projectId": validationErrorMessage({target: {name: "projectId", value}}) });
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
      case "workName":
        error = value.length < 1 ? "Enter Work Name" : "";
        break;
      case "projectId":
        error = value.length < 1 ? "Select Project" : "";
        break;
      case "workLink":
        error = value.length < 1 ? "Enter Work Link" : "";
        break;
      case "priority":
        error = value.length < 1 ? "Select Priority" : "";
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

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((err) => err.length > 0);

    if (hasErrors) {
      toast.error(toastMessages.fillAllFields);
      setSubmittingForm(false);
      return;
    }

    if ( validateForm(formErrors) ) {
      let response = await addWork(formData, props.profile);
      console.log(response);
      toast.success(toastMessages.addWorkSuccess);
      // history.push('/works');
      props.setUpdateGrid(!props.updateGrid);
      props.setOpen(false);
      setSubmittingForm(false);
    } else {
      toast.error(toastMessages.fillAllFields);
      console.error("Form submission aborted due to validation errors or empty fields.");
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

  const formattedProjectOptions = projectList.map(project => ({
    value: project.id,
    label: project.projectName
  }));

  return (
    <div className="main detail-page add_work">
      <ToastContainer position="top-center" theme="colored" />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center user-form-container ">
              <div style={{ width: "1200px" }} className="user-form-wrapper">
                <div className="heading-wrapper">
                  <h1>{props.work ? 'Edit' : 'Add'} Work Details</h1>
                </div>
                <Form onSubmit={handleSubmit} className="user-form">
                  <fieldset>
                    <Form.Group controlId="formBasicReferralName" className="pb-lg-3 pb-sm-0 row ">
                    <div className='col-lg-6 col-sm-12 pb-sm-2'>
                        <RequiredLabel>Project</RequiredLabel>
                        {/* <Form.Control
                          as="select"
                          name="projectId"
                          value={formData.projectId}
                          onChange={handleChange}
                          placeholder="Select Project"
                        >
                          <option value="">Select Project</option>
                          {projectList.map((option) => {
                            return (
                              <option key={option.projectName} value={option.id}>
                                {option.projectName}
                              </option>
                            );
                          })}
                        </Form.Control> */}
                        <Select
                          name="projectId"
                          options={formattedProjectOptions}
                          value={formattedProjectOptions.find(o => o.value === formData.projectId)}
                          onChange={selected => handleProjectChange(selected.value)}
                          isSearchable
                          placeholder="Search Project..."
                        />
                        {formErrors.projectId && (
                          <Form.Text className="text-danger">
                            {formErrors.projectId}
                          </Form.Text>
                        )}
                      </div>
                      <div className="col-lg-6 col-sm-12 pb-sm-2">
                        <RequiredLabel>Work Name</RequiredLabel>
                        <Form.Control
                          type="text"
                          name="workName"
                          value={formData.workName}
                          onChange={handleChange}
                          placeholder="Enter Work Name"
                        />
                        {formErrors.workName && (
                          <Form.Text className="text-danger">
                            {formErrors.workName}
                          </Form.Text>
                        )}
                      </div>
                    </Form.Group>
                    <Form.Group className="pb-lg-3 pb-sm-0 row ">
                      <div className="col-lg-6 col-sm-12 pb-sm-2">
                        <RequiredLabel>Work Link</RequiredLabel>
                        <Form.Control
                          type="text"
                          name="workLink"
                          value={formData.workLink}
                          onChange={handleChange}
                          placeholder="Enter Work Link"
                        />
                        {formErrors.workLink && (
                          <Form.Text className="text-danger">
                            {formErrors.workLink}
                          </Form.Text>
                        )}
                      </div>
                      <div className="col-lg-6 col-sm-12 pb-sm-2">
                        <RequiredLabel>Priority</RequiredLabel>
                        <Form.Control
                          as="select"
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          placeholder="Select Priority"
                        >
                          <option value="">Select Priority</option>
                          <option value="Normal">Normal</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Super Urgent">Super Urgent</option>
                          <option value="Super Duper Urgent">Super Duper Urgent</option>
                        </Form.Control>
                        {formErrors.priority && (
                          <Form.Text className="text-danger">
                            {formErrors.priority}
                          </Form.Text>
                        )}
                      </div>
                      
                    </Form.Group>
                    <Form.Group className="pb-lg-3 pb-sm-0 row ">
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
                        {formErrors.comments && (
                          <Form.Text className="text-danger">
                            {formErrors.comments}
                          </Form.Text>
                        )}
                      </div>
                      <div className='col-lg-6 col-sm-12 pb-sm-2'>
                        <Form.Label >Hours Limit</Form.Label>
                        <Form.Control
                          type="number"
                          name="hoursLimit"
                          value={formData.hoursLimit}
                          onChange={handleChange}
                          placeholder="Enter Hours"
                        />
                      </div>
                    </Form.Group>
                    <Form.Group className="pb-lg-3 pb-sm-0 row ">
                      <div className='col-lg-6 col-sm-12 pb-sm-2'>
                        <Form.Label >Estimated Hours</Form.Label>
                        <Form.Control
                          type="number"
                          name="estimatedHours"
                          value={formData.estimatedHours}
                          onChange={handleChange}
                          placeholder="Enter Hours"
                        />
                      </div>
                      <div className='col-lg-6 col-sm-12 pb-sm-2'>
                        <Form.Label >Due Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          placeholder="Select Due Date"
                        />
                      </div>
                    </Form.Group>
                  </fieldset>
                  <div className="d-flex form-row align-items-center justify-content-center btn-wrapper">
                    <div className="col-auto">
                      <Button variant="primary" type="cancle" onClick={handleBack}>
                        Cancel
                      </Button>
                    </div>

                    <div className="col-auto">
                      <Button variant="primary" type="submit" className={submittingForm ? "disabled" : ""}>
                        Save
                      </Button>
                    </div>

                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWork;
