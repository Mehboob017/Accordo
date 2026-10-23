'use client';
import { useEffect, useState } from 'react';
import BlogContext from '.';
import { useQuery } from '@tanstack/react-query';
import { fetchBlogs } from '@/api/blog.api';

const BlogProvider = (props) => {
  const [blogState, setBlogState] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [blogTags, setBlogTags] = useState([]);
  const [blogParams, setBlogParams] = useState('');

  const {
    data: BlogData,
    isLoading,
  } = useQuery({
    // Use SDL blogs API once globally so sidebar & other places can reuse
    queryKey: ['blogs', 'context'],
    queryFn: () => fetchBlogs({ page: 1, limit: 10 }),
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 min — blog listing context data
  });

  useEffect(() => {
    if (BlogData) {
      setBlogState(BlogData.data || []);
      setRecentPosts(BlogData.recentPosts || []);
      setBlogCategories(BlogData.categories || []);
      setBlogTags(BlogData.tags || []);
    }
  }, [BlogData]);

  const handleSetQueryParams = (value) => {
    setBlogParams(value);
  };

  return (
    <>
      <BlogContext.Provider
        value={{
          handleSetQueryParams,
          blogParams,
          blogState,
          recentPosts,
          blogCategories,
          blogTags,
          setBlogParams,
          blogContextLoader: isLoading,
          ...props,
        }}
      >
        {props.children}
      </BlogContext.Provider>
    </>
  );
};

export default BlogProvider;
