import Image from 'next/image';

const Avatar = ({
  data,
  placeHolder,
  name,
  customClass,
  customImageClass,
  height,
  width,
}) => {
  const imageSrc = data || placeHolder;

  if (!imageSrc) return null;

  return (
    <>
      <Image
        className={customImageClass ? customImageClass : ''}
        src={imageSrc}
        height={height || 50}
        width={width || 50}
        alt={name?.name || name || ''}
        unoptimized
      />
    </>
  );
};

export default Avatar;
