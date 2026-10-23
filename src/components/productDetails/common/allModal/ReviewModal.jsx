import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import ResponsiveModal from '@/components/common/ResponsiveModal';
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
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from 'react-icons/ri';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productReviewSchema } from '@/utils/validation/ZodValidationSchema';
import { useSubmitReview } from '@/utils/hooks/useProduct';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import SuccessModal from '@/components/common/SuccessModal';
import Confetti from 'react-confetti-boom';
import './ReviewModal.scss';
import { uploadFileToS3 } from '@/utils/helpers';
import MediaPickerModal from '@/components/account/orders/components/MediaPickerModal';
import CameraModal from '@/components/auth/login/components/CameraModal';
import { useCameraCapture } from '@/components/auth/login/hooks/useCameraCapture';
import VideoRecorderModal from '@/components/account/orders/components/VideoRecorderModal';
import { useVideoCapture } from '@/components/account/orders/hooks/useVideoCapture';

// --- Feedback Constants ---
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

const getFeedbackQuestionsByRating = (rating) =>
  rating > 3 ? POSITIVE_FEEDBACK_QUESTIONS : NEGATIVE_FEEDBACK_QUESTIONS;

// --- Upload Constants ---
const MAX_REVIEW_FILES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/jpg',
];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/mov',
];
const ACCEPTED_FILE_TYPES = 'image/*,video/*';

const StarRating = ({ rating, onReview, size = 24 }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="star-btn"
          onClick={() => onReview(star)}
          aria-label={`Review ${star} stars`}
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

const ReviewModal = ({ modal, setModal, productState, refetch }) => {
  const defaultValues = {
    rating: productState?.product?.user_review?.rating || 0,
    description: productState?.product?.user_review?.description || '',
  };

  const productImageSrc = productState?.product?.coverImage || '';

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productReviewSchema),
    defaultValues,
  });

  const { mutateAsync: submitReviewApi } = useSubmitReview();
  const currentRating = watch('rating');

  const [selectedOptions, setSelectedOptions] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bonusCoins, setBonusCoins] = useState(0);
  const [recievedRating, setRecievedRating] = useState(0);

  // --- Upload State ---
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    file: null,
    index: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
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

  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const isExpanded = currentRating > 0;
  const feedbackQuestions = useMemo(
    () => getFeedbackQuestionsByRating(currentRating),
    [currentRating]
  );

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [
    isExpanded,
    selectedOptions,
    watch('description'),
    currentRating,
    errors,
    reviewImages,
    uploadError,
  ]);

  const prevModalRef = useRef(modal);
  const prevProductRef = useRef(productState?.product?.id);

  useEffect(() => {
    const isModalOpening = !prevModalRef.current && Boolean(modal);
    const isProductChanged =
      Boolean(productState?.product?.id) &&
      prevProductRef.current !== productState?.product?.id;

    prevModalRef.current = modal;
    prevProductRef.current = productState?.product?.id;

    if (isModalOpening || isProductChanged) {
      reset(defaultValues);
      setSelectedOptions({});
      clearErrors();
      // Cleanup uploaded files on modal/product change
      setReviewImages((prev) => {
        prev.forEach((img) => URL.revokeObjectURL(img.preview));
        return [];
      });
      setUploadError(null);
    }
  }, [modal, productState?.product?.id, reset]);

  const handleRatingChange = (value) => {
    const currentQuestions = getFeedbackQuestionsByRating(currentRating);
    const newQuestions = getFeedbackQuestionsByRating(value);

    if (currentQuestions !== newQuestions || value === 0) {
      setSelectedOptions({});
      currentQuestions.forEach((q) => clearErrors(`feedback_${q.id}`));
    }

    const newValue = value === currentRating ? 0 : value;
    setValue('rating', newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleOptionToggle = (questionId, option) => {
    const questionOpts = selectedOptions[questionId] || [];
    const isSelected = questionOpts.includes(option);

    const newQuestionOpts = isSelected
      ? questionOpts.filter((o) => o !== option)
      : [...questionOpts, option];

    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: newQuestionOpts,
    }));

    if (newQuestionOpts.length > 0) {
      clearErrors(`feedback_${questionId}`);
    }
  };

  // --- Upload Handlers ---
  const cleanupUploadState = useCallback(() => {
    setReviewImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
    setUploadError(null);
    setPreviewModal({ open: false, file: null, index: 0 });
  }, []);

  const handleReviewImageUpload = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      setUploadError(null);

      if (reviewImages.length + files.length > MAX_REVIEW_FILES) {
        setUploadError(
          `Maximum ${MAX_REVIEW_FILES} files allowed. You can upload ${MAX_REVIEW_FILES - reviewImages.length} more.`
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
        setReviewImages((prev) => [...prev, ...validatedFiles]);
      }

      if (e.target) e.target.value = '';
    },
    [reviewImages.length]
  );

  const handleRemoveReviewImage = useCallback((imageId) => {
    setReviewImages((prev) => {
      const img = prev.find((i) => i.id === imageId);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== imageId);
    });
    setUploadError(null);
  }, []);

  const handlePreviewOpen = useCallback((file, index) => {
    setPreviewModal({ open: true, file, index });
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewModal({ open: false, file: null, index: 0 });
  }, []);

  const handlePrevPreview = (e) => {
    e.stopPropagation();
    if (!reviewImages || reviewImages.length === 0) return;
    const newIndex = previewModal.index > 0 ? previewModal.index - 1 : reviewImages.length - 1;
    setPreviewModal({ ...previewModal, file: reviewImages[newIndex], index: newIndex });
  };

  const handleNextPreview = (e) => {
    e.stopPropagation();
    if (!reviewImages || reviewImages.length === 0) return;
    const newIndex = previewModal.index < reviewImages.length - 1 ? previewModal.index + 1 : 0;
    setPreviewModal({ ...previewModal, file: reviewImages[newIndex], index: newIndex });
  };

  const handleClose = () => {
    reset(defaultValues);
    setSelectedOptions({});
    clearErrors();
    cleanupUploadState();
    setModal('');
  };

  const onSubmit = async (values) => {
    const currentQuestions = getFeedbackQuestionsByRating(values.rating);

    if (values.rating > 0 && values.rating <= 3) {
      let hasUnanswered = false;
      let firstErrorId = null;

      currentQuestions.forEach((q) => {
        if (!selectedOptions[q.id] || selectedOptions[q.id].length === 0) {
          setError(`feedback_${q.id}`, {
            type: 'manual',
            message: 'Please select at least one option.',
          });
          hasUnanswered = true;
          if (!firstErrorId) firstErrorId = q.id;
        }
      });

      if (hasUnanswered) {
        const errorElement = document.getElementById(
          `question_${firstErrorId}`
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    const formattedAnswers = currentQuestions
      .map((q) => {
        const answers = selectedOptions[q.id];
        if (!answers || answers.length === 0) return null;
        return {
          question: q.question,
          answers: answers,
        };
      })
      .filter(Boolean);

    const payload = {
      orderItemUid: productState?.orderDetails?.orderItemUid || '',
      rating: values.rating,
      comment: values.description || '',
      answers: formattedAnswers,
    };

    setIsUploading(true);

    try {
      if (reviewImages.length > 0) {
        const uploadedMedias = await Promise.all(
          reviewImages.map(async (img) => {
            const s3Key = await uploadFileToS3(img.file, 'reviews');
            return {
              type: img.type,
              key: s3Key,
            };
          })
        );
        payload.medias = uploadedMedias;
      }

      const trxUid = productState?.orderDetails?.trxUid;

      // console.log("Submit review payload", payload)
      // console.log("Submit review trxUid", trxUid)

      // return;

      // 1. Capture the API response explicitly
      const response = await submitReviewApi({ payload, trxUid });

      // 2. Extract the coin count safely
      const earnedCoins = response?.REVIEW_BONUS_COINS || 0;
      const rating = response?.data?.rating || 0;
      setBonusCoins(earnedCoins);
      setRecievedRating(rating);

      reset(defaultValues);
      setSelectedOptions({});
      cleanupUploadState();
      setModal('');
      setShowSuccessModal(true);

      if (refetch) refetch();
    } catch (error) {
      console.error('Failed to submit review:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit review.';
      ToastNotification('error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper mapping to translate ratings to descriptive feedback texts
  const getRatingText = (rating) => {
    const textMap = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very good',
      5: 'Excellent',
    };
    return textMap[rating] || '';
  };

  return (
    <>
      {/*  bonusCoins > 0 && */}
      {showSuccessModal && recievedRating > 3 && (
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
          bonusCoins > 0
            ? `We appreciate your feedback—it helps us improve. You have earned ${bonusCoins} bonus coins!`
            : 'We appreciate your feedback—it helps us improve.'
        }
      />

      <ResponsiveModal
        modal={!!modal}
        setModal={setModal}
        closeButton={
          <button
            type="button"
            className="btn-close position-static"
            onClick={handleClose}
            aria-label="Close"
          >
            <RiCloseLine />
          </button>
        }
        extraFunction={handleClose}
        classes={{
          modalClass: 'theme-modal review-modal modal-md',
          offcanvasClass: 'review-offcanvas',
          modalHeaderClass: 'review-header justify-content-between',
          modalBodyClass: 'review-body',
          title: 'Write a Review',
        }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="review-content product-rating-item"
        >
          <div className="review-product-card">
            <div className="review-product-image">
              {productImageSrc && (
                <Image
                  src={productImageSrc}
                  alt={productState?.product?.name || 'Product'}
                  width={60}
                  height={60}
                  unoptimized
                />
              )}
            </div>
            <div className="review-product-info">
              <h6 className="product-name">{productState?.product?.name}</h6>
            </div>
          </div>

          <div
            className={`review-rating-section ${errors.rating ? 'has-error' : ''}`}
          >
            <label className="rating-label">
              Rating{' '}
              <span className="required" style={{ color: 'red' }}>
                *
              </span>
            </label>
            <div className="rating-row">
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <StarRating
                    rating={field.value}
                    onReview={handleRatingChange}
                    size={28}
                  />
                )}
              />
              {/* =
              {currentRating > 0 && (
                <span
                  className="rating-text"
                  style={{
                    marginLeft: '12px',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  {getRatingText(currentRating)}
                </span>
              )} */}
            </div>
            {errors.rating && (
              <p
                className="field-error"
                style={{ color: 'red', marginTop: '4px' }}
              >
                {errors.rating.message}
              </p>
            )}
          </div>

          <div
            className="feedback-section"
            style={{
              height: contentHeight,
              overflow: 'hidden',
              transition: 'height 0.3s ease-in-out',
              marginTop: isExpanded ? '16px' : '0',
            }}
          >
            <div ref={contentRef} className="feedback-content">
              {feedbackQuestions.map((q) => {
                const isRequired = currentRating > 0 && currentRating <= 3;
                const fieldError = errors[`feedback_${q.id}`];

                return (
                  <div
                    key={q.id}
                    id={`question_${q.id}`}
                    className="feedback-question"
                    style={{ marginBottom: '16px' }}
                  >
                    <p
                      className="question-text"
                      style={{ marginBottom: '8px', fontWeight: '500' }}
                    >
                      {q.question}
                      {isRequired && (
                        <span style={{ color: 'red', marginLeft: '4px' }}>
                          *
                        </span>
                      )}
                    </p>
                    <div
                      className="options-list"
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                    >
                      {q.options.map((option) => {
                        const isSelected =
                          selectedOptions[q.id]?.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            className={`option-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleOptionToggle(q.id, option)}
                            style={{
                              borderColor:
                                fieldError && !isSelected ? 'red' : '',
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {fieldError && (
                      <p
                        className="field-error"
                        style={{
                          color: 'red',
                          fontSize: '12px',
                          marginTop: '6px',
                        }}
                      >
                        {fieldError.message}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* --- Upload Section --- */}
              <div className="review-upload-section">
                <label className="upload-label">
                  Add Photos / Videos
                  <span className="optional-tag">(Optional)</span>
                </label>
                <p className="upload-helper-text">
                  Max {MAX_REVIEW_FILES} files • Images: max 5MB • Videos: max
                  20MB • {reviewImages.length}/{MAX_REVIEW_FILES} uploaded
                </p>

                {uploadError && (
                  <div className="review-upload-error">
                    <RiErrorWarningLine size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="review-upload-area">
                  {reviewImages.length < MAX_REVIEW_FILES && (
                    <button
                      type="button"
                      className="review-add-btn"
                      disabled={isSubmitting || isUploading}
                      onClick={() => setIsMediaPickerOpen(true)}
                    >
                      <RiImageAddLine size={20} />
                      <span>Add Files</span>
                      <span className="review-btn-helper">Images/Videos</span>
                    </button>
                  )}

                  {reviewImages.map((file, index) => (
                    <div
                      key={file.id}
                      className={`review-upload-thumb ${file.type}`}
                      onClick={() => handlePreviewOpen(file, index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handlePreviewOpen(file, index)
                      }
                    >
                      {file.type === 'image' ? (
                        <img
                          src={file.preview}
                          alt="Review"
                          draggable={false}
                        />
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
                        disabled={isSubmitting || isUploading}
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

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  multiple
                  hidden
                  disabled={isSubmitting || isUploading}
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


              <div
                className="review-feedback-section"
                style={{ marginTop: '20px' }}
              >
                <label
                  className="feedback-label"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                  }}
                >
                  Your review
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className="review-feedback-textarea w-100"
                      placeholder="Enter your review..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        resize: 'vertical',
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="submit-section" style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn-submit btn-primary w-100"
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
        setModal={() => handlePreviewClose()}
        closeButton={
          <button
            type="button"
            className="btn-close position-static"
            onClick={handlePreviewClose}
            aria-label="Close preview"
          >
            <RiCloseLine />
          </button>
        }
        extraFunction={handlePreviewClose}
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
            <div className="review-preview-media-container">
              {reviewImages?.length > 1 && (
                <button type="button" className="preview-nav-btn prev" onClick={handlePrevPreview} aria-label="Previous">
                  <RiArrowLeftSLine />
                </button>
              )}
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
              {reviewImages?.length > 1 && (
                <button type="button" className="preview-nav-btn next" onClick={handleNextPreview} aria-label="Next">
                  <RiArrowRightSLine />
                </button>
              )}
            </div>
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

export default ReviewModal;
