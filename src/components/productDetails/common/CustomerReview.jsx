import { useState } from 'react';
import { Col, Progress, Row } from 'reactstrap';
import { RiStarFill } from 'react-icons/ri';
import Btn from '@/elements/buttons/Btn';
import ReviewModal from './allModal/ReviewModal';

const CustomerReview = ({ productState }) => {
  const [modal, setModal] = useState('');

  return (
    <>
      <Col xl={5}>
        <div className="product-rating-box">
          <Row>
            {productState?.product?.reviews_count ? (
              <Col xl={12}>
                <div className="product-main-rating">
                  <h2>
                    {productState?.product?.rating_count.toFixed(2)}
                    <RiStarFill />
                  </h2>
                  <h5>
                    {productState?.product?.reviews_count} Ratings
                  </h5>
                </div>
              </Col>
            ) : null}
            <Col xl={12}>
              {productState?.product?.reviews_count ? (
                <ul className="product-rating-list">
                  {productState?.product?.review_ratings
                    ?.slice()
                    ?.reverse()
                    .map((rate, i) => (
                      <li key={i}>
                        <div className="rating-product">
                          <h5>
                            {productState?.product?.review_ratings?.length -
                              1 -
                              i +
                              1}
                            <RiStarFill />
                          </h5>
                          <Progress multi>
                            <Progress
                              value={(
                                (rate / productState?.product?.reviews_count) *
                                100
                              ).toFixed(0)}
                            />
                          </Progress>
                          <h5 className="total">{rate}</h5>
                        </div>
                      </li>
                    ))}
                </ul>
              ) : null}
              {productState?.product?.can_review ? (
                <div className="review-title-2">
                  <h4 className="fw-bold">Review This Product</h4>
                  <p>Let Other Customers Know What You Think.</p>
                  <Btn
                    className="btn"
                    onClick={() => setModal(productState?.product?.id)}
                    title={
                      productState?.product?.user_review
                        ? "Edit Review"
                        : "Write a Review"
                    }
                  />
                </div>
              ) : null}
            </Col>
          </Row>
        </div>
      </Col>
      <ReviewModal
        modal={modal}
        setModal={setModal}
        productState={productState}
      />
    </>
  );
};

export default CustomerReview;
