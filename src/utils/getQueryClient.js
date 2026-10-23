// import { QueryClient } from '@tanstack/react-query';
// import { cache } from 'react';

// // Cache the queryClient creation to ensure we use the same client during a single request
// export const getQueryClient = cache(() => {
//   return new QueryClient({
//     defaultOptions: {
//       queries: {
//         // With SSR, we usually want to set some default staleTime
//         // above 0 to avoid refetching immediately on the client
//         staleTime: 60 * 1000, // 1 minute
//       },
//     },
//   });
// });


import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { cache } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

export const getQueryClient = cache(makeQueryClient);
