import React from 'react';

const RatioImage = (props) => {
  return (
    <img
      loading='lazy'
      decoding='async'
      {...props}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        ...props.style,
      }}
    />
  );
};
export default RatioImage;
