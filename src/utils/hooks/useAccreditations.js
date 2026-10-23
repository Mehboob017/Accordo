import { fetchAccreditations } from "@/api/accreditations.api";
import { useQuery } from "@tanstack/react-query";

export const useAccreditations = () => {
  return useQuery({
    queryKey: ['accreditations'],
    queryFn: fetchAccreditations,
  });
};
