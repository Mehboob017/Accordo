'use client';
import Image from 'next/image';
import English from '../../../../../public/assets/images/country/English.png';

const defaultLanguage = {
  title: 'English',
  image: English,
};

const TopLanguage = () => {
  return (
    <div className="theme-form-select select-dropdown selected-language">
      <Image
        src={defaultLanguage.image}
        className="img-fluid"
        alt={defaultLanguage.title}
        height={20}
        width={20}
        priority
        unoptimized
      />
      <span>{defaultLanguage.title}</span>
    </div>
  );
};

export default TopLanguage;
