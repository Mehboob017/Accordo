'use client';

import { useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Col,
  Row,
} from 'reactstrap';
import FaqCategory from './FaqCategory';

const FaqSection = ({
  faqs = [],
  title = 'Frequently Asked Questions',
  titleTag = 'h2',
  description,
  categories,
  showPageHeader = true,
  activeCategoryUid = null,
  onChangeCategory,
  className = '',
  accordionClassName = '',
}) => {
  const [open, setOpen] = useState(1);
  const TitleTag = titleTag;

  const toggle = (id) => {
    setOpen((prev) => (prev === id ? undefined : id));
  };

  const showCategories = Array.isArray(categories) && categories.length > 0;

  return (
    <section className={`faq-box-contain section-t-space section-b-space ${className}`.trim()}>
      {showPageHeader && <div className="container-fluid-lg">
        <div className="events-header">
          {title && <h2 className="events-title">{title}</h2>}
          {description && <p className="events-subtitle">{description}</p>}
        </div>
      </div>}
      {showCategories && (
        <FaqCategory
          categories={categories}
          activeCategoryUid={activeCategoryUid}
          onChangeCategory={onChangeCategory}
        />
      )}
      <div className="container-fluid-lg">
        <Row>
          <Col xl={5}>
            <div className="faq-contain">
              {title && <TitleTag>{title}</TitleTag>}
              {description && <p>{description}</p>}
            </div>
          </Col>
          <Col xl={7}>
            <div className={`faq-accordion ${accordionClassName}`.trim()}>
              <Accordion open={open} toggle={toggle}>
                {faqs.map((faq, i) => (
                  <AccordionItem key={faq?.uid ?? i}>
                    <AccordionHeader targetId={i + 1} tag="h3">
                      {faq?.question}
                      {open === i + 1 ? (
                        <RiArrowUpSLine />
                      ) : (
                        <RiArrowDownSLine />
                      )}
                    </AccordionHeader>
                    <AccordionBody accordionId={i + 1}>
                      <p dangerouslySetInnerHTML={{ __html: faq?.answer || '' }} style={{ whiteSpace: "pre-line" }}></p>
                    </AccordionBody>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default FaqSection;
