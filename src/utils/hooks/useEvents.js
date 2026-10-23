import { fetchCalendarEvents, fetchEventDetail, fetchEvents } from '@/api/events.api';
import { useQuery } from '@tanstack/react-query';

export const useEvents = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

export const useCalendarEvents = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['calendar-events', params],
    queryFn: () => fetchCalendarEvents(params),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

export const useEventDetail = (eventSlug, options = {}) => {
  return useQuery({
    queryKey: ['event-detail', { eventSlug }],
    queryFn: () => fetchEventDetail({ eventSlug }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  })
}