import Link from 'next/link';
import { Col, Row } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import styles from './page.module.scss';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Read the Privacy Policy for www.sdlindia.com, including legal notices, privacy references, jurisdiction, and usage rules.',
  alternates: {
    canonical: 'https://www.sdlindia.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <WrapperComponent classes={{ sectionClass: styles.banner }} noRowCol>
        <Row className="justify-content-center">
          <Col xs="12" lg="10" className="text-center">
            <h1 className={styles.bannerTitle}>Privacy Policy</h1>
            <nav aria-label="Breadcrumb">
              <ol className={styles.breadcrumbs}>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">Privacy Policy</li>
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
              <h2 className={styles.sectionTitle}>Privacy Policy:</h2>
              <p>
                At Shree Dhootapapeshwar Limited Online Store, accessible from{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>
                , our top priority is the privacy of our visitors. This Privacy
                Policy document contains types of information that is collected
                and recorded by Shree Dhootapapeshwar Limited and how we use it.
                All natural persons, whose personal information is either
                collected/ received/ possessed/ stored/ dealt in/ handled by
                Company or who visit the site{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>{' '}
                and provide information to the Company online, are covered under
                this Policy.
              </p>

              <h3 className={styles.subTitle}>
                Information covered by this Policy
              </h3>
              <p>
                This Policy seeks to cover personal information of the
                customers/persons i.e. which may include any of the following:
              </p>

              <ul>
                <li>Name & Address</li>
                <li>E-mail</li>
                <li>Phone number</li>
                <li>IP address</li>
                <li>GST Number (if applicable)</li>
                <li>Comments</li>
                <li>Queries</li>
              </ul>

              <h3 className={styles.subTitle}>Log Files</h3>
              <p>
                Shree Dhootapapeshwar Limited follows a standard procedure of
                using log files. These files log visitors when they visit
                websites. All hosting companies do this and a part of hosting
                services & analytics.
              </p>
              <p>
                The information collected by log files include internet protocol
                (IP) addresses, browser type, Internet Service Provider (ISP),
                date and time stamp, referring/exit pages, and possibly the
                number of clicks. These are not linked to any information that
                is personally identifiable. The purpose of the information is
                for analysing trends, administering the site, tracking users,
                movement on the website and gathering demographic information.
              </p>

              <h3 className={styles.subTitle}>Data Retention</h3>
              <p>
                We retain your personal information only for as long as
                necessary to provide our services, maintain your account,
                fulfill orders, provide customer support, comply with applicable
                laws, resolve disputes, and enforce our legal agreements.
              </p>
              <p>
                Order history, invoices, payment-related records, and other
                transaction information may be retained for the period required
                under applicable tax, accounting, and other legal or regulatory
                obligations, even if you request deletion of your account.
              </p>
              <p>
                Once personal data is no longer required for these purposes, it
                will be securely deleted or anonymized.
              </p>

              <h3 className={styles.subTitle}>Data Deletion</h3>
              <p>
                You may request the deletion of your account and personal data
                by submitting a request through our Contact Us page:{' '}
                <a
                  href="/delete-account"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://sdlindia.com/delete-account
                </a>{' '}
                After receiving your request, our support team will verify your
                request and will begin the account deletion process within 24
                hours.
              </p>
              <p>Upon approval:</p>
              <ul>
                <li>Your account will be deactivated or deleted.</li>
                <li>
                  Personal information that is no longer required will be
                  deleted.
                </li>
                <li>
                  Order history, invoices, payment records, and other
                  information that we are legally required to retain for tax,
                  accounting, fraud prevention, dispute resolution, or other
                  regulatory purposes will be retained for the legally required
                  period and will not be deleted until those obligations expire.
                </li>
              </ul>
              <p>
                Once the applicable legal retention period has ended, such
                retained information will be securely deleted or anonymized
                where feasible.
              </p>

              <h3 className={styles.subTitle}>Cookies and Web Beacons</h3>
              <p>
                Like any other website, SDL uses cookies. These cookies are used
                to store information including visitor preferences, and the
                pages on the website that the visitor accessed or visited. The
                information is used to optimise the users’ experience by
                customising our webpage content based on visitors or browser
                type and/or other information. You can choose to disable cookies
                through your individual browser options. To know more in detail
                about cookie management with specific web browsers, it can be
                found at the browsers’ respective websites.
              </p>

              <h3 className={styles.subTitle}>Our Advertising Partners</h3>
              <p>
                Some of advertisers on our site may use cookies and web beacons.
                Each of our advertising partners have their own Privacy Policy
                for their policies on user data.
              </p>

              <h3 className={styles.subTitle}>Third Party Privacy Policies</h3>
              <p>
                Shree Dhootapapeshwar Limited’s Privacy Policy does not apply to
                other advertisers or websites whose hyperlinks may feature on
                our website. Thus, we are advising you to consult the respective
                Privacy Policies of these third-party ad servers for more
                detailed information.
              </p>

              <h3 className={styles.subTitle}>
                Link to privacy policy of third-party service providers used by
                the app:
              </h3>
              <p>Firebase Analytics</p>

              <h3 className={styles.subTitle}>Online Privacy Policy Only</h3>
              <p>
                This Privacy Policy applies only to our online activities and is
                valid for visitors to our website with regard to the information
                that they shared and/or collect on Shree Dhootapapeshwar
                Limited. This policy is not applicable to any information
                collected offline or via channels other than this website.
              </p>

              <h3 className={styles.subTitle}>Consent</h3>
              <p>
                By using our website, you hereby consent to our Privacy Policy
                and agree to its Terms & Conditions.Information contained on
                this website is not a substitute to expert advice by a
                registered ayurvedic practitioner. The products, services &
                information featured on this website is for consumption in India
                only.
              </p>
            </article>
          </Col>
        </Row>
      </WrapperComponent>
    </main>
  );
}
