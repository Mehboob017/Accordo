// 'use client';
// import React, { useContext } from 'react';
// import { AccordionBody, AccordionHeader, AccordionItem } from 'reactstrap';
// import { useTranslation } from '@/utils/translations';
// import CategoryContext from '@/helper/categoryContext';
// import Link from 'next/link';

// const Category = () => {
//   const { t } = useTranslation('common');
//   const { filterCategory } = useContext(CategoryContext);
//   const categoryData = filterCategory('post');
//   return (
//     <AccordionItem>
//       <AccordionHeader targetId="2">{t('Category')}</AccordionHeader>
//       <AccordionBody accordionId="2" className="p-0">
//         <div className="category-list-box">
//           <ul>
//             {categoryData?.map((category, index) => (
//               <li key={index}>
//                 <Link
//                   href={{
//                     pathname: `/blogs`,
//                     query: { category: category?.slug },
//                   }}
//                 >
//                   <div className="category-name">
//                     <h5>{category.name}</h5>
//                     <span>({category?.blogs_count})</span>
//                   </div>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </AccordionBody>
//     </AccordionItem>
//   );
// };

// export default Category;

'use client';
import React, { useContext, useState } from 'react';
import { AccordionBody, AccordionHeader, AccordionItem } from 'reactstrap';
import { useTranslation } from '@/utils/translations';
import BlogContext from '@/helper/blogContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const INITIAL_CATEGORY_COUNT = 4;

const Category = ({ categorySlug }) => {
  const { t } = useTranslation('common');
  const { blogCategories } = useContext(BlogContext);
  const pathname = usePathname();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const sourceCategories = blogCategories || [];

  const visibleCategories = showAllCategories
    ? sourceCategories
    : sourceCategories?.slice(0, INITIAL_CATEGORY_COUNT);

  const hasMoreCategories = sourceCategories?.length > INITIAL_CATEGORY_COUNT;

  // Hide "view more" button on blog listing page (/blogs/[category]), show on single blog pages
  const pathSegments = pathname.split('/').filter(Boolean);
  const isBlogListingPage = pathSegments.length === 2 && pathSegments[0] === 'blogs';

  // /blogs = all blogs, /blogs/xyz = category xyz
  const isAllBlogsView = pathSegments.length === 1 && pathSegments[0] === 'blogs';

  const totalBlogsCount = sourceCategories?.reduce((sum, cat) => sum + (cat.blogs_count || 0), 0) || 0;

  return (
    <AccordionItem>
      <AccordionHeader targetId="2">{t('Category')}</AccordionHeader>

      <AccordionBody accordionId="2" className="p-0">
        <div className="category-list-box">
          <ul>
            {/* All Blogs - always first */}
            <li>
              <Link href="/blogs">
                <div className={`category-name ${isAllBlogsView ? 'active' : ''}`}>
                  <h5>{t('AllBlogs') || 'All Blogs'}</h5>
                  <span>({totalBlogsCount})</span>
                </div>
              </Link>
            </li>
            {visibleCategories?.map((category, index) => {
              const isActive = categorySlug === category?.slug;
              return (
                <li key={index}>
                  <Link href={`/blogs/${category?.slug}`}>
                    <div className={`category-name ${isActive ? 'active' : ''}`}>
                      <h5>{category.name}</h5>
                      <span>({category?.blogs_count})</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ---- View More / View Less ---- */}
          {/* Hide on blog listing page, show on single blog pages */}
          {!isBlogListingPage && hasMoreCategories && (
            <div className="text-center py-2">
              <button
                type="button"
                className="btn btn-theme-outline btn-sm w-100"
                onClick={() => setShowAllCategories((prev) => !prev)}
              >
                {showAllCategories ? t('View Less') || 'View Less' : t('View More')}
              </button>
            </div>
          )}
        </div>
      </AccordionBody>
    </AccordionItem>
  );
};

export default Category;
