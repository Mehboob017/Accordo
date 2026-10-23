import { Fragment } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import WrapperComponent from '@/components/common/WrapperComponent';
import SkCheckout from '@/components/common/skeletonLoader/checkoutSkeleton/SkCheckout';

export default function CheckoutLoading() {
  return (
    <Fragment>
      <Breadcrumb title="Checkout" subNavigation={[{ name: 'Checkout' }]} />
      <WrapperComponent
        classes={{
          sectionClass: 'compare-section section-b-space',
          row: 'g-0 compare-row',
        }}
        customCol={true}
      >
        <SkCheckout />
      </WrapperComponent>
    </Fragment>
  );
}
