import Image from 'next/image';

const NoDataFound = ({ data = {} }) => {
  return (
    <div className={data?.customClass ? data?.customClass : ''}>
      {data?.imageUrl && (
        <Image
          src={data?.imageUrl}
          className="img-fluid"
          alt="no-data"
          height={data?.height}
          width={data?.width}
          unoptimized
        />
      )}
      <h4>{data?.title}</h4>
      <p>{data?.description}</p>
    </div>
  );
};

export default NoDataFound;
