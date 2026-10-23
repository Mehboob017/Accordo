import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, Row, Col, FormFeedback, InputGroup, InputGroupText } from 'reactstrap';
import { validateIndianPhone, validateEmail } from '../utils/validation';

const PersonalDetailsStep = ({ data, updateData, onNext }) => {
  const [errors, setErrors] = useState({});

  const handleValidation = () => {
    let tempErrors = {};
    let isValid = true;

    if (!data.farmerName.trim()) { tempErrors.farmerName = "Name is required"; isValid = false; }
    if (!validateIndianPhone(data.contactNumber)) { tempErrors.contactNumber = "Enter a valid 10-digit Indian mobile number"; isValid = false; }
    if (!validateEmail(data.email)) { tempErrors.email = "Enter a valid email address"; isValid = false; }
    if (!data.address.trim()) { tempErrors.address = "Address is required"; isValid = false; }

    setErrors(tempErrors);
    return isValid;
  };

  return (
    <Form
      className="cultivator-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (handleValidation()) onNext();
      }}
    >
      <h4 className="mb-4">1. Personal Details</h4>
      <Row>
        <Col xs="12" md="6">
          <FormGroup>
            <Label>
              Name of Farmer <span className="text-danger">*</span>
            </Label>
            <Input
              maxLength="100"
              value={data.farmerName}
              onChange={(e) =>
                updateData('personalDetails', 'farmerName', e.target.value)
              }
              invalid={!!errors.farmerName}
            />
            <FormFeedback>{errors.farmerName}</FormFeedback>
          </FormGroup>
        </Col>
        <Col xs="12" md="6">
          <FormGroup>
            <Label>
              Contact Number <span className="text-danger">*</span>
            </Label>
            <InputGroup>
              <div>
                <InputGroupText className="static-unit">+91</InputGroupText>
                <Input
                  type="tel"
                  maxLength="10"
                  placeholder="9876543210"
                  value={data.contactNumber}
                  onChange={(e) =>
                    updateData(
                      'personalDetails',
                      'contactNumber',
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  invalid={!!errors.contactNumber}
                />
              </div>
              <FormFeedback>{errors.contactNumber}</FormFeedback>
            </InputGroup>
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label>E-mail</Label>
        <Input
          type="email"
          maxLength="100"
          value={data.email}
          onChange={(e) =>
            updateData('personalDetails', 'email', e.target.value)
          }
          invalid={!!errors.email}
        />
        <FormFeedback>{errors.email}</FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label>
          Address <span className="text-danger">*</span>
        </Label>
        <Input
          type="textarea"
          rows="3"
          maxLength="300"
          value={data.address}
          onChange={(e) =>
            updateData('personalDetails', 'address', e.target.value)
          }
          invalid={!!errors.address}
        />
        <FormFeedback>{errors.address}</FormFeedback>
      </FormGroup>
      <div className="d-flex justify-content-end mt-4">
        <Button color="success" type="submit" size="lg">
          Next Step &rarr;
        </Button>
      </div>
    </Form>
  );
};
export default PersonalDetailsStep;