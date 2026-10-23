'use client';

import React, { useContext, useEffect, useState } from 'react';
import { RiAddLine, RiMapPinLine } from 'react-icons/ri';
import CheckoutCard from './common/CheckoutCard';
import AddAddressForm from './common/AddAddressForm';
import ShowAddress from './ShowAddress';
import ResponsiveModal from '../common/ResponsiveModal';
import UserContext from '@/helper/userContext';

const DeliveryAddress = ({
  type,
  title,
  address,
  modal,
  mutate,
  setModal,
  setFieldValue,
  values,
  isAddressSubmitting,
}) => {
  const [showAddressLimitModal, setShowAddressLimitModal] = useState(false);
  const { isAuthenticated } = useContext(UserContext);

  useEffect(() => {
    if (!address?.length) return;

    const currentSelectedAddress = values?.[`${type}_address_id`];
    if (currentSelectedAddress) {
      return;
    }

    const defaultAddress = address[0];
    setFieldValue(`${type}_address_id`, defaultAddress?.uid || '');
  }, [address, setFieldValue, type, values]);

  const handleAddNewAddress = () => {
    if (isAddressSubmitting) return;
    if ((address?.length || 0) >= 20) {
      setShowAddressLimitModal(true);
      return;
    }
    setModal(type);
  };

  if (!isAuthenticated) return;

  return (
    <>
      <CheckoutCard icon={<RiMapPinLine />}>
        <div className="checkout-title">
          <h4>{title}</h4>
          {
            isAuthenticated && (
              <a
                className="d-flex align-items-center fw-bold pill-css"
                onClick={handleAddNewAddress}
              >
                Add New
                <RiAddLine className="me-1"></RiAddLine>
              </a>
            )
          }
        </div>
        <div className="checkout-detail">
          {
            <>
              {address?.length > 0 ? (
                <div
                  className="address-list common-scrollbar"
                  data-lenis-prevent
                  style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}
                >
                  {address?.map((item, i) => (
                    <ShowAddress item={item} key={i} type={type} index={i} />
                  ))}
                </div>
              ) : (
                <div className="empty-box">
                  <h2>No Address Found</h2>
                </div>
              )}
            </>
          }
          <ResponsiveModal
            modal={modal == type ? true : false}
            setModal={setModal}
            classes={{
              modalClass: 'theme-modal modal-md',
              modalHeaderClass: 'justify-content-between',
              title:
                type === 'shipping'
                  ? 'Add Shipping Address'
                  : 'Add Billing Address',
            }}
          >
            <AddAddressForm
              mutate={mutate}
              setModal={setModal}
              type={type}
              isSubmitting={isAddressSubmitting}
            />
          </ResponsiveModal>
          <ResponsiveModal
            modal={showAddressLimitModal}
            setModal={setShowAddressLimitModal}
            classes={{
              modalClass: 'theme-modal modal-sm',
              modalHeaderClass: 'justify-content-between',
              title: 'Address Limit Reached',
            }}
          >
            <div className="p-2">Maximum 20 addresses can be added.</div>
          </ResponsiveModal>
        </div>
      </CheckoutCard>
    </>
  );
};

export default DeliveryAddress;
