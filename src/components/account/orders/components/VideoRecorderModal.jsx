import React from 'react';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import Btn from '@/elements/buttons/Btn';
import {
  RiRecordCircleLine,
  RiStopCircleLine,
  RiRestartLine,
  RiCheckLine,
  RiVideoLine,
  RiAlertLine,
} from 'react-icons/ri';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const VideoRecorderModal = ({
  isOpen,
  onClose,
  videoError,
  videoRef,
  isRecording,
  recordingDuration,
  recordedBlob,
  recordedSize,
  isLimitReached,
  maxVideoSize = 20 * 1024 * 1024,
  onStartRecording,
  onStopRecording,
  onRetake,
  onSave,
}) => {
  const currentSizeMB = (recordedSize / (1024 * 1024)).toFixed(2);
  const maxSizeMB = (maxVideoSize / (1024 * 1024)).toFixed(0);
  const sizePercentage = Math.min(100, (recordedSize / maxVideoSize) * 100);

  let progressBarColor = '#0da487';
  if (sizePercentage > 85) progressBarColor = '#dc3545';
  else if (sizePercentage > 65) progressBarColor = '#ffc107';

  return (
    <ResponsiveModal
      modal={isOpen}
      setModal={onClose}
      extraFunction={onClose}
      classes={{
        modalClass:
          'theme-modal view-modal address-modal modal-md otp-login-modal profile-picker-modal video-recorder-modal',
        offcanvasClass: 'address-modal otp-login-offcanvas',
        modalHeaderClass: 'justify-content-between',
        title: 'Record Video (Max 20MB)',
      }}
    >
      <div className="profile-picker-wrapper video-recorder-wrapper">
        <div
          className="video-recorder-preview-container"
          style={{
            position: 'relative',
            backgroundColor: '#111',
            borderRadius: 8,
            overflow: 'hidden',
            minHeight: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            className="w-100 h-100"
            autoPlay
            playsInline
            muted={!recordedBlob}
            style={{
              maxHeight: 340,
              objectFit: 'cover',
              backgroundColor: '#111',
            }}
          />

          {/* Recording Status Overlay */}
          {isRecording && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#e54d42',
                    display: 'inline-block',
                    animation: 'pulse 1s infinite alternate',
                  }}
                />
                <span>REC {formatTime(recordingDuration)}</span>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  color: sizePercentage > 85 ? '#ff7875' : '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {currentSizeMB} MB / {maxSizeMB} MB
              </div>
            </div>
          )}

          {/* Size Limit Progress Bar when recording */}
          {isRecording && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: 'rgba(255,255,255,0.2)',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${sizePercentage}%`,
                  backgroundColor: progressBarColor,
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                }}
              />
            </div>
          )}

          {/* Limit Reached Warning Overlay */}
          {isLimitReached && (
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                backgroundColor: 'rgba(220, 53, 69, 0.9)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                zIndex: 10,
              }}
            >
              <RiAlertLine size={16} />
              <span>20MB limit reached. Recording automatically stopped.</span>
            </div>
          )}
        </div>

        {videoError && (
          <div className="text-danger small mt-2 d-flex align-items-center gap-1">
            <RiAlertLine size={16} />
            <span>{videoError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="d-flex gap-2 mt-3">
          {!recordedBlob && !isRecording && (
            <>
              <Btn
                type="button"
                size="md"
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: '#e54d42',
                  borderColor: '#e54d42',
                  color: '#fff',
                  fontWeight: 600,
                }}
                onClick={onStartRecording}
                disabled={!!videoError}
              >
                <RiRecordCircleLine size={18} />
                Start Recording
              </Btn>
              <Btn
                type="button"
                size="md"
                className="w-100 profile-picker-secondary-btn"
                style={{
                  backgroundColor: 'transparent',
                  color: '#0da487',
                  border: '1px solid #0da487',
                }}
                onClick={onClose}
              >
                Cancel
              </Btn>
            </>
          )}

          {isRecording && (
            <Btn
              type="button"
              size="md"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: '#e54d42',
                borderColor: '#e54d42',
                color: '#fff',
                fontWeight: 600,
              }}
              onClick={onStopRecording}
            >
              <RiStopCircleLine size={18} />
              Stop Recording
            </Btn>
          )}

          {recordedBlob && (
            <>
              <Btn
                type="button"
                size="md"
                color="primary"
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={onSave}
                disabled={recordedSize > maxVideoSize}
              >
                <RiCheckLine size={18} />
                Use Video ({currentSizeMB}MB)
              </Btn>
              <Btn
                type="button"
                size="md"
                className="w-100 profile-picker-secondary-btn d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: 'transparent',
                  color: '#0da487',
                  border: '1px solid #0da487',
                }}
                onClick={onRetake}
              >
                <RiRestartLine size={18} />
                Record Again
              </Btn>
            </>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default VideoRecorderModal;
