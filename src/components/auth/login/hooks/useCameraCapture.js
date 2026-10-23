import { useState, useRef, useEffect } from 'react';

export const useCameraCapture = () => {
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const bindStreamToVideo = async (stream) => {
    if (!videoRef.current) return false;

    const videoEl = videoRef.current;
    videoEl.srcObject = stream;

    try {
      await videoEl.play();
      return true;
    } catch (error) {
      return false;
    }
  };

  const stopCameraStream = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      if (!showCameraModal) {
        stopCameraStream();
        setCameraError('');
        return;
      }

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setCameraError('Camera not supported on this device');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        cameraStreamRef.current = stream;

        let isBound = await bindStreamToVideo(stream);
        if (!isBound) {
          // Modal mount timing can delay video ref creation; retry once next frame.
          await new Promise((resolve) => requestAnimationFrame(resolve));
          isBound = await bindStreamToVideo(stream);
        }

        if (!isBound) {
          setCameraError('Unable to start camera preview. Please try again.');
          stopCameraStream();
          return;
        }

        setCameraError('');
      } catch (err) {
        setCameraError('Unable to access camera. Please check permissions.');
      }
    };

    startCamera();
    return () => {
      stopCameraStream();
    };
  }, [showCameraModal]);

  const capturePhoto = (callback) => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setCameraError('Camera is not ready yet. Please try again.');
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      setCameraError('Camera preview not ready. Please wait a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Failed to capture photo');
          return;
        }

        const file = new File([blob], 'profile-photo.jpg', {
          type: 'image/jpeg',
        });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileList = dataTransfer.files;

        callback(fileList);
        setShowCameraModal(false);
      },
      'image/jpeg',
      0.9
    );
  };

  return {
    showCameraModal,
    setShowCameraModal,
    cameraError,
    videoRef,
    capturePhoto,
    stopCameraStream,
  };
};
