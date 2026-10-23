import { useState } from 'react';

export const useFilePreview = () => {
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [degreeCertPreview, setDegreeCertPreview] = useState(null);
  const [regCertPreview, setRegCertPreview] = useState(null);
  const [regCertName, setRegCertName] = useState('');
  const [degreeCertName, setDegreeCertName] = useState('');

  const handleFilePreview = (file, type) => {
    if (file && file[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setProfilePhotoPreview(reader.result);
        } else if (type === 'reg') {
          setRegCertPreview(reader.result);
        } else if (type === 'degree') {
          setDegreeCertPreview(reader.result);
        }
      };
      reader.readAsDataURL(file[0]);
    }
  };

  const resetPreviews = () => {
    setProfilePhotoPreview(null);
    setDegreeCertPreview(null);
    setRegCertPreview(null);
    setRegCertName('');
    setDegreeCertName('');
  };

  return {
    profilePhotoPreview,
    setProfilePhotoPreview,
    degreeCertPreview,
    setDegreeCertPreview,
    regCertPreview,
    setRegCertPreview,
    regCertName,
    setRegCertName,
    degreeCertName,
    setDegreeCertName,
    handleFilePreview,
    resetPreviews,
  };
};
