import { memo } from 'react';
import { Input, Label } from 'reactstrap';

const BooleanFilter = ({
  definition,
  selectedValues = [],
  onChange,
  disabled = false,
}) => {
  const inputId = `${definition?.key}-toggle`;
  const isChecked =
    selectedValues.includes('true') ||
    selectedValues.includes('1') ||
    selectedValues.includes('yes');

  return (
    <div className="filter-boolean-toggle form-check form-switch m-0">
      <Input
        className="form-check-input"
        type="switch"
        role="switch"
        id={inputId}
        checked={isChecked}
        onChange={(event) =>
          onChange?.(definition?.key, event.target.checked ? ['true'] : [])
        }
        disabled={disabled}
        aria-label={definition?.label || 'Boolean filter'}
      />
      <Label className="form-check-label" htmlFor={inputId}>
        {definition?.label}
      </Label>
    </div>
  );
};

export default memo(BooleanFilter);
