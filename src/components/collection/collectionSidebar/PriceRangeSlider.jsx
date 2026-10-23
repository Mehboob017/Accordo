import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const getSafeStep = (maxPrice) => {
  if (maxPrice <= 100) {
    return 1;
  }

  return 10;
};

export default function PriceRangeSlider({
  maxPrice,
  value,
  onChange,
  onCommit,
  disabled = false,
}) {
  const safeMaxPrice = Math.max(Number(maxPrice) || 0, 0);
  const absoluteMin = 1;
  const step = getSafeStep(safeMaxPrice);
  const [range, setRange] = useState({
    min: value?.min ?? absoluteMin,
    max: value?.max ?? safeMaxPrice,
  });
  const rangeRef = useRef(range);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    const nextRange = {
      min: Math.max(value?.min ?? absoluteMin, absoluteMin),
      max: Math.min(
        Math.max(value?.max ?? safeMaxPrice, absoluteMin),
        safeMaxPrice
      ),
    };

    setRange(nextRange);
    rangeRef.current = nextRange;
  }, [absoluteMin, safeMaxPrice, value?.max, value?.min]);

  const minDistance = step;

  const minPercent = useMemo(() => {
    if (safeMaxPrice <= absoluteMin) return 0;

    return ((range.min - absoluteMin) / (safeMaxPrice - absoluteMin)) * 100;
  }, [range.min, safeMaxPrice]);

  const maxPercent = useMemo(() => {
    if (safeMaxPrice <= absoluteMin) return 100;

    return ((range.max - absoluteMin) / (safeMaxPrice - absoluteMin)) * 100;
  }, [range.max, safeMaxPrice]);

  const updateRange = useCallback(
    (nextRange) => {
      setRange(nextRange);
      rangeRef.current = nextRange;
      onChange?.(nextRange);
    },
    [onChange]
  );

  const commitRange = useCallback(() => {
    onCommit?.(rangeRef.current);
  }, [onCommit]);

  const handleMinChange = (event) => {
    const raw = Number(event.target.value);

    const nextMin = Math.min(raw, range.max - minDistance);

    updateRange({
      min: Math.max(nextMin, absoluteMin),
      max: range.max,
    });
  };

  const handleMaxChange = (event) => {
    const nextMax = Math.max(
      Number(event.target.value),
      range.min + minDistance
    );
    updateRange({
      min: range.min,
      max: Math.min(nextMax, safeMaxPrice),
    });
  };

  if (safeMaxPrice <= 0) {
    return <div className="price-display">Rs. 0 to Rs. 0</div>;
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
          min={absoluteMin}
          max={safeMaxPrice}
          step={step}
          value={range.min}
          onChange={handleMinChange}
          onMouseUp={commitRange}
          onTouchEnd={commitRange}
          onKeyUp={commitRange}
          onBlur={commitRange}
          className="slider-input"
          style={{ zIndex: range.min > safeMaxPrice - minDistance ? 5 : 3 }}
          disabled={disabled}
        />
        <input
          type="range"
          min={absoluteMin}
          max={safeMaxPrice}
          step={step}
          value={range.max}
          onChange={handleMaxChange}
          onMouseUp={commitRange}
          onTouchEnd={commitRange}
          onKeyUp={commitRange}
          onBlur={commitRange}
          className="slider-input"
          style={{ zIndex: 4 }}
          disabled={disabled}
        />
      </div>

      <div className="price-display">
        Rs.{range.min.toLocaleString('en-IN')} to Rs.
        {range.max.toLocaleString('en-IN')}
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
}
