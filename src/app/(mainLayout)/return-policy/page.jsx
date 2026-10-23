import Link from 'next/link';
import { Col, Row } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import styles from './page.module.scss';

export const metadata = {
  title: 'Return & Refund Policy',
  description:
    'Read the Return & Refund Policy for www.sdlindia.com, including legal notices, privacy references, jurisdiction, and usage rules.',
  alternates: {
    canonical: 'https://www.sdlindia.com/return-policy',
  },
};

export default function RefundPolicyPage() {
  return (
    <main>
      <WrapperComponent classes={{ sectionClass: styles.banner }} noRowCol>
        <Row className="justify-content-center">
          <Col xs="12" lg="10" className="text-center">
            <h1 className={styles.bannerTitle}>Return & Refund Policy</h1>
            <nav aria-label="Breadcrumb">
              <ol className={styles.breadcrumbs}>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">Return & Refund Policy</li>
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
              <h2 className={styles.sectionTitle}>Cancellation:</h2>
              <p>
                Cancellations are allowed only till the time product is not
                shipped from our warehouses. Please contact our Customer Care
                team immediately at{' '}
                <a href="mailto:healthcare@sdlindia.com">
                  healthcare@sdlindia.com
                </a>{' '}
                or call us on <a href="tel:1800229874">1800-229-874</a> (MON-
                FRI, Timing (IST): 10:00 AM To 05:00 PM, except on holidays) to
                assist you in cancelling your order.
              </p>
              <h3 className={styles.subTitle}>Refund:</h3>
              <p>
                We will initiate your refund within 3 working days of our
                confirmation. However, it may take 7-15 working days for the
                amount to get credited / reflected in your bank or credit card
                account statement as this involves inter-bank refund procedures
                which may take time.
              </p>
              <h3 className={styles.subTitle}>Return:</h3>
              <p>
                We at Shree Dhootapapeshwar Limited are committed to our valued
                customers & have designed a fair as well as transparent return
                policy.
              </p>
              <ol>
                <li>
                  Please raise a return/replacement request within 2 days from
                  the date of delivery. In case of damaged/missing product,
                  raise a return/replacement within 2 days from the date of
                  delivery. Kindly e-mail us at{' '}
                  <a href="mailto:healthcare@sdlindia.com">
                    healthcare@sdlindia.com
                  </a>{' '}
                  with relevant details such as invoice number. Shree
                  Dhootapapeshwar Ltd. would 2 working days to review your
                  return request & reply to the same.
                </li>
                <li>
                  You would need to send the product, at your expense, via any
                  reliable courier or postal services to the address provided
                  below. The product should reach us within 15 days of dispatch.
                </li>
                <li>
                  After the product is received, SHREE DHOOTAPAPESHWAR LTD will
                  verify it against the claim and initiate the replacement or
                  refund if the claim meets our policy. Please note that
                  replacement would depend upon the stock availability.
                </li>
              </ol>
              <h3 className={styles.subTitle}>
                Circumstances under which returns/replacements would be
                considered.
              </h3>
              <ul>
                <li>Wrong product delivered</li>
                <li>Expired product delivered</li>
                <li>
                  Damaged product delivered – physical damage/ tampered product
                  or packaging
                </li>
                <li>Incomplete order – missing products</li>
              </ul>
              <h3 className={styles.subTitle}>
                Circumstances under which returns/replacements would NOT be
                considered.
              </h3>
              <ul>
                <li>Opened/used/altered products</li>
                <li>Original packaging (mono cartons, labels, etc.) missing</li>
                <li>
                  The return/replacement request is generated after 2 days from
                  the date of delivery
                </li>
                <li>
                  The damaged/missing product is reported after 2 days from the
                  date of delivery
                </li>
                <li>
                  The product is physically received by us after 15 days of
                  despatch.
                </li>
              </ul>
              <h3 className={styles.subTitle}>Address for returns</h3>
              <p>
                Kindly direct your returns, securely packed & appropriately
                labelled to the given below address.
              </p>
              <h3 className={styles.subTitle}>Shree Dhootapapeshwar Ltd.</h3>
              <p className="text-danger font-weight-bold text-underline">
                ATTENTION: CONSUMER AYURVED CELL
              </p>
              <p>
                Veer Savarkar Chowk, Nr. Ballaleshwar Mandir,
                <br />
                Panvel – 410206
                <br />
                Maharashtra.
              </p>
            </article>
          </Col>
        </Row>
      </WrapperComponent>
    </main>
  );
}
