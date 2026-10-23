import { Suspense } from 'react';
import BlogListing from '@/components/blogs/Details';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';
import Loader from '@/layout/loader';

export async function generateMetadata() {
  return generateStaticSeoMetadata('blogs');
}

const BlogListingPage = async ({ params }) => {
  const { categoryname } = await params;
  const { schemas } = await getStaticSeo('blogs');

  const formattedCategory = categoryname
    ? categoryname
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Blogs';

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <section className="section-t-space blog-section">
        <div className="container-fluid-lg">
          <div className="events-header text-center">
            <h1 className="events-title">{formattedCategory} Blogs</h1>
            <p className="events-subtitle">
              Explore insights, stories, and guides on {formattedCategory},
              wellness, and healthy living.
            </p>
          </div>
        </div>
      </section>
      <Suspense fallback={<Loader />}>
        <BlogListing categorySlug={categoryname} />
      </Suspense>
    </>
  );
};

export default BlogListingPage;
