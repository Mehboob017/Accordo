import QuickView from '../QuickView';
import AddToWishlist from '../AddToWishlist';

const ProductBoxAction = ({ productObj, listClass }) => {
  return (
    <ul className={listClass}>
      <QuickView productObj={productObj} />
      <AddToWishlist productObj={productObj} />
    </ul>
  );
};

export default ProductBoxAction;
