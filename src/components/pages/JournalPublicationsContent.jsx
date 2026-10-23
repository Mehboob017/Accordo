'use client';

import { Col, Row } from 'reactstrap';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { formatDate } from '@/utils/helpers';
import { useJournalPublications } from '@/utils/hooks/useJournalPublications';
import JournalPublicationsSkeleton from './JournalPublicationsSkeleton';
import { RiArrowRightSLine, RiCalendarLine, RiExternalLinkLine } from 'react-icons/ri';

const JournalPublicationsContent = () => {
  const searchParams = useSearchParams();
  const currentPage = Math.abs(Number(searchParams.get('page'))) || 1;
  const itemsPerPage = 12;

  const { data: response, isLoading: journalPublicationsLoader } = useJournalPublications(
    currentPage,
    itemsPerPage
  );

  if (journalPublicationsLoader) return <JournalPublicationsSkeleton />;

  const journalPublications = response?.data?.journalpublications || [];
  const pagination = response?.data?.pagination || {};
  const totalItems = pagination.total || 0;

  return (
    <>
      <Row className="g-sm-4 g-3">
        {journalPublications.map((publication) => {
          return (
            <Col key={publication.uid} lg={3} md={4} xs={6}>
              <a
                href={publication.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="publication-card-link"
              >
                <div className="publication-card">
                  <div className="publication-card-inner">
                    <div className="publication-image">
                      <div className="pdf-badge">
                        <span>PDF</span>
                      </div>
                      <Image
                        src={
                          publication.coverImage || '/assets/images/logo/1.png'
                        }
                        alt={publication.coverImageAlt || publication.title}
                        width={300}
                        height={200}
                        className="img-fluid"
                        onError={(e) => {
                          e.target.src = '/assets/images/logo/1.png';
                        }}
                      />
                    </div>
                    <div className="publication-content">
                      <h3
                        className="publication-title"
                        title={publication.title}
                      >
                        {publication.title}
                      </h3>
                      {publication.date && (
                        <div className="publication-meta">
                          <span className="publication-date">
                            {/* <i className="ri-calendar-line"></i> */}
                            <RiCalendarLine />
                            {formatDate(publication.date)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="publication-meta m-0">
                      <button className="herb-card__button w-100 btn-primary">
                        View PDF
                        <RiArrowRightSLine className="button-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            </Col>
          );
        })}
      </Row>

      {totalItems > itemsPerPage && (
        <nav className="custome-pagination mt-4">
          <Pagination total={totalItems} perPage={itemsPerPage} />
        </nav>
      )}
    </>
  );
};

export default JournalPublicationsContent;
