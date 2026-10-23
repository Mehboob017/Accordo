'use client';

import { Form, Formik } from 'formik';
import { Col, Row } from 'reactstrap';
import DeliveryAddress from './DeliveryAddress';
import { useEffect, useMemo, useState } from 'react';
import CheckoutSidebar from './checkoutSidebar';
import LoginPrompt from './LoginPrompt';
import UserContext from '@/helper/userContext';
import {
  useAddCustomerAddress,
  useCustomerAddresses,
} from '@/utils/hooks/useCustomerAddress';
import { useContext } from 'react';
import { updateMetaUserData } from '@/utils/metaPixel';

function MetaAddressMatcher({ address, userData }) {
  useEffect(() => {
    if (!address) return;
    updateMetaUserData({
      email: userData?.email,
      phone: address?.phone,
      firstName: address?.firstName,
      lastName: address?.lastName,
      city: address?.city,
      state: address?.state,
      pincode: address?.pincode,
      country: address?.countryCode || 'IN',
      externalId: userData?.uid,
    });
  }, [address, userData]);

  return null;
}

const CheckoutForm = () => {
  const [address, setAddress] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState('');
  const [modal, setModal] = useState('');
  const { isAuthenticated, userData } = useContext(UserContext);
  const { data, refetch } = useCustomerAddresses({
    enabled: isAuthenticated,
  });

  const addressList = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    const addresses = Array.isArray(data?.data?.addresses)
      ? data.data.addresses
      : [];
    const shippingAddresses = addresses.filter((item) => item?.type === 'shipping');

    return shippingAddresses.length > 0 ? shippingAddresses : addresses;
  }, [data?.data?.addresses, isAuthenticated]);

  const { mutate: addAddressMutate, isPending: isAddressSubmitting } =
    useAddCustomerAddress({
      onSuccess: () => {
      setModal('');
      refetch && refetch();
      },
    });

  useEffect(() => {
    setAddress(addressList);
  }, [addressList]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAddress([]);
      setDefaultAddressId('');
      return;
    }

    let preferredAddressId = '';

    if (typeof window !== 'undefined') {
      const rawDraft = sessionStorage.getItem('checkout-offcanvas-data');
      if (rawDraft) {
        try {
          const parsedDraft = JSON.parse(rawDraft);
          preferredAddressId = parsedDraft?.selectedAddressId || '';
        } catch (error) {
          console.error('Unable to parse checkout-offcanvas-data', error);
        }
      }
    }

    if (!preferredAddressId && addressList?.length > 0) {
      preferredAddressId = addressList[0]?.uid || '';
    }

    setDefaultAddressId(preferredAddressId || '');
  }, [addressList, isAuthenticated]);

  return (
    <Formik
      enableReinitialize
      initialValues={{
        shipping_address_id: defaultAddressId || '',
        billing_address_id: defaultAddressId || '',
      }}
    >
      {({ values, setFieldValue }) => {
        const selectedShippingAddress =
          address.find(
            (item) =>
              item?.id === values.shipping_address_id ||
              item?.uid === values.shipping_address_id
          ) || address[0] || null;

        return (
          <Form>
            <MetaAddressMatcher
              address={selectedShippingAddress}
              userData={userData}
            />
            <div className="pb-4 checkout-section-2">
              <Row className="g-sm-4 g-3">
                <Col xl="7">
                  <div className="left-sidebar-checkout">
                    <div className="checkout-detail-box">
                      <ul>
                        <LoginPrompt />
                        <DeliveryAddress
                          key="shipping"
                          type="shipping"
                          title={'Shipping Address'}
                          values={values}
                          updateId={values['consumer_id']}
                          setFieldValue={setFieldValue}
                          address={address}
                          modal={modal}
                          mutate={addAddressMutate}
                          setModal={setModal}
                          isAddressSubmitting={isAddressSubmitting}
                        />
                      </ul>
                    </div>
                  </div>
                </Col>
                <CheckoutSidebar
                  values={values}
                  setFieldValue={setFieldValue}
                  selectedShippingAddress={selectedShippingAddress}
                  onAddAddress={() => setModal('shipping')}
                />
              </Row>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CheckoutForm;
