import React from 'react';
import { Form, FormGroup, Label, Input, Button, Row, Col, InputGroup, InputGroupText } from 'reactstrap';

const SiteClimateStep = ({ data, updateData, onPrev, onNext }) => {
  return (
    <Form className="cultivator-step-form" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
      <h4 className="mb-4">3. Site & Climate Details</h4>
      
      <h5 className="text-secondary mt-4 mb-3 border-bottom pb-2">Location & Area</h5>
      <Row>
        <Col xs="12" md="12">
          <FormGroup>
            <Label>Location</Label>
            <Input type="text" maxLength="150" value={data.location} onChange={(e) => updateData('siteClimate', 'location', e.target.value)} />
          </FormGroup>
        </Col>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Dist. from Highway/Industry</Label>
            <InputGroup>
              <Input type="number" min="0" step="any" value={data.distHighway} onChange={(e) => updateData('siteClimate', 'distHighway', e.target.value)} />
              <InputGroupText className="static-unit">km</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Dist. from Nearest City</Label>
            <InputGroup>
              <Input type="number" min="0" step="any" value={data.distCity} onChange={(e) => updateData('siteClimate', 'distCity', e.target.value)} />
              <InputGroupText className="static-unit">km</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Area</Label>
            <InputGroup>
              <Input type="number" min="0" step="any" value={data.area} onChange={(e) => updateData('siteClimate', 'area', e.target.value)} />
              <InputGroupText className="static-unit">acres</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
      </Row>

      <h5 className="text-secondary mt-4 mb-3 border-bottom pb-2">Soil & Environment</h5>
      <Row>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Type of Soil</Label>
            <Input type="text" maxLength="100" value={data.soilType} onChange={(e) => updateData('siteClimate', 'soilType', e.target.value)} />
          </FormGroup>
        </Col>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Temperature</Label>
            <InputGroup>
              <Input type="text" maxLength="50" placeholder="e.g. 20-25" value={data.temperature} onChange={(e) => updateData('siteClimate', 'temperature', e.target.value)} />
              <InputGroupText className="static-unit">°C</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Rainfall</Label>
            <InputGroup>
              <Input type="text" maxLength="50" placeholder="e.g. 100-150" value={data.rainfall} onChange={(e) => updateData('siteClimate', 'rainfall', e.target.value)} />
              <InputGroupText className="static-unit">mm</InputGroupText>
            </InputGroup>
          </FormGroup>
        </Col>
      </Row>
      
      <Row>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Irrigation Source</Label>
            <Input type="text" maxLength="100" value={data.irrigationSource} onChange={(e) => updateData('siteClimate', 'irrigationSource', e.target.value)} />
          </FormGroup>
        </Col>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Nature of Other Crops at Site</Label>
            <Input type="text" maxLength="150" value={data.otherCropsSite} onChange={(e) => updateData('siteClimate', 'otherCropsSite', e.target.value)} />
          </FormGroup>
        </Col>
        <Col xs="12" md="4">
          <FormGroup>
            <Label>Nature of Other Crops in the Vicinity</Label>
            <Input type="text" maxLength="150" value={data.otherCropsVicinity} onChange={(e) => updateData('siteClimate', 'otherCropsVicinity', e.target.value)} />
          </FormGroup>
        </Col>
      </Row>

      <div className="d-flex justify-content-between mt-5">
        <Button color="secondary" onClick={onPrev}>&larr; Previous</Button>
        <Button color="success" type="submit" size="lg">Next Step &rarr;</Button>
      </div>
    </Form>
  );
};
export default SiteClimateStep;