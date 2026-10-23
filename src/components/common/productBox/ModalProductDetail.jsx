import React, { useContext } from 'react';
import { Col, Row } from 'reactstrap';
import Image from 'next/image';
import ProductBox1Rating from './productBox1/ProductBox1Rating';
import Btn from '@/elements/buttons/Btn';
import TextLimit from '@/utils/customFunctions/TextLimit';
import { placeHolderImage } from '../../../data/CommonPath';
import SettingContext from '@/helper/settingContext';

const ModalProductDetail = ({ productObj }) => {
  const { convertCurrency } = useContext(SettingContext);
  return (
    <Row className="g-sm-4 g-2">
      <Col lg={6}>
        <div className="slider-image">
          <Image
            src={
              productObj?.product_thumbnail?.original_url || placeHolderImage
            }
            className="img-fluid"
            alt={productObj?.name || ''}
            height={500}
            width={500}
            unoptimized
          />
        </div>
      </Col>

      <Col lg={6}>
        <div className="right-sidebar-modal">
          <h4 className="title-name">{productObj?.name}</h4>
          <h4 className="price">{convertCurrency(productObj?.sale_price)}</h4>
          <div className="product-rating">
            <ProductBox1Rating />
            <span className="ms-2">8 Reviews</span>
            <span className="ms-2 text-danger">6 sold in last 16 hours</span>
          </div>

          <div className="product-detail">
            <h4>Product Details :</h4>
            <TextLimit value={productObj?.description} maxLength={150} />
          </div>
          <div className="modal-button">
            <Btn className="btn btn-md add-cart-button icon">
              Add To Cart
            </Btn>
            <Btn className="btn theme-bg-color view-button icon text-white fw-bold btn-md">
              View More Details
            </Btn>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default ModalProductDetail;
