import { cultivatorAddFormApi } from '@/api/cultivators.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCultivatorAddForm = (options = {}) => {

  return useMutation({
    mutationKey: ['cultivator-add-form'],
    mutationFn: (payload) => cultivatorAddFormApi(payload),
    ...options,
  });
};
