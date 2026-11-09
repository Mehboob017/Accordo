'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Col, Row } from 'reactstrap';

import WrapperComponent from '../common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import ProductBox1 from '@/components/common/productBox/productBox1/ProductBox1';
import { useBestSellers, useHome } from '@/utils/hooks/useHome';
import { normalizeProductForCard } from '@/utils/fallbackProducts';
import SkBestSeller from '@/components/common/skeletonLoader/homeSkeleton/SkBestSeller';
import styles from './BestSellerProducts.module.scss';

const getResolvedProduct = (product) => {
  if (!product) return null;

  return product?.crossLinkProduct || product;
};

const BestSellerProducts = ({
  products,
  title = 'Our Best Sellers',
  subTitle = 'Explore Our Best Sellers',
  sectionClass = 'best-seller-products-section section-b-space',
  viewAllHref = '/collections',
  viewAllText = 'View All',
  maxItems = 4,
  fetchFromHome = true,
}) => {
  const hasExternalProducts = Array.isArray(products);
  const shouldFetchHome = fetchFromHome && !hasExternalProducts;

  // const { data } = useHome(
  //   {},
  //   {
  //     enabled: shouldFetchHome,
  //   }
  // );
  const { data, isLoading } = useBestSellers({ enabled: shouldFetchHome });

  const featuredProducts = data?.data?.featuredProducts || [];

  const externalProductList = useMemo(() => {
    if (!hasExternalProducts) return [];

    return products
      .map(getResolvedProduct)
      .map(normalizeProductForCard)
      .filter(Boolean)
      .slice(0, maxItems);
  }, [hasExternalProducts, products, maxItems]);

  const homeFeaturedProductsList = useMemo(() => {
    if (!shouldFetchHome) return [];

    return featuredProducts
      .map(normalizeProductForCard)
      .filter(Boolean)
      .slice(0, maxItems);
  }, [featuredProducts, maxItems, shouldFetchHome]);

  const relatedProductList = hasExternalProducts
    ? externalProductList
    : homeFeaturedProductsList;

  const resolvedViewAllHref =
    shouldFetchHome && !hasExternalProducts
      ? `${viewAllHref}?tags=best-seller`
      : viewAllHref;

  if (isLoading) {
    return (
      <SkBestSeller
        count={maxItems}
        title={title}
        subTitle={subTitle}
        sectionClass={sectionClass}
      />
    );
  }

  if (!relatedProductList.length) {
    return null;
  }

  return (
    <WrapperComponent classes={{ sectionClass }} noRowCol={true}>
      {/* ── Heading + Clean Text Link View All (matches ShopByCategory) ── */}
      <Row className="align-items-center mb-1">
        <Col xs={9} sm={10}>
          <CustomHeading
            customClass="mb-0"
            title={title}
            subTitle={subTitle}
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>

        <Col xs={3} sm={2} className="text-end">
          <Link
            prefetch={false}
            href={resolvedViewAllHref}
            className={styles['view-all-link']}
          >
            {viewAllText}
          </Link>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="product-slider-placeholder">
            <Row className="g-sm-4 g-3 product-list-section">
              {relatedProductList.slice(0, 4).map((product, i) => (
                <Col xl={3} lg={4} md={6} xs={6} key={i}>
                  <ProductBox1
                    imgUrl={product?.product_thumbnail}
                    productDetail={{ ...product }}
                    classObj={{ productBoxClass: 'product-box-3' }}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default BestSellerProducts;
