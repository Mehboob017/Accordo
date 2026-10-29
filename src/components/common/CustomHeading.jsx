const CustomHeading = (props) => {
  const {
    title,
    subTitle,
    svgUrl,
    customClass,
    customTitleClass,
    svgClass = '',
  } = props;

  const rootClass =
    customTitleClass || (customClass ? `${customClass} ` : 'title');

  return (
    <div className={rootClass}>
      <div className="mb-3 mb-lg-4">
        <h2 className="mb-3">{title}</h2>
        {/* {svgUrl && <span className={`title-leaf ${svgClass}`}>{svgUrl}</span>} */}
        {subTitle && (
          <p style={{ color: '#07112C', lineHeight: '1.6' }}>{subTitle}</p>
        )}
      </div>
      {props.children && props.children}
    </div>
  );
};

export default CustomHeading;
