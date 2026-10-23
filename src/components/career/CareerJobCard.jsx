"use client";

import { useCallback, useId, useState } from "react";
import styles from "./CareerJobCard.module.scss";

export default function CareerJobCard({ job }) {
  const [flipped, setFlipped] = useState(false);
  const descriptionId = useId();

  const showFront = useCallback(() => setFlipped(false), []);
  const showBack = useCallback(() => setFlipped(true), []);

  return (
    <div
      className={`${styles.card} ${flipped ? styles.flipped : ""}`}
      aria-labelledby={`job-role-${job.id}`}
    >
      <div className={styles.inner}>
        {/* FRONT */}

        <div className={`${styles.face} ${styles.front}`}>
          <div className={styles.topBar}></div>

          <div className={styles.cardBody}>
            <div className={styles.typeRow}>
              <span className={styles.typePill}>{job.employmentType}</span>

              <span className={styles.openingsBadge}>
                <span className={styles.activeDot}></span>
                {job.openings} Openings
              </span>
            </div>

            <h3 id={`job-role-${job.id}`} className={styles.role}>
              {job.role}
            </h3>

            <p className={styles.description}>{job.description}</p>

            <div className={styles.divider}></div>

            <div className={styles.metaGrid}>
              <div>
                <span className={styles.metaLabel}>Experience</span>
                <span className={styles.metaValue}>{job.experience}</span>
              </div>

              <div>
                <span className={styles.metaLabel}>Location</span>
                <span className={styles.metaValue}>{job.location}</span>
              </div>

              <div>
                <span className={styles.metaLabel}>Department</span>
                <span className={styles.metaValue}>{job.department}</span>
              </div>

              <div>
                <span className={styles.metaLabel}>Work Mode</span>
                <span className={styles.metaValue}>{job.workMode}</span>
              </div>
            </div>

            {/* <button
              className={styles.viewBtn}
              onClick={showBack}
              aria-controls={descriptionId}
            >
              View Job Description
            </button> */}
            <div className={styles.actionButtons}>

            <button
                className={`${styles.applyBtn} btn outline-theme-color`}
                onClick={() => {
                    window.open('https://hrms.sdlindia.com/hradmin/careers/', '_blank');
                }}
            >
                Apply
            </button> 
            <button
                className={styles.viewBtn}
                onClick={showBack}
                aria-controls={descriptionId}
            >
                Job Description
            </button>

            
            </div>
          </div>
        </div>

        {/* BACK */}

        <div className={`${styles.face} ${styles.back}`}>
          <div className={styles.topBar}></div>

          <div className={styles.backHeader}>
            <h3 className={styles.backRole}>{job.role}</h3>

            <p className={styles.backMeta}>
              {job.employmentType} • {job.location}
            </p>
          </div>

          <div
            id={descriptionId}
            className={styles.descriptionWrap}
          >
            <div className={styles.jdSection}>
              <p className={styles.jdLabel}>About the Role</p>
              <p className={styles.jdText}>{job.about}</p>
            </div>

            <div className={styles.jdSection}>
              <p className={styles.jdLabel}>Responsibilities</p>
              <p className={styles.jdText}>{job.responsibilities}</p>
            </div>

            <div className={styles.jdSection}>
              <p className={styles.jdLabel}>Requirements</p>
              <p className={styles.jdText}>{job.jobDescription}</p>
            </div>
          </div>

          <div className={styles.backFooter}>
            <button className={styles.backBtn} onClick={showFront}>
              ← Back to Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}