'use client';

import { HydrationBoundary } from '@tanstack/react-query';

export default function HydrateProvider({ children, state }) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
