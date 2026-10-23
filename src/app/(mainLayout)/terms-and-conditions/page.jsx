import Link from 'next/link';
import { Col, Row } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import styles from './page.module.scss';

export const metadata = {
  title: 'Terms & Conditions',
  description:
    'Read the Terms & Conditions and Disclaimer for www.sdlindia.com, including legal notices, privacy references, jurisdiction, and usage rules.',
  alternates: {
    canonical: 'https://www.sdlindia.com/terms-and-conditions',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main>
      <WrapperComponent classes={{ sectionClass: styles.banner }} noRowCol>
        <Row className="justify-content-center">
          <Col xs="12" lg="10" className="text-center">
            <h1 className={styles.bannerTitle}>Terms & Conditions</h1>
            <nav aria-label="Breadcrumb">
              <ol className={styles.breadcrumbs}>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">Terms & Conditions</li>
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
              <h2 className={styles.sectionTitle}>Terms & Conditions:</h2>
              <p>
                The following terms &amp; conditions have been designed keeping
                in mind the comfort &amp; safety of your visit to our website.
              </p>
              <p>
                These terms and conditions outline the rules and regulations for
                the use of Shree Dhootapapeshwar Limited&apos;s website, located
                at{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>
                .
              </p>
              <p>
                By accessing this website, it is presumed that you accept these
                terms and conditions laid forth herein. Acceptance of terms and
                conditions in part or part thereof is not acceptable under the
                terms &amp; conditions. Do not continue to use this site if you
                do not agree to take all the terms and conditions stated on this
                page.
              </p>
              <p>
                The following terminology applies to these Terms & Conditions,
                Privacy Policy and Disclaimer Notice and all Agreements:
                &ldquo;Client&rdquo;, &ldquo;You&rdquo; and &ldquo;Your&rdquo;
                refers to you, the person who logs in on this website and
                compliant to the Company&apos;s terms and conditions. &ldquo;The
                Company&rdquo;, &ldquo;Ourselves&rdquo;, &ldquo;We&rdquo;,
                &ldquo;Our&rdquo; and &ldquo;Us&rdquo;, refers to our Company.
                &ldquo;Party&rdquo;, &ldquo;Parties&rdquo;, or &ldquo;Us&rdquo;,
                refers to both the Client and ourselves. All terms refer to the
                offer, acceptance and consideration of payment necessary to
                undertake the process of our assistance to the Client in the
                most appropriate manner for the express purpose of meeting the
                Client&apos;s needs in respect of provision of the
                Company&apos;s stated services, in accordance with and subject
                to, prevailing law of India. Any use of the above terminology or
                other words in the singular, plural, capitalization and/or
                he/she or they, are taken as interchangeable and therefore as
                referring to same.
              </p>

              <h3 className={styles.subTitle}>Cookies</h3>
              <p>
                We employ the use of cookies. By accessing{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>
                , you agree to use cookies in agreement with the SHREE
                DHOOTAPAPESHWAR LTD&apos;s Privacy Policy.
              </p>
              <p>
                Most interactive websites use cookies to let them retrieve the
                user&apos;s details for each visit. Cookies are used by our
                website to enable the functionality of certain areas &amp; to
                make it easier for people visiting our website. Some of our
                affiliate/advertising partners may also use cookies.
              </p>

              <h3 className={styles.subTitle}>License</h3>
              <p>
                Unless otherwise stated, SHREE DHOOTAPAPESHWAR LTD and/or its
                licensors own the intellectual property rights for all material
                on{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>
                . All intellectual property rights are reserved. You may access
                this from{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>{' '}
                for your own personal use subjected to restrictions set in these
                terms and conditions.
              </p>
              <p>
                <strong>You must not:</strong>
              </p>
              <ul>
                <li>Republish material.</li>
                <li>Sell, rent or sub-license material.</li>
                <li>Reproduce, duplicate or copy material.</li>
                <li>Redistribute content.</li>
              </ul>
              <p>This Agreement shall begin on the date hereof.</p>
              <p>
                Parts of this website offer an opportunity for users to post and
                exchange opinions and information in certain areas of the
                website. SHREE DHOOTAPAPESHWAR LTD does not filter, edit,
                publish or review comments prior to their presence on the
                website. Comments do not reflect the views and opinions of SHREE
                DHOOTAPAPESHWAR LTD, its agents and/or affiliates. Comments
                reflect the views and opinions of the person who post their
                views and opinions. To the extent permitted by applicable laws,
                SHREE DHOOTAPAPESHWAR LTD shall not be liable for the Comments
                or for any liability, damages or expenses caused and/or suffered
                as a result of any use of and/or posting of and/or appearance of
                the Comments on this website.
              </p>
              <p>
                SHREE DHOOTAPAPESHWAR LTD reserves the right to monitor all
                Comments and to remove any Comments which can be considered
                inappropriate, offensive or causes breach of these Terms and
                Conditions.
              </p>
              <p>
                <strong>You warrant and represent that:</strong>
              </p>
              <ol>
                <li>
                  You are entitled to post the Comments on our website &amp;
                  that the Comments do not invade any intellectual property
                  right, including without limitation copyright, patent or
                  trademark of any third party or of the Company.
                </li>
                <li>
                  The Comments do not contain any defamatory, libellous,
                  offensive, indecent or otherwise unlawful material which are
                  liable to be considered as an invasion of individuals privacy.
                </li>
                <li>
                  The Comments will not be used to solicit or promote business
                  or custom or present commercial activities or unlawful
                  activity.
                </li>
              </ol>

              <h3 className={styles.subTitle}>Hyperlinking to our Content</h3>
              <p>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>{' '}
                may provide links to third party websites or Internet content
                such as blogs or forums. Please note that{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>{' '}
                is not liable for the content or products or services of such
                third-party websites or internet content.
              </p>

              <h3 className={styles.subTitle}>Frames</h3>
              <p>
                Without prior approval and written permission, you may not
                create frames around our Web pages that alter in any way the
                visual presentation or appearance of our Website.
              </p>

              <h3 className={styles.subTitle}>Your Privacy</h3>
              <p>
                We request you to read the read Privacy Policy{' '}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
                .
              </p>

              <h3 className={styles.subTitle}>Reservation of Rights</h3>
              <p>
                We reserve the right to request that you remove all links or any
                link to our Website. You approve to immediately remove all links
                to our Website upon request. We also reserve the right to amend
                these terms and conditions and it&apos;s linking policy at any
                time. By continuously linking to our Website, you agree to be
                bound to and follow these linking terms and conditions.
              </p>

              <h3 className={styles.subTitle}>
                Removal of links from our website
              </h3>
              <p>
                If you find any link on our Website that is offensive for any
                reason, you are free to contact and inform us any moment. We
                will consider requests to remove links but we are not obligated
                to or so or to respond to you directly.
              </p>
              <p>
                We do not ensure that the information on this website is
                correct, we do not warrant its completeness or accuracy; nor do
                we promise to ensure that the website remains available or that
                the material on the website is kept up to date.
              </p>

              <h3 className={styles.subTitle}>Disclaimer</h3>
              <p>
                All the information on this website -{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>{' '}
                - is published in good faith and for general information purpose
                only. SHREE DHOOTAPAPESHWAR LTD does not make any warranties
                about the completeness, reliability and accuracy of this
                information. Any action you take upon the information you find
                on this website ({' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>
                ), is strictly at your own risk. SHREE DHOOTAPAPESHWAR LTD will
                not be liable for any losses and/or damages in connection with
                the use of our website.
              </p>
              <p>
                Information contained on this website is not a substitute to
                expert advice by a registered medical practitioner. Always seek
                the advice of a registered medical practitioner for any queries
                regarding a medical problem, or concerning the use of any
                product mentioned on the site. Do not disregard the professional
                medical advice or delay in seeking it because of any information
                available on this site. Any self-medication by using any
                generic-proprietary product of the company, information of which
                is available on the website, will be strictly at the user&apos;s
                own risk.
              </p>
              <p>
                The products, services &amp; information featured on this
                website is for consumption in India only. Foreign nationals are
                advised to desist from accessing services, medicines, advise and
                products from this website if the same is not authorised or does
                not meet your country or State laws. By accessing such services,
                medicines, advise and products from this website means that you
                have chosen to do so on your own accord and will indemnify SHREE
                DHOOTAPAPESHWAR LIMITED from all claims, consequences,
                violations or any such incidence AND waive your right to
                protest, litigate or demand any compensation, damages or
                reimbursement as a result of your wilful or casual action with
                or without full knowledge or laws in your country or State laws.
              </p>
              <p>
                By using our website, you hereby consent to our disclaimer and
                agree to its terms.
              </p>

              <h3 className={styles.subTitle}>Jurisdiction</h3>
              <p>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  www.sdlindia.com
                </a>{' '}
                is owned &amp; operated by SHREE DHOOTAPAPESHWAR LTD with
                registered office at 135 Nanubhai Desai Road, Khetwadi, Mumbai,
                India. These terms of use are governed by the laws applicable in
                India with courts of Greater Mumbai having jurisdictional
                authority. All users accessing this web site would be governed
                by the local laws as applicable to the use of such websites. The
                users are responsible for complying with the prevalent laws in
                their respective locations.
              </p>

              <h3 className={styles.subTitle}>Update</h3>
              <p>
                Should we update, amend or make any changes to this document,
                those changes will be prominently posted here.
              </p>

              {/* <div className={styles.linkRow}>
                <span className={styles.linkLabel}>Website:</span>{' '}
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://sdlindia.com
                </a>
              </div>
              <div className={styles.linkRow}>
                <span className={styles.linkLabel}>Mailing:</span>{' '}
                <a href="mailto:healthcare@sdlindia.com">
                  healthcare@sdlindia.com
                </a>
              </div> */}
            </article>
          </Col>
        </Row>
      </WrapperComponent>
    </main>
  );
}
