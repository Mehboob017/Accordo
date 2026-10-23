import React, { useEffect, useState } from 'react';
import CategoryContext from '.';
import categoryJson from '@/app/api/category/category.json';

const CategoryProvider = (props) => {
  const [categoryAPIData, setCategoryAPIData] = useState({
    data: [],
    refetchCategory: '',
    params: {},
    categoryIsLoading: false,
  });

  const categoryData = categoryJson?.data || [];
  const categoryIsLoading = false;
  const filterCategory = (value) => {
    return categoryData?.filter((elem) => elem.type === value) || [];
  };

  // Setting Data on Category variables
  useEffect(() => {
    if (categoryData) {
      setCategoryAPIData((prev) => ({
        ...prev,
        data: categoryData,
        categoryIsLoading: categoryIsLoading,
      }));
    }
  }, [categoryData]);

  return (
    <CategoryContext.Provider
      value={{
        ...props,
        categoryAPIData,
        setCategoryAPIData,
        filterCategory: filterCategory,
        categoryIsLoading,
      }}
    >
      {props.children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;
