// Example API Response Structure for Preclinical Studies
// API Endpoint: https://testserver.sdlindia.com/api/preclinical-studies

// Expected Response Format:
// {
//   "success": true,
//     "message": "Preclinical Studies fetched successfully",
//       "data": {
//     "peclinicalstudies": [
//       {
//         "uid": "cmkwnmt330026qnz5f3cpv72u",
//         "resourceCategoryUid": "cmkwniwd9001mqnz51wmyaccu",
//         "resourceSubcategoryUid": "cmkwnjhc6001qqnz5zmn2p15m",
//         "type": "preclinical studies",
//         "title": "asdfghgfds",
//         "coverImage": null,
//         "coverImageAlt": null,
//         "date": null,
//         "pdfPath": "https://somewhrlightsail.s3.ap-south-1.amazonaws.com/Sdl/Resources/PDFs/1769521869081-Receipt.pdf",
//         "created_at": "2026-01-27T13:51:09.760Z",
//         "updated_at": "2026-01-27T13:51:09.760Z",
//         "resourceCategory": {
//           "uid": "cmkwniwd9001mqnz51wmyaccu",
//           "name": "test category"
//         },
//         "resourceSubcategory": {
//           "uid": "cmkwnjhc6001qqnz5zmn2p15m",
//           "name": "test subcate"
//         }
//       },
//       {
//         "uid": "cmkwnmfez0022qnz5oc37xzas",
//         "resourceCategoryUid": "cmkwniwd9001mqnz51wmyaccu",
//         "resourceSubcategoryUid": "cmkwnjhc6001qqnz5zmn2p15m",
//         "type": "preclinical studies",
//         "title": "sdfgbhnjhgfds",
//         "coverImage": null,
//         "coverImageAlt": null,
//         "date": "2026-01-15",
//         "pdfPath": "https://somewhrlightsail.s3.ap-south-1.amazonaws.com/Sdl/Resources/PDFs/1769521851680-debitenoteInvoice.pdf",
//         "created_at": "2026-01-27T13:50:52.043Z",
//         "updated_at": "2026-01-27T13:50:52.043Z",
//         "resourceCategory": {
//           "uid": "cmkwniwd9001mqnz51wmyaccu",
//           "name": "test category"
//         },
//         "resourceSubcategory": {
//           "uid": "cmkwnjhc6001qqnz5zmn2p15m",
//           "name": "test subcate"
//         }
//       },
//       {
//         "uid": "cmkwnluh8001yqnz5eerttsdv",
//         "resourceCategoryUid": "cmkwniwd9001mqnz51wmyaccu",
//         "resourceSubcategoryUid": "cmkwnjhc6001qqnz5zmn2p15m",
//         "type": "preclinical studies",
//         "title": "asdfvbgfvds",
//         "coverImage": null,
//         "coverImageAlt": null,
//         "date": null,
//         "pdfPath": "https://somewhrlightsail.s3.ap-south-1.amazonaws.com/Sdl/Resources/PDFs/1769521824376-MOP.pdf",
//         "created_at": "2026-01-27T13:50:24.908Z",
//         "updated_at": "2026-01-27T13:50:24.908Z",
//         "resourceCategory": {
//           "uid": "cmkwniwd9001mqnz51wmyaccu",
//           "name": "test category"
//         },
//         "resourceSubcategory": {
//           "uid": "cmkwnjhc6001qqnz5zmn2p15m",
//           "name": "test subcate"
//         }
//       },
//       {
//         "uid": "cmkwnk615001uqnz5o68o53hp",
//         "resourceCategoryUid": "cmkwniwd9001mqnz51wmyaccu",
//         "resourceSubcategoryUid": "cmkwnjhc6001qqnz5zmn2p15m",
//         "type": "preclinical studies",
//         "title": "xdcfghygtfrde",
//         "coverImage": null,
//         "coverImageAlt": null,
//         "date": "2026-01-01",
//         "pdfPath": "https://somewhrlightsail.s3.ap-south-1.amazonaws.com/Sdl/Resources/PDFs/1769521736900-debitenoteInvoice.pdf",
//         "created_at": "2026-01-27T13:49:06.570Z",
//         "updated_at": "2026-01-27T13:49:06.570Z",
//         "resourceCategory": {
//           "uid": "cmkwniwd9001mqnz51wmyaccu",
//           "name": "test category"
//         },
//         "resourceSubcategory": {
//           "uid": "cmkwnjhc6001qqnz5zmn2p15m",
//           "name": "test subcate"
//         }
//       }
//     ],
//       "resourcecategories": [
//         {
//           "uid": "cmkwniwd9001mqnz51wmyaccu",
//           "type": "preclinical studies",
//           "name": "test category",
//           "image": null,
//           "imageAlt": null,
//           "description": "xdcfgfgthyu",
//           "created_at": "2026-01-27T13:48:07.390Z",
//           "updated_at": "2026-01-27T13:48:07.390Z"
//         }
//       ],
//         "pagination": {
//       "total": 4,
//         "page": 1,
//           "limit": 10,
//             "totalPages": 1
//     }
//   }
// }

// Usage in the application:
// 1. Server Component (page.jsx) prefetches the data
// 2. Data is dehydrated and passed to client
// 3. Client component (PreclinicalStudiesClient.jsx) uses the hook to access hydrated data
// 4. If API returns no data, fallback static data is used
