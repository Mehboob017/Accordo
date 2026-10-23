import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB limit

const getSupportedMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidateTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
  ];
  return candidateTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';
};

export const useVideoCapture = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [recordedSize, setRecordedSize] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const totalRecordedBytesRef = useRef(0);
  const activeMimeTypeRef = useRef('');

  const stopCameraStream = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current && !recordedUrl) {
      videoRef.current.srcObject = null;
    }
  }, [recordedUrl]);

  const bindStreamToVideo = async (stream) => {
    if (!videoRef.current) return false;
    const videoEl = videoRef.current;
    videoEl.src = '';
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.playsInline = true;

    try {
      await videoEl.play();
      return true;
    } catch {
      return false;
    }
  };

  const startCamera = useCallback(async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setVideoError('Video recording is not supported on this device or browser.');
      return;
    }

    try {
      setVideoError('');
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      } catch (audioErr) {
        // Fallback to video only if audio is unavailable or denied
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      }

      cameraStreamRef.current = stream;

      let isBound = await bindStreamToVideo(stream);
      if (!isBound) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        isBound = await bindStreamToVideo(stream);
      }

      if (!isBound) {
        setVideoError('Unable to start video preview. Please try again.');
        stopCameraStream();
      }
    } catch (err) {
      setVideoError('Camera/Microphone access denied or unavailable. Please check permissions.');
    }
  }, [stopCameraStream]);

  // Modal lifecycle
  useEffect(() => {
    if (showVideoModal) {
      setRecordedBlob(null);
      setRecordedUrl(null);
      setRecordedSize(0);
      setIsRecording(false);
      setRecordingDuration(0);
      setIsLimitReached(false);
      startCamera();
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      stopCameraStream();
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
      setRecordedBlob(null);
      setRecordedUrl(null);
      setRecordedSize(0);
      setIsRecording(false);
      setRecordingDuration(0);
      setVideoError('');
      setIsLimitReached(false);
    }
    return () => {
      stopCameraStream();
    };
  }, [showVideoModal, startCamera, stopCameraStream]);

  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (!cameraStreamRef.current) {
      setVideoError('Camera stream is not ready.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setVideoError('MediaRecorder is not supported by your browser.');
      return;
    }

    const mimeType = getSupportedMimeType();
    activeMimeTypeRef.current = mimeType;
    recordedChunksRef.current = [];
    totalRecordedBytesRef.current = 0;
    setRecordedSize(0);
    setRecordingDuration(0);
    setIsLimitReached(false);
    setVideoError('');

    try {
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(cameraStreamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          totalRecordedBytesRef.current += event.data.size;
          setRecordedSize(totalRecordedBytesRef.current);

          if (totalRecordedBytesRef.current >= MAX_VIDEO_SIZE) {
            setIsLimitReached(true);
            stopRecording();
          }
        }
      };

      mediaRecorder.onstop = () => {
        const mime = activeMimeTypeRef.current || 'video/webm';
        const finalBlob = new Blob(recordedChunksRef.current, { type: mime });
        setRecordedBlob(finalBlob);
        setRecordedSize(finalBlob.size);

        const url = URL.createObjectURL(finalBlob);
        setRecordedUrl(url);

        stopCameraStream();

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.muted = false;
          videoRef.current.controls = true;
          videoRef.current.load();
        }
      };

      // Request data every 500ms to monitor size
      mediaRecorder.start(500);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setVideoError('Failed to start recording: ' + (err.message || 'Unknown error'));
    }
  }, [stopCameraStream, stopRecording]);

  const retakeVideo = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordedSize(0);
    setRecordingDuration(0);
    setIsLimitReached(false);
    setVideoError('');

    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.controls = false;
    }

    startCamera();
  }, [recordedUrl, startCamera]);

  const saveVideo = useCallback(
    (callback) => {
      if (!recordedBlob) {
        setVideoError('No video recorded.');
        return;
      }

      if (recordedBlob.size > MAX_VIDEO_SIZE) {
        setVideoError('Recorded video exceeds the 20MB limit. Please record a shorter video.');
        return;
      }

      const mime = recordedBlob.type || 'video/webm';
      let ext = 'webm';
      if (mime.includes('mp4')) ext = 'mp4';
      else if (mime.includes('quicktime')) ext = 'mov';

      const file = new File([recordedBlob], `recorded-video-${Date.now()}.${ext}`, {
        type: mime,
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const fileList = dataTransfer.files;

      callback(fileList);
      setShowVideoModal(false);
    },
    [recordedBlob]
  );

  return {
    showVideoModal,
    setShowVideoModal,
    videoError,
    videoRef,
    isRecording,
    recordingDuration,
    recordedBlob,
    recordedUrl,
    recordedSize,
    isLimitReached,
    maxVideoSize: MAX_VIDEO_SIZE,
    startRecording,
    stopRecording,
    retakeVideo,
    saveVideo,
  };
};
