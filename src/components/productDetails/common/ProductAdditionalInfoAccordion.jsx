import { handleShare } from '@/utils/helpers';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RiPlayCircleLine, RiFileTextLine, RiArticleLine } from 'react-icons/ri';

const CompanyBlock = ({ data }) => {
  if (!data) return null;

  // Build address lines — join non-empty parts
  const addressParts = [
    data.addressLine1,
    data.addressLine2,
    data.city,
    data.state,
    data.country,
    data.pincode,
  ].filter(Boolean);

  // Group address into two visual lines: street / city+state+country+pin
  const streetParts = [data.addressLine1, data.addressLine2].filter(Boolean);
  const localeParts = [
    data.city,
    data.state,
    data.country,
    data.pincode,
  ].filter(Boolean);

  const hasAddress = addressParts.length > 0;

  return (
    <div className="pd-company-block">
      {data.companyName && (
        <p className="pd-company-block__name">{data.companyName}</p>
      )}
      {hasAddress && (
        <p className="pd-company-block__address">
          {streetParts.length > 0 && <span>{streetParts.join(', ')}</span>}
          {streetParts.length > 0 && localeParts.length > 0 && <br />}
          {localeParts.length > 0 && <span>{localeParts.join(', ')}</span>}
        </p>
      )}
      {data.contactPersonName && (
        <p className="pd-company-block__meta text-capitalize">
          {data.contactPersonName}
        </p>
      )}
      {data.contactEmail && (
        <a
          href={`mailto:${data.contactEmail}`}
          className="pd-company-block__meta pd-company-block__link"
        >
          {data.contactEmail}
        </a>
      )}
      {data.contactNumber && (
        <a
          href={`tel:${data.contactNumber}`}
          className="pd-company-block__meta pd-company-block__link"
        >
          {data.contactNumber}
        </a>
      )}
      {data.gstNo && (
        <p className="pd-company-block__meta pd-company-block__gst">
          GST: {data.gstNo}
        </p>
      )}
    </div>
  );
};

const shareItems = [
  { id: 'facebook', iconClass: 'ri-facebook-fill' },
  { id: 'twitter', iconClass: 'ri-twitter-fill' },
  { id: 'linkedin', iconClass: 'ri-linkedin-fill' },
  { id: 'whatsapp', iconClass: 'ri-whatsapp-fill' },
  { id: 'email', iconClass: 'ri-mail-fill' },
];

const ADDITIONAL_FILE_TYPES = ['article', 'monograph', 'document', 'video'];

const getFileNameFromPath = (path = '') => {
  if (!path) return 'Untitled file';

  const lastSegment = path.split('/').pop() || path;
  const cleanName = lastSegment.split('?')[0];

  try {
    const decodedName = decodeURIComponent(cleanName);

    return decodedName.includes('-')
      ? decodedName.substring(decodedName.indexOf('-') + 1)
      : decodedName;
  } catch {
    return cleanName.includes('-')
      ? cleanName.substring(cleanName.indexOf('-') + 1)
      : cleanName;
  }
};

const getTypeLabel = (type = '') => {
  if (!type) return 'File';
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
};

const ProductAdditionalInfoAccordion = ({ product }) => {
  const [isOpen, setIsOpen] = useState(true);
  const bodyRef = useRef(null);
  const rxProduct = product?.customerType === 'retailer';

  const rows = useMemo(() => {
    const safeProduct = product || {};
    const productFiles = Array.isArray(safeProduct.productFiles)
      ? safeProduct.productFiles
      : [];
    const additionalInfoFiles = productFiles
      .filter((file) => {
        const normalizedType = (file?.type || '').toLowerCase();
        return (
          Boolean(file?.path) && ADDITIONAL_FILE_TYPES.includes(normalizedType)
        );
      })
      .map((file) => {
        const normalizedType = (file?.type || '').toLowerCase();
        return {
          uid: file?.uid || file?.path,
          type: normalizedType,
          typeLabel: getTypeLabel(normalizedType),
          path: file.path,
          fileName: file.name,
          // fileName: getFileNameFromPath(file.path),
        };
      });

    const expiryInMonth = Number(safeProduct.expiryInMonth);
    const expiryText =
      Number.isFinite(expiryInMonth) && expiryInMonth > 0
        ? `Best before ${expiryInMonth} months from the date of manufacture`
        : '';

    const manufacturedBy = safeProduct?.manufacturedBy || null;
    const markettedBy = safeProduct?.markettedBy || null;

    const returnable = safeProduct?.returnable;
    const returnPeriod = safeProduct?.returnPeriod;
    const returnPolicyText =
      returnable === false
        ? 'This product is not returnable.'
        : returnable === true && returnPeriod
          ? `Returns accepted within ${returnPeriod} of delivery.`
          : returnable === true
            ? 'Return available.'
            : '';

    const nextRows = [
      additionalInfoFiles.length > 0
        ? {
          label: 'Additional Files',
          isFiles: true,
          files: additionalInfoFiles,
        }
        : null,
      expiryText ? { label: 'Expiry', value: expiryText } : null,
      manufacturedBy
        ? { label: 'Manufactured By', isCompany: true, data: manufacturedBy }
        : null,
      markettedBy
        ? { label: 'Marketed By', isCompany: true, data: markettedBy }
        : null,
      returnPolicyText
        ? { label: 'Return Period', value: returnPolicyText }
        : null,
    ].filter(Boolean);

    return nextRows;
  }, [product]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const updateHeight = () => {
      el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : '0px';
    };

    updateHeight();

    if (isOpen) {
      const ro = new ResizeObserver(() => {
        el.style.maxHeight = `${el.scrollHeight}px`;
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [isOpen]);

  return (
    <div className={`pd-additional-info ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="pd-additional-info__toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <h2 className="pd-additional-info__title">
          Additional Information
        </h2>
        <span
          className={`pd-additional-info__icon ${isOpen ? 'is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div
        ref={bodyRef}
        className={`pd-additional-info__body ${isOpen ? 'is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="pd-additional-info__list">
          {rxProduct && (
            <div className="pd-additional-info__row">
              <div className="pd-additional-info__label">Disclaimer</div>
              <div className="pd-additional-info__colon" aria-hidden="true">
                :
              </div>
              <div className="pd-additional-info__value">
                Prescription medicines are displayed for information only.
                Currently, Online purchase is not available. Please consult a
                registered medical practitioner before use.
              </div>
            </div>
          )}
          {rows.map((row) => (
            <div className="pd-additional-info__row" key={row.label}>
              <div className="pd-additional-info__label">{row.label}</div>
              <div className="pd-additional-info__colon" aria-hidden="true">
                :
              </div>
              <div className="pd-additional-info__value">
                {row.isCompany ? (
                  <CompanyBlock data={row.data} />
                ) : row.isFiles ? (
                  <div className="pd-additional-info__files" role="list">
                    {row.files.map((file) => (
                      <a
                        key={file.uid}
                        href={file.path}
                        target="_blank"
                        rel="noreferrer"
                        className="pd-additional-info__file"
                        role="listitem"
                      >
                        {file.type === 'image' ? (
                          <span className="pd-additional-info__file-thumb-wrap">
                            <img
                              src={file.path}
                              alt={file.fileName}
                              loading="lazy"
                              className="pd-additional-info__file-thumb"
                            />
                          </span>
                        ) : (
                          <span
                            className="pd-additional-info__file-icon"
                            aria-hidden="true"
                          >
                            {file.type === 'video' ? (
                              <RiPlayCircleLine />
                            ) : file.type === 'monograph' || file.type === 'document' ? (
                              <RiFileTextLine />
                            ) : (
                              <RiArticleLine />
                            )}
                          </span>
                        )}

                        <span className="pd-additional-info__file-meta">
                          <span className="pd-additional-info__file-type">
                            {file.typeLabel}
                          </span>
                          <span
                            className="pd-additional-info__file-name"
                            title={file.fileName}
                          >
                            {file.fileName}
                          </span>
                        </span>
                      </a>
                    ))}
                  </div>
                ) : row.isLink ? (
                  <a
                    className="pd-additional-info__link"
                    href={row.value}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Monograph-reference-link
                  </a>
                ) : (
                  row.value
                )}
              </div>
            </div>
          ))}

          <div className="pd-additional-info__row">
            <div className="pd-additional-info__label">Share it</div>
            <div className="pd-additional-info__colon" aria-hidden="true">
              :
            </div>
            <div className="pd-additional-info__value">
              <div className="pd-additional-info__share">
                {shareItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="pd-additional-info__share-btn"
                    aria-label={item.id}
                    onClick={() => handleShare(item.id)}
                  >
                    <i className={item.iconClass} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAdditionalInfoAccordion;
