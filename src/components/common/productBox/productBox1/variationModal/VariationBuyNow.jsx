import Btn from '@/elements/buttons/Btn';
import CartContext from '@/helper/cartContext';
import { useTranslation } from '@/utils/translations';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { trackMetaEvent } from '@/utils/metaPixel';
import { setCheckoutRequest } from '@/api/checkout.api';

const VariationBuyNow = ({ cloneVariation, setVariationModal }) => {
  const { t } = useTranslation('common');
  const { handleIncDec } = useContext(CartContext);
  const router = useRouter();
  
  const productInStock = cloneVariation?.selectedVariation
    ? cloneVariation?.selectedVariation?.stock_status == 'in_stock'
    : cloneVariation?.product?.stock_status == 'in_stock';

  const handleBuyNow = (allProduct) => {
    if (productInStock) {
      const checkoutPayload = {
        productUid: allProduct?.uid ?? allProduct?.id,
        variantUid:
          cloneVariation?.selectedVariation?.uid ??
          cloneVariation?.selectedVariation?.id ??
          null,
        quantity: cloneVariation.productQty || 1,
      };

      const itemPrice = Number(
        cloneVariation?.selectedVariation?.sale_price ??
        cloneVariation?.selectedVariation?.disPrice ??
        cloneVariation?.selectedVariation?.mrp ??
        allProduct?.disPrice ??
        allProduct?.mrp ??
        0
      );

      trackMetaEvent('InitiateCheckout', {
        content_ids: [checkoutPayload.variantUid || checkoutPayload.productUid].filter(Boolean),
        content_type: 'product',
        value: itemPrice * checkoutPayload.quantity,
        currency: 'INR',
        num_items: checkoutPayload.quantity
      });

      setCheckoutRequest(checkoutPayload);
      setVariationModal(false);
      router.push('/checkout');
    }
  };

  return (
    <button
      className="btn-buy-now"
      disabled={!productInStock}
      onClick={() => handleBuyNow(cloneVariation.product)}
    >
      <span className="label-full">Buy Now</span>
      <span className="label-short">Buy</span>
    </button>
  );
};

export default VariationBuyNow;
