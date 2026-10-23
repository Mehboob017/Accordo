import { useContext, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import request from '@/utils/axiosUtils';
import { ProductAPI } from '@/utils/axiosUtils/API';
import { useQuery } from '@tanstack/react-query';
import SettingContext from '@/helper/settingContext';

const convertToRupees = (value) => {
  const amount = Number(value);
  return `₹ ${amount.toFixed(2)}`;
};

const TrendingProduct = ({ productState }) => {
  const { convertCurrency } = useContext(SettingContext);
  const categoryId = useMemo(() => {
    return productState?.product?.categories?.map((elem) => elem?.id);
  }, [productState?.product?.categories]);
  const { data: productData, refetch: productRefetch } = useQuery({
    queryKey: [categoryId],
    queryFn: () =>
      request({
        url: ProductAPI,
        params: { status: 1, trending: 1, category_ids: categoryId?.join() },
      }),
    enabled: false,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  });
  useEffect(() => {
    categoryId?.length > 0 && productRefetch();
  }, [categoryId]);
  if (productData?.length == 0) return null;
  return (
    <div className="pt-25">
      <div className="category-menu">
        <h3>Trending Products</h3>

        <Link href="/products/swamala-classic" className="order-item">
          <div className="thumb">
            <Image
              src={'/assets/images/product/Swamala-Classic.jpg'}
              alt={'Swamala Classic'}
              width={48}
              height={48}
              draggable={false}
              unoptimized
            />
          </div>

          {/* Product Info */}
          <div className="info">
            <span className="name">Swamala Classic 200gm</span>
            <span className="meta">200 gm</span>
          </div>

          {/* Price */}
          <div className="price">
            <span className="current">{convertToRupees(355.5)}</span>
            {<del>395.00</del>}
          </div>
        </Link>
        <Link href="/products/hingwashtak-choorna" className="order-item">
          <div className="thumb">
            <Image
              src={'/assets/images/product/Hingwashtak_Choorna.webp'}
              alt={'Hingwashtak Choorna'}
              width={48}
              height={48}
              draggable={false}
              unoptimized
            />
          </div>

          {/* Product Info */}
          <div className="info">
            <span className="name">Hingwashtak Choorna 500gm</span>
            <span className="meta">500 gm</span>
          </div>

          {/* Price */}
          <div className="price">
            <span className="current">{convertToRupees(13.5)}</span>
            {<del>15.00</del>}
          </div>
        </Link>

        {/* <ul className="product-list product-right-sidebar border-0 p-0">
          {productData?.slice(0, 4)?.map((elem, i) => (
            <li key={i}>
              <div className="offer-product">
                <Link href={`/products/${elem?.slug}`} className="offer-image">
                  {elem?.product_thumbnail?.original_url && (
                    <Image
                      src={elem?.product_thumbnail?.original_url}
                      className="img-fluid"
                      alt={elem?.name}
                      height={80}
                      width={80}
                      unoptimized
                    />
                  )}
                </Link>

                <div className="offer-detail">
                  <div>
                    <Link href={`/products/${elem?.slug}`}>
                      <h6 className="name">{elem?.name}</h6>
                    </Link>
                    <span>{elem?.unit}</span>
                    <div className="vertical-price">
                      <h5 className="price theme-color">
                        {convertCurrency(elem?.sale_price)}{' '}
                        <del className="text-content">
                          {convertCurrency(elem?.price)}
                        </del>
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul> */}
      </div>
    </div>
  );
};

export default TrendingProduct;
