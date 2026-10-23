import { formatAddress } from '@/utils/helpers';

const AddressTable = ({ address }) => {
  const fullName = [address?.firstName, address?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const phone = [address?.countryCode, address?.phone]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div className="address-table">
      <div className="address-row">
        <div className="address-label">
          Name <span>:</span>
        </div>
        <div className="address-value text-capitalize">
          <p>{fullName || ''}</p>
        </div>
      </div>
      <div className="address-row">
        <div className="address-label">
          Address <span>:</span>
        </div>
        <div className="address-value">
          {formatAddress(address) || '-'}
        </div>
      </div>
      <div className="address-row">
        <div className="address-label">
          Phone <span>:</span>
        </div>
        <div className="address-value">{phone || '-'}</div>
      </div>
    </div>
  );
};

export default AddressTable;
