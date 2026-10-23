import { memo, useMemo } from 'react';
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  UncontrolledAccordion,
} from 'reactstrap';
import SelectFilter from './SelectFilter';
import RangeFilter from './RangeFilter';
import BooleanFilter from './BooleanFilter';

const FilterRenderer = ({
  filters = [],
  filterState = {},
  open,
  toggle,
  onFilterChange,
  disabled = false,
}) => {
  const defaultOpenList = useMemo(
    () => filters.map((_, index) => String(index + 1)),
    [filters]
  );

  if (!Array.isArray(filters) || filters.length === 0) {
    return null;
  }

  return (
    <UncontrolledAccordion
      className="custome-accordion"
      open={open}
      toggle={toggle}
      stayOpen
      defaultOpen={defaultOpenList}
    >
      {filters.map((definition, index) => {
        const accordionId = String(index + 1);
        const selectedValues = Array.isArray(filterState?.[definition?.key])
          ? filterState[definition.key]
          : [];

        return (
          <AccordionItem key={definition?.key || accordionId}>
            <AccordionHeader targetId={accordionId}>
              <span>{definition?.label || definition?.key}</span>
            </AccordionHeader>
            <AccordionBody accordionId={accordionId}>
              {definition?.type === 'range' ? (
                <RangeFilter
                  definition={definition}
                  selectedValues={selectedValues}
                  onCommit={onFilterChange}
                  disabled={disabled}
                />
              ) : definition?.type === 'boolean' ? (
                <BooleanFilter
                  definition={definition}
                  selectedValues={selectedValues}
                  onChange={onFilterChange}
                  disabled={disabled}
                />
              ) : (
                <SelectFilter
                  definition={definition}
                  selectedValues={selectedValues}
                  onChange={onFilterChange}
                  disabled={disabled}
                />
              )}
            </AccordionBody>
          </AccordionItem>
        );
      })}
    </UncontrolledAccordion>
  );
};

export default memo(FilterRenderer);
