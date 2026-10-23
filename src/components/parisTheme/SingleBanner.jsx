import ProductIdsContext from '@/helper/productIdsContext';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';

const SingleBanner = ({ classes = {}, image_url, height, width, dataAPI }) => {
  const { filteredProduct } = useContext(ProductIdsContext);
  const redirectToProduct = (productId) => {
    const product = filteredProduct.find((elem) => elem?.id == productId);
    return 'product/' + product?.slug;
  };
  return (
    <div className={classes?.sectionClass ? classes?.sectionClass : ''}>
      <div className="banner-contain">
        {image_url ? (
          dataAPI?.redirect_link?.link_type === 'external_url' ? (
            <Link href={dataAPI?.redirect_link?.link || '/'} target="_blank">
              <Image
                src={image_url}
                className="img-fluid"
                alt="Banner"
                height={height}
                width={width}
                unoptimized
              />
            </Link>
          ) : dataAPI?.redirect_link?.link_type === 'collection' ? (
            <Link
              href={
                `/collections?category=${dataAPI?.redirect_link?.link}` ||
                '/'
              }
            >
              <Image
                src={image_url}
                className="img-fluid w-100"
                alt="Banner"
                height={height}
                width={width}
                unoptimized
              />
            </Link>
          ) : dataAPI?.redirect_link?.link_type === 'product' ? (
            <Link
              href={
                `/${redirectToProduct(dataAPI?.redirect_link?.link)}` ||
                '/'
              }
            >
              <Image
                src={image_url}
                className="img-fluid"
                alt="Banner"
                height={height}
                width={width}
                unoptimized
              />
            </Link>
          ) : (
            <Image
              src={image_url}
              className="img-fluid"
              alt="Banner"
              height={height}
              width={width}
              unoptimized
            />
          )
        ) : null}
      </div>
    </div>
  );
};

export default SingleBanner;
