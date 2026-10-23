'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import { RiFilePdfLine, RiCloseLine, RiUploadCloud2Line } from 'react-icons/ri';
import Btn from '@/elements/buttons/Btn';
import styles from './EducationSection.module.scss';

const MAX_TEXT_LENGTH = 50;
const MIN_TEXT_LENGTH = 2;
const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;

const EMPTY_QUALIFICATION_FIELDS = {
  collegeName: '',
  specialist: '',
  thesisFileKey: '',
  thesisFile: null,
};

const createEmptyQualificationDrafts = () => ({
  bachelor: { ...EMPTY_QUALIFICATION_FIELDS },
  master: { ...EMPTY_QUALIFICATION_FIELDS },
});

const getFileNameFromPath = (value = '') => {
  if (!value) return '';
  try {
    const sanitizedValue = value.split('?')[0];
    const lastSegment = sanitizedValue.split('/').pop() || sanitizedValue;
    return decodeURIComponent(lastSegment);
  } catch {
    return value;
  }
};

const EducationSection = ({ isEditing, value, onChange }) => {
  const fields = useMemo(
    () => ({
      qualification: value?.qualification || '',
      collegeName: value?.collegeName || '',
      specialist: value?.specialist || '',
      thesisFileKey: value?.thesisFileKey || '',
      thesisFile: value?.thesisFile || null,
    }),
    [value]
  );

  const [fieldErrors, setFieldErrors] = useState({
    collegeName: '',
    specialist: '',
  });
  const [thesisError, setThesisError] = useState('');
  const thesisInputRef = useRef(null);
  const qualificationDraftsRef = useRef(createEmptyQualificationDrafts());
  const [localThesisPreviewUrl, setLocalThesisPreviewUrl] = useState('');

  const syncDraftFromValue = (source) => {
    const qual = source?.qualification;
    if (qual !== 'bachelor' && qual !== 'master') return;
    qualificationDraftsRef.current[qual] = {
      collegeName: source?.collegeName || '',
      specialist: source?.specialist || '',
      thesisFileKey: source?.thesisFileKey || '',
      thesisFile: source?.thesisFile || null,
    };
  };

  useEffect(() => {
    if (!isEditing) {
      qualificationDraftsRef.current = createEmptyQualificationDrafts();
    }
    syncDraftFromValue(value);
  }, [isEditing, value]);

  useEffect(() => {
    if (!(fields.thesisFile instanceof File)) {
      setLocalThesisPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(fields.thesisFile);
    setLocalThesisPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [fields.thesisFile]);

  const setValidatedTextField = (key, val) => {
    const allowCommaSeparated = key === 'specialist';
    const sanitized = val
      .replace(allowCommaSeparated ? /[^a-zA-Z,\s]/g : /[^a-zA-Z\s]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s/, '')
      .slice(0, MAX_TEXT_LENGTH);
    const alphaLength = sanitized.replace(/[\s,]/g, '').length;

    if (typeof onChange === 'function') {
      onChange({ [key]: sanitized });
    }

    if (!sanitized) {
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
      return;
    }

    if (alphaLength < MIN_TEXT_LENGTH) {
      setFieldErrors((prev) => ({
        ...prev,
        [key]: `Minimum ${MIN_TEXT_LENGTH} characters required`,
      }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const clearThesis = () => {
    setThesisError('');
    if (typeof onChange === 'function') {
      onChange({ thesisFile: null, thesisFileKey: '' });
    }
    if (thesisInputRef.current) thesisInputRef.current.value = '';
  };

  const handleQualificationChange = (val) => {
    if (val === fields.qualification) return;

    const currentQual = fields.qualification;
    if (currentQual === 'bachelor' || currentQual === 'master') {
      qualificationDraftsRef.current[currentQual] = {
        collegeName: fields.collegeName,
        specialist: fields.specialist,
        thesisFileKey: fields.thesisFileKey,
        thesisFile: fields.thesisFile,
      };
    }

    const draft =
      qualificationDraftsRef.current[val] || { ...EMPTY_QUALIFICATION_FIELDS };

    if (typeof onChange === 'function') {
      onChange({
        qualification: val,
        ...draft,
      });
    }
    setFieldErrors({ collegeName: '', specialist: '' });
    setThesisError('');
    if (thesisInputRef.current) thesisInputRef.current.value = '';
  };

  const handleThesisChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setThesisError('Only PDF files are accepted.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setThesisError('PDF size must be 5MB or less.');
      e.target.value = '';
      return;
    }

    setThesisError('');
    if (typeof onChange === 'function') {
      onChange({ thesisFile: file });
    }
  };

  const isBachelor = fields.qualification === 'bachelor';
  const isMaster = fields.qualification === 'master';
  const showCollegeField = isBachelor || isMaster;
  const thesisDisplayName =
    fields.thesisFile?.name || getFileNameFromPath(fields.thesisFileKey);
  const thesisPreviewUrl = localThesisPreviewUrl || fields.thesisFileKey || '';
  const thesisDisplaySize = fields.thesisFile
    ? `${(fields.thesisFile.size / 1024).toFixed(0)} KB`
    : null;

  return (
    <div className="education-section">
      <Row className="gx-3 gy-2">
        {/* ── Qualification Tab Buttons ───────────────────────────── */}
        <Col md={12}>
          <FormGroup className="wireframe-field mb-0">
            <Label
              className="form-label mb-2 text-uppercase font-weight-bold"
              style={{ fontSize: '12px' }}
            >
              Qualification
            </Label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`flex-grow-1 qualification-btn py-2 ${fields.qualification === 'bachelor' ? 'active' : ''}`}
                disabled={!isEditing}
                onClick={() => handleQualificationChange('bachelor')}
              >
                Bachelor's in Ayurved
              </button>
              <button
                type="button"
                className={`flex-grow-1 qualification-btn py-2 ${fields.qualification === 'master' ? 'active' : ''}`}
                disabled={!isEditing}
                onClick={() => handleQualificationChange('master')}
              >
                Master's in Ayurved
              </button>
            </div>
          </FormGroup>
        </Col>

        {/* ── College name (bachelor & master) ───────────────────── */}
        {showCollegeField && (
          <Col md={12}>
            <FormGroup className="wireframe-field mb-0 mt-2">
              <Label
                className="form-label mb-1 text-uppercase font-weight-bold"
                style={{ fontSize: '12px' }}
              >
                College Name
                {/* <span className="text-danger">*</span> */}
              </Label>
              <Input
                type="text"
                className="form-control"
                placeholder="Enter college name"
                value={fields.collegeName}
                onChange={(e) =>
                  setValidatedTextField('collegeName', e.target.value)
                }
                maxLength={MAX_TEXT_LENGTH}
                minLength={MIN_TEXT_LENGTH}
                pattern="[A-Za-z ]+"
                invalid={!!fieldErrors.collegeName}
                disabled={!isEditing}
              />
              {/* {isMaster && !fieldErrors.collegeName && (
                <small
                  className="text-muted mt-1 d-block"
                  style={{
                    fontSize: '11px',
                    color: '#9e9e9e',
                    fontStyle: 'italic',
                  }}
                >
                  Changes to Thesis Title if Master's is selected
                </small>
              )} */}
              {fieldErrors.collegeName && (
                <FormFeedback className="d-block message-error">
                  {fieldErrors.collegeName}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
        )}

        {/* ── Expertise (master only) ───────────────────────────── */}
        {isMaster && (
          <Col md={12}>
            <FormGroup className="wireframe-field mb-0 mt-2">
              <Label
                className="form-label mb-1 text-uppercase font-weight-bold"
                style={{ fontSize: '12px' }}
              >
                Expertise
                {/* <span className="text-danger">*</span> */}
              </Label>
              <Input
                type="text"
                className="form-control"
                placeholder="Enter area of expertise (comma separated)"
                value={fields.specialist}
                onChange={(e) =>
                  setValidatedTextField('specialist', e.target.value)
                }
                maxLength={MAX_TEXT_LENGTH}
                minLength={MIN_TEXT_LENGTH}
                pattern="[A-Za-z, ]+"
                invalid={!!fieldErrors.specialist}
                disabled={!isEditing}
              />
              {fieldErrors.specialist && (
                <FormFeedback className="d-block message-error">
                  {fieldErrors.specialist}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
        )}

        {/* ── Thesis PDF (master only) ───────────────────────────── */}
        {isMaster && (
          <Col md={12}>
            <FormGroup className="wireframe-field mb-0 mt-2">
              {!thesisDisplayName ? (
                <div
                  className={`thesis-dropzone ${!isEditing ? 'disabled' : ''}`}
                >
                  <input
                    ref={thesisInputRef}
                    type="file"
                    accept="application/pdf"
                    id="thesisFileInput"
                    className="thesis-file-input"
                    onChange={handleThesisChange}
                    disabled={!isEditing}
                  />
                  <label
                    htmlFor="thesisFileInput"
                    className="thesis-dropzone-label"
                  >
                    <RiUploadCloud2Line size={28} className="upload-icon" />
                    <span className="upload-text">Click to upload thesis</span>
                    <small className="upload-hint">PDF files only</small>
                  </label>
                  {thesisError && <p className="thesis-error">{thesisError}</p>}
                </div>
              ) : (
                <div className="thesis-card">
                  <div className="thesis-card-header">
                    <RiFilePdfLine size={20} className="pdf-icon" />
                    <a
                      href={thesisPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="thesis-link"
                      title="Open thesis in new tab"
                    >
                      {thesisDisplayName}
                    </a>
                    {thesisDisplaySize && (
                      <span className="thesis-filesize">
                        {thesisDisplaySize}
                      </span>
                    )}
                    {isEditing && (
                      <>
                        <input
                          ref={thesisInputRef}
                          type="file"
                          accept="application/pdf"
                          id="thesisFileInputChange"
                          onChange={handleThesisChange}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="thesisFileInputChange"
                          className="thesis-change-btn mb-0 ms-2"
                        >
                          Change
                        </label>
                        <button
                          type="button"
                          className="thesis-remove-btn"
                          onClick={clearThesis}
                          aria-label="Remove thesis file"
                        >
                          <RiCloseLine size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </FormGroup>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default EducationSection;
