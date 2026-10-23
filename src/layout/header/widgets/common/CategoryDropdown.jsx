import React, { useContext } from 'react';
import Btn from '@/elements/buttons/Btn';
import CategoryContext from '@/helper/categoryContext';

const CategoryDropdown = () => {
  const { filterCategory } = useContext(CategoryContext);
  const categoryData = filterCategory('product');
  return (
    <>
      <Btn className="location-button">
        <select className="form-select locat-name">
          <option>All Categories</option>
          {categoryData?.map((category, i) => (
            <option key={i}>{category.name}</option>
          ))}
        </select>
      </Btn>
    </>
  );
};

export default CategoryDropdown;
