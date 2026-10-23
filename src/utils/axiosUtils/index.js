import axios from 'axios';
import getCookie from '../customFunctions/GetCookie';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

const normalizeUrl = (path) => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

const request = async ({ url, ...options }, router) => {
  const safeUrl = normalizeUrl(url);
  // console.log({ options: { url: safeUrl, ...options }, router });
  client.defaults.headers.common.Authorization = `Bearer ${getCookie('uat')}`;
  const onSuccess = (response) => response;
  const onError = (error) => {
    if (error?.response?.status == 403) {
      router && router.push('/403');
    }
    router && router.push('/404');
    console.log('error axios-utils', error?.response?.status, error);
    return error;
  };
  try {
    const response = await client({ url: safeUrl, ...options });
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};

export default request;
