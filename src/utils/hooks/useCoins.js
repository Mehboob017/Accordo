import { useQuery } from '@tanstack/react-query';
import { fetchCoins } from '@/api/coins.api';

export const useCoins = (params = {}, options = {}) => {
  const parsedPage = Number(params?.page ?? 1);
  const parsedLimit = Number(params?.limit ?? 10);

  const page = Number.isFinite(parsedPage)
    ? Math.max(1, Math.floor(parsedPage))
    : 1;
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.floor(parsedLimit))
    : 10;

  return useQuery({
    queryKey: ['coins', page, limit],
    queryFn: () => fetchCoins({ page, limit }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    select: (payload) => {
      const summary = payload?.data?.summary || {};
      const totalEarned = Math.max(0, Number(summary?.totalEarned || 0));
      const used = Math.max(0, Number(summary?.used || 0));
      const coinValue = Math.max(0, Number(summary?.coinValue || 0));
      const held = Math.max(0, Number(summary?.held || 0));
      const remaining = Math.max(0, Number(summary?.remaining || 0));
      const valueInRupee = Math.max(0, Number(summary?.totalUsableCoinInRs || 0));

      const history = Array.isArray(payload?.data?.history)
        ? payload.data.history
        : [];
      const pagination = payload?.data?.pagination || {};

      return {
        success: Boolean(payload?.success),
        message: payload?.message || '',
        summary: {
          totalEarned,
          used,
          coinValue,
          held,
          remaining,
          valueInRupee,
        },
        transactions: {
          data: history,
          total: Number(pagination?.totalItems || history.length || 0),
          per_page: Number(pagination?.itemsPerPage || limit),
          current_page: Number(pagination?.currentPage || page),
          total_pages: Number(pagination?.totalPages || 1),
          has_next_page: Boolean(pagination?.hasNextPage),
          has_previous_page: Boolean(pagination?.hasPreviousPage),
        },
      };
    },
    ...options,
  });
};
