import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoMdRefresh } from 'react-icons/io';
import styles from './PageActionOverlay.module.scss';

const PageActionOverlay = ({ isOpen = false, icon: Icon = IoMdRefresh }) => {
  useEffect(() => {
    if (typeof document === 'undefined' || !isOpen) {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;

    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className={styles.overlay}>
      <Icon className={styles.icon} />
    </div>,
    document.body
  );
};

export default memo(PageActionOverlay);
