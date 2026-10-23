'use client';

import { useState, useRef, useEffect, useMemo, memo } from 'react';
import Image from 'next/image';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import SuccessModal from '@/components/common/SuccessModal';
import Confetti from 'react-confetti-boom';
import {
  RiStarFill,
  RiStarLine,
  RiCloseLine,
  RiImageAddLine,
  RiVideoLine,
  RiCloseFill,
  RiErrorWarningLine,
  RiCameraLine,
  RiFolderUploadLine,
} from 'react-icons/ri';
import { useForm, Controller } from 'react-hook-form';
import { useRateOrder } from '@/utils/hooks/useMyOrders';
import { canReviewOrder } from '@/utils/orders/statusMapper';
import { toast } from 'react-toastify';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { placeHolderImage } from '@/data/CommonPath';
import '../../productDetails/common/allModal/ReviewModal.scss';
import { uploadFileToS3 } from '@/utils/helpers';
import MediaPickerModal from './components/MediaPickerModal';
import CameraModal from '../../auth/login/components/CameraModal';
import { useCameraCapture } from '../../auth/login/hooks/useCameraCapture';
import VideoRecorderModal from './components/VideoRecorderModal';
import { useVideoCapture } from './hooks/useVideoCapture';

const POSITIVE_FEEDBACK_QUESTIONS = [
  {
    id: 'positive_quality',
    question: 'What did you like about this product?',
    options: [
      'Good overall quality',
      'Met expectations',
      'Felt reliable',
      'Easy to use',
      'Worth the purchase',
    ],
  },
  {
    id: 'positive_experience',
    question: 'How was your overall experience?',
    options: [
      'Smooth experience',
      'Satisfied with the product',
      'Good value for money',
      'Would buy again',
      'Would recommend to others',
    ],
  },
];

const NEGATIVE_FEEDBACK_QUESTIONS = [
  {
    id: 'negative_quality',
    question: 'What could be improved in this product?',
    options: [
      'Quality could be better',
      'Did not meet expectations',
      'Needs improvement',
      'Not easy to use',
      'Did not feel worth the price',
    ],
  },
  {
    id: 'negative_experience',
    question: 'What issue did you notice?',
    options: [
      'Unsatisfactory experience',
      'Product was not good',
      'Not as expected',
      'Had usability issues',
      'Would not purchase again',
    ],
  },
];

const QUESTION_LABEL_BY_ID = [
  ...POSITIVE_FEEDBACK_QUESTIONS,
  ...NEGATIVE_FEEDBACK_QUESTIONS,
].reduce((accumulator, question) => {
  accumulator[question.id] = question.question;
  return accumulator;
}, {});

const LOW_RATING_FEEDBACK_ERROR =
  'Selecting at least one option is required for the questions.';

const getFeedbackQuestionsByRating = (rating) =>
  rating > 3 ? POSITIVE_FEEDBACK_QUESTIONS : NEGATIVE_FEEDBACK_QUESTIONS;

// --- Upload Constants ---
const MAX_REVIEW_FILES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'];
const ACCEPTED_FILE_TYPES = 'image/*,video/*';

const formatBackendErrorMessage = (error) => {
  const rawMessage =
    error?.response?.data?.message || error?.response?.data?.error || '';

  if (!rawMessage) return '';

  return rawMessage;
};

const StarRating = ({ rating, onRate, size = 20, disabled = false }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="star-btn"
          onClick={() => onRate(star)}
          disabled={disabled}
          aria-label={`Rate ${star} stars`}
        >
          {star <= rating ? (
            <RiStarFill className="star filled" style={{ fontSize: size }} />
          ) : (
            <RiStarLine className="star" style={{ fontSize: size }} />
          )}
        </button>
      ))}
    </div>
  );
};

const DeliveryRatingCard = memo(function DeliveryRatingCard({
  firstProductImage,
  deliveryImageFailed,
  setDeliveryImageFailed,
  control,
}) {
  return (
    <div className="delivery-rating-section">
      <div className="delivery-rating-card">
        <div className="delivery-icon">
          {firstProductImage && !deliveryImageFailed ? (
            <Image
              src={firstProductImage}
              alt="Order item"
              width={48}
              height={48}
              onError={() => setDeliveryImageFailed(true)}
              unoptimized
            />
          ) : (
            <span className="delivery-icon-fallback">📦</span>
          )}
        </div>
        <div className="delivery-info">
          <h6>Rate delivery experience</h6>
          <Controller
            name="deliveryRating"
            control={control}
            render={({ field }) => (
              <StarRating
                rating={field.value}
                onRate={(star) =>
                  field.onChange(star === field.value ? 0 : star)
                }
                size={24}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
});

const ProductRatingItem = ({
  product,
  rating,
  isRateable,
  onRatingChange,
  selectedOptions,
  onOptionToggle,
  comment,
  onCommentChange,
  images = [],
  onImagesChange,
  onPreviewOpen,
  isSubmitting,
}) => {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const cameraCapture = useCameraCapture();
  const videoCapture = useVideoCapture();

  const triggerFilePicker = (source) => {
    if (!fileInputRef.current) return;
    if (source === 'camera') {
      fileInputRef.current.setAttribute('accept', 'image/*');
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.removeAttribute('multiple');
    } else if (source === 'video') {
      fileInputRef.current.setAttribute('accept', 'video/*');
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.removeAttribute('multiple');
    } else {
      fileInputRef.current.setAttribute('accept', ACCEPTED_FILE_TYPES);
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('multiple', '');
    }
    fileInputRef.current.click();
  };

  const isExpanded = isRateable && rating > 0;
  const feedbackQuestions = useMemo(
    () => getFeedbackQuestionsByRating(rating),
    [rating]
  );

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, selectedOptions, comment, images, uploadError]);

  const handleReviewImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadError(null);

    if (images.length + files.length > MAX_REVIEW_FILES) {
      setUploadError(
        `Maximum ${MAX_REVIEW_FILES} files allowed. You can upload ${MAX_REVIEW_FILES - images.length} more.`
      );
      if (e.target) e.target.value = '';
      return;
    }

    const validatedFiles = [];
    const errors = [];

    for (const file of files) {
      const fileType = file.type;
      const fileSize = file.size;
      const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

      if (!isImage && !isVideo) {
        errors.push(
          `${file.name}: Invalid file type. Only JPG, PNG, WebP images and MP4, WebM videos are allowed.`
        );
        continue;
      }

      if (isImage && fileSize > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: Image size must be less than 5MB.`);
        continue;
      }

      if (isVideo && fileSize > MAX_VIDEO_SIZE) {
        errors.push(`${file.name}: Video size must be less than 20MB.`);
        continue;
      }

      validatedFiles.push({
        id: `review-file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
        size: fileSize,
        name: file.name,
      });
    }

    if (errors.length > 0) {
      setUploadError(errors.join(' '));
    }

    if (validatedFiles.length > 0) {
      onImagesChange([...images, ...validatedFiles]);
    }

    if (e.target) e.target.value = '';
  };

  const handleRemoveReviewImage = (imageId) => {
    const img = images.find((i) => i.id === imageId);
    if (img) URL.revokeObjectURL(img.preview);
    onImagesChange(images.filter((i) => i.id !== imageId));
    setUploadError(null);
  };

  const handleStarClick = (star) => {
    if (!isRateable) return;

    if (star === rating) {
      onRatingChange(0);
    } else {
      onRatingChange(star);
    }
  };

  return (
    <div
      className={`product-rating-item ${!isRateable ? 'disabled-item' : ''}`}
    >
      <div className="product-rating-row">
        <div className="product-info">
          <div className="product-thumb">
            <Image
              src={
                product.image || placeHolderImage
              }
              alt={product.name}
              width={40}
              height={40}
              draggable={false}
              unoptimized
            />
          </div>
          <span className="product-name">{product.name}</span>
        </div>
        <StarRating
          rating={rating}
          onRate={handleStarClick}
          size={18}
          disabled={!isRateable}
        />
      </div>

      {!isRateable && (
        <p className="rating-disabled-note">
          You can rate this item after delivery.
        </p>
      )}

      <div
        className="feedback-section"
        style={{
          height: contentHeight,
          overflow: 'hidden',
          transition: 'height 0.3s ease-in-out',
        }}
      >
        <div ref={contentRef} className="feedback-content">
          {feedbackQuestions.map((q) => (
            <div key={q.id} className="feedback-question">
              <p className="question-text">{q.question}</p>
              <div className="options-list">
                {q.options.map((option) => {
                  const isSelected = selectedOptions[q.id]?.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`option-pill ${isSelected ? 'selected' : ''}`}
                      disabled={!isRateable}
                      onClick={() => onOptionToggle(q.id, option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="review-upload-section">
            <label className="upload-label">
              Add Photos / Videos
              <span className="optional-tag">(Optional)</span>
            </label>
            <p className="upload-helper-text">
              Max {MAX_REVIEW_FILES} files • Images: max 5MB • Videos: max
              20MB • {images.length}/{MAX_REVIEW_FILES} uploaded
            </p>

            {uploadError && (
              <div className="review-upload-error">
                <RiErrorWarningLine size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="review-upload-area">
              {images.length < MAX_REVIEW_FILES && (
                <button
                  type="button"
                  className="review-add-btn"
                  disabled={isSubmitting}
                  onClick={() => setIsMediaPickerOpen(true)}
                >
                  <RiImageAddLine size={20} />
                  <span>Add Files</span>
                  <span className="review-btn-helper">Images/Videos</span>
                </button>
              )}

              {images.map((file) => (
                <div
                  key={file.id}
                  className={`review-upload-thumb ${file.type}`}
                  onClick={() => onPreviewOpen(file)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onPreviewOpen(file)}
                >
                  {file.type === 'image' ? (
                    <img src={file.preview} alt="Review" draggable={false} />
                  ) : (
                    <div className="review-video-preview">
                      <video src={file.preview} draggable={false} />
                      <div className="review-video-overlay">
                        <RiVideoLine size={24} />
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="review-remove-btn"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveReviewImage(file.id);
                    }}
                    aria-label="Remove file"
                  >
                    <RiCloseFill size={14} />
                  </button>
                  <div className="review-file-info">
                    <span className="review-file-type-badge">
                      {file.type === 'image' ? 'IMG' : 'VID'}
                    </span>
                    <span className="review-file-size">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              hidden
              disabled={isSubmitting}
              onChange={handleReviewImageUpload}
            />
            <MediaPickerModal
              isOpen={isMediaPickerOpen}
              onClose={() => setIsMediaPickerOpen(false)}
              onTakePhoto={() => {
                const isMobileDevice =
                  typeof navigator !== 'undefined' &&
                  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                const supportsDesktopCamera =
                  typeof navigator !== 'undefined' &&
                  !!navigator.mediaDevices?.getUserMedia;

                if (!isMobileDevice && supportsDesktopCamera) {
                  setIsMediaPickerOpen(false);
                  cameraCapture.setShowCameraModal(true);
                } else {
                  setIsMediaPickerOpen(false);
                  triggerFilePicker('camera');
                }
              }}
              onRecordVideo={() => {
                const isMobileDevice =
                  typeof navigator !== 'undefined' &&
                  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                const supportsDesktopCamera =
                  typeof navigator !== 'undefined' &&
                  !!navigator.mediaDevices?.getUserMedia;

                if (!isMobileDevice && supportsDesktopCamera) {
                  setIsMediaPickerOpen(false);
                  videoCapture.setShowVideoModal(true);
                } else {
                  setIsMediaPickerOpen(false);
                  triggerFilePicker('video');
                }
              }}
              onChooseFromGallery={() => {
                setIsMediaPickerOpen(false);
                triggerFilePicker('gallery');
              }}
            />
            <CameraModal
              isOpen={cameraCapture.showCameraModal}
              onClose={() => cameraCapture.setShowCameraModal(false)}
              cameraError={cameraCapture.cameraError}
              videoRef={cameraCapture.videoRef}
              onCapture={() => {
                cameraCapture.capturePhoto((fileList) => {
                  handleReviewImageUpload({ target: { files: fileList } });
                });
              }}
            />
            <VideoRecorderModal
              isOpen={videoCapture.showVideoModal}
              onClose={() => videoCapture.setShowVideoModal(false)}
              videoError={videoCapture.videoError}
              videoRef={videoCapture.videoRef}
              isRecording={videoCapture.isRecording}
              recordingDuration={videoCapture.recordingDuration}
              recordedBlob={videoCapture.recordedBlob}
              recordedSize={videoCapture.recordedSize}
              isLimitReached={videoCapture.isLimitReached}
              maxVideoSize={videoCapture.maxVideoSize}
              onStartRecording={videoCapture.startRecording}
              onStopRecording={videoCapture.stopRecording}
              onRetake={videoCapture.retakeVideo}
              onSave={() => {
                videoCapture.saveVideo((fileList) => {
                  handleReviewImageUpload({ target: { files: fileList } });
                });
              }}
            />
          </div>

          <div className="comment-section">
            <textarea
              className="comment-textarea"
              placeholder="Write your reviews here..."
              value={comment}
              disabled={!isRateable}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const RateOrderModal = ({ isOpen, onClose, order, onSubmit }) => {
  const products = useMemo(() => {
    const sourceItems =
      (Array.isArray(order?.items) && order.items) ||
      (Array.isArray(order?.orderItems) && order.orderItems) ||
      (Array.isArray(order?.products) && order.products) ||
      [];

    if (sourceItems.length > 0) {
      return sourceItems.map((item) => ({
        id: item.id,
        orderItemUid: item.orderItemUid,
        name: item.name,
        image: item.image,
        status: item.currentStatus || item.status || '',
        isRateable: canReviewOrder(item.currentStatus || item.status),
        variant: item.variant || '',
        quantity: Number(item.quantity || 1),
      }));
    }

    return [];
  }, [order]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isHighRatingSubmitted, setIsHighRatingSubmitted] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState(0);
  const [deliveryImageFailed, setDeliveryImageFailed] = useState(false);
  const [previewModal, setPreviewModal] = useState({ open: false, file: null });
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: triggerRateOrder, isPending: isSubmitting } =
    useRateOrder();

  const firstProductImage = products?.[0]?.image || '';

  useEffect(() => {
    setDeliveryImageFailed(false);
  }, [firstProductImage, isOpen]);

  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      deliveryRating: 0,
      productRatings: {},
      productOptions: {},
      productComments: {},
      productImages: {},
      otherFeedback: '',
    },
  });

  const productRatings = watch('productRatings');
  const productOptions = watch('productOptions');
  const productComments = watch('productComments');
  const productImages = watch('productImages');

  const activeOrderKey = order?.id || order?.trxUid || '';
  const prevOrderKeyRef = useRef(activeOrderKey);
  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    const isOpening = !prevIsOpenRef.current && isOpen;
    const isDifferentOrder = prevOrderKeyRef.current !== activeOrderKey;
    prevIsOpenRef.current = isOpen;
    prevOrderKeyRef.current = activeOrderKey;

    if (isOpening || (isOpen && isDifferentOrder)) {
      cleanupAllUploads();
      resetForm();
    }
  }, [isOpen, activeOrderKey]);

  const rateableProductIds = useMemo(
    () =>
      products
        .filter((p) => p.isRateable)
        .map((p) => String(p.id))
        .sort()
        .join(','),
    [products]
  );

  useEffect(() => {
    if (!products.length) return;

    const rateableIds = new Set(
      products
        .filter((product) => product.isRateable)
        .map((product) => String(product.id))
    );

    const currentImages = watch('productImages') || {};
    let hasRemoved = false;
    Object.entries(currentImages).forEach(([productId, fileList]) => {
      if (!rateableIds.has(productId)) {
        hasRemoved = true;
        fileList?.forEach((img) => URL.revokeObjectURL(img.preview));
      }
    });

    if (hasRemoved) {
      setValue(
        'productImages',
        Object.fromEntries(
          Object.entries(currentImages).filter(([productId]) =>
            rateableIds.has(productId)
          )
        )
      );
    }
  }, [rateableProductIds]);

  const handleProductRatingChange = (productId, rating) => {
    const currentRatings = productRatings || {};
    setValue(
      'productRatings',
      {
        ...currentRatings,
        [productId]: rating,
      },
      { shouldValidate: true }
    );

    if (rating === 0) {
      const currentOptions = productOptions || {};
      const currentComments = productComments || {};
      const currentImages = productImages || {};
      const newOptions = { ...currentOptions };
      const newComments = { ...currentComments };
      const newImages = { ...currentImages };

      if (newImages[productId]) {
        newImages[productId].forEach(img => URL.revokeObjectURL(img.preview));
      }

      delete newOptions[productId];
      delete newComments[productId];
      delete newImages[productId];
      setValue('productOptions', newOptions);
      setValue('productComments', newComments);
      setValue('productImages', newImages);
    }
  };

  const handleOptionToggle = (productId, questionId, option) => {
    const currentOptions = productOptions || {};
    const productOpts = currentOptions[productId] || {};
    const questionOpts = productOpts[questionId] || [];

    const isSelected = questionOpts.includes(option);
    const newQuestionOpts = isSelected
      ? questionOpts.filter((o) => o !== option)
      : [...questionOpts, option];

    setValue(
      'productOptions',
      {
        ...currentOptions,
        [productId]: {
          ...productOpts,
          [questionId]: newQuestionOpts,
        },
      },
      { shouldValidate: true }
    );
  };

  const handleCommentChange = (productId, comment) => {
    const currentComments = productComments || {};
    setValue('productComments', {
      ...currentComments,
      [productId]: comment,
    });
  };

  const handleImagesChange = (productId, newImagesList) => {
    const currentImages = productImages || {};
    setValue('productImages', {
      ...currentImages,
      [productId]: newImagesList,
    });
  };

  const buildItemReviews = (data) => {
    return products
      .filter(
        (product) =>
          product.isRateable &&
          Number(data.productRatings?.[product.id] || 0) > 0
      )
      .map((product) => {
        const selectedQuestionAnswers = Object.entries(
          data.productOptions?.[product.id] || {}
        )
          .map(([questionId, answers]) => {
            const question = QUESTION_LABEL_BY_ID[questionId];

            if (!question || !Array.isArray(answers) || answers.length === 0) {
              return null;
            }

            return {
              question,
              answers,
            };
          })
          .filter(Boolean);

        const review = {
          orderItemUid: String(product.orderItemUid || '').trim(),
          rating: Number(data.productRatings?.[product.id] || 0),
          comment: data.productComments?.[product.id] || '',
        };

        if (selectedQuestionAnswers.length > 0) {
          review.answers = selectedQuestionAnswers;
        }

        const files = data.productImages?.[product.id] || [];
        if (files.length > 0) {
          review.files = files.map((img) => ({
            id: img.id,
            file: img.file,
            type: img.type,
            size: img.size,
            name: img.name,
          }));
        }

        return review;
      });
  };

  const validateBeforeSubmit = (data) => {
    const errors = [];
    const deliveryStars = Number(data.deliveryRating || 0);
    let hasLowRatingQuestionGap = false;

    if (deliveryStars < 1) {
      errors.push('Please rate your delivery experience.');
    }

    products
      .filter((product) => product.isRateable)
      .forEach((product) => {
        const rating = Number(data.productRatings?.[product.id] || 0);

        if (rating > 0) {
          const requiredQuestionIds = getFeedbackQuestionsByRating(rating).map(
            (question) => question.id
          );
          const selectedByQuestion = data.productOptions?.[product.id] || {};
          const hasMissingSelection = requiredQuestionIds.some((questionId) => {
            const answers = selectedByQuestion[questionId];
            return !Array.isArray(answers) || answers.length === 0;
          });

          if (hasMissingSelection) {
            if (rating <= 3) {
              hasLowRatingQuestionGap = true;
            }
          }
        }
      });

    if (hasLowRatingQuestionGap) {
      errors.push(LOW_RATING_FEEDBACK_ERROR);
    }

    return [...new Set(errors)];
  };

  const onFormSubmit = async (data) => {
    const validationErrors = validateBeforeSubmit(data);

    if (validationErrors.length > 0) {
      validationErrors.forEach((message) =>
        ToastNotification('error', message)
      );
      return;
    }

    setIsUploading(true);

    try {
      const itemReviews = buildItemReviews(data);

      for (const review of itemReviews) {
        if (review.files && review.files.length > 0) {
          const uploadedMedias = await Promise.all(
            review.files.map(async (fileData) => {
              const s3Key = await uploadFileToS3(fileData.file, 'reviews');
              return {
                type: fileData.type,
                key: s3Key,
              };
            })
          );
          review.medias = uploadedMedias;
        }
        delete review.files;
      }

      const payload = {
        deliveryRating: data.deliveryRating,
        overallFeedback: data.otherFeedback || '',
        itemReviews,
      };

      // console.log('Submitting review payload:', payload);
      // return;

      if (!order?.trxUid) {
        throw new Error('Transaction uid is required to rate order');
      }

      // Capture the API response here
      const res = await triggerRateOrder({
        trxUid: order.trxUid,
        payload,
      });
      // console.log("res order", res);

      // Extract coinsAwarded from your JSON structure (res.data.coinsAwarded)
      const awardedCoins = res?.data?.coinsAwarded || 0;
      setCoinsAwarded(awardedCoins);

      // if (onSubmit) {
      //   await onSubmit(payload);
      // }
      const highRating = res?.data?.review?.deliveryRating > 3;
      setIsHighRatingSubmitted(highRating);

      cleanupAllUploads();
      resetForm();
      onClose();
      setShowSuccessModal(true);
    } catch (error) {
      const backendMessage = formatBackendErrorMessage(error);

      if (backendMessage) {
        ToastNotification('error', backendMessage);
      } else {
        ToastNotification(
          'error',
          'Unable to submit review right now. Please try again.'
        );
      }

      console.error('Failed to submit review:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    // We do NOT reset isHighRatingSubmitted here because it's needed for the Confetti when the success modal is shown.
    reset({
      deliveryRating: 0,
      productRatings: {},
      productOptions: {},
      productComments: {},
      productImages: {},
      otherFeedback: '',
    });
  };

  const cleanupAllUploads = () => {
    if (productImages) {
      Object.values(productImages).forEach((imagesList) => {
        imagesList.forEach((img) => URL.revokeObjectURL(img.preview));
      });
    }
    setPreviewModal({ open: false, file: null });
  };

  const handleClose = () => {
    if (isSubmitting) return;
    cleanupAllUploads();
    resetForm();
    onClose();
  };

  return (
    <>
      {showSuccessModal && isHighRatingSubmitted && (
        <Confetti
          mode="fall"
          autoStart
          sound={false}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            pointerEvents: 'none',
          }}
          x={0.5}
          y={0}
          particleCount={150}
          deg={90}
          spreadDeg={45}
          launchSpeed={0.8}
          explosionSpeed={4}
          fallSpeed={1.8}
          effectCount={99999}
          effectInterval={800}
          shapeSize={8}
          opacity={1}
          tweenDuration={1000}
          colors={[
            '#ff1744',
            '#ff9100',
            '#ffd600',
            '#00e676',
            '#00b0ff',
            '#d500f9',
            '#fefefe',
          ]}
        />
      )}
      <SuccessModal
        modal={showSuccessModal}
        setModal={setShowSuccessModal}
        title="Thank You!"
        message={
          coinsAwarded > 0
            ? `We appreciate your feedback! You have successfully earned ${coinsAwarded} coins.`
            : 'We appreciate your feedback—it helps us improve.'
        }
      />

      <ResponsiveModal
        modal={isOpen}
        setModal={onClose}
        extraFunction={handleClose}
        showCloseButton={!isSubmitting}
        classes={{
          modalClass: 'theme-modal rate-order-modal modal-md',
          offcanvasClass: 'rate-order-offcanvas',
          modalHeaderClass: 'rate-order-header justify-content-between',
          modalBodyClass: 'rate-order-body',
          title: 'How was your order?',
        }}
      >
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="rate-order-content"
        >
          <DeliveryRatingCard
            firstProductImage={firstProductImage}
            deliveryImageFailed={deliveryImageFailed}
            setDeliveryImageFailed={setDeliveryImageFailed}
            control={control}
          />

          <div className="products-rating-section">
            <h6 className="section-title">Tell us more about the products</h6>
            <div className="products-list">
              {products.map((product) => (
                <ProductRatingItem
                  key={product.id}
                  product={product}
                  rating={productRatings?.[product.id] || 0}
                  isRateable={product.isRateable}
                  onRatingChange={(rating) =>
                    handleProductRatingChange(product.id, rating)
                  }
                  selectedOptions={productOptions?.[product.id] || {}}
                  onOptionToggle={(questionId, option) =>
                    handleOptionToggle(product.id, questionId, option)
                  }
                  comment={productComments?.[product.id] || ''}
                  onCommentChange={(comment) =>
                    handleCommentChange(product.id, comment)
                  }
                  images={productImages?.[product.id] || []}
                  onImagesChange={(newImages) =>
                    handleImagesChange(product.id, newImages)
                  }
                  onPreviewOpen={(file) =>
                    setPreviewModal({ open: true, file })
                  }
                  isSubmitting={isSubmitting || isUploading}
                />
              ))}
            </div>
          </div>

          <div className="other-feedback-section">
            <p className="feedback-label">Any other feedback?</p>
            <Controller
              name="otherFeedback"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  className="other-feedback-textarea input-common"
                  placeholder="Share any additional feedback about your order..."
                  rows={3}
                />
              )}
            />
          </div>

          <div className="submit-section">
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </ResponsiveModal>

      {/* --- File Preview Modal --- */}
      <ResponsiveModal
        modal={previewModal.open}
        setModal={() => setPreviewModal({ open: false, file: null })}
        closeButton={
          <button
            type="button"
            className="btn-close position-static"
            onClick={() => setPreviewModal({ open: false, file: null })}
            aria-label="Close preview"
          >
            <RiCloseLine />
          </button>
        }
        extraFunction={() => setPreviewModal({ open: false, file: null })}
        classes={{
          modalClass: 'theme-modal review-preview-modal',
          offcanvasClass: 'review-preview-offcanvas',
          modalHeaderClass: 'review-preview-header justify-content-between',
          modalBodyClass: 'review-preview-body',
          title: previewModal.file?.name || 'Preview',
        }}
      >
        {previewModal.file && (
          <>
            {previewModal.file.type === 'image' ? (
              <img
                src={previewModal.file.preview}
                alt={previewModal.file.name}
                draggable={false}
              />
            ) : (
              <video
                src={previewModal.file.preview}
                controls
                autoPlay
                playsInline
                style={{ width: '100%', maxHeight: '70vh' }}
              />
            )}
            <div className="review-preview-footer">
              <span className="preview-file-name">
                {previewModal.file.name}
              </span>
              <span className="preview-file-meta">
                <span className="preview-type-badge">
                  {previewModal.file.type === 'image' ? 'IMG' : 'VID'}
                </span>
                {(previewModal.file.size / 1024 / 1024).toFixed(2)}MB
              </span>
            </div>
          </>
        )}
      </ResponsiveModal>
    </>
  );
};

export default RateOrderModal;

{
  /* <Confetti
  key={confettiBurstKey}
  mode="boom"
  particleCount={100}
  x={confettiPlacement.originX}
  y={confettiPlacement.originY}
  spreadDeg={90}
  shapeSize={7}
  // effectCount={2}
  // effectInterval={3000}
  launchSpeed={0.5}
  opacityDeltaMultiplier={0.9}
  style={confettiPlacement.style}
  colors={['#0da487', '#6ed1bd', '#f3c95f', '#fefefe']}
/>; */
}
