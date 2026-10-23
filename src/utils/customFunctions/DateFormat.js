// export const dateFormat = (date, noTime) => {
//   const d = new Date(date);
//   var hours = d.getHours();
//   var minutes = d.getMinutes();
//   var ampm = hours >= 12 ? 'pm' : 'am';
//   hours = hours % 12;
//   hours = hours ? hours : 12; // the hour '0' should be '12'
//   minutes = minutes < 10 ? '0' + minutes : minutes;
//   var strTime = hours + ':' + minutes + ' ' + ampm;
//   // return noTime
//   //   ? `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
//   //   : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${strTime}`;
//   return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
// };

// export const formatDateForDateRange = (dateData) => {
//   const date = new Date(dateData);
//   return dateFormat(date.toISOString(), true);
// };

export const dateFormat = (date) => {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
