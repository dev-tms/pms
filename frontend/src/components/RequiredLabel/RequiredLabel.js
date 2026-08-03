import React from "react";
import { Form } from "react-bootstrap";

const RequiredLabel = ({ children }) => (
  <Form.Label>
    {children} <span className="text-danger">*</span>
  </Form.Label>
);

export default RequiredLabel;