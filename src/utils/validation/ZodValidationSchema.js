import { z } from 'zod';
import { EMAIL_PATTERN } from "../constants"

// phone regex /^[6-9]\d{9}$/

export const addressFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(25, 'First name must be at most 25 characters').regex(/^[a-zA-Z\s]+$/, 'First name can contain only letters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(25, 'Last name must be at most 25 characters').regex(/^[a-zA-Z\s]+$/, 'Last name can contain only letters'),
  countryCode: z.string().min(1, 'Country code is required'),
  // phone: z.string().min(10, 'Phone number must be at least 10 digits').max(10, 'Phone number must be at most 10 digits').regex(/^\d+$/, 'Phone number must contain only digits'),
  phone: z.string().regex(/^\d+$/, 'Phone number must contain only digits').regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  alternate_phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: 'Invalid phone number',
    }),
  // email: z.string().min(1, 'Email is required').regex(EMAIL_PATTERN, 'Invalid email address'),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || EMAIL_PATTERN.test(val),
      { message: 'Invalid email address' }
    ),
  addressType: z.enum(['Home', 'Office', 'Other'], {
    required_error: 'Address type is required',
  }),
  otherAddressType: z.string().max(20, 'Address type must be at most 20 characters').optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be exactly 6 digits').regex(/^\d+$/, 'Pincode must contain only digits'),
  latitude: z.union([z.string(), z.number()]).optional(),
  longitude: z.union([z.string(), z.number()]).optional(),
  googleAddress: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.addressType === 'Other' && !data.otherAddressType?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['otherAddressType'],
      message: 'Please enter address type',
    });
  }
});

// Zod validation schema
export const ratingSchema = z.object({
  deliveryRating: z.number().min(1, 'Please rate the delivery experience'),
  productRatings: z.record(z.string(), z.number()).refine(
    (ratings) => Object.values(ratings).some(r => r > 0),
    { message: 'Please rate at least one product' }
  ),
  productOptions: z.record(z.string(), z.record(z.string(), z.array(z.string()))).optional(),
  productComments: z.record(z.string(), z.string()).optional(),
  otherFeedback: z.string().optional(),
});

export const productReviewSchema = z.object({
  rating: z.number().min(1, 'Please rate this product'),
  description: z.string().optional(),
  product_id: z.union([z.string(), z.number()]).optional(),
  review_image_id: z.union([z.string(), z.number()]).optional(),
});

// OTP Login validation schemas
export const otpPhoneSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string().regex(/^\d+$/, 'Phone number must contain only digits').regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
});

export const otpVerificationSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

// Registration form validation schema
export const registrationFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(25, 'First name must be at most 25 characters').regex(/^[a-zA-Z\s]+$/, 'First name can contain only letters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(25, 'Last name must be at most 25 characters').regex(/^[a-zA-Z\s]+$/, 'Last name can contain only letters'),
  email: z
    .string()
    .max(50, 'Email must be at most 50 characters')
    .optional()
    .refine(
      (val) => !val || EMAIL_PATTERN.test(val),
      { message: 'Invalid email address' }
    ),
  profilePhoto: z.any().optional(),
  role: z.enum(['Doctor', 'Customer'], {
    required_error: 'Please select a role',
  }),
  // Doctor-specific fields
  registrationNumber: z.string().optional(),
  degreeCertificate: z.any().optional(),
  registrationCertificate: z.any().optional(),
  specialization: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.role === 'Doctor') {
      return !!data.registrationNumber && data.registrationNumber.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Registration number is required for doctors',
    path: ['registrationNumber'],
  }
).refine(
  (data) => {
    if (data.role === 'Doctor') {
      return data.registrationCertificate && (data.registrationCertificate instanceof FileList ? data.registrationCertificate.length > 0 : data.registrationCertificate);
    }
    return true;
  },
  {
    message: 'Registration certificate is required',
    path: ['registrationCertificate'],
  }
);