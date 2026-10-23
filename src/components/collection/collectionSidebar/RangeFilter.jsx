import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const parseRangeValue = (value) => {
  if (!value || typeof value !== 'string') {
    return [null, null];
  }

  const [rawMin, rawMax] = value.split('-').map(Number);

  return [Number.isFinite(rawMin) ? rawMin : null, Number.isFinite(rawMax) ? rawMax : null];
};

const toRangeString = (min, max) => `${min}-${max}`;

const RangeFilter = ({
  definition,
  selectedValues = [],
  onCommit,
  disabled = false,
}) => {
  const safeMin = Number.isFinite(Number(definition?.min)) ? Number(definition.min) : 0;
  const safeMax = Number.isFinite(Number(definition?.max)) ? Number(definition.max) : safeMin;
  const safeStep = Number.isFinite(Number(definition?.step)) && Number(definition?.step) > 0
    ? Number(definition.step)
    : 1;

  const selectedRangeString = Array.isArray(selectedValues) ? selectedValues[0] : '';
  const [selectedMin, selectedMax] = parseRangeValue(selectedRangeString);

  const [range, setRange] = useState({
    min: selectedMin ?? safeMin,
    max: selectedMax ?? safeMax,
  });
  const rangeRef = useRef(range);

  useEffect(() => {
    const nextRange = {
      min: selectedMin ?? safeMin,
      max: selectedMax ?? safeMax,
    };
    setRange(nextRange);
    rangeRef.current = nextRange;
  }, [safeMax, safeMin, selectedMax, selectedMin]);

  const minPercent = useMemo(() => {
    if (safeMax <= safeMin) {
      return 0;
    }

    return ((range.min - safeMin) / (safeMax - safeMin)) * 100;
  }, [range.min, safeMax, safeMin]);

  const maxPercent = useMemo(() => {
    if (safeMax <= safeMin) {
      return 100;
    }

    return ((range.max - safeMin) / (safeMax - safeMin)) * 100;
  }, [range.max, safeMax, safeMin]);

  const updateRange = useCallback((nextRange) => {
    setRange(nextRange);
    rangeRef.current = nextRange;
  }, []);

  const commitRange = useCallback(() => {
    const currentRange = rangeRef.current;

    if (!definition?.key) {
      return;
    }

    const isDefaultRange =
      currentRange.min <= safeMin &&
      currentRange.max >= safeMax;

    onCommit?.(
      definition.key,
      isDefaultRange ? [] : [toRangeString(currentRange.min, currentRange.max)]
    );
  }, [definition?.key, onCommit, safeMax, safeMin]);

  const handleMinChange = (event) => {
    const nextMin = Math.min(Number(event.target.value), range.max - safeStep);

    updateRange({
      min: Math.max(nextMin, safeMin),
      max: range.max,
    });
  };

  const handleMaxChange = (event) => {
    const nextMax = Math.max(Number(event.target.value), range.min + safeStep);

    updateRange({
      min: range.min,
      max: Math.min(nextMax, safeMax),
    });
  };

  if (safeMax <= safeMin) {
    return <p className="text-content mb-0">Range is unavailable.</p>;
  }

  return (
    <div className="price-range-container px-1 py-3">
      <div className="slider-wrapper">
        <div className="slider-track" />
        <div
          className="slider-range"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(maxPercent - minPercent, 0)}%`,
          }}
        />
        <input
          type="range"
          min={safeMin}
          max={safeMax}
          step={safeStep}
          value={range.min}
          onChange={handleMinChange}
          onMouseUp={commitRange}
          onTouchEnd={commitRange}
          onKeyUp={commitRange}
          onBlur={commitRange}
          className="slider-input"
          disabled={disabled}
          aria-label={`${definition?.label || 'Range'} minimum`}
        />
        <input
          type="range"
          min={safeMin}
          max={safeMax}
          step={safeStep}
          value={range.max}
          onChange={handleMaxChange}
          onMouseUp={commitRange}
          onTouchEnd={commitRange}
          onKeyUp={commitRange}
          onBlur={commitRange}
          className="slider-input"
          disabled={disabled}
          aria-label={`${definition?.label || 'Range'} maximum`}
        />
      </div>

      <div className="price-display">
        {range.min.toLocaleString('en-IN')} to {range.max.toLocaleString('en-IN')}
      </div>

      <style jsx>{`
        .price-range-container {
          width: 100%;
          background: var(--page-bg-color);
        }

        .slider-wrapper {
          position: relative;
          height: 5px;
          margin-bottom: 20px;
        }

        .slider-track {
          position: absolute;
          width: 100%;
          height: 5px;
          background: #e0e0e0;
          border-radius: 5px;
        }

        .slider-range {
          position: absolute;
          height: 5px;
          background: var(--theme-color);
          border-radius: 5px;
        }

        .slider-input {
          position: absolute;
          width: 100%;
          height: 5px;
          background: none;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--theme-color);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          pointer-events: all;
          position: relative;
          z-index: 4;
          margin-top: -6.5px;
        }

        .slider-input:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .slider-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--theme-color);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          pointer-events: all;
          position: relative;
          z-index: 4;
        }

        .slider-input:disabled::-moz-range-thumb {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .slider-input::-webkit-slider-runnable-track {
          -webkit-appearance: none;
          appearance: none;
          height: 5px;
        }

        .slider-input::-moz-range-track {
          height: 5px;
        }

        .price-display {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default memo(RangeFilter);
