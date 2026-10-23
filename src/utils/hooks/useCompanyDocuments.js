import { fetchCompanyDocuments } from "@/api/company-documents.api";
import { useQuery } from "@tanstack/react-query";

export const useCompanyDocuments = () => {
  return useQuery({
    queryKey: ['company-documents'],
    queryFn: fetchCompanyDocuments,
  });
};