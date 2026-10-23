import { getAuthHeaders } from '@/api/wishlist.api';
import { capitalizeWords } from '@/utils/customFunctions/Capitalize';

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const normalizeCountryCode = (countryCode) => {
  const value = String(countryCode || '+91').trim();
  return value.startsWith('+') ? value : `+${value}`;
};

export const mapAddressFormToCustomerAddressPayload = (
  formData,
  type = 'shipping'
) => {
  const resolvedAddressType = formData?.addressType === 'Other'
    ? String(formData?.otherAddressType || '').trim()
    : formData?.addressType || 'Home';

  return {
    type: type === 'billing' ? 'billing' : 'shipping',
    firstName: capitalizeWords(formData?.firstName) || '',
    lastName: capitalizeWords(formData?.lastName) || '',
    countryCode: normalizeCountryCode(formData?.countryCode),
    phone: formData?.phone || '',
    alternate_phone: formData?.alternate_phone || '',
    email: formData?.email || '',
    addressLine1: formData?.address1 || formData?.addressLine1 || '',
    addressLine2: formData?.address2 || formData?.addressLine2 || '',
    country: 'India',
    state: formData?.state || '',
    city: formData?.city || '',
    landmark: formData?.landmark || '',
    pincode: String(formData?.pincode || ''),
    latitude: String(formData?.latitude || ''),
    longitude: String(formData?.longitude || ''),
    placeId: formData?.placeId || '',
    googleAddress: formData?.googleAddress || '',
    gstAvailibilty: 'No',
    addressType: resolvedAddressType || 'Home',
  };
};

export const mapGstInvoiceFormToCustomerAddressPayload = (
  formData,
  existingAddress = {}
) => {
  // const resolvedAddressType = existingAddress?.addressType || formData?.addressType || '';

  return {
    type: 'billing',
    firstName:
      capitalizeWords(formData?.firstName || existingAddress?.firstName || existingAddress?.first_name) || '',
    lastName:
      capitalizeWords(formData?.lastName || existingAddress?.lastName || existingAddress?.last_name) || '',
    countryCode: normalizeCountryCode(
      formData?.countryCode || existingAddress?.countryCode || existingAddress?.country_code
    ),
    phone: String(formData?.phone || existingAddress?.phone || ''),
    email: formData?.email || existingAddress?.email || '',
    addressType: null,
    addressLine1:
      formData?.address1 ||
      formData?.addressLine1 ||
      existingAddress?.addressLine1 ||
      existingAddress?.address1 ||
      '',
    addressLine2:
      formData?.address2 ||
      formData?.addressLine2 ||
      existingAddress?.addressLine2 ||
      existingAddress?.address2 ||
      '',
    googleAddress: formData?.googleAddress || existingAddress?.googleAddress || '',
    country: formData?.country || existingAddress?.country || 'India',
    state: formData?.state || existingAddress?.state || '',
    city: formData?.city || existingAddress?.city || '',
    landmark: formData?.landmark || existingAddress?.landmark || '',
    pincode: String(formData?.pincode || existingAddress?.pincode || ''),
    longitude: String(
      formData?.longitude ?? existingAddress?.longitude ?? ''
    ),
    latitude: String(
      formData?.latitude ?? existingAddress?.latitude ?? ''
    ),
    gstAvailibilty: formData?.gstNumber ? 'Yes' : 'No',
    gstNo: formData?.gstNumber || '',
    companyName: formData?.companyName || '',
  };
};

export const fetchCustomerAddresses = async () => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${SDL_BASE_URL}/customer-addresses`, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch customer addresses');
  }

  return data;
};

export const addCustomerAddress = async (payload) => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error("Authentication required");
  }

  const requestBody = {
    ...payload,
    firstName: capitalizeWords(payload.firstName),
    lastName: capitalizeWords(payload.lastName),
  };

  // console.log(requestBody);

  const response = await fetch(`${SDL_BASE_URL}/customer-address/add`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Failed to add address");
  }

  return data;
};

export const updateCustomerAddress = async ({ userId, payload }) => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error("Authentication required");
  }

  if (!userId) {
    throw new Error("Address id is required");
  }

  const requestBody = {
    ...payload,
    firstName: capitalizeWords(payload.firstName),
    lastName: capitalizeWords(payload.lastName)
  };

  // console.log("Update address payload:", requestBody);

  const response = await fetch(
    `${SDL_BASE_URL}/customer-address/update/${userId}`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Failed to update address");
  }

  return data;
};

export const deleteCustomerAddress = async (addressId) => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error('Authentication required');
  }

  if (!addressId) {
    throw new Error('Address id is required');
  }

  const response = await fetch(
    `${SDL_BASE_URL}/customer-address/delete/${addressId}`,
    {
      method: 'POST',
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to delete address');
  }

  return data;
};
