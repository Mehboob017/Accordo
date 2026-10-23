'use client';

import { useId } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { RiInformationLine } from 'react-icons/ri';
import './OrderSummary.scss';

const OrderSummary = ({ summary }) => {
  const {
    subtotalExGst = 0,
    gstAmount = 0,
    totalMrp = 0,
    subtotal = 0,
    mrp = 0,
    itemTotal = 0,
    discountedPrice = 0,
    slabDiscountAmount = 0,
    slabDiscountPercentage = 0,
    couponDiscount = 0,
    shippingCharge = 0,
    sdlCoinDiscount = 0,
    grandTotal = 0,
    roundingAmount = 0,
    offerDiscountAmount = 0,
  } = summary || {};

  const slabDiscountTooltipId = useId().replace(/:/g, '');

  // const productDiscount = (mrp || itemTotal) - (discountedPrice || itemTotal);

  // console.log('OrderSummary - summary:', summary);

  const toSafeNumber = (value) => {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  };

  const formatInr = (value, options = {}) => {
    const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(toSafeNumber(value));
  };

  return (
    <div className="order-summary-section">
      <h4 className="summary-title ">Bill Details</h4>

      <div className="summary-rows">
        {/* total mrp */}
        <div className="summary-row">
          <span className="label">Item total (MRP - Incl. GST)</span>
          <span className="value">
            <strike
              style={{
                color: '#9e9e9e',
                fontSize: '12px',
              }}
            >
              {formatInr(totalMrp)}
            </strike>{' '}
            {formatInr(subtotal)}
          </span>
        </div>

        {/* product discount */}
        {/* {productDiscount > 0 && (
          <div className="summary-row discount">
            <span className="label">Product discount</span>
            <span className="value">- ₹{productDiscount.toFixed(2)}</span>
          </div>
        )} */}

        <div className={`summary-row`}>
          <span className="label">Base Price</span>
          <span className="value">{formatInr(subtotalExGst)}</span>
        </div>

        {/* discounted price */}
        {/* <div className="summary-row">
          <span className="label">Discounted price</span>
          <span className="value">
            ₹{(discountedPrice || itemTotal).toFixed(2)}
          </span>
        </div> */}

        {/* slab discount */}
        {slabDiscountAmount > 0 && (
          <div className="summary-row discount">
            <span className="label d-flex gap-1 align-items-center">
              Slab discount{' '}
              {slabDiscountPercentage > 0
                ? ` (${Number(slabDiscountPercentage).toFixed(2).replace(/\.00$/, '')}%)`
                : ''}
              {/* <RiInformationLine id={slabDiscountTooltipId} size={16} className="" /> */}
              <span
                id={slabDiscountTooltipId}
                className="d-inline-flex align-items-center"
                style={{ cursor: 'pointer', color: 'var(--9e9e9e)' }}
              >
                <RiInformationLine size={16} className="" />
              </span>
            </span>
            <UncontrolledTooltip
              placement="top"
              target={slabDiscountTooltipId}
              style={{ fontSize: 12 }}
            >
              Applied on the base price (excluding GST)
            </UncontrolledTooltip>
            <span className="value">- ₹{slabDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        {/* offer discount */}
        {offerDiscountAmount > 0 && (
          <div className="summary-row discount">
            <span className="label">Offer discount</span>
            <span className="value">- ₹{offerDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        {/* coupon discount */}
        {couponDiscount > 0 && (
          <div className="summary-row discount">
            <span className="label">Coupon discount</span>
            <span className="value">- ₹{couponDiscount.toFixed(2)}</span>
          </div>
        )}

        {/* coin discount */}
        {sdlCoinDiscount > 0 && (
          <div className="summary-row discount">
            <span className="label">SDL Points discount</span>
            <span className="value">- ₹{sdlCoinDiscount.toFixed(2)}</span>
          </div>
        )}

        {gstAmount > 0 && (
          <div className="summary-row">
            <span className="label">GST charges</span>
            <span className="value">{formatInr(gstAmount)}</span>
          </div>
        )}

        {/* shipping charges */}
        <div className="summary-row">
          <span className="label d-flex gap-1 align-items-center">
            Shipping charge
          </span>
          <span
            className={`value ${shippingCharge === 0 ? 'theme-color fw-semibold' : ''}`}
          >
            {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toFixed(2)}`}
          </span>
        </div>

        {/* rounding amount */}
        {roundingAmount !== 0 && (
          <div
            // className={`summary-row ${roundingAmount < 0 ? 'discount' : ''}`}
            className={`summary-row`}
          >
            <span className="label">Round off</span>
            <span className="value">
              {roundingAmount < 0
                ? `- ${formatInr(Math.abs(roundingAmount))}`
                : `+ ${formatInr(roundingAmount)}`}
            </span>
          </div>
        )}

        {/* grand total */}
        <div className="summary-row total">
          <span className="label">
            Grand total{' '}
            <span className="gst-inclusive-text text-muted small mb-0">
              (Incl. GST)
            </span>
          </span>
          <span className="value">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
