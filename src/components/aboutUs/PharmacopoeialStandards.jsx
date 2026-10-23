'use client';

import React from 'react';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import PressGrid from '@/components/press/PressGrid';

const standardImages = [
  {
    uid: "pharmacopoeia-1",
    name: "Association of Analytical Chemists",
    image: "/assets/images/standard-book/AOAC.jpg.webp",
    imageAlt: "AOAC",
    url: "https://www.aoac.org/iofficial-methods-of-analysis-i-22nd-edition-2023/"
  },
  {
    uid: "pharmacopoeia-2",
    name: "British Herbal Pharmacopoeia",
    image: "/assets/images/standard-book/British_herbal_pharmacopoeia.jpg.webp",
    imageAlt: "British Herbal Pharmacopoeia",
    url: "https://bhma.info/product/british-herbal-compendium-volume-1/"
  },
  {
    uid: "pharmacopoeia-3",
    name: "Quality Standards of Indian Medicinal Plants (ICMR – Indian Council of Medical Research)",
    image: "/assets/images/standard-book/ICMR.jpg.webp",
    imageAlt: "ICMR",
  },
  {
    uid: "pharmacopoeia-4",
    name: "International Council for Harmonisation",
    image: "/assets/images/standard-book/IHC.jpg.webp",
    imageAlt: "IHC",
    url: "https://www.ich.org/"
  },
  {
    uid: "pharmacopoeia-5",
    name: "American Herbal Pharmacopoeia",
    image: "/assets/images/standard-book/american_herbal_pharmacopoeia.jpg.webp",
    imageAlt: "American Herbal Pharmacopoeia",
    url: "https://herbal-ahp.org/"
  },
  {
    uid: "pharmacopoeia-6",
    name: "Ayurvedic Pharmacopoeia of India",
    image: "/assets/images/standard-book/ayurvedic_pharmacopoeia.jpg.webp",
    imageAlt: "Ayurvedic Pharmacopoeia ",
  },
  {
    uid: "pharmacopoeia-7",
    name: "Indian Pharmacopoeia",
    image: "/assets/images/standard-book/indian_pharmacopoeia.jpg.webp",
    imageAlt: "Indian Pharmacopoeia",
    url: "https://ipc.gov.in/shop/index.php?route=product/category&path=59"
  },
  {
    uid: "pharmacopoeia-8",
    name: "Quality Control Methods for Medicinal Plant Materials – World Health Organisation",
    image: "/assets/images/standard-book/qualitycontrolmethods.jpg.webp",
    imageAlt: "Quality Control Methods",
    url: "https://www.who.int/docs/default-source/medicines/norms-and-standards/guidelines/quality-control/quality-control-methods-for-medicinal-plant-materials.pdf"
  }
];

const PharmacopoeialStandards = () => {
  return (
    <WrapperComponent classes={{ sectionClass: 'section-b-space press-main-section pharmacopoeial-standards' }}>
      <CustomHeading
        customClass="mb-4"
        title="Pharmacopoeial Standards & Protocols"
      // svgUrl={<LeafSVG className="icon-width" />}
      // subTitle="Reference Standards"
      />
      <div className="press-page">
        <div className="press-content-section pt-0">
          <div className="press-page">
            <section className="press-page__content">
              <PressGrid
                items={standardImages}
                onOpen={(index) => {
                  const url = standardImages[index]?.url;
                  if (url) {
                    window.open(url, "_blank", "noopener,noreferrer");
                  }
                }}
              />
            </section>
          </div>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default PharmacopoeialStandards;
