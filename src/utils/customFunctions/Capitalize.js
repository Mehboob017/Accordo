const Capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default Capitalize;

export const capitalizeWords = (value = '') =>
  value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());