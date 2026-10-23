import { Suspense } from 'react';
import BlogListing from '@/components/blogs/Details';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';
import Loader from '@/layout/loader';

export async function generateMetadata() {
  return generateStaticSeoMetadata('blogs');
}

const BlogsPage = async () => {
  const { schemas } = await getStaticSeo('blogs');

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <section className="section-t-space blog-section">
        <div className="container-fluid-lg">
          <div className="events-header text-center">
            <h1 className="events-title">Discover Our Blogs</h1>
            <h2 className="sr-only">This is a blogs listing page.</h2>
            <p className="events-subtitle">
              Explore insights, stories, and guides on Ayurveda, wellness, and
              healthy living.
            </p>
          </div>
        </div>
      </section>
      <Suspense fallback={<Loader />}>
        <BlogListing />
      </Suspense>
    </>
  );
};

export default BlogsPage;
