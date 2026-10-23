import { memo, useCallback } from 'react';
import { AccordionBody, Input, Label } from 'reactstrap';

const CollectionCheckboxSection = ({
  accordionId,
  filterKey,
  options,
  selectedValues,
  onToggle,
  disabled = false,
}) => {
  const handleChange = useCallback(
    (event) => {
      onToggle(filterKey, event.target.value);
    },
    [filterKey, onToggle]
  );

  return (
    <AccordionBody accordionId={accordionId}>
      <ul   data-lenis-prevent className="category-list custom-padding custom-height">
        {options.map((option) => {
          const inputId = `${filterKey}-${option.uid || option.value}`;
          const isOptionDisabled = disabled || option.disabled || !option.value;

          return (
            <li key={option.uid || option.value}>
              <div className="form-check category-list-box">
                <Input
                  className="checkbox_animated"
                  type="checkbox"
                  id={inputId}
                  value={option.value}
                  checked={selectedValues.includes(option.value)}
                  onChange={handleChange}
                  disabled={isOptionDisabled}
                />
                <Label className="form-check-label" htmlFor={inputId}>
                  <span className="name">{option.name}</span>
                </Label>
              </div>
            </li>
          );
        })}
      </ul>
    </AccordionBody>
  );
};

export default memo(CollectionCheckboxSection);