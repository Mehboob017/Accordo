'use client';

import styles from './ShopByIngredients.module.scss';
import { RiSeedlingLine } from 'react-icons/ri';
import { useHome, useSeasonProducts } from '@/utils/hooks/useHome';
import { useEffect, useState, useMemo } from 'react';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { getFallbackProductsForCard } from '@/utils/fallbackProducts';
import ProductBox1 from '@/components/common/productBox/productBox1/ProductBox1';
import { LeafSVG } from '@/components/common/CommonSVG';
import Btn from '@/elements/buttons/Btn';

const ShopByIngredients = () => {
  // const { data } = useHome();
  const { data } = useSeasonProducts();

  const seasonProducts = data?.data?.seasonProducts || {};

  const hasProducts = Object.values(seasonProducts).some(
    (products) => products.length > 0
  );

  if (!hasProducts) {
    return null;
  }

  const seasons = useMemo(
    () =>
      Object.keys(seasonProducts).map((season) => ({
        id: season,
        name: season,
        icon: RiSeedlingLine,
        description: `${season} Season Products`,
      })),
    [seasonProducts]
  );

  const [activeIngredientId, setActiveIngredientId] = useState('');

  useEffect(() => {
    if (!activeIngredientId && seasons.length) {
      setActiveIngredientId(seasons[0].id);
    }
  }, [seasons, activeIngredientId]);

  const activeIngredient = useMemo(
    () => seasons.find((season) => season.id === activeIngredientId),
    [activeIngredientId, seasons]
  );

  const products = useMemo(() => {
    return getFallbackProductsForCard({
      data: seasonProducts?.[activeIngredientId] || [],
    });
  }, [seasonProducts, activeIngredientId]);

  if (!products) return null;

  return (
    <WrapperComponent
      classes={{ sectionClass: styles['ingredients-section'] }}
      noRowCol={true}
    >
      <div className={styles['heading-wrapper']}>
        <CustomHeading
          customClass="mb-0 text-center"
          title="Shop By Rhutus"
          subTitle=""
          svgUrl={<LeafSVG className="icon-width" />}
        />
        <p className={styles['subtitle']}>
          Explore Trusted Ayurvedic Products by Rhutus
        </p>
      </div>

      <div className={`${styles['ingredients-scroll-wrapper']} hide-scrollbar`}>
        <div className={`${styles['ingredients-list']}`}>
          {seasons.map((ingredient) => {
            const Icon = ingredient.icon;
            const isActive = ingredient.id === activeIngredientId;

            return (
              <button
                key={ingredient.id}
                type="button"
                className={`${styles['ingredient-item']} ${isActive ? styles['ingredient-item--active'] : ''}`}
                onClick={() => setActiveIngredientId(ingredient.id)}
              >
                <span className={styles['ingredient-icon']}>
                  <span className={styles['ingredient-icon-inner']}>
                    <Icon aria-hidden="true" className="icon" />
                  </span>
                </span>
                <span className={styles['ingredient-label']}>
                  {ingredient.name}
                </span>
                {isActive && (
                  <span className={styles['ingredient-underline']} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles['products-wrapper']}>
        <div className={styles['products-grid']}>
          {products.map((product, index) => (
            <ProductBox1
              key={`${activeIngredientId}-${product.uid}-${index}`}
              imgUrl={product?.product_thumbnail}
              productDetail={{ ...product }}
              classObj={{ productBoxClass: 'product-box-3' }}
            />
          ))}
        </div>
      </div>

      {activeIngredient && (
        <div className="text-center mt-3">
          <a href={`/collections?seasons=${activeIngredient.name}`}>
            <Btn type="button" color="primary" className="btn btn-md mx-auto">
              View All
            </Btn>
          </a>
        </div>
      )}
    </WrapperComponent>
  );
};

export default ShopByIngredients;
