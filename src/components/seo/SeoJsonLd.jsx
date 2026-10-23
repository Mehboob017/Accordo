const SeoJsonLd = ({ schemas = [] }) => {
  if (!schemas || !schemas.length) {
    return null;
  }

  return (
    <>
      {schemas.map((schema, index) => {
        if (!schema) return null;
        const jsonContent =
          typeof schema === 'string'
            ? schema.replace(/<script\b[^>]*>/gi, '').replace(/<\/script>/gi, '').trim()
            : JSON.stringify(schema);

        return (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonContent }}
          />
        );
      })}
    </>
  );
};

export default SeoJsonLd;

// const SeoJsonLd = ({ schemas = [] }) => {
//   if (!schemas.length) return null;

//   return (
//     <>
//       {schemas.map((schema, index) => (
//         <script
//           key={index}
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify(schema),
//           }}
//         />
//       ))}
//     </>
//   );
// };

// export default SeoJsonLd;