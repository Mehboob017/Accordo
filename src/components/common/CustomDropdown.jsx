'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RiArrowDownSLine, RiCheckLine } from 'react-icons/ri';

/**
 * CustomDropdown - A fully styled custom dropdown component
 * @param {Object} props
 * @param {string} props.label - Label text for the dropdown
 * @param {string} props.value - Current selected value
 * @param {Array} props.options - Array of {label, value} objects
 * @param {Function} props.onChange - Callback when value changes (value) => {}
 * @param {string} props.placeholder - Placeholder text when no value selected
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disable the dropdown
 * @param {string} props.triggerId - Unique id for trigger/label association
 */
const CustomDropdown = forwardRef((
  {
    label,
    value,
    options = [],
    onChange,
    placeholder = 'Select an option',
    className = '',
    disabled = false,
    triggerId = 'custom-dropdown-trigger',
  },
  ref
) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle option selection
  const handleOptionClick = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  useImperativeHandle(ref, () => ({
    click: () => triggerRef.current?.click?.(),
    close: () => setIsOpen(false),
    open: () => !disabled && setIsOpen(true),
    toggle: () => !disabled && setIsOpen((v) => !v),
  }));

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus next option
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const nextIndex = Math.min(currentIndex + 1, options.length - 1);
          if (nextIndex !== currentIndex) {
            handleOptionClick(options[nextIndex].value);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus previous option
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (prevIndex !== currentIndex) {
            handleOptionClick(options[prevIndex].value);
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
      {label && (
        <label className="custom-dropdown__label" htmlFor={triggerId}>
          {label}
        </label>
      )}

      <div
        className={`custom-dropdown__trigger h-100 ${isOpen ? 'is-open' : ''} ${
          disabled ? 'is-disabled' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        id={triggerId}
        ref={triggerRef}
      >
        <span className="custom-dropdown__trigger-text">{selectedLabel}</span>
        <RiArrowDownSLine
          className={`custom-dropdown__trigger-icon ${isOpen ? 'rotate' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="custom-dropdown__menu" role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                className={`custom-dropdown__option ${
                  isSelected ? 'is-selected' : ''
                }`}
                onClick={() => handleOptionClick(option.value)}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOptionClick(option.value);
                  }
                }}
              >
                <span className="custom-dropdown__option-label">
                  {option.label}
                </span>
                {isSelected && (
                  <RiCheckLine className="custom-dropdown__option-check" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default CustomDropdown;
