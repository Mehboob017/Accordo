'use client';

import React from 'react';
import { VscWorkspaceTrusted } from "react-icons/vsc";
import styles from '@/components/career/CareerBenefits.module.scss';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';

const associatedOrganisations = [
  {
    id: 1,
    title: 'Om Health Care Products',
    description:
      'This is an organisation committed to marketing of Ayurvedic formulations suitable for global consumers.',
    icon: VscWorkspaceTrusted,
  },
  {
    id: 2,
    title: 'Om Vital Vertriebs GmbH',
    description: "Represents Shree Dhootapapeshwar Ltd.'s interest in the EU.",
    icon: VscWorkspaceTrusted,
  },
  {
    id: 3,
    title: 'Shree Dhootapapeshwar Ayurved Trust',
    description: 'SDAV is a registered trust dedicated to the cause of Ayurved. It is involved in activities like organic cultivation, healthcare camps, etc.',
    icon: VscWorkspaceTrusted,
  },
  {
    id: 4,
    title: 'Shree Dhootapapeshwar Ayurved Vidyalaya Samiti',
    description: 'This is engaged in reprinting and publication of old Ayurvedic text books and treatise to make them easily available and accessible to Ayurvedic practitioners as well as students.',
    icon: VscWorkspaceTrusted,
  },
  {
    id: 5,
    title: 'Shree Dhootapapeshwar Ayurved Research Foundation',
    description: 'Has played the main role in development of SDS (Shree Dhootapapeshwar Standards) to define its own norms of Shree Dhootapapeshwar Ltd. for raw material as well as finished products.',
    icon: VscWorkspaceTrusted,
  },
];

const AssociatedOrganisations = () => {
  return (
    <section className={`${styles.section} section-b-space section-lg-space`}>
      <div className="container-fluid-lg">
        <CustomHeading
          customClass="mb-3 mb-lg-4"
          title="Associated Organisations"
          // subTitle=""
          // svgUrl={<LeafSVG className="icon-width" />}
        />

        <div className="row g-3 g-md-4">
          {associatedOrganisations.map((item) => (
            <div key={item.id} className="col-xl-4 col-md-6 col-sm-12">
              <div className={styles.card}>
                <div className={styles.iconWrapper}>
                  <div className={styles.iconCircle}>
                    <item.icon className={styles.icon} aria-hidden="true" />
                  </div>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AssociatedOrganisations;
