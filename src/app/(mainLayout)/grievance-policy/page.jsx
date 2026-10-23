import Link from 'next/link';
import { Col, Row } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import styles from './page.module.scss';

export const metadata = {
  title: 'Grievance Redressal Policy',
  description:
    'Learn about the structured grievance redressal mechanism, customer care working hours, and contact channels for Shree Dhootapapeshwar Limited.',
  alternates: {
    canonical: 'https://www.sdlindia.com/grievance-policy',
  },
};

export default function GrievancePolicyPage() {
  return (
    <main>
      <WrapperComponent classes={{ sectionClass: styles.banner }} noRowCol>
        <Row className="justify-content-center">
          <Col xs="12" lg="10" className="text-center">
            <h1 className={styles.bannerTitle}>Grievance Redressal Policy</h1>
            <nav aria-label="Breadcrumb">
              <ol className={styles.breadcrumbs}>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">Grievance Redressal Policy</li>
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
                Our Commitment to Customer Care
              </h2>

              <p className="lead fw-medium mb-4">
                Shree Dhootapapeshwar Limited (hereinafter referred to as "SDL",
                "We", "Us", or "Our") is committed to providing the highest
                standards of customer service and ensuring prompt, fair, and
                effective resolution of customer grievances.
              </p>

              <p>
                We value customer feedback and strive to address all concerns in
                a transparent and timely manner. SDL has established a
                structured grievance redressal mechanism for receiving,
                registering, and resolving customer complaints, queries,
                feedback, and suggestions through dedicated communication
                channels. We encourage our customers to reach out to us whenever
                they experience any issue relating to our products or services.
              </p>

              <h3 className={styles.subTitle}>Contact Channels</h3>
              <p>
                For any query, complaint, feedback, suggestion, or request, you
                may contact us through the following channels:
              </p>

              <ul className="list-unstyled mb-4 ps-2">
                <li className="mb-2">
                  <strong>E-mail:</strong>{' '}
                  <a
                    href="mailto:healthcare@sdlindia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    healthcare@sdlindia.com
                  </a>
                </li>
                <li className="mb-2">
                  <strong>Customer Helpline:</strong>{' '}
                  <a href="tel:1800229874">1800-229-874</a>
                </li>
                <li className="mb-2">
                  <strong>Alternative Helpline:</strong>{' '}
                  <a href="tel:+912223829874">+91-22-23829874</a>
                </li>
              </ul>

              <h3 className={styles.subTitle}>Reporting Timeline</h3>
              <blockquote className={styles.warningBox}>
                <p className="mb-0 fw-semibold text-dark">
                  For complaints relating to orders after delivery, customers
                  are requested to report the issue within{' '}
                  <strong>48 hours from the date of delivery</strong> to enable
                  prompt investigation and resolution.
                </p>
              </blockquote>

              <h3 className={styles.subTitle}>Customer Care Working Hours</h3>
              <p>For all issues, our Customer Care team is available:</p>

              <ul className="mb-4">
                <li>
                  <strong>Days:</strong> Monday to Friday
                </li>
                <li>
                  <strong>Time:</strong> 10:00 A.M. to 5:00 P.M. (IST)
                </li>
                <li>
                  <strong>Lunch Break:</strong> 1:00 P.M. to 2:00 P.M. (IST)
                </li>
              </ul>

              <p className="text-muted small mb-4">
                <em>
                  Note: Customer support services remain closed on National
                  Holidays and on any other day declared as a holiday by SDL.
                </em>
              </p>

              <hr className="my-4" />

              <p className="mb-0 fw-medium">
                SDL remains committed to resolving customer grievances in a
                fair, courteous, and efficient manner, with the objective of
                ensuring complete customer satisfaction.
              </p>
            </article>
          </Col>
        </Row>
      </WrapperComponent>
    </main>
  );
}
