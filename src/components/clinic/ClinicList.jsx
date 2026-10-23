'use client';

import { useEffect, useRef } from 'react';
import { RiMapPinLine, RiPhoneLine, RiMailLine } from 'react-icons/ri';

const ClinicCard = ({ clinic, isSelected, onClick }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

  const formatAddress = () => {
    const parts = [
      clinic.addressLine1,
      clinic.addressLine2,
      clinic.city,
      clinic.state,
      clinic.pincode,
    ].filter(Boolean);

    return parts.join(', ');
  };

  const getDoctorName = () => {
    // const customer = clinic.doctor?.customer;
    // if (!customer) return 'Doctor';
    // return `Dr. ${customer.firstName} ${customer.lastName}`.trim();
    return `Dr. ${clinic.name || 'Doctor'}`;
  };

  const getSpecializations = () => {
    const doctorSpecs = clinic.doctorClinicSpecializations || [];
    return doctorSpecs.map(spec => spec.doctorSpecialization?.name).filter(Boolean);
  };

  const handleContactUs = (e) => {
    e.stopPropagation();
    window.location.href = `tel:${clinic.phone}`;
  };

  const handleGetDirections = (e) => {
    e.stopPropagation();
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`,
      '_blank'
    );
  };

  const specializations = getSpecializations();

  return (
    <div
      ref={cardRef}
      className={`clinic-card ${isSelected ? 'is-selected' : ''}`}
    >
      <div className="clinic-card-content">
        <h3 className="clinic-card-name">{clinic.clinicName || 'Clinic'}</h3>

        <p className="clinic-card-doctor">{getDoctorName()}</p>

        {specializations.length > 0 && (
          <div className="clinic-card-specializations">
            {specializations.slice(0, 3).map((spec, index) => (
              <span key={index} className="specialization-badge">
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className="clinic-card-contact">
          <a
            href={`tel:${clinic.phone}`}
            className="clinic-card-phone"
            onClick={(e) => e.stopPropagation()}
          >
            <RiPhoneLine className="info-icon" />
            {clinic.countryCode} {clinic.phone}
          </a>
          {clinic.email && (
            <a
              href={`mailto:${clinic.email}`}
              className="clinic-card-email"
              onClick={(e) => e.stopPropagation()}
            >
              <RiMailLine className="info-icon" />
              {clinic.email}
            </a>
          )}
        </div>

        <p className="clinic-card-address">
          <RiMapPinLine className="info-icon" />
          {formatAddress()}
        </p>

        <div className="clinic-card-actions">
          <button
            className="clinic-action-btn contact-btn btn-secondary"
            onClick={handleContactUs}
          >
            <RiPhoneLine className="btn-icon" />
            Contact Us
          </button>
          <button
            className="clinic-action-btn direction-btn btn-primary"
            onClick={handleGetDirections}
          >
            <RiMapPinLine className="btn-icon" />
            Direction
          </button>
        </div>
      </div>
    </div>
  );
};

const ClinicList = ({ clinics = [], selectedClinicId, onClinicClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="clinic-list clinic-list-skeleton" aria-label="Loading clinics">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="clinic-card clinic-skeleton-card" aria-hidden="true">
            <div className="clinic-card-content">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-subtitle" />

              <div className="clinic-card-specializations">
                <span className="skeleton-pill" />
                <span className="skeleton-pill" />
                <span className="skeleton-pill" />
              </div>

              <div className="skeleton-line skeleton-contact" />
              <div className="skeleton-line skeleton-contact" />
              <div className="skeleton-line skeleton-address" />

              <div className="clinic-card-actions">
                <div className="skeleton-btn" />
                <div className="skeleton-btn" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="clinic-list-empty">
        <p>No clinics found. Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="clinic-list">
      {clinics.map((clinic) => (
        <ClinicCard
          key={clinic.uid}
          clinic={clinic}
          isSelected={selectedClinicId === clinic.uid}
          onClick={onClinicClick}
        />
      ))}
    </div>
  );
};

export default ClinicList;
