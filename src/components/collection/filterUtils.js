export const COLLECTION_FILTER_DEFAULTS = {
  department: '',
  category: [],
  healthInterests: [],
  healthConcerns: [],
  herbs: [],
  tags: [],
  labels: [],
  price: [],
  attribute: [],
  rating: [],
  discount: [],
  sortBy: 'relevance',
  field: '',
};

export const COLLECTION_FILTER_ARRAY_KEYS = [
  'category',
  'healthInterests',
  'healthConcerns',
  'herbs',
  'tags',
  'labels',
  'price',
  'attribute',
  'rating',
  'discount',
];

export const COLLECTION_FILTER_STRING_KEYS = ['department', 'sortBy', 'field'];

const RESERVED_QUERY_KEYS = new Set([
  'layout',
  'page',
  'limit',
  'search',
  'q',
  'sort',
  'sortBy',
  'department',
  'field',
  'minPrice',
  'maxPrice',
]);

const TRUTHY_BOOLEAN_VALUES = new Set(['true', '1', 'yes', 'on']);

export const mapCollectionSortToApiSort = (sortBy) => {
  switch (sortBy) {
    case 'low-high':
      return 'price_asc';
    case 'high-low':
      return 'price_desc';
    case 'a-z':
      return 'name_asc';
    case 'z-a':
      return 'name_desc';
    case 'relevance':
      return 'relevance';
    default:
      return 'relevance';
  }
};

export const mapApiSortToCollectionSort = (sort) => {
  switch (sort) {
    case 'price_asc':
      return 'low-high';
    case 'price_desc':
      return 'high-low';
    case 'name_asc':
      return 'a-z';
    case 'name_desc':
      return 'z-a';
    case 'relevance':
      return 'relevance';
    default:
      return 'relevance';
  }
};

const dedupe = (values = []) => [...new Set(values.filter(Boolean))];

const toHyphenatedValue = (value) => String(value).trim().replace(/\s+/g, '-');

const normalizeType = (type) => String(type || 'select').toLowerCase();

const getRangeQueryKeys = (definition = {}) => {
  const filterKey = String(definition?.key || '').trim();

  if (definition?.query?.min && definition?.query?.max) {
    return {
      minKey: definition.query.min,
      maxKey: definition.query.max,
    };
  }

  if (filterKey.toLowerCase() === 'price') {
    return {
      minKey: 'minPrice',
      maxKey: 'maxPrice',
    };
  }

  return {
    minKey: `${filterKey}_min`,
    maxKey: `${filterKey}_max`,
  };
};

const isTruthyBooleanParam = (value) =>
  TRUTHY_BOOLEAN_VALUES.has(String(value || '').trim().toLowerCase());

const hasSameValues = (left = [], right = []) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

const normalizeRangeLabel = (value, label = '') => {
  const isPriceLikeLabel = /price|amount|cost/i.test(String(label || ''));

  if (isPriceLikeLabel) {
    const formatted = formatPriceFilterLabel(value);
    if (formatted !== value) {
      return formatted;
    }
  }

  if (!value || typeof value !== 'string') {
    return value;
  }

  const [minValue, maxValue] = value.split('-').map(Number);

  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    return value;
  }

  return `${label || 'Range'}: ${minValue.toLocaleString('en-IN')} - ${maxValue.toLocaleString('en-IN')}`;
};

const normalizeBooleanLabel = (value, label = '') => {
  if (isTruthyBooleanParam(value)) {
    return label || 'Enabled';
  }

  return value;
};

const getDynamicFilterKeys = (params = {}, filterDefinitions = []) => {
  if (Array.isArray(filterDefinitions) && filterDefinitions.length > 0) {
    return filterDefinitions
      .map((definition) => definition?.key)
      .filter(Boolean);
  }

  return Object.keys(params).filter((key) => !RESERVED_QUERY_KEYS.has(key));
};

const createDynamicDefaults = (filterDefinitions = []) => {
  const defaults = {};

  filterDefinitions.forEach((definition) => {
    if (!definition?.key) {
      return;
    }

    defaults[definition.key] = [];
  });

  return defaults;
};

export const getCollectionFilterResetState = (
  currentFilter = {},
  filterDefinitions = []
) => {
  const nextFilter = {
    ...COLLECTION_FILTER_DEFAULTS,
    ...currentFilter,
  };

  Object.keys(nextFilter).forEach((key) => {
    if (COLLECTION_FILTER_STRING_KEYS.includes(key)) {
      return;
    }

    if (Array.isArray(nextFilter[key])) {
      nextFilter[key] = [];
      return;
    }

    if (typeof nextFilter[key] === 'string') {
      nextFilter[key] = '';
    }
  });

  filterDefinitions.forEach((definition) => {
    if (!definition?.key) {
      return;
    }

    nextFilter[definition.key] = [];
  });

  return {
    ...nextFilter,
    sortBy: currentFilter?.sortBy || '',
    field: currentFilter?.field || '',
  };
};

const parseNumericParam = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
};

export const parseCollectionFilters = (params = {}, filterDefinitions = []) => {
  const nextFilter = {
    ...COLLECTION_FILTER_DEFAULTS,
    ...createDynamicDefaults(filterDefinitions),
  };
  const minPrice = parseNumericParam(params.minPrice);
  const maxPrice = parseNumericParam(params.maxPrice);

  const dynamicFilterKeys = getDynamicFilterKeys(params, filterDefinitions);

  dynamicFilterKeys.forEach((key) => {
    const value = params[key];

    if (typeof value !== 'string' || value.length === 0) {
      nextFilter[key] = [];
      return;
    }

    const definition = filterDefinitions.find((item) => item?.key === key);
    const definitionType = normalizeType(definition?.type);

    if (definitionType === 'boolean') {
      nextFilter[key] = isTruthyBooleanParam(value) ? ['true'] : [];
      return;
    }

    nextFilter[key] = dedupe(value.split(','));
  });

  COLLECTION_FILTER_STRING_KEYS.forEach((key) => {
    nextFilter[key] =
      typeof params[key] === 'string' ? params[key] : '';
  });

  if (minPrice !== null && maxPrice !== null) {
    nextFilter.price = [`${minPrice}-${maxPrice}`];
  }

  filterDefinitions.forEach((definition) => {
    if (!definition?.key) {
      return;
    }

    if (normalizeType(definition.type) !== 'range') {
      return;
    }

    const { minKey, maxKey } = getRangeQueryKeys(definition);
    const minValue = parseNumericParam(params[minKey]);
    const maxValue = parseNumericParam(params[maxKey]);

    if (minValue !== null && maxValue !== null) {
      nextFilter[definition.key] = [`${minValue}-${maxValue}`];
    }
  });

  nextFilter.sortBy = mapApiSortToCollectionSort(
    params.sort || params.sortBy
  );

  return nextFilter;
};

export const updateSearchParamsWithFilters = (
  searchParams,
  filter,
  filterDefinitions = []
) => {
  const nextParams = new URLSearchParams(searchParams?.toString?.() ?? '');

  const filterKeys =
    filterDefinitions.length > 0
      ? filterDefinitions.map((definition) => definition?.key).filter(Boolean)
      : Object.keys(filter || {}).filter(
        (key) => !COLLECTION_FILTER_STRING_KEYS.includes(key)
      );

  filterKeys.forEach((key) => {
    const definition = filterDefinitions.find((item) => item?.key === key);
    const definitionType = normalizeType(definition?.type);
    const values = Array.isArray(filter?.[key]) ? dedupe(filter[key]) : [];

    if (definitionType === 'range' || key === 'price') {
      const rangeValue = values[0] || '';
      const [minValue, maxValue] = String(rangeValue)
        .split('-')
        .map(parseNumericParam);
      const { minKey, maxKey } = getRangeQueryKeys(definition || { key });

      nextParams.delete(key);

      if (minValue !== null && maxValue !== null) {
        nextParams.set(minKey, String(minValue));
        nextParams.set(maxKey, String(maxValue));
      } else {
        nextParams.delete(minKey);
        nextParams.delete(maxKey);
      }

      return;
    }

    if (definitionType === 'boolean') {
      if (values.length > 0 && isTruthyBooleanParam(values[0])) {
        nextParams.set(key, 'true');
      } else {
        nextParams.delete(key);
      }

      return;
    }

    const normalizedValues = values.map(toHyphenatedValue);

    if (normalizedValues.length > 0) {
      nextParams.set(key, normalizedValues.join(','));
    } else {
      nextParams.delete(key);
    }
  });

  nextParams.delete('health_interest');
  nextParams.delete('healthConcern');
  nextParams.delete('health_concern');
  nextParams.delete('price');
  nextParams.delete('sortBy');
  nextParams.delete('field');

  COLLECTION_FILTER_STRING_KEYS.forEach((key) => {
    if (key === 'sortBy' || key === 'field') {
      return;
    }

    if (filter?.[key]) {
      nextParams.set(key, toHyphenatedValue(filter[key]));
    } else {
      nextParams.delete(key);
    }
  });

  const apiSort = mapCollectionSortToApiSort(filter?.sortBy);

  if (apiSort) {
    nextParams.set('sort', apiSort);
  } else {
    nextParams.delete('sort');
  }

  return nextParams;
};

export const formatPriceFilterLabel = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  const [minValue, maxValue] = value.split('-').map(Number);

  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    return value;
  }

  return `Rs. ${minValue.toLocaleString('en-IN')} - Rs. ${maxValue.toLocaleString('en-IN')}`;
};

export const createCollectionFilterValueLabelMap = (sections = []) =>
  sections.reduce((accumulator, section) => {
    if (!section?.key || !Array.isArray(section?.options || section?.items)) {
      return accumulator;
    }

    const options = Array.isArray(section.options) ? section.options : section.items;

    accumulator[section.key] = options.reduce((sectionLabels, item) => {
      if (item?.value !== undefined && item?.value !== null) {
        sectionLabels[String(item.value)] = item.name || item.label || item.value;
      }

      return sectionLabels;
    }, {});

    return accumulator;
  }, {});

export const getSelectedFilterEntries = (
  filter = {},
  labelMap = {},
  filterDefinitions = []
) => {
  if (Array.isArray(filterDefinitions) && filterDefinitions.length > 0) {
    return filterDefinitions.reduce((entries, definition) => {
      if (!definition?.key) {
        return entries;
      }

      const values = Array.isArray(filter?.[definition.key])
        ? filter[definition.key]
        : [];

      values.forEach((value) => {
        const normalizedValue = String(value);
        const definitionType = normalizeType(definition?.type);
        const baseLabel = labelMap?.[definition.key]?.[normalizedValue] || normalizedValue;

        let label = baseLabel;

        if (definitionType === 'range') {
          label = normalizeRangeLabel(normalizedValue, definition?.label);
        }

        if (definitionType === 'boolean') {
          label = normalizeBooleanLabel(normalizedValue, definition?.label);
        }

        entries.push({
          key: definition.key,
          value: normalizedValue,
          label,
        });
      });

      return entries;
    }, []);
  }

  const entries = [];

  const filterGroups = [
    { key: 'category' },
    { key: 'healthInterests' },
    { key: 'healthConcerns' },
    { key: 'herbs' },
    { key: 'tags' },
    { key: 'labels' },
    { key: 'attribute' },
    { key: 'price', formatLabel: formatPriceFilterLabel },
    {
      key: 'rating',
      formatLabel: (value) => `Rating ${value}`,
      normalizeValue: (value) => String(value).replace(/^rating\s+/i, ''),
    },
  ];

  filterGroups.forEach(({ key, formatLabel, normalizeValue }) => {
    const values = Array.isArray(filter[key]) ? filter[key] : [];

    values.forEach((value) => {
      const normalizedValue = normalizeValue ? normalizeValue(value) : value;
      const baseLabel = labelMap?.[key]?.[normalizedValue] || normalizedValue;
      entries.push({
        key,
        value: normalizedValue,
        label: formatLabel ? formatLabel(normalizedValue) : baseLabel,
      });
    });
  });

  return entries;
};

export const shouldUpdateFilterValues = (previousValues = [], nextValues = []) =>
  !hasSameValues(previousValues, nextValues);