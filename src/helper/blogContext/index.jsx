import { createContext } from 'react';

const BlogContext = createContext({
  handleSetQueryParams: () => {},
  blogParams: '',
  blogState: [],
  recentPosts: [],
  blogCategories: [],
  blogTags: [],
  setBlogParams: () => {},
  blogContextLoader: false,
});

export default BlogContext;
