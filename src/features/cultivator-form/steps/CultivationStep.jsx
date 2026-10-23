import React from 'react';
import { Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';

const CultivationStep = ({ data, updateData, onPrev, onSubmit }) => {
  return (
    <Form className="cultivator-step-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <h4 className="mb-4">4. Cultivation Details</h4>
      
      <Row>
        <Col xs="12" md="6"><FormGroup><Label>Planting Material (seed, etc.)</Label><Input type="text" maxLength="100" value={data.plantingMaterial} onChange={(e) => updateData('cultivation', 'plantingMaterial', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="6"><FormGroup><Label>Source of Planting Material</Label><Input type="text" maxLength="100" value={data.materialSource} onChange={(e) => updateData('cultivation', 'materialSource', e.target.value)} /></FormGroup></Col>
        
        <Col xs="12" md="6">
          <FormGroup>
            <Label>Whether Certified</Label>
            <Input type="select" value={data.isCertified} onChange={(e) => updateData('cultivation', 'isCertified', e.target.value)}>
              <option value="">Select...</option><option value="Yes">Yes</option><option value="No">No</option>
            </Input>
          </FormGroup>
        </Col>
        <Col xs="12" md="6"><FormGroup><Label>Certifying Body</Label><Input type="text" maxLength="100" value={data.certifyingBody} onChange={(e) => updateData('cultivation', 'certifyingBody', e.target.value)} /></FormGroup></Col>
        
        <Col xs="12" md="4"><FormGroup><Label>Date of Planting</Label><Input type="date" value={data.dateOfPlanting} onChange={(e) => updateData('cultivation', 'dateOfPlanting', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="4"><FormGroup><Label>Age at Harvest</Label><Input type="text" maxLength="50" placeholder="e.g. 6 months" value={data.ageAtHarvest} onChange={(e) => updateData('cultivation', 'ageAtHarvest', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="4"><FormGroup><Label>Season of Harvest</Label><Input type="text" maxLength="50" value={data.harvestSeason} onChange={(e) => updateData('cultivation', 'harvestSeason', e.target.value)} /></FormGroup></Col>
        
        <Col xs="12" md="6">
          <FormGroup>
            <Label>Whether Organic/Non-Organic</Label>
            <Input type="select" value={data.isOrganic} onChange={(e) => updateData('cultivation', 'isOrganic', e.target.value)}>
              <option value="">Select...</option><option value="Organic">Organic</option><option value="Non-Organic">Non-Organic</option>
            </Input>
          </FormGroup>
        </Col>
        <Col xs="12" md="6"><FormGroup><Label>Certifying Body (If Organic)</Label><Input type="text" maxLength="100" value={data.organicCertifyingBody} onChange={(e) => updateData('cultivation', 'organicCertifyingBody', e.target.value)} /></FormGroup></Col>
      </Row>

      <h5 className="text-secondary mt-4 mb-3 border-bottom pb-2">Chemicals & Processing</h5>
      <Row>
        <Col xs="12" md="4"><FormGroup><Label>Fertilizers Used</Label><Input type="text" maxLength="100" value={data.fertilizers} onChange={(e) => updateData('cultivation', 'fertilizers', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="4"><FormGroup><Label>Pesticides Used</Label><Input type="text" maxLength="100" value={data.pesticides} onChange={(e) => updateData('cultivation', 'pesticides', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="4"><FormGroup><Label>Herbicides Used</Label><Input type="text" maxLength="100" value={data.herbicides} onChange={(e) => updateData('cultivation', 'herbicides', e.target.value)} /></FormGroup></Col>
        
        <Col xs="12" md="6"><FormGroup><Label>Cleaning Process</Label><Input type="text" maxLength="150" value={data.cleaning} onChange={(e) => updateData('cultivation', 'cleaning', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="6"><FormGroup><Label>Washing Process</Label><Input type="text" maxLength="150" value={data.washing} onChange={(e) => updateData('cultivation', 'washing', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="4"><FormGroup><Label>Drying Process</Label><Input type="text" maxLength="150" value={data.drying} onChange={(e) => updateData('cultivation', 'drying', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="4"><FormGroup><Label>Sorting Process</Label><Input type="text" maxLength="150" value={data.sorting} onChange={(e) => updateData('cultivation', 'sorting', e.target.value)} /></FormGroup></Col>
        <Col xs="12" md="4"><FormGroup><Label>Packing Process</Label><Input type="text" maxLength="150" value={data.packing} onChange={(e) => updateData('cultivation', 'packing', e.target.value)} /></FormGroup></Col>
      </Row>

      <div className="d-flex justify-content-between mt-5">
        <Button color="secondary" onClick={onPrev}>&larr; Previous</Button>
        <Button color="primary" type="submit" size="lg">Submit Registration</Button>
      </div>
    </Form>
  );
};
export default CultivationStep;