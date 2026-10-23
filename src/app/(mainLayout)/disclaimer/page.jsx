import Link from 'next/link';
import { Col, Row } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import styles from './page.module.scss';

export const metadata = {
  title: 'Disclaimer',
  description:
    'Legal disclaimer and medical advice notice for using the Shree Dhootapapeshwar Limited online store and website.',
  alternates: {
    canonical: 'https://www.sdlindia.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <main>
      <WrapperComponent classes={{ sectionClass: styles.banner }} noRowCol>
        <Row className="justify-content-center">
          <Col xs="12" lg="10" className="text-center">
            <h1 className={styles.bannerTitle}>Disclaimer</h1>
            <nav aria-label="Breadcrumb">
              <ol className={styles.breadcrumbs}>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">Disclaimer</li>
              </ol>
            </nav>
          </Col>
        </Row>
      </WrapperComponent>

      <WrapperComponent
        classes={{ sectionClass: styles.contentSection }}
        noRowCol
      >
        <Row className="justify-content-center">
          <Col xs="12">
            <article className={styles.legalCard}>
              <h2 className={styles.sectionTitle}>
                Medical & Legal Disclaimer
              </h2>

              <p className="lead fw-medium mb-4">
                All the contents of this Web-Site—such as text, graphics,
                images, information, and other content available on the Site—are
                for <strong>informational purposes only</strong>.
              </p>

              <p>
                The content is not intended to be a substitute for professional
                medical advice, diagnosis, or treatment. Always seek the advice
                of a registered medical practitioner for any queries regarding a
                medical problem, or concerning the use of any product mentioned
                on the site.
              </p>

              <blockquote className={styles.warningBox}>
                <p className="mb-0 fw-semibold text-danger">
                  DO NOT disregard professional medical advice or delay in
                  seeking it because of any information available on this Site.
                </p>
              </blockquote>

              <p className="mt-4 mb-0">
                Any self-medication by using any product, generic, or
                proprietary product of the company, the information of which is
                available on the Web-Site, will be{' '}
                <strong>strictly at the user’s own risk</strong>.
              </p>
            </article>
          </Col>
        </Row>
      </WrapperComponent>
    </main>
  );
}
