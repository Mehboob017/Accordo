import common from '@/data/translations/common.json';

const namespaces = {
  common,
};

export const translate = (key, namespace = 'common') => {
  const dictionary = namespaces[namespace] || {};
  return dictionary[key] || key;
};

export const useTranslation = (arg1 = 'common', arg2) => {
  const namespace = arg2 ?? (typeof arg1 === 'string' ? arg1 : 'common');
  const dictionary = namespaces[namespace] || {};
  const t = (key) => dictionary[key] || key;
  return { t };
};
