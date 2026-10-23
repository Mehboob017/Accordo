import React from 'react';
import { LeafSVG } from '@/components/common/CommonSVG';
import CustomHeading from '../common/CustomHeading';
import CareerJobCard from './CareerJobCard';
import styles from './CareerPosition.module.scss';

const jobs = [
  {
    id: 1,
    role: 'PSR',
    employmentType: 'Full Time',
    openings: 4,
    experience: '2-5 Years',
    location: 'Pune, Maharashtra',
    department: 'Medical',
    workMode: 'On-site',
    description:
      'Deliver exceptional patient support by coordinating appointments, handling inquiries, and ensuring a seamless healthcare experience.',
    about:
      'As a Patient Service Representative (PSR), you will be the first point of contact for patients. You will ensure a smooth and positive healthcare journey by assisting with appointments, patient inquiries, and coordination between patients and healthcare professionals.',
    responsibilities:
      '• Welcome and assist patients with appointments and registrations.\n• Handle patient inquiries through phone, email, and in person.\n• Coordinate with doctors and clinic staff for seamless patient care.\n• Maintain accurate patient records and documentation.\n• Provide information about treatments, services, and healthcare programs.\n• Ensure a professional and compassionate patient experience.',
    jobDescription:
      'Bachelor’s degree in any discipline with 2–5 years of experience in healthcare or customer service. Excellent communication, organizational, and computer skills are required. Experience with CRM systems is an added advantage.',
  },
  {
    id: 2,
    role: 'DM',
    employmentType: 'Full Time',
    openings: 2,
    experience: '1-3 Years',
    location: 'Remote',
    department: 'Marketing',
    workMode: 'Hybrid',
    description:
      'Create engaging, SEO-friendly healthcare content and execute impactful digital marketing campaigns.',
    about:
      'Join our marketing team to create impactful digital campaigns that promote Ayurvedic healthcare solutions. You will develop engaging content, manage digital channels, and help increase brand visibility across multiple platforms.',
    responsibilities:
      '• Create SEO-friendly website and blog content.\n• Plan and execute social media campaigns.\n• Manage email marketing and promotional campaigns.\n• Optimize website content for search engines.\n• Analyze campaign performance using analytics tools.\n• Collaborate with designers and content creators to deliver engaging campaigns.',
    jobDescription:
      'Bachelor’s degree in Marketing, Communications, or a related field with 1–3 years of experience. Knowledge of SEO, Google Analytics, social media marketing, and excellent writing skills are essential. Healthcare or Ayurveda experience is preferred.',
  },
  {
    id: 3,
    role: 'ZSM',
    employmentType: 'Full Time',
    openings: 3,
    experience: '5-8 Years',
    location: 'Mumbai, Maharashtra',
    department: 'Sales',
    workMode: 'On-site',
    description:
      'Lead regional sales operations, manage field teams, and drive business growth across the assigned territory.',
    about:
      'As a Zonal Sales Manager (ZSM), you will lead regional sales operations, mentor sales teams, and build strong relationships with distributors, healthcare professionals, and business partners to achieve sales targets.',
    responsibilities:
      '• Develop and execute regional sales strategies.\n• Lead, mentor, and motivate the sales team.\n• Achieve monthly and quarterly sales targets.\n• Build strong relationships with distributors and key clients.\n• Monitor market trends and competitor activities.\n• Prepare sales reports and performance analysis.\n• Coordinate with marketing and product teams to drive business growth.',
    jobDescription:
      'Bachelor’s degree in Business, Marketing, Pharmacy, or a related field with 5–8 years of sales experience. Strong leadership, communication, and team management skills are required. Experience in pharmaceutical, healthcare, or Ayurvedic sales is preferred.',
  },
];

const CareerPosition = () => {
  return (
    <section
      id="open-positions"
      className={`${styles.section} section-lg-space`}
    >
      <div className="container-fluid-lg">
        <CustomHeading
          customClass="mb-0 "
          title="Open Positions"
          subTitle="Explore current opportunities and find the role that fits your passion and expertise."
          svgUrl={<LeafSVG className="icon-width" />}
        />

        <div className={`row g-3 g-md-4 ${styles.cardsRow}`}>
          {jobs.map((job) => (
            <div className="col-lg-4 col-md-6 col-sm-12" key={job.id}>
              <CareerJobCard job={job} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CareerPosition;
