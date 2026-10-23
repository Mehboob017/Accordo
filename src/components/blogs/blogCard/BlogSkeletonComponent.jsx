import { Col, Row } from 'reactstrap';
import SkBlogGrid from '@/components/common/skeletonLoader/blogSkeleton/SkBlogGrid';

const BlogSkeletonComponent = ({ boxStyle }) => {
  const variant = boxStyle || 'list_view';
  // list_view: 4 rows (full width, horizontal) | grid_view: 6 cards (2–3 per row)
  const count = variant === 'list_view' ? 4 : 6;

  return (
    <Row className="g-4">
      {Array.from({ length: count }, (_, i) => (
        <Col
          xs={variant === 'list_view' ? 12 : undefined}
          xxl={variant !== 'list_view' ? 4 : undefined}
          sm={variant !== 'list_view' ? 6 : undefined}
          key={i}
        >
          <SkBlogGrid variant={variant} />
        </Col>
      ))}
    </Row>
  );
};

export default BlogSkeletonComponent;
