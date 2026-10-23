import { capitalizeWords } from "@/utils/customFunctions/Capitalize";
import {
  uploadFileToS3
} from "@/utils/helpers";

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

/**
 * -----------------------------
 * LOGIN
 * -----------------------------
 */

/**
 * @typedef {Object} LoginResponse
 * @property {boolean} success
 * @property {string} message
 * @property {LoginData} data
 */

/**
 * @typedef {Object} LoginData
 * @property {User} user
 * @property {string} token
 * @property {boolean} needsProfile
 * @property {boolean} isNewUser
 */

/**
 * @typedef {Object} User
 * @property {string} uid
 * @property {string} firstName
 * @property {string} lastName
 * @property {string|null} email
 * @property {string} phone
 * @property {string|null} profileImage
 * @property {string} role
 * @property {boolean} isDoctor
 * @property {"PENDING" | "APPROVED" | "REJECTED"} kycStatus
 * @property {DoctorDetails|null} doctorDetails
 */

export const login = async (params) => {
  const res = await fetch(`${SDL_BASE_URL}/web-login`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: params.phone,
      ...(params.turnstileToken ? { turnstileToken: params.turnstileToken } : {}),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
};


/**
 * -----------------------------
 * RESEND OTP
 * -----------------------------
 */

/**
 * @typedef {Object} ResendOtpData
 * @property {string} phone
 * @property {string} expiresIn
 * @property {string} otp
 * @property {number} resendAllowedAfter
 */

/**
 * @typedef {Object} ResendOtpResponse
 * @property {boolean} success
 * @property {string} message
 * @property {ResendOtpData} data
 */

/**
 * Resend OTP to user phone number
 * @param {{ phone: string }} params - Resend OTP params
 * @returns {Promise<ResendOtpResponse>} Response from the server
 */
export const resendOtp = async (params) => {
  const res = await fetch(`${SDL_BASE_URL}/resend-otp`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: params.phone,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
};

/**
 * -----------------------------
 * VERIFY OTP
 * -----------------------------
 */

/**
 * @typedef {Object} VerifyOtpErrorResponse
 * @property {false} success
 * @property {string} message
 */

/**
 * @typedef {Object} VerifyOtpSuccessResponse
 * @property {true} success
 * @property {string} message
 * @property {Object} data
 */

/**
 * @typedef {VerifyOtpSuccessResponse | VerifyOtpErrorResponse} VerifyOtpResponse
 */

/**
 * Verify OTP for user login
 * @param {{ phone: string, otp: string }} params - Verify OTP params
 * @returns {Promise<VerifyOtpResponse>} Response from the server
 */
export const verifyOtp = async (params) => {
  const res = await fetch(`${SDL_BASE_URL}/verify-otp`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: params.phone,
      otp: params.otp
    }),
  });

  return res.json();
};

/**
 * -----------------------------
 * LOGOUT
 * -----------------------------
 */

/**
 * @typedef {Object} LogoutResponse
 * @property {boolean} success
 * @property {string} message
 */

/**
 * Logout user
 * 
 * @returns {Promise<LogoutResponse>} Response from the server
 */
export const logout = async (params) => {
  const res = await fetch(`${SDL_BASE_URL}/logout`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: params.phone
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to logout');
  }

  return res.json();
};

/**
 * -----------------------------
 * CREATE PROFILE
 * -----------------------------
 */

/**
 * @typedef {Object} CreateProfileUser
 * @property {string} uid
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string|null} profileImage
 * @property {string} role
 * @property {boolean} isDoctor
 * @property {string|null} kycStatus
 * @property {Object|null} doctorDetails
 */

/**
 * @typedef {Object} CreateProfileResponseData
 * @property {CreateProfileUser} user
 * @property {string} token
 */

/**
 * @typedef {Object} CreateProfileResponse
 * @property {boolean} success
 * @property {string} message
 * @property {CreateProfileResponseData} data
 */

/**
 * Create user profile
 * @param {{
 *  profileImageFile?: File | null,
 *  firstName: string,
 *  lastName: string,
 *  email: string,
 *  phone: string,
 *  role: string,
 *  registrationNo: string,
 *  registrationFile?: File | null,
 *  degreeFile?: File | null,
 *  specializationUids: string[]
 * }} profileData - Profile payload
 *
 * @returns {Promise<CreateProfileResponse>} Response from server
 */
export const createProfile = async (profileData) => {
  const {
    profileImageFile,
    registrationFile,
    degreeFile,
    ...rest
  } = profileData;

  let profileImageFileKey = null;
  let registrationFileKey = null;
  let degreeFileKey = null;

  // Upload profile image if provided
  if (profileImageFile instanceof File) {
    profileImageFileKey = await uploadFileToS3(
      profileImageFile,
      "SDL/profile"
    );
  }

  // Upload registration file if provided
  if (registrationFile instanceof File) {
    registrationFileKey = await uploadFileToS3(
      registrationFile,
      "SDL/documents/registration"
    );
  }

  // Upload degree file if provided
  if (degreeFile instanceof File) {
    degreeFileKey = await uploadFileToS3(
      degreeFile,
      "SDL/documents/degree"
    );
  }

  const requestBody = {
    ...rest,
    firstName: capitalizeWords(rest.firstName),
    lastName: capitalizeWords(rest.lastName),
    profileImageFileKey,
    registrationFileKey,
    degreeFileKey,
  };

  // console.log("create profile:", requestBody);

  const res = await fetch(`${SDL_BASE_URL}/create-profile`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message);
  }

  return res.json();
};

/**
 * @typedef {Object} SpecializationsResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Specialization[]} data
 */

/**
 * @returns {Promise<Specialization[]>} List of specializations
 */
export const doctorSpecializations = async () => {
  const res = await fetch(`${SDL_BASE_URL}/specializations`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch specializations');
  }

  return res.json();
};


/**
 * ==========================================
 * GET AUTH CUSTOMER RESPONSE TYPES
 * ==========================================
 */

/**
 * @typedef {Object} GetUserProfileResponse
 * @property {boolean} success
 * @property {string} message
 * @property {AuthCustomer} authCustomer
 */

/**
 * @typedef {Object} AuthCustomer
 * @property {string} uid
 * @property {string} customerUid
 * @property {string} phone
 * @property {string} firstName
 * @property {string} lastName
 * @property {string|null} email
 * @property {string|null} profileImage
 * @property {string} role
 * @property {boolean} isDoctor
 * @property {"PENDING" | "APPROVED" | "REJECTED"} kycStatus
 * @property {DoctorDetails|null} doctorDetails
 * @property {boolean} isNewUser
 * @property {Address[]} addresses
 */

/**
 * @typedef {Object} DoctorDetails
 * @property {string} uid
 * @property {string} customerUid
 * @property {"PENDING" | "APPROVED" | "REJECTED"} kycStatus
 * @property {string|null} kycVerificationDate
 * @property {string|null} kycVerifiedBy
 * @property {string|null} kycSubmitDate
 * @property {string|null} expiredOn
 * @property {boolean} hasAddressFlag
 * @property {boolean} consentFlag
 * @property {string|null} website
 * @property {string} created_at
 * @property {string} updated_at
 * @property {DoctorKycDocument[]} doctorKycDocuments
 * @property {DoctorSpecialization[]} doctorSpecializations
 * @property {DoctorClinicAddress[]} doctorClinicAddresses
 */
/**
 * @typedef {Object} DoctorKycDocument
 * @property {string} uid
 * @property {string} doctorUid
 * @property {"PENDING" | "APPROVED" | "REJECTED"} status
 * @property {string|null} correctionNote
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} degreeFile
 * @property {string} registrationFile
 * @property {string} registrationNo
 */
/**
 * @typedef {Object} DoctorSpecialization
 * @property {string} uid
 * @property {string} doctorUid
 * @property {string} specialisationUid
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Specialization} specialization
 */

/**
 * @typedef {Object} Specialization
 * @property {string} uid
 * @property {string} name
 * @property {string} image
 * @property {string} imageAlt
 * @property {boolean} status
 * @property {string} created_at
 * @property {string} updated_at
 */
/**
 * @typedef {Object} DoctorClinicAddress
 * @property {string} uid
 * @property {string} doctorUid
 * @property {string} clinicName
 * @property {string} addressLine1
 * @property {string} addressLine2
 * @property {string} city
 * @property {string} state
 * @property {string} country
 * @property {string} pincode
 * @property {string} created_at
 * @property {string} updated_at
 */
/**
 * @typedef {Object} Address
 * @property {string} uid
 * @property {string} customerUid
 * @property {"billing" | "shipping"} type
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} countryCode
 * @property {string} phone
 * @property {string} email
 * @property {string|null} addressType
 * @property {string} addressLine1
 * @property {string} addressLine2
 * @property {string} country
 * @property {string} state
 * @property {string} city
 * @property {string} district
 * @property {string} landmark
 * @property {string} pincode
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} placeId
 * @property {string} googleAddress
 * @property {"yes" | "no"} gstAvailibilty
 * @property {string|null} gstNo
 * @property {string|null} companyName
 * @property {string} created_at
 * @property {string} updated_at
 */


/**
 * Fetch authenticated user profile
 * @returns {Promise<GetUserProfileResponse>}
 */
export const getUserProfile = async () => {
  const token = localStorage.getItem('userToken');

  const res = await fetch(
    `${SDL_BASE_URL}/getauthcustomer`,
    {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }

  /** @type {GetUserProfileResponse} */
  const data = await res.json();

  // console.log('getUserProfile - Response data:', data);

  return data;
};

/**
 * -----------------------------
 * PROFILE PHONE VERIFICATION
 * -----------------------------
 */

/**
 * @typedef {Object} ProfileCheckPhoneAuthErrorResponse
 * @property {false} success
 * @property {string} message
 */

/**
 * @typedef {Object} ProfileCheckPhoneSuccessData
 * @property {string} phone
 * @property {string} otp
 * @property {string} expiresIn
 */

/**
 * @typedef {Object} ProfileCheckPhoneSuccessResponse
 * @property {true} success
 * @property {string} message
 * @property {ProfileCheckPhoneSuccessData} data
 */

/**
 * @typedef {ProfileCheckPhoneSuccessResponse | ProfileCheckPhoneAuthErrorResponse} ProfileCheckPhoneResponse
 */

/**
 * @typedef {Object} ProfileVerifyPhoneAuthErrorResponse
 * @property {false} success
 * @property {string} message
 */

/**
 * @typedef {Object} ProfileVerifyPhoneSuccessResponse
 * @property {true} success
 * @property {string} message
 */

/**
 * @typedef {ProfileVerifyPhoneSuccessResponse | ProfileVerifyPhoneAuthErrorResponse} ProfileVerifyPhoneResponse
 */

/**
 * Check if phone can be verified for profile update and send OTP.
 * Requires authenticated session token.
 * @param {{ phone: string }} params
 * @returns {Promise<ProfileCheckPhoneResponse>}
 */
export const checkProfilePhone = async (params) => {
  const token = localStorage.getItem('userToken');
  const res = await fetch(`${SDL_BASE_URL}/profile/check-phone`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      phone: params.phone,
    }),
  });

  return res.json();
};

/**
 * Verify phone OTP for profile update.
 * Requires authenticated session token.
 * @param {{ phone: string, otp: string }} params
 * @returns {Promise<ProfileVerifyPhoneResponse>}
 */
export const verifyProfilePhone = async (params) => {
  const token = localStorage.getItem('userToken');
  const res = await fetch(`${SDL_BASE_URL}/profile/verify-phone`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      phone: params.phone,
      otp: params.otp,
    }),
  });

  return res.json();
};


/**
 * -----------------------------
 * UPDATE PROFILE
 * -----------------------------
 */

/**
 * @typedef {Object} UpdateProfilePayload
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} gender
 * @property {File} [profilePhotoFile] - Optional profile photo file
 */

/**
 * @typedef {Object} UpdateProfileResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Object} data
 */

/**
 * Update user profile
 * @param {UpdateProfilePayload} profileData - Profile data to update
 * @returns {Promise<UpdateProfileResponse>} Response from server
 * 
 * registrationNo
registrationFile
degreeFile
specializationUids
profilePhotoFile
profileImageFile
firstName
lastName
email
phone
 * 
 */

export const updateProfile = async (profileData) => {
  // Extract ALL potential file objects so they don't get stringified
  const {
    profilePhotoFile,
    thesisFile,
    degreeFile,
    registrationFile,
    ...rest
  } = profileData;

  // Create the payload
  const requestBody = {
    ...rest,
    firstName: capitalizeWords(rest.firstName),
    lastName: capitalizeWords(rest.lastName),
  };

  // Upload profile photo
  if (profilePhotoFile instanceof File) {
    requestBody.profileImageFileKey = await uploadFileToS3(
      profilePhotoFile,
      "SDL/profile"
    );
  }

  // Upload thesis PDF
  if (thesisFile instanceof File) {
    const uploadedThesisKey = await uploadFileToS3(
      thesisFile,
      "SDL/documents/thesis"
    );

    requestBody.thesisFileKey = uploadedThesisKey;
    requestBody.thesis = uploadedThesisKey;
  }

  // Avoid clearing existing thesis if no new file is uploaded
  if (!requestBody.thesisFileKey) {
    delete requestBody.thesisFileKey;
    delete requestBody.thesis;
  }

  // Upload Degree Certificate
  if (degreeFile instanceof File) {
    requestBody.degreeFileKey = await uploadFileToS3(
      degreeFile,
      "SDL/documents/degree"
    );
  }

  // Upload Registration Certificate
  if (registrationFile instanceof File) {
    requestBody.registrationFileKey = await uploadFileToS3(
      registrationFile,
      "SDL/documents/registration"
    );
  }

  const token = localStorage.getItem("userToken");

  // console.log("Edit profile payload:", requestBody);
  // throw new Error("custom error message");

  const res = await fetch(`${SDL_BASE_URL}/edit-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(requestBody),
  });

  return res.json();
};
