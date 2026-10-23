import { Col, Label } from 'reactstrap';
import { Field, useFormikContext } from 'formik';
import { ReactstrapRadio } from '../reactstrapFormik';
import { formatAddress } from '@/utils/helpers';

const ShowAddress = ({ item, type, index }) => {
  const { values } = useFormikContext();
  const selectedAddressId = values?.[`${type}_address_id`];
  const isSelected = String(selectedAddressId ?? '') === String(item?.uid ?? '');

  return (
    <Col className="col-md-7 col-10">
      <Label htmlFor={`address-${type}-${index}`}>
        <div className={`delivery-address-box ${isSelected ? 'address-selected' : ''}`}>
          <div>
            <div className="form-check">
              <Field
                component={ReactstrapRadio}
                id={`address-${type}-${index}`}
                className="form-check-input"
                type="radio"
                name={`${type}_address_id`}
                value={item.uid}
              />
            </div>
            <ul className="delivery-address-detail">
              <li>
                <h4 className="fw-semibold address-label">
                  {item?.addressType || item?.type || 'Address'}
                </h4>
              </li>
              <li>
                <p className="text-capitalize">
                  {item?.firstName} {item?.lastName} | {item?.countryCode}{' '}
                  {item?.phone}
                </p>
                <p className="text-content">{formatAddress(item)}</p>
              </li>
            </ul>
          </div>
        </div>
      </Label>
    </Col>
  );
};

export default ShowAddress;
