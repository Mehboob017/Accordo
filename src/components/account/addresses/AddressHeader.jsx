import Btn from '@/elements/buttons/Btn';
import { RiAddLine, RiCloseLine } from 'react-icons/ri';
import AddressData from './AddressData';
import { useState } from 'react';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import AddAddressForm from '@/components/checkout/common/AddAddressForm';
import CustomModal from '@/components/common/CustomModal';
import {
  useAddCustomerAddress,
  useCustomerAddresses,
  useUpdateCustomerAddress,
} from '@/utils/hooks/useCustomerAddress';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';

const AddressHeader = () => {
  const [editAddress, setEditAddress] = useState();
  const [modal, setModal] = useState(false);
  const [addressLengthError, setAddressLengthError] = useState(false);

  const {
    data,
    refetch,
    isLoading,
    isFetching,
  } = useCustomerAddresses();
  const addressState = Array.isArray(data?.data?.addresses)
    ? data.data.addresses.filter((address) => address.type === 'shipping')
    : [];

  const { mutate: addAddress, isPending: isAddAddressPending } =
    useAddCustomerAddress({
      onSuccess: () => {
        setModal(false);
        refetch && refetch();
      },
    });

  const { mutate: updateAddress, isPending: isEditAddressPending } =
    useUpdateCustomerAddress({
      onSuccess: (data) => {
        setModal(false);
        ToastNotification(
          'success',
          data?.message || 'Address updated successfully'
        );
        refetch && refetch();
      },
    });

  const editMutate = (payload) => {
    const userId = editAddress?.id || editAddress?.uid || editAddress?.userId;
    if (!userId) {
      return;
    }
    updateAddress({ userId, payload });
  };

  const handleAddAddress = () => {
    if (addressState.length < 20) {
      setModal('add');
    } else {
      setAddressLengthError(true);
    }
  };

  return (
    <>
      <div className="dashboard-address">
        {/* Updated Header Card matching the new SCSS */}
        <div className="address-header-card mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h5 className="header-title mb-1">Saved Address</h5>
            <p className="header-subtext mb-0">
              Manage your delivery addresses
            </p>
          </div>
          <Btn
            color="primary"
            className="add-new-btn d-flex gap-2 align-items-center"
            onClick={handleAddAddress}
            title={'Add New Address'}
          >
            <RiAddLine className="stroke-w-1 fs-6" />
          </Btn>
        </div>

        {/* <AddressData
          addressState={addressState}
          modal={modal}
          setModal={setModal}
          setEditAddress={setEditAddress}
        /> */}
        <AddressData
          addressState={addressState}
          isLoading={isLoading || isFetching}
          modal={modal}
          setModal={setModal}
          setEditAddress={setEditAddress}
        />
      </div>

      <div className="checkout-detail">
        <ResponsiveModal
          modal={modal === 'add' || modal === 'edit'}
          setModal={() => setModal(false)}
          closeButton={
            <RiCloseLine
              className="btn-close position-static"
              onClick={() => setModal(false)}
            />
          }
          classes={{
            modalClass: 'theme-modal view-modal address-modal modal-md',
            modalHeaderClass: 'justify-content-between',
            title: modal === 'add' ? 'Add Address' : 'Edit Address',
          }}
          backdrop="static"
        >
          <div className="right-sidebar-box">
            <AddAddressForm
              mutate={modal === 'add' ? addAddress : editMutate}
              setModal={setModal}
              setEditAddress={setEditAddress}
              editAddress={editAddress}
              modal={modal}
              type={modal}
              isSubmitting={
                modal === 'add' ? isAddAddressPending : isEditAddressPending
              }
            />
          </div>
        </ResponsiveModal>
      </div>

      <CustomModal
        modal={addressLengthError}
        setModal={setAddressLengthError}
        classes={{
          modalClass: 'theme-modal view-modal address-view-modal modal-md',
          modalHeaderClass: 'justify-content-between',
          title: 'Address Limit Reached',
        }}
      >
        <div className="text-center">
          <p className="mb-3">
            You can add a maximum of <strong>20 addresses</strong>.
            <br />
            To add a new address, please remove an existing one.
          </p>
          <Btn
            title="Okay, Got it"
            className="theme-bg-color btn-md fw-bold text-light w-100"
            onClick={() => setAddressLengthError(false)}
          />
        </div>
      </CustomModal>
    </>
  );
};

export default AddressHeader;
