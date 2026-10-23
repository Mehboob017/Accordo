'use client';

import { useId } from 'react';
import { RiInformationLine } from 'react-icons/ri';
import './CheckoutOrderSummary.scss';
import { UncontrolledTooltip } from 'reactstrap';

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

const CheckoutOrderSummary = ({ summary = {} }) => {
  const {
    itemTotal = 0,
    productDiscount = 0,
    discountedPrice = 0,
    cartSubtotalExGst = 0,
    totalGst = 0,
    subtotal = 0,
    mrp = 0,
    slabDiscount = 0,
    slabDiscountPercentage = 0,
    offerDiscount = 0,
    couponDiscount = 0,
    shippingCharge = 0,
    superCoinDiscount = 0,
    roundOffAmount = 0,
    grandTotal = 0,
    freeShippingThreshold = 0,
  } = summary;

  const shippingTooltipId = useId().replace(/:/g, '');
  const slabDiscountTooltipId = useId().replace(/:/g, '');

  // console.log({ summary });

  return (
    <div className="order-summary-section">
      <h4 className="summary-title">Bill Details</h4>

      <div className="summary-rows">
        <div className="summary-row">
          <span className="label">Item total (MRP - Incl. GST)</span>
          <span className="value">
            <strike
              style={{
                color: '#9e9e9e',
                fontSize: '12px',
              }}
            >
              {formatInr(mrp)}
            </strike>{' '}
            {formatInr(subtotal)}
          </span>
        </div>

        {/* <div className={`summary-row ${productDiscount > 0 ? 'discount' : ''}`}>
          <span className="label">Product discount</span>
          <span className="value">- {formatInr(productDiscount)}</span>
        </div> */}

        <div className={`summary-row`}>
          <span className="label">Base Price</span>
          <span className="value">{formatInr(cartSubtotalExGst)}</span>
        </div>

        {/* <div className="summary-row">
          <span className="label">Discounted price</span>
          <span className="value">{formatInr(discountedPrice)}</span>
        </div> */}

        {slabDiscount > 0 && (
          <div className="summary-row discount">
            <span className="label d-flex gap-1 align-items-center">
              Slab discount
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
            <span className="value">- {formatInr(slabDiscount)}</span>
          </div>
        )}

        {offerDiscount > 0 && (
          <div className="summary-row discount">
            <span className="label">Offer discount</span>
            <span className="value">- {formatInr(offerDiscount)}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="summary-row discount">
            <span className="label">Coupon discount</span>
            <span className="value">- {formatInr(couponDiscount)}</span>
          </div>
        )}

        {superCoinDiscount > 0 && (
          <div
            className={`summary-row ${superCoinDiscount > 0 ? 'discount' : ''}`}
          >
            <span className="label">SDL Points discount</span>
            <span className="value">- {formatInr(superCoinDiscount)}</span>
          </div>
        )}

        {totalGst > 0 && (
          <div className="summary-row">
            <span className="label">GST charges</span>
            <span className="value">{formatInr(totalGst)}</span>
          </div>
        )}

        <div className="summary-row">
          <span className="label d-flex gap-1 align-items-center">
            Shipping charge
            <span
              id={shippingTooltipId}
              className="d-inline-flex align-items-center"
              style={{ cursor: 'pointer', color: 'var(--9e9e9e)' }}
            >
              <RiInformationLine size={16} className="" />
            </span>
          </span>
          <UncontrolledTooltip
            placement="top"
            target={shippingTooltipId}
            style={{ fontSize: 12 }}
          >
            {shippingCharge === 0
              ? `Free shipping on orders above ${formatInr(
                freeShippingThreshold,
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }
              )}!`
              : `Shipping charges apply to orders below ${formatInr(
                freeShippingThreshold,
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }
              )}.`}
          </UncontrolledTooltip>
          <span
            className={`value ${shippingCharge === 0 ? 'theme-color fw-semibold' : ''}`}
          >
            {shippingCharge === 0 ? 'FREE' : formatInr(shippingCharge)}
          </span>
        </div>

        {roundOffAmount !== 0 && (
          <div
            // className={`summary-row ${roundOffAmount < 0 ? 'discount' : ''}`}
            className={`summary-row`}
          >
            <span className="label">Round off</span>
            <span className="value">
              {roundOffAmount < 0
                ? `- ${formatInr(Math.abs(roundOffAmount))}`
                : `+ ${formatInr(roundOffAmount)}`}
            </span>
          </div>
        )}

        <div className="summary-row total">
          <span className="label">Grand total (Incl. GST)</span>
          <span className="value">{formatInr(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;
