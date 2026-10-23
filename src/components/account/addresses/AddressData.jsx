import NoDataFound from '@/components/common/NoDataFound';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal';
import Loader from '@/layout/loader';
import { useState } from 'react';
import {
  RiDeleteBinLine,
  RiEditBoxLine,
  RiHome4Line,
  RiBuilding4Line,
  RiPhoneLine,
  RiMailLine,
} from 'react-icons/ri';
import { Col, Row } from 'reactstrap';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { useDeleteCustomerAddress } from '@/utils/hooks/useCustomerAddress';
import { useQueryClient } from '@tanstack/react-query';
import emptyImage from '../../../../public/assets/svg/empty-items.svg';
import { formatAddress } from '@/utils/helpers';
import { capitalizeWords } from '@/utils/customFunctions/Capitalize';

const AddressData = ({
  addressState,
  isLoading,
  modal,
  setModal,
  setEditAddress,
}) => {
  const [deleteId, setDeleteId] = useState('');
  const queryClient = useQueryClient();

  const { mutate: deleteAddress } = useDeleteCustomerAddress({
    onSuccess: (res) => {
      setModal('');
      setDeleteId('');
      queryClient.invalidateQueries(['customer-address']);
      ToastNotification(
        'success',
        res?.message || 'Address deleted successfully.'
      );
    },
    onError: (error) => {
      ToastNotification(
        'error',
        error?.message || 'Failed to delete address'
      );
    },
  });

  const removeAddress = () => {
    if (!deleteId) return;
    deleteAddress(deleteId);
  };

  const getAddressIcon = (type) => {
    if (type?.toLowerCase() === 'home') return <RiHome4Line />;
    if (type?.toLowerCase() === 'office') return <RiBuilding4Line />;
    return <RiHome4Line />;
  };

  if (isLoading) {
    return null;
    return (
      <Row className="g-sm-4 g-3 dashboard-address">
        <Col xs={12}>
          <Loader />
        </Col>
      </Row>
    );
  }

  return (
    <Row className="g-sm-4 g-3 dashboard-address">
      {addressState?.length > 0 ? (
        addressState.map((address) => (
          <Col xl={6} lg={12} md={6} key={address.uid}>
            <div
              className={`address-box ${address.defaultFlag ? 'active-address' : ''
                }`}
            >
              <div className="address-header d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  {address?.addressType && (
                    <div
                      className={`address-type-badge ${address.defaultFlag ? 'active' : ''
                        }`}
                    >
                      {getAddressIcon(address.addressType)}
                      <span>{address.addressType}</span>
                    </div>
                  )}

                  {/* {address?.defaultFlag && (
                    <div className="default-badge">
                      <span>Default</span>
                    </div>
                  )} */}
                </div>

                <div className="address-actions d-flex gap-2">
                  <button
                    className="address-action-btn edit-btn"
                    onClick={() => {
                      setEditAddress(address);
                      setModal('edit');
                    }}
                  >
                    <RiEditBoxLine />
                  </button>

                  <button
                    className="address-action-btn delete-btn"
                    onClick={() => {
                      setDeleteId(address.uid);
                      setModal('remove');
                    }}
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              </div>

              <div className="address-details">
                {address?.firstName && (
                  <h5 className="user-name">
                    {`${capitalizeWords(address?.firstName ?? '')} ${capitalizeWords(address?.lastName ?? '')}`}
                  </h5>
                )}

                <p className="address-text">
                  {formatAddress(address) || ''}
                </p>

                {address?.phone && (
                  <div className="phone-number">
                    <RiPhoneLine />
                    <span>
                      {address?.countryCode || '+91'} {address?.phone}
                    </span>
                  </div>
                )}

                {address?.email && (
                  <div className="phone-number">
                    <RiMailLine />
                    <span>{address.email}</span>
                  </div>
                )}
              </div>
            </div>
          </Col>
        ))
      ) : (
        <Col xs={12}>
          <NoDataFound
            data={{
              customClass: 'no-data-added',
              imageUrl: emptyImage,
              title: 'No Address Found',
              description:
                'You have not added any addresses yet. Please add an address to manage your deliveries.',
              height: 300,
              width: 300,
            }}
          />
        </Col>
      )}

      <ConfirmDeleteModal
        modal={modal === 'remove'}
        setModal={setModal}
        confirmFunction={removeAddress}
        setDeleteId={setDeleteId}
      />
    </Row>
  );
};
export default AddressData;