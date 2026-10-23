'use client';
import { useContext, useEffect, useMemo, useState } from 'react';
import Loader from '@/layout/loader';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useSearchParams } from 'next/navigation';
import ProductIdsContext from '@/helper/productIdsContext';
import Product4Image from '../productDetails/product4Image';
import { useProductDetailRaw } from '@/utils/hooks/useProduct';

const ProductsDetailContent = ({ params }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { setGetProductIds } = useContext(ProductIdsContext);
  const searchParams = useSearchParams();
  const queryProductLayout = searchParams.get('layout');
  const queryProductVariant = searchParams.get('productVariant');
  // Getting Product Layout
  const isProductLayout = useMemo(() => {
    return queryProductLayout ? queryProductLayout : 'product_images';
  }, [queryProductLayout, themeOption]);

  const [productState, setProductState] = useState({
    product: [],
    attributeValues: [],
    productQty: 1,
    selectedVariation: '',
    variantIds: []
  });

  // Calling Product API on slug via shared raw-product hook
  const {
    data: productDetailResponse,
    isLoading,
  } = useProductDetailRaw({
    slug: params,
    productVariant: queryProductVariant,
  });

  const ProductData = useMemo(() => {
    const apiData = productDetailResponse?.data;
    if (!apiData) {
      return null;
    }

    return apiData?.product || apiData;
  }, [productDetailResponse]);

  // Setting Product API Data on state Variable and getting ids from cross_sell_products,related_products;
  useEffect(() => {
    if (ProductData) {
      const crossSellProducts = Array.isArray(ProductData?.cross_sell_products)
        ? ProductData.cross_sell_products
        : Array.isArray(ProductData?.crossSellProducts)
        ? ProductData.crossSellProducts
        : [];
      const relatedProducts = Array.isArray(ProductData?.related_products)
        ? ProductData.related_products
        : Array.isArray(ProductData?.relatedProducts)
        ? ProductData.relatedProducts
        : [];

      (crossSellProducts.length > 0 || relatedProducts.length > 0) &&
        setGetProductIds({
          ids: Array.from(
            new Set([
              ...crossSellProducts,
              ...relatedProducts,
            ])
          ).join(','),
        });
      setProductState((prev) => ({ ...prev, product: ProductData }));
    }
  }, [ProductData, setGetProductIds]);
  
  useEffect(() => {
    const handleScroll = () => {
      const button = document.querySelector('.scroll-button');
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        if (buttonRect.bottom < window.innerHeight && buttonRect.bottom < 0) {
          document.body.classList.add('stickyCart');
        } else {
          document.body.classList.remove('stickyCart');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      // Clean up the event listener when the component unmounts
      window.removeEventListener('scroll', handleScroll);
      document.body.classList?.remove('stickyCart');
    };
  }, []);

  if (isLoading) return <Loader />;

  const showProductLayout = {
    product_images: (
      <Product4Image
        productState={productState}
        setProductState={setProductState}
      />
    )
  };
  return (
    <>
      {showProductLayout[isProductLayout]}
    </>
  );
};

export default ProductsDetailContent;
