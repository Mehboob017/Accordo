import FilterOverflowList, {
  DEFAULT_FILTER_OVERFLOW_LIMIT,
} from '@/components/common/filterOverflow/FilterOverflowList';
import { memo, useCallback, useMemo, useState } from 'react';
import { Input, Label } from 'reactstrap';

const normalizeString = (value) => String(value || '').toLowerCase().trim();
const SELECT_FILTER_VISIBLE_OPTION_LIMIT = DEFAULT_FILTER_OVERFLOW_LIMIT;

const getOptionCount = (option) => {
  const rawCount = option?.count ?? option?.products_count ?? option?.total;
  const parsedCount = Number(rawCount);

  return Number.isFinite(parsedCount) ? parsedCount : null;
};

const SelectFilter = ({
  definition,
  selectedValues = [],
  onChange,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMulti = definition?.multi !== false;
  const options = Array.isArray(definition?.options) ? definition.options : [];

  const filteredOptions = useMemo(() => {
    if (!definition?.searchable || !searchTerm.trim()) {
      return options;
    }

    const normalizedSearch = normalizeString(searchTerm);

    return options.filter((option) => {
      const optionName = normalizeString(option?.name || option?.label || option?.value);
      return optionName.includes(normalizedSearch);
    });
  }, [definition?.searchable, options, searchTerm]);

  const handleToggle = (value) => {
    if (!value || disabled) {
      return;
    }

    if (!isMulti) {
      const nextValues = selectedValues.includes(value) ? [] : [value];
      onChange?.(definition?.key, nextValues);
      return;
    }

    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    onChange?.(definition?.key, nextValues);
  };

  const renderOptionItem = useCallback(
    (option) => {
      const rawValue = option?.value;
      const optionValue = rawValue === undefined || rawValue === null ? '' : String(rawValue);
      const inputId = `${definition?.key}-${option?.uid || optionValue}`;
      const optionCount = getOptionCount(option);
      const isOptionDisabled = disabled || option?.disabled || !optionValue;
      const checked = selectedValues.includes(optionValue);

      return (
        <li key={option?.uid || optionValue}>
          <div className="form-check category-list-box">
            <Input
              className="checkbox_animated"
              type={isMulti ? 'checkbox' : 'radio'}
              name={definition?.key}
              id={inputId}
              value={optionValue}
              checked={checked}
              onChange={() => handleToggle(optionValue)}
              disabled={isOptionDisabled}
            />
            <Label className="form-check-label" htmlFor={inputId}>
              <span className="name">{option?.name || option?.label || optionValue}</span>
              {optionCount !== null && (
                <span className="number">({optionCount})</span>
              )}
            </Label>
          </div>
        </li>
      );
    },
    [definition?.key, disabled, handleToggle, isMulti, selectedValues]
  );

  return (
    <div>
      {definition?.searchable && (
        <div className="filter-search-box mb-3">
          <Input
            type="search"
            placeholder={`Search ${definition?.label || 'options'}`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            disabled={disabled}
            aria-label={`Search ${definition?.label || 'options'}`}
          />
        </div>
      )}

      <FilterOverflowList
        items={filteredOptions}
        label={definition?.label || 'options'}
        limit={SELECT_FILTER_VISIBLE_OPTION_LIMIT}
        listClassName="category-list custom-padding custom-height"
        disabled={disabled}
        renderItem={renderOptionItem}
        emptyState={
          <li>
            <p className="text-content mb-0">No options found.</p>
          </li>
        }
      />
    </div>
  );
};

export default memo(SelectFilter);
