import BlogProvider from '@/helper/blogContext/BlogProvider';

export default function BlogsLayout({ children }) {
  return <BlogProvider>{children}</BlogProvider>;
}
