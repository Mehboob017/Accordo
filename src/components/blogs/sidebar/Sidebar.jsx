import React, { useContext, useState } from 'react';
import { Col, UncontrolledAccordion } from 'reactstrap';
import RecentPost from './RecentPost';
import Category from './Category';
import Tags from './Tags';
import { useSearchParams } from 'next/navigation';
import CategoryContext from '@/helper/categoryContext';
import BlogContext from '@/helper/blogContext';
import SKBlogSidebar from '@/components/common/skeletonLoader/blogSkeleton/SKBlogSidebar';
// import AddToGoogleCalendar from '@/components/googleCalender/AddToGoogleCalendar';

const Sidebar = ({ sidebarType, categorySlug, forceLoading = false }) => {
  const [open, setOpen] = useState('1');
  const searchParams = useSearchParams();
  const { blogContextLoader } = useContext(BlogContext);
  const { categoryIsLoading } = useContext(CategoryContext);
  const querySidebar = searchParams.get('sidebar');
  // Force right_sidebar as default when no query params or sidebarType are present
  // Query params can still override if needed
  const sidebarVariant = sidebarType || querySidebar || 'right_sidebar';
  const styleObj = {
    no_sidebar: { class: 'd-none' },
    left_sidebar: { class: 'order-lg-1' },
    right_sidebar: { colClass: { xxl: 9, xl: 8, lg: 7 } },
  };

  const isLoadingSidebar = forceLoading || blogContextLoader || categoryIsLoading;
  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  return (
    <Col
      xxl={4}
      xl={4}
      lg={5}
      className={styleObj[sidebarVariant]?.class || ''}
    >
      <div className="left-sidebar-box" translate="no">
        {isLoadingSidebar ? (
          <SKBlogSidebar />
        ) : (
          <UncontrolledAccordion
            className="left-accordion-box"
            open={open}
            toggle={toggle}
            defaultOpen={['1', '2', '3']}
            stayOpen
          >
            <RecentPost categorySlug={categorySlug} />
            <Category categorySlug={categorySlug} />
            <Tags categorySlug={categorySlug} />
            {/* <AddToGoogleCalendar /> */}
          </UncontrolledAccordion>
        )}
      </div>
    </Col>
  );
};

export default Sidebar;
