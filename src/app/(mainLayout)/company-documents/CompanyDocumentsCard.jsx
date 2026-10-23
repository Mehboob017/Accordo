'use clienti';

import Image from 'next/image';
import { RiArrowRightSLine } from 'react-icons/ri';

const CompanyDocumentsCard = ({ file, index }) => {
  // console.log(file);

  return (
    <a
      href={file.filePath}
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

            <img
              src={file?.coverImage || '/assets/images/logo/1.png'}
              alt={file?.coverImageAlt || 'company document'}
              width={300}
              height={200}
              className="img-fluid"
            />
          </div>

          <div className="publication-meta m-0">
            <button
              type="button"
              className="herb-card__button w-100 btn-primary"
            >
              View PDF
              <RiArrowRightSLine className="button-icon" />
            </button>
          </div>
        </div>
      </div>
    </a>
  );
};

export default CompanyDocumentsCard;
