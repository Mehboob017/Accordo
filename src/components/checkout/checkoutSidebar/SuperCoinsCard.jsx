import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Confetti from 'react-confetti-boom';
import { RiInformationLine } from 'react-icons/ri';
import { UncontrolledTooltip } from 'reactstrap';
import styles from './SuperCoinsCard.module.scss';

const clampRatio = (value) => Math.min(1, Math.max(0, value));

const formatCoinCount = (value) => {
  const normalizedValue = Math.max(0, Math.floor(Number(value) || 0));

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(normalizedValue);
};

const formatCoinValue = (value) => {
  const normalizedValue = Number(value);

  if (!Number.isFinite(normalizedValue)) {
    return '0';
  }

  if (Math.floor(normalizedValue) === normalizedValue) {
    return normalizedValue.toFixed(0);
  }

  return normalizedValue.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
};

const SuperCoinsCard = ({
  isApplied,
  onToggle,
  totalSuperCoinsAmount = 0,
  coinValue = 1,
  appliedCoinsCount = 0,
  resetHighlightSignal = 0,
  disabled = false,
}) => {
  const cardRef = useRef(null);
  const safeCoinValue = Number(coinValue) || 1;
  const safeTotalSuperCoins = Math.max(0, Math.floor(Number(totalSuperCoinsAmount) || 0));
  const safeAppliedCoinsCount = Math.max(0, Math.floor(Number(appliedCoinsCount) || 0));
  const activeCoinsCount = Math.max(
    0,
    safeTotalSuperCoins - (isApplied ? safeAppliedCoinsCount : 0)
  );
  const convertedSavingsAmount = Number(
    (safeAppliedCoinsCount * safeCoinValue).toFixed(2)
  );
  const effectiveSavingsAmount = isApplied ? convertedSavingsAmount : 0;
  const savedText = `₹${effectiveSavingsAmount.toFixed(2)}`;
  const conversionText = `${formatCoinCount(
    safeAppliedCoinsCount
  )} points x ₹${formatCoinValue(safeCoinValue)} = ₹${convertedSavingsAmount.toFixed(2)}`;
  const infoIconId = useId().replace(/:/g, '');
  const previouslyAppliedRef = useRef(isApplied);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);
  const [confettiPlacement, setConfettiPlacement] = useState({
    originX: 0.5,
    originY: 0.5,
    style: {
      width: '100vw',
      height: '100vh',
      transform: 'translate3d(0, 0, 0)',
    },
  });
  const [coinCounterState, setCoinCounterState] = useState({
    previous: activeCoinsCount,
    current: activeCoinsCount,
    direction: 'up',
    isAnimating: false,
  });
  const [isResetHighlighted, setIsResetHighlighted] = useState(false);

  const updateConfettiPlacement = useCallback(() => {
    if (!cardRef.current || typeof window === 'undefined') {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth || 1;
    const viewportHeight = window.innerHeight || 1;
    const originX = clampRatio((rect.left + rect.width * 0.5) / viewportWidth);
    const originY = clampRatio((rect.top + rect.height * 0.7) / viewportHeight);

    setConfettiPlacement({
      originX,
      originY,
      style: {
        width: `${viewportWidth}px`,
        height: `${viewportHeight}px`,
        transform: `translate3d(${-rect.left}px, ${-rect.top}px, 0)`,
      },
    });
  }, []);

  useEffect(() => {
    updateConfettiPlacement();

    const handleViewportChange = () => {
      updateConfettiPlacement();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, { passive: true });

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange);
    };
  }, [updateConfettiPlacement]);

  useEffect(() => {
    if (!previouslyAppliedRef.current && isApplied) {
      updateConfettiPlacement();
      setConfettiBurstKey((currentKey) => currentKey + 1);
    }

    previouslyAppliedRef.current = isApplied;
  }, [isApplied, updateConfettiPlacement]);

  useEffect(() => {
    setCoinCounterState((currentState) => {
      if (currentState.current === activeCoinsCount) {
        return currentState;
      }

      return {
        previous: currentState.current,
        current: activeCoinsCount,
        direction: activeCoinsCount < currentState.current ? 'up' : 'down',
        isAnimating: true,
      };
    });
  }, [activeCoinsCount]);

  useEffect(() => {
    if (!coinCounterState.isAnimating) {
      return undefined;
    }

    const animationTimeout = window.setTimeout(() => {
      setCoinCounterState((currentState) => ({
        ...currentState,
        previous: currentState.current,
        isAnimating: false,
      }));
    }, 280);

    return () => {
      window.clearTimeout(animationTimeout);
    };
  }, [coinCounterState.isAnimating]);

  useEffect(() => {
    if (!resetHighlightSignal) {
      return undefined;
    }

    setIsResetHighlighted(true);

    const highlightTimeout = window.setTimeout(() => {
      setIsResetHighlighted(false);
    }, 1100);

    return () => {
      window.clearTimeout(highlightTimeout);
    };
  }, [resetHighlightSignal]);

  const animatedCoinValues = useMemo(() => {
    if (!coinCounterState.isAnimating) {
      return [];
    }

    if (coinCounterState.direction === 'down') {
      return [coinCounterState.current, coinCounterState.previous];
    }

    return [coinCounterState.previous, coinCounterState.current];
  }, [
    coinCounterState.current,
    coinCounterState.direction,
    coinCounterState.isAnimating,
    coinCounterState.previous,
  ]);

  const handleChange = () => {
    if (disabled || typeof onToggle !== 'function') return;

    const nextState = !isApplied;
    onToggle(nextState);
  };

  return (
    <div className={styles.supercoinsWrapper}>
      <button
        ref={cardRef}
        type="button"
        className={`${styles.supercoinsCard} ${isApplied ? styles.checked : ''} ${
          isResetHighlighted ? styles.resetHighlight : ''
        }`}
        onClick={handleChange}
        disabled={disabled}
      >
        {isApplied && confettiBurstKey > 0 && (
          <div className={styles.confettiLayer} aria-hidden="true">
            <Confetti
              key={confettiBurstKey}
              mode="boom"
              particleCount={100}
              x={confettiPlacement.originX}
              y={confettiPlacement.originY}
              spreadDeg={90}
              shapeSize={7}
              // effectCount={2}
              // effectInterval={3000}
              launchSpeed={0.5}
              opacityDeltaMultiplier={0.9}
              style={confettiPlacement.style}
              colors={['#0da487', '#6ed1bd', '#f3c95f', '#fefefe']}
            />
          </div>
        )}

        <div className={styles.supercoinsLeft}>
          <div className={`${styles.supercoinsCheckbox} ${isApplied ? styles.checked : ''}`}>
            <div className={styles.supercoinsCheckboxIcon} />
          </div>

          <div className={styles.supercoinsTextGroup}>
            <div className={styles.supercoinsTitleRow}>
              <span className={styles.supercoinsTitle}>SDL Points</span>
            </div>
            <div className={styles.supercoinsSubtitle}>
              <span className={styles.supercoinsSubtitleLabel}>
                Total Active SDL Points:
              </span>
              <span className={styles.coinCounter}>
                {coinCounterState.isAnimating ? (
                  <span
                    className={`${styles.coinCounterTrack} ${
                      coinCounterState.direction === 'down'
                        ? styles.slideDown
                        : styles.slideUp
                    }`}
                  >
                    {animatedCoinValues.map((value, index) => (
                      <span
                        key={`${value}-${index}`}
                        className={styles.coinCounterValue}
                      >
                        {formatCoinCount(value)}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className={styles.coinCounterValue}>
                    {formatCoinCount(coinCounterState.current)}
                  </span>
                )}
              </span>
              <RiInformationLine
                size={14}
                className={styles.supercoinsInfoIcon}
                id={infoIconId}
              />
            </div>
          </div>
        </div>

        <div className={styles.supercoinsRight}>
          <div className={styles.supercoinsRightLabel}>You saved</div>
          <div className={styles.supercoinsRightAmount}>
            {isApplied ? savedText : '₹00.00'}
          </div>
        </div>
      </button>

      <UncontrolledTooltip
        placement="top"
        target={infoIconId}
        className="supercoins-custom-tooltip"
      >
        <div className={styles.tooltipContent}>
          <div className={styles.tooltipTitle}>
            You have {safeTotalSuperCoins} SDL Points
          </div>
          <div className={styles.tooltipText}>
            SDL Points apply on product amount only. Shipping is paid separately.
          </div>
          <div className={styles.tooltipDivider} />
          <div className={styles.tooltipRate}>
            1 SDL Coin = ₹{formatCoinValue(safeCoinValue)}
          </div>
        </div>
      </UncontrolledTooltip>
    </div>
  );
};

export default SuperCoinsCard;
