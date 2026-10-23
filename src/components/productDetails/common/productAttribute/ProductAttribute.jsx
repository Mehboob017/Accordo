import { useContext, useEffect, useState } from 'react';
import RadioAttribute from './RadioAttribute';
import DropdownAttribute from './DropdownAttribute';
import ColorAttribute from './ColorAttribute';
import ImageOtherAttributes from './Image&OtherAttributes';
import CartContext from '@/helper/cartContext';

// Local currency formatter for variation cards
const convertToRupees = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '';
  return `₹ ${amount.toFixed(2)}`;
};

const ProductAttribute = ({
  productState,
  setProductState,
  stickyAddToCart,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [soldOutAttributesIds, setSoldOutAttributesIds] = useState([]);
  const { cartProducts } = useContext(CartContext);
  const [cartItem, setCartItem] = useState();

  const variations = productState?.product?.variations || [];
  const selectedVariationId =
    productState?.selectedVariation?.id ||
    productState?.variation?.id ||
    productState?.variation_id;

  /* ----------------------------
     Sync cart item ONCE
  -----------------------------*/
  useEffect(() => {
    if (!productState?.product?.id) return;

    const found = cartProducts?.find(
      (elem) => elem?.product?.id === productState.product.id
    );

    if (found !== cartItem) {
      setCartItem(found);
    }
  }, [cartProducts, productState?.product?.id]);

  /* ----------------------------
     Restore variant from cart
  -----------------------------*/
  useEffect(() => {
    if (!cartItem?.variation || productState?.selectedVariation) return;

    const attributeIds = cartItem.variation.attribute_values.map((v) => v.id);

    setSelectedOptions(
      cartItem.variation.attribute_values.map((v) => ({
        id: Number(v.id),
        attribute_id: Number(v.attribute_id),
      }))
    );

    setProductState((prev) => ({
      ...prev,
      attributeValues: attributeIds,
      variantIds: attributeIds,
      selectedVariation: cartItem.variation,
      variation: cartItem.variation,
      variation_id: cartItem.variation.id,
    }));
  }, [cartItem]);

  /* ----------------------------
     Auto-select lowest price variation (default)
  -----------------------------*/
  useEffect(() => {
    if (!variations.length) return;
    // Skip if already selected via cart or user interaction
    if (productState?.selectedVariation || cartItem?.variation) return;

    // Find the in-stock variation with the lowest sale_price
    const inStockVariations = variations.filter(
      (v) => v.stock_status === 'in_stock'
    );
    const pool = inStockVariations.length > 0 ? inStockVariations : variations;
    const cheapest = pool.reduce((min, v) => {
      const price = v.sale_price ?? v.price ?? Infinity;
      const minPrice = min.sale_price ?? min.price ?? Infinity;
      return price < minPrice ? v : min;
    }, pool[0]);

    if (cheapest) {
      handleVariantSelect(cheapest);
    }
  }, [variations.length]);

  /* ----------------------------
     Stock check (guarded)
  -----------------------------*/
  const checkStockAvailable = () => {
    setProductState((prev) => {
      if (prev.selectedVariation) {
        const status =
          prev.selectedVariation.quantity < prev.productQty
            ? 'out_of_stock'
            : 'in_stock';

        if (prev.selectedVariation.stock_status === status) return prev;

        return {
          ...prev,
          selectedVariation: {
            ...prev.selectedVariation,
            stock_status: status,
          },
        };
      }

      const status =
        prev.product.quantity < prev.productQty ? 'out_of_stock' : 'in_stock';

      if (prev.product.stock_status === status) return prev;

      return {
        ...prev,
        product: { ...prev.product, stock_status: status },
      };
    });
  };

  /* ----------------------------
     Variant resolver
  -----------------------------*/
  const setVariant = (variations, value) => {
    if (!value) return;

    let tempSelected = [...selectedOptions];
    let tempSoldOut = [];
    let matchedVariation = null;

    const index = tempSelected.findIndex(
      (item) => Number(item.attribute_id) === Number(value.attribute_id)
    );

    if (index === -1) {
      tempSelected.push({
        id: Number(value.id),
        attribute_id: Number(value.attribute_id),
      });
    } else {
      tempSelected[index] = {
        id: Number(value.id),
        attribute_id: Number(value.attribute_id),
      };
    }

    const tempVariantIds = tempSelected.map((v) => v.id);

    variations?.forEach((variation) => {
      const attrIds = variation.attribute_values.map((v) => v.id);

      const isMatch =
        attrIds.length === tempVariantIds.length &&
        attrIds.every((id) => tempVariantIds.includes(id));

      if (isMatch) matchedVariation = variation;

      if (variation.stock_status === 'out_of_stock') {
        tempSoldOut.push(...attrIds);
      }
    });

    setSelectedOptions(tempSelected);
    setSoldOutAttributesIds([...new Set(tempSoldOut)]);

    setProductState((prev) => ({
      ...prev,
      attributeValues: tempVariantIds,
      variantIds: tempVariantIds,
      ...(matchedVariation && {
        selectedVariation: matchedVariation,
        variation: matchedVariation,
        variation_id: matchedVariation.id,
      }),
      product: {
        ...prev.product,
        attributes: prev.product.attributes.map((attr) =>
          attr.id === value.attribute_id
            ? { ...attr, selected_value: value.value }
            : attr
        ),
      },
    }));

    if (matchedVariation) {
      checkStockAvailable();
    }
  };

  /* ----------------------------
     Variant card click
  -----------------------------*/
  const handleVariantSelect = (variation) => {
    if (!variation) return;

    const attributeIds = variation.attribute_values.map((v) => v.id);

    setSelectedOptions(
      variation.attribute_values.map((v) => ({
        id: Number(v.id),
        attribute_id: Number(v.attribute_id),
      }))
    );

    setSoldOutAttributesIds([]);

    setProductState((prev) => ({
      ...prev,
      attributeValues: attributeIds,
      variantIds: attributeIds,
      selectedVariation: variation,
      variation,
      variation_id: variation.id,
    }));
  };

  /* ----------------------------
     JSX (UNCHANGED)
  -----------------------------*/
  return (
    <div className="pickup-box">
      <div className="product-info">
        <div className="variation-availability-summary">
          <span className="variation-availability-label product-title">
            <h4>Availability: Net Quantity</h4>
          </span>
        </div>

        {variations.length > 0 ? (
          <div className="variation-radio-list">
            {variations.map((variation) => {
              const attrValues = variation?.attribute_values || [];
              const valueLabel = attrValues
                .map((val) => val?.value)
                .filter(Boolean)
                .join(' / ');
              const sale = variation?.sale_price ?? variation?.price;
              const priceToShow = sale;
              const inStock = variation?.stock_status === 'in_stock';
              const isSelected =
                Number(selectedVariationId) === Number(variation?.id);

              return (
                <button
                  type="button"
                  key={variation?.id ?? valueLabel}
                  className={`variation-radio-card ${isSelected ? 'active' : ''} ${!inStock ? 'disabled' : ''}`}
                  onClick={() => inStock && handleVariantSelect(variation)}
                  disabled={!inStock}
                  aria-pressed={isSelected}
                >
                  <div className="variation-radio-content">
                    <div className="variation-radio-title-row">
                      <span className="variation-radio-title">
                        {valueLabel || 'Variant'}
                      </span>
                    </div>

                    <div className="variation-radio-pricing">
                      <span className="variation-price-strong">
                        {priceToShow !== undefined
                          ? convertToRupees(priceToShow)
                          : ''}
                      </span>
                    </div>

                    <div className="variation-radio-bottom">
                      <span
                        className={`variation-radio-stock ${inStock ? 'in-stock' : 'out-of-stock'}`}
                      >
                        {inStock ? 'In stock' : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          productState?.product?.attributes?.map((elem, i) => (
            <div className="product-package" key={i}>
              {stickyAddToCart ? (
                <DropdownAttribute
                  elem={elem}
                  setVariant={setVariant}
                  soldOutAttributesIds={soldOutAttributesIds}
                  i={i}
                  productState={productState}
                />
              ) : (
                <>
                  <div className="product-title">
                    <h4>
                      {elem?.name} : {elem?.selected_value}
                    </h4>
                  </div>

                  {elem?.style == 'radio' ? (
                    <RadioAttribute
                      elem={elem}
                      setVariant={setVariant}
                      soldOutAttributesIds={soldOutAttributesIds}
                      i={i}
                      productState={productState}
                    />
                  ) : elem?.style == 'dropdown' ? (
                    <DropdownAttribute
                      elem={elem}
                      setVariant={setVariant}
                      soldOutAttributesIds={soldOutAttributesIds}
                      i={i}
                      productState={productState}
                    />
                  ) : elem?.style == 'color' ? (
                    <ColorAttribute
                      elem={elem}
                      setVariant={setVariant}
                      soldOutAttributesIds={soldOutAttributesIds}
                      productState={productState}
                    />
                  ) : (
                    <ImageOtherAttributes
                      elem={elem}
                      setVariant={setVariant}
                      soldOutAttributesIds={soldOutAttributesIds}
                      productState={productState}
                    />
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductAttribute;
