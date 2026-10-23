import React, { useContext } from 'react';
import { categoryTags } from '../../../data/Custom';
import Link from 'next/link';
import { useTranslation } from '@/utils/translations';

const CategoryTagsContent = () => {
  const { t } = useTranslation('common');
  return (
    <ul className="value-list">
      {categoryTags.map((elem) => (
        <li key={elem.id}>
          <div className="category-list">
            <h5 className="ms-0 text-title">
              <Link href={elem.path}>{t(elem.title)}</Link>
            </h5>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CategoryTagsContent;
