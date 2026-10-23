'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { AccordionBody, AccordionHeader, AccordionItem } from 'reactstrap';
import { useTranslation } from '@/utils/translations';
import BlogContext from '@/helper/blogContext';

const Tags = ({ categorySlug }) => {
  const { t } = useTranslation('common');
  const { blogTags, blogCategories } = useContext(BlogContext);

  const tagList = blogTags || [];
  const baseCategory = categorySlug || blogCategories?.[0]?.slug || '';

  if (!tagList.length) return null;

  return (
    <AccordionItem>
      <AccordionHeader targetId="3">{t('Keywords')}</AccordionHeader>
      <AccordionBody accordionId="3" className="pt-0">
        <div className="product-tags-box">
          <ul>
            {tagList?.map((tags, index) => (
              <li key={index}>
                {/* <Link
                  href={baseCategory ? `/blogs/${baseCategory}?tag=${tags?.slug}` : `/blogs?tag=${tags?.slug}`}
                >
                  {tags.name}
                </Link> */}
                <span>{tags.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </AccordionBody>
    </AccordionItem>
  );
};

export default Tags;
