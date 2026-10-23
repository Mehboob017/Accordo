'use client';

import { useEffect, useMemo, useState } from 'react';
import { Row, Col } from 'reactstrap';

import { useCompanyDocuments } from '@/utils/hooks/useCompanyDocuments';
import CompanyDocumentsTabs from './CompanyDocumentsTabs';
import { CompanyDocumentsSkeleton } from './CompanyDocumentsSkeleton';
import WrapperComponent from '@/components/common/WrapperComponent';
import CompanyDocumentsCard from './CompanyDocumentsCard';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';

const CompanyDocuments = ({ hideHeading = false }) => {
  const { data, isLoading } = useCompanyDocuments();

  const documents = data?.data?.documents || [];
  const companyDocuments = data?.data?.companyDocuments || [];

  const [activeYear, setActiveYear] = useState('');

  useEffect(() => {
    if (!activeYear && documents.length) {
      setActiveYear(documents[0].uid);
    }
  }, [documents, activeYear]);

  const activeDocument = useMemo(() => {
    return companyDocuments.find((item) => item.uid === activeYear);
  }, [activeYear, companyDocuments]);

  if (isLoading) {
    return <CompanyDocumentsSkeleton />;
  }

  if (documents.length == 0) {
    return (
      // <WrapperComponent classes={{ sectionClass: 'section-b-space' }}>
      //   <div className="empty-cart-box my-5">
      //     <h5>No Company Documents Found</h5>
      //     <a
      //       href="/"
      //       className="btn btn-md btn-primary mt-3 d-inline-block"
      //     >
      //       Back to Home
      //     </a>
      //   </div>
      // </WrapperComponent>
      null
    )
  }

  return (
    <WrapperComponent classes={{
      sectionClass: "section-b-space"
    }} noRowCol={true}>
      {!hideHeading && (
        <Row>
          <Col xs={12}>
            <CustomHeading
              customClass="mb-0"
              title="Company Documents"
              svgUrl={<LeafSVG className="icon-width" />}
              subTitle="Explore our company documents"
            />
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={12}>
          <CompanyDocumentsTabs
            tabs={documents}
            activeTab={activeYear}
            onChange={setActiveYear}
          />
        </Col>
      </Row>

      <Row className="g-sm-4 g-3 mt-3 journal-publications-section">
        {activeDocument?.documentFiles?.map((file, index) => (
          <Col key={file.uid} lg={3} md={4} xs={6}>
            <CompanyDocumentsCard file={file} key={file.uid} />
          </Col>
        ))}
      </Row>
    </WrapperComponent>
  );
};

export default CompanyDocuments;