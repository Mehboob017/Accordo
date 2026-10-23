import RHFInputField from './RHFInputField';

const RHFSimpleInputField = ({ nameList }) => {
  return (
    <>
      {nameList.map(({ name, ...rest }, i) => (
        <RHFInputField name={name} {...rest} key={i} />
      ))}
    </>
  );
};

export default RHFSimpleInputField;


