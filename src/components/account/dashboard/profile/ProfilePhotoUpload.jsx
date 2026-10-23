'use client';

import React, { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { RiAddLine, RiCloseLine } from 'react-icons/ri';


const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ProfilePhotoUpload = ({ control, isEditing, profilePhotoPreview, onFileChange, userName }) => {
  const inputRef = useRef(null);
  const initials = getInitials(userName);

  return (
    <Controller
      name="profilePhoto"
      control={control}
      render={({ field: { onChange, onBlur, name, ref } }) => (
        <div className="avatar-upload">
          <input
            name={name}
            ref={(e) => {
              ref(e);
              inputRef.current = e;
            }}
            onBlur={onBlur}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              onChange(files);
              onFileChange?.(files);
            }}
            className="avatar-input"
            id="profilePhotoInput"
            disabled={!isEditing}
          />

          {/* Wrapper keeps image + buttons together */}
          <div className="avatar-label">
            <span className="avatar-ring">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-initials" aria-label={`Initials ${initials}`}>
                  {initials}
                </span>
              )}

              {/* ADD — opens the file picker */}
              {isEditing && (
                <span
                  className="avatar-add"
                  role="button"
                  aria-label="Upload photo"
                  onClick={() => inputRef.current?.click()}
                >
                  <RiAddLine size={18} />
                </span>
              )}

              {/* REMOVE — clears the photo without opening file picker */}
              {isEditing && (
                <span
                  className="avatar-remove"
                  role="button"
                  aria-label="Remove photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (inputRef.current) {
                      inputRef.current.value = '';
                    }
                    onChange(null);
                    onFileChange?.(null);
                  }}
                >
                  <RiCloseLine size={18} />
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    />
  );
};

export default ProfilePhotoUpload;
