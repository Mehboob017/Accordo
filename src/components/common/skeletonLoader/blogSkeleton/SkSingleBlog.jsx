import { Col } from 'reactstrap';

const SkSingleBlog = ({ sidebarType }) => {
  const sidebarVariant = sidebarType || 'right_sidebar';

  const styleObj = {
    no_sidebar: { colClass: { xxl: 12, xl: 12, lg: 12 } },
    left_sidebar: { class: 'order-lg-2', colClass: { xxl: 9, xl: 8, lg: 7 } },
    right_sidebar: { colClass: { xxl: 9, xl: 8, lg: 7 } },
  };

  return (
    <>
      {/* Top banner/image skeleton */}
      <Col xxl="12" xl="12" lg="12" className="ratio_50">
        <div className="blog-detail-image rounded-3 mb-4 skeleton">
          <div className="skeleton__img" />
        </div>
      </Col>

      {/* Content skeleton, matching main blog column width */}
      <Col
        {...styleObj[sidebarVariant]?.colClass}
        className={styleObj[sidebarVariant]?.class || ''}
      >
        <div className="blog-detail-contain skeleton">
          <div className="skeleton__header skeleton__header--long" />
          <div className="skeleton__p" />
          <div className="skeleton__p" />
          <div className="skeleton__p" />
        </div>
      </Col>
    </>
  );
};

export default SkSingleBlog;

