import { Fragment } from 'react';
import { Input, Label } from 'reactstrap';

const formatRupees = (value) => {
  const amount = Number(value || 0);
  return `₹ ${amount.toFixed(2)}`;
};

const RadioAttribute = ({
  elem,
  soldOutAttributesIds,
  productState,
  setVariant,
  i,
}) => {
  return (
    <div className="d-flex">
      {elem?.attribute_values.map((value, index) => {
        const variationMatch = productState?.product?.variations?.find(
          (variation) =>
            variation?.attribute_values?.some(
              (attribute_value) => Number(attribute_value?.id) === Number(value?.id)
            )
        );

        const salePrice = variationMatch?.sale_price ?? variationMatch?.price;
        const listPrice = variationMatch?.price;
        const stockLabel = variationMatch?.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock';

        return (
        <Fragment key={index}>
          {productState?.attributeValues?.includes(value?.id) ? (
            <div
              className={`form-check ${soldOutAttributesIds.includes(value.id) ? 'disabled' : ''}`}
            >
              <Input
                type="radio"
                className="form-check-input"
                id={`radio-${i}-${index}`}
                name={`radio-group-${i}`}
                value={index}
                checked={productState?.variantIds?.includes(value?.id)}
                disabled={soldOutAttributesIds.includes(value.id)}
                onChange={(e) =>
                  setVariant(
                    productState?.product?.variations,
                    elem?.attribute_values[e.target.value]
                  )
                }
              />
              <Label
                htmlFor={`radio-${i}-${index}`}
                className="form-check-label variation-attr-label"
              >
                <span className="variation-attr-name">{value?.value}</span>
                {variationMatch && (
                  <span className="variation-attr-meta">
                    <span className="variation-attr-price">
                      {salePrice !== undefined ? formatRupees(salePrice) : ''}
                      {listPrice !== undefined && listPrice !== salePrice && (
                        <del>{formatRupees(listPrice)}</del>
                      )}
                    </span>
                    <span
                      className={`variation-attr-stock ${
                        variationMatch?.stock_status === 'in_stock' ? 'in-stock' : 'out-of-stock'
                      }`}
                    >
                      {stockLabel}
                    </span>
                  </span>
                )}
              </Label>
            </div>
          ) : null}
        </Fragment>
        );
      })}
    </div>
  );
};

export default RadioAttribute;
