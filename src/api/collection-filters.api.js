const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const RESERVED_FILTER_PARAM_KEYS = new Set([
  'department',
  'field',
  'sort',
  'sortBy',
  'price',
  'minPrice',
  'maxPrice',
]);

const LEGACY_FILTER_KEY_ALIASES = {
  categories: 'category',
  category: 'category',
  health_interests: 'healthInterests',
  health_concerns: 'healthConcerns',
  healthinterests: 'healthInterests',
  healthconcerns: 'healthConcerns',
};

const dedupeValues = (values = []) => [...new Set(values.filter(Boolean))];

const toSafeKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_');

const toLegacyCompatibleKey = (label) => {
  const safeKey = toSafeKey(label);

  return LEGACY_FILTER_KEY_ALIASES[safeKey] || safeKey;
};

const normalizeFilterType = (type) => {
  const normalizedType = String(type || 'select').trim().toLowerCase();

  if (normalizedType === 'range' || normalizedType === 'boolean') {
    return normalizedType;
  }

  return 'select';
};

const normalizeOption = (option = {}) => {
  if (typeof option === 'string' || typeof option === 'number') {
    const value = String(option);

    return {
      uid: value,
      name: value,
      slug: value,
      value,
      disabled: !value,
    };
  }

  const value = option?.value ?? option?.slug ?? option?.uid ?? option?.name ?? '';
  const parsedCount = Number(option?.count ?? option?.products_count ?? option?.total);

  return {
    uid: option?.uid ?? '',
    name: option?.name ?? option?.label ?? String(value || ''),
    slug: option?.slug ?? '',
    value: value === null || value === undefined ? '' : String(value),
    count: Number.isFinite(parsedCount) ? parsedCount : null,
    disabled: !value || option?.disabled === true,
  };
};

const normalizeOptions = (options = []) => {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map(normalizeOption).filter((option) => option?.name);
};

const getRangeStep = (minValue, maxValue, stepValue) => {
  if (Number.isFinite(stepValue) && stepValue > 0) {
    return stepValue;
  }

  const span = Math.max(Number(maxValue || 0) - Number(minValue || 0), 0);

  if (span >= 1000) {
    return 100;
  }

  if (span >= 100) {
    return 10;
  }

  return 1;
};

const normalizeFilterDefinition = (rawFilter = {}) => {
  const key = String(rawFilter?.key || '').trim();
  if (!key) {
    return null;
  }

  const type = normalizeFilterType(rawFilter?.type);
  const label = rawFilter?.label || key;

  if (type === 'range') {
    const min = Number.isFinite(Number(rawFilter?.min)) ? Number(rawFilter.min) : 0;
    const max = Number.isFinite(Number(rawFilter?.max)) ? Number(rawFilter.max) : min;

    return {
      key,
      label,
      type,
      min,
      max,
      step: getRangeStep(min, max, Number(rawFilter?.step)),
      query: rawFilter?.query,
    };
  }

  if (type === 'boolean') {
    return {
      key,
      label,
      type,
      query: rawFilter?.query,
    };
  }

  return {
    key,
    label,
    type: 'select',
    multi: rawFilter?.multi !== false,
    searchable: Boolean(rawFilter?.searchable),
    options: normalizeOptions(rawFilter?.options),
    query: rawFilter?.query,
  };
};

const dedupeFilterDefinitions = (filters = []) => {
  const seen = new Set();

  return filters.filter((filter) => {
    if (!filter?.key || seen.has(filter.key)) {
      return false;
    }

    seen.add(filter.key);
    return true;
  });
};

const mapCollectionSortToApiSort = (sortBy) => {
  switch (sortBy) {
    case 'low-high':
      return 'price_asc';
    case 'high-low':
      return 'price_desc';
    case 'a-z':
      return 'name_asc';
    case 'z-a':
      return 'name_desc';
    default:
      return '';
  }
};

const buildCollectionFiltersQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (RESERVED_FILTER_PARAM_KEYS.has(key)) {
      return;
    }

    const values = Array.isArray(value) ? dedupeValues(value) : [];

    if (values.length > 0) {
      searchParams.set(key, values.join(','));
    }
  });

  if (params?.department) {
    searchParams.set('department', params.department);
  }

  if (params?.field) {
    searchParams.set('field', params.field);
  }

  if (params?.sort) {
    searchParams.set('sort', params.sort);
  } else {
    const sortValue = mapCollectionSortToApiSort(params?.sortBy);

    if (sortValue) {
      searchParams.set('sort', sortValue);
    }
  }

  const priceRange = Array.isArray(params?.price) ? params.price[0] : '';
  const [minPrice, maxPrice] = String(priceRange || '')
    .split('-')
    .map((value) => Number(value));

  if (Number.isFinite(minPrice) && Number.isFinite(maxPrice)) {
    searchParams.set('minPrice', String(minPrice));
    searchParams.set('maxPrice', String(maxPrice));
  }

  return searchParams.toString();
};

const toLegacySection = (filterDefinition) => {
  if (filterDefinition?.type !== 'select') {
    return null;
  }

  return {
    key: filterDefinition.key,
    label: filterDefinition.label,
    items: normalizeOptions(filterDefinition.options),
  };
};

const normalizeLegacyCollectionFiltersData = (data = {}) => {
  const filterDefinitions = [];
  let priceRangeLabel = 'Price Range';
  let priceRangeMax = 0;

  Object.entries(data).forEach(([label, value]) => {
    if (Array.isArray(value)) {
      const key = toLegacyCompatibleKey(label);

      if (!key) {
        return;
      }

      filterDefinitions.push(
        normalizeFilterDefinition({
          key,
          label,
          type: 'select',
          multi: true,
          searchable: false,
          options: value,
        })
      );

      return;
    }

    if (String(label).trim().toLowerCase() === 'price range') {
      const maxValue = Number(value?._max?.disPrice ?? 0);
      const minValue = Number(value?._min?.disPrice ?? 0);

      priceRangeLabel = label;
      priceRangeMax = Number.isFinite(maxValue) ? maxValue : 0;

      filterDefinitions.push(
        normalizeFilterDefinition({
          key: 'price',
          label,
          type: 'range',
          min: Number.isFinite(minValue) ? minValue : 0,
          max: priceRangeMax,
          step: getRangeStep(minValue, maxValue),
          query: {
            min: 'minPrice',
            max: 'maxPrice',
          },
        })
      );
    }
  });

  const filters = dedupeFilterDefinitions(filterDefinitions.filter(Boolean));

  return {
    filters,
    sections: filters.map(toLegacySection).filter(Boolean),
    priceRangeLabel,
    priceRangeMax,
  };
};

const normalizeCollectionFiltersData = (data = {}) => {
  if (Array.isArray(data?.filters)) {
    const filters = dedupeFilterDefinitions(
      data.filters.map(normalizeFilterDefinition).filter(Boolean)
    );
    const priceFilter = filters.find(
      (filterDefinition) => filterDefinition?.type === 'range'
    );

    return {
      filters,
      sections: filters.map(toLegacySection).filter(Boolean),
      priceRangeLabel: priceFilter?.label || 'Price Range',
      priceRangeMax: Number(priceFilter?.max ?? 0),
    };
  }

  return normalizeLegacyCollectionFiltersData(data);
};

export const fetchCollectionFilters = async (params = {}) => {
  const queryString = buildCollectionFiltersQueryString(params);
  const url = queryString
    ? `${SDL_BASE_URL}/collection-filters?${queryString}`
    : `${SDL_BASE_URL}/collection-filters`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Failed to fetch collection filters (${res.status})`,
        data: {
          sections: [],
          priceRangeLabel: 'Price Range',
          priceRangeMax: 0,
        },
      };
    }

    const json = await res.json();
    const normalizedSourceData =
      json && typeof json === 'object' && Array.isArray(json?.filters)
        ? json
        : json?.data ?? {};

    return {
      success: Boolean(json?.success),
      message: json?.message || 'Collection filters fetched successfully',
      data: normalizeCollectionFiltersData(normalizedSourceData),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch collection filters',
      data: {
        sections: [],
        priceRangeLabel: 'Price Range',
        priceRangeMax: 0,
      },
    };
  }
};