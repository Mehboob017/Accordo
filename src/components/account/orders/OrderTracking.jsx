'use client';

import { getStatusMeta } from '@/utils/orders/statusMapper';
import './OrderTracking.scss';

const resolveStatusDate = (entry = {}) => {
  return entry?.date || entry?.createdAt || entry?.changedAt || '';
};

export const formatStepDate = (value) => {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const buildTimelineSteps = (statusHistory = []) => {
  const normalizedHistory = Array.isArray(statusHistory) ? statusHistory : [];

  return normalizedHistory
    .map((entry, index) => {
      const rawStatus = String(entry?.status || '').trim();
      const rawDate = resolveStatusDate(entry);

      if (!rawStatus) {
        return null;
      }

      const statusMeta = getStatusMeta(rawStatus);

      return {
        key: `${statusMeta.key}-${index}`,
        label: statusMeta.label,
        icon: statusMeta.icon,
        color: statusMeta.color,
        date: formatStepDate(rawDate),
        note: String(
          entry?.note ||
            entry?.notes ||
            entry?.message ||
            entry?.description ||
            ''
        ).trim(),
      };
    })
    .filter(Boolean);
};

const OrderTracking = ({ statusHistory = [] }) => {
  const steps = buildTimelineSteps(statusHistory);

  if (steps.length === 0) {
    return (
      <p className="step-current">Tracking updates are not available yet.</p>
    );
  }

  const resolvedCurrentIndex = steps.length - 1;

  return (
    <div className="order-tracking">
      <ul className="timeline">
        {steps.map((step, index) => {
          const isCompleted = index <= resolvedCurrentIndex;
          const isActive = index === resolvedCurrentIndex;

          return (
            <li
              key={step.key}
              className={[
                'timeline-step',
                isCompleted ? 'completed' : '',
                isActive ? 'active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--step-color': step.color || 'var(--theme-color)' }}
            >
              <div className="step-indicator">
                <span className="circle">
                  {isCompleted ? <step.icon /> : <span className="dot" />}
                </span>
                {index < steps.length - 1 && (
                  <span
                    className={[
                      'line',
                      isCompleted && index < resolvedCurrentIndex
                        ? 'line-completed'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                )}
              </div>
              <div className="step-content">
                <p className="step-label">{step.label}</p>
                {step.date && <span className="step-date">{step.date}</span>}
                {isActive && !step.date && (
                  <span className="step-current">Current status</span>
                )}
                {step.note && <p className="step-note">{step.note}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderTracking;
