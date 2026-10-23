import React, { useState } from 'react';
import { FiTrash } from 'react-icons/fi';
import { Form, FormGroup, Input, Button, Table, InputGroup, InputGroupText } from 'reactstrap';

const MedicinalPlantsStep = ({ data, setFormData, onPrev, onNext }) => {
  const [error, setError] = useState('');

  const handlePlantChange = (index, field, value) => {
    const updatedPlants = [...data];
    updatedPlants[index][field] = value;
    setFormData(prev => ({ ...prev, medicinalPlants: updatedPlants }));
  };

  const addRow = () => {
    const newPlant = { id: Date.now().toString() + Math.random().toString(36).substring(7), itemName: '', part: '', quantity: '', packing: '', harvestDate: '' };
    setFormData(prev => ({ ...prev, medicinalPlants: [...prev.medicinalPlants, newPlant] }));
  };

  const removeRow = (id) => {
    if (data.length === 1) return; // Prevent deleting the last row
    setFormData(prev => ({ ...prev, medicinalPlants: prev.medicinalPlants.filter(plant => plant.id !== id) }));
  };

  const handleValidation = () => {
    const isValid = data.every(plant => plant.itemName.trim() && plant.quantity);
    if (!isValid) { setError("Please fill out 'Item Name' and 'Quantity' for all rows."); return false; }
    setError('');
    return true;
  };

  return (
    <Form
      className="cultivator-step-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (handleValidation()) onNext();
      }}
    >
      <h4 className="mb-4">2. Medicinal Plant(s) Offered</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive-wrapper mb-3">
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: '200px' }}>Item Name *</th>
              <th style={{ minWidth: '150px' }}>Part</th>
              <th style={{ minWidth: '150px' }}>Quantity *</th>
              <th style={{ minWidth: '150px' }}>Packing</th>
              <th style={{ minWidth: '180px' }}>Month/Year Harvest</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((plant, index) => (
              <tr key={plant.id}>
                <td>
                  <Input
                    type="text"
                    value={plant.itemName}
                    onChange={(e) =>
                      handlePlantChange(index, 'itemName', e.target.value)
                    }
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={plant.part}
                    onChange={(e) =>
                      handlePlantChange(index, 'part', e.target.value)
                    }
                  />
                </td>
                <td>
                  <InputGroup>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={plant.quantity}
                      onChange={(e) =>
                        handlePlantChange(index, 'quantity', e.target.value)
                      }
                    />
                    <InputGroupText className="static-unit">kg</InputGroupText>
                  </InputGroup>
                </td>
                <td>
                  <Input
                    type="text"
                    value={plant.packing}
                    onChange={(e) =>
                      handlePlantChange(index, 'packing', e.target.value)
                    }
                  />
                </td>
                <td>
                  <Input
                    type="month"
                    value={plant.harvestDate}
                    onChange={(e) =>
                      handlePlantChange(index, 'harvestDate', e.target.value)
                    }
                  />
                </td>
                <td className="text-center">
                  <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={() => removeRow(plant.id)}
                    disabled={data.length === 1}
                  >
                    <FiTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Button color="secondary" outline onClick={addRow}>
        + Add Another Plant
      </Button>

      <div className="d-flex justify-content-between mt-5">
        <Button color="secondary" onClick={onPrev}>
          &larr; Previous
        </Button>
        <Button color="success" type="submit" size="lg">
          Next Step &rarr;
        </Button>
      </div>
    </Form>
  );
};
export default MedicinalPlantsStep;