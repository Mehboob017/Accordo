import { useTranslation } from '@/utils/translations';
import React, { useContext } from 'react';

const AuthHeadings = (props) => {
  const { t } = useTranslation('common');
  const { heading1, heading2 } = props;
  return (
    <div className="log-in-title">
      <h3>{t(heading1)}</h3>
      <h4>{t(heading2)}</h4>
    </div>
  );
};

export default AuthHeadings;
