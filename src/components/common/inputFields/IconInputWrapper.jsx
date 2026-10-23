import { useTranslation } from '@/utils/translations';
import { useContext } from 'react';
import { Col, Label } from 'reactstrap';

const IconInputWrapper = (props) => {
  const { t } = useTranslation('common');
  return (
    <Col
      {...props?.colprops}
      className={props?.colclass ? props?.colclass : ''}
    >
      <div className="custom-form mb-3">
        <Label htmlFor={props?.label || ''} className="form-label">
          {t(props?.label)}{' '}
          {props?.require == 'true' && (
            <span className="text-danger required-dot">*</span>
          )}
        </Label>
        {props.children}
      </div>
    </Col>
  );
};

export default IconInputWrapper;
