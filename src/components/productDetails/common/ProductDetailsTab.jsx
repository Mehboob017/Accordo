import { useState } from 'react';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import NavTabTitles from '@/components/common/NavTabs';
import TextLimit from '@/utils/customFunctions/TextLimit';
import CustomerReview from './CustomerReview';
import NoDataFound from '@/components/common/NoDataFound';
import TrendingProduct from './productDetailSidebar/TrendingProduct';

const IngredientsTab = ({ product }) => (
  <div className="ingredients-content">
    {product?.ingredients ? (
      <div dangerouslySetInnerHTML={{ __html: product.ingredients }} />
    ) : (
      <div>
        <p>
          <strong>Key Ingredients:</strong>
        </p>
        <p>
          This product contains carefully selected natural ingredients sourced
          for quality, safety, and consistency to support everyday wellness
          needs.
        </p>
        <p>
          For detailed ingredient information, please refer to the product
          packaging or contact customer support.
        </p>
      </div>
    )}
  </div>
);

const IndicationsTab = ({ product }) => (
  <div className="indications-content">
    <p>
      <strong>Common Uses:</strong>
    </p>
    {product?.indication ? (
      <p>{product.indication}</p>
    ) : (
      <p>
        This product is formulated for daily support, targeted relief, and
        routine supplementation based on traditional wellness practices.
      </p>
    )}
  </div>
);

const DosageTab = ({ product }) => (
  <div className="dosage-content">
    {product?.dosage ? (
      <div dangerouslySetInnerHTML={{ __html: product.dosage }} />
    ) : (
      <div>
        <p>
          <strong>Suggested Use:</strong>
        </p>
        <p>
          Please follow the dosage instructions provided on the product
          packaging. Typical serving patterns align with standard Ayurvedic
          guidance.
        </p>
        <p>
          <em>
            Note: Consult with a qualified healthcare professional before
            starting any new supplement regimen, especially if you are pregnant,
            nursing, or taking medications.
          </em>
        </p>
      </div>
    )}
  </div>
);

const AvailabilityTab = ({ product }) => (
  <div className="availability-content">
    {product?.availability ? (
      <div dangerouslySetInnerHTML={{ __html: product.availability }} />
    ) : (
      <div>No data provided</div>
    )}
  </div>
);

const MarketedByTab = ({ product }) => (
  <div className="marketed-by-content">
    {product?.market_by ? <div></div> : <p>No data provided</p>}
  </div>
);

const CautionTab = ({ product }) => (
  <div className="caution-content">
    {product?.caution ? (
      <div dangerouslySetInnerHTML={{ __html: product.caution }} />
    ) : (
      <div>No data provided</div>
    )}
  </div>
);

const BenefitsTab = ({ product }) => (
  <div className="benefits-content">
    {product?.benefits ? (
      <div dangerouslySetInnerHTML={{ __html: product.benefits }} />
    ) : (
      <div>No data provided</div>
    )}
  </div>
);

const DimensionsTab = ({ product }) => (
  <div className="dimensions-content">
    {product?.dimensions ? (
      <div dangerouslySetInnerHTML={{ __html: product.dimensions }} />
    ) : (
      <div>No data provided</div>
    )}
  </div>
);

const MarketAuthorizationTab = ({ product }) => (
  <div className="market-authorization-content">
    {product?.market_authorization ? (
      <div dangerouslySetInnerHTML={{ __html: product.market_authorization }} />
    ) : (
      <div>No Data Provided</div>
    )}
  </div>
);

const ProductDetailsTab = ({ productState }) => {
  const [activeTab, setActiveTab] = useState(1);
  const ProductDetailsTabTitle = [
    { id: 1, name: 'Description' },
    { id: 2, name: 'Ingredients' },
    { id: 3, name: 'Indications' },
    { id: 4, name: 'Dosage' },
    { id: 5, name: 'Availability' },
    { id: 6, name: 'Marketed By' },
    { id: 7, name: 'Caution' },
    { id: 8, name: 'Review' },
    { id: 9, name: 'Benefits' },
    { id: 10, name: 'Dimensions' },
    { id: 11, name: 'Market Authorization' },
  ];

  return (
    <>
      <Col md={8}>
        <div className="product-section-box mt-0">
          <NavTabTitles
            classes={{ navClass: 'nav-tabs custom-nav hide-scrollbar' }}
            titleList={ProductDetailsTabTitle}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <TabContent className="custom-tab" activeTab={activeTab}>
            <TabPane className={activeTab == 1 ? 'show active' : ''} tabId={1}>
              <TextLimit value={productState?.product?.description} />
            </TabPane>

            <TabPane className={activeTab == 2 ? 'show active' : ''} tabId={2}>
              <IngredientsTab product={productState?.product} />
            </TabPane>

            <TabPane className={activeTab == 3 ? 'show active' : ''} tabId={3}>
              <IndicationsTab product={productState?.product} />
            </TabPane>

            <TabPane className={activeTab == 4 ? 'show active' : ''} tabId={4}>
              <DosageTab product={productState?.product} />
            </TabPane>

            <TabPane className={activeTab == 5 ? 'show active' : ''} tabId={5}>
              <AvailabilityTab product={productState?.product} />
            </TabPane>

            <TabPane className={activeTab == 6 ? 'show active' : ''} tabId={6}>
              <MarketedByTab product={productState?.product} />
            </TabPane>

            <TabPane className={activeTab == 7 ? 'show active' : ''} tabId={7}>
              <CautionTab product={productState?.product} />
            </TabPane>

            <TabPane className={activeTab == 8 ? 'show active' : ''} tabId={8}>
              <div className="review-box">
                <Row className="g-4">
                  {productState?.product?.can_review ||
                    productState?.product?.reviews_count ? (
                    <CustomerReview productState={productState} />
                  ) : (
                    <Col xl={12}>
                      <NoDataFound
                        data={{
                          customClass: 'no-data-added',
                          title: 'NoReviewYet',
                          description: 'NoReviewYetDescription',
                        }}
                      />
                    </Col>
                  )}
                </Row>
              </div>
            </TabPane>

            <TabPane className={activeTab == 9 ? 'show active' : ''} tabId={9}>
              <BenefitsTab product={productState?.product} />
            </TabPane>

            <TabPane
              className={activeTab == 10 ? 'show active' : ''}
              tabId={10}
            >
              <DimensionsTab product={productState?.product} />
            </TabPane>

            <TabPane
              className={activeTab == 11 ? 'show active' : ''}
              tabId={11}
            >
              <MarketAuthorizationTab product={productState?.product} />
            </TabPane>
          </TabContent>
        </div>
      </Col>
      <Col md={4}>
        <TrendingProduct productState={productState} />
      </Col>
    </>
  );
};

export default ProductDetailsTab;
