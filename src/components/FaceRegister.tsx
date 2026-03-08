import { saveFaceDescriptor } from '@/api/auth';
import { Button, Spin } from 'antd';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface FaceRegisterProps {
  onSuccess: () => void;
  onSkip: () => void;
}

type Status = 'loading-models' | 'models-ready' | 'starting-camera' | 'camera-ready' | 'detecting' | 'captured' | 'saving' | 'done' | 'error';

const FaceRegister = ({ onSuccess, onSkip }: FaceRegisterProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>('loading-models');
  const [statusMsg, setStatusMsg] = useState('Loading face recognition models…');
  const [capturing, setCapturing] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('loading-models');
        setStatusMsg('Loading face recognition models…');
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setStatus('models-ready');
        setStatusMsg('Models loaded. Starting webcam…');
        startCamera();
      } catch {
        setStatus('error');
        setStatusMsg('Failed to load face recognition models.');
      }
    };
    loadModels();

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      setStatus('starting-camera');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('camera-ready');
      setStatusMsg('Webcam ready. Click "Capture Face" to register your face.');
    } catch {
      setStatus('error');
      setStatusMsg('Could not access webcam. Please allow camera permission and try again.');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const captureFace = async () => {
    if (!videoRef.current || status !== 'camera-ready') return;
    setCapturing(true);
    setStatus('detecting');
    setStatusMsg('Detecting face…');

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        setStatus('camera-ready');
        setStatusMsg('No face detected. Please ensure your face is visible and well-lit.');
        toast.error('No face detected. Please try again.');
        setCapturing(false);
        return;
      }

      if (detections.length > 1) {
        setStatus('camera-ready');
        setStatusMsg('Multiple faces detected. Please ensure only your face is visible.');
        toast.error('Multiple faces detected. Please have only your face in frame.');
        setCapturing(false);
        return;
      }

      const descriptor = Array.from(detections[0].descriptor);

      // Draw detection on canvas
      if (canvasRef.current && videoRef.current) {
        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        const resized = faceapi.resizeResults(detections, dims);
        faceapi.draw.drawDetections(canvasRef.current, resized);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      }

      setStatus('saving');
      setStatusMsg('Saving face data…');

      await saveFaceDescriptor(descriptor);

      setStatus('done');
      setStatusMsg('Face registered successfully!');
      toast.success('Face registered! You can now use Face Login.');
      stopCamera();
      setTimeout(() => onSuccess(), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to register face.';
      setStatus('camera-ready');
      setStatusMsg(msg);
      toast.error(msg);
      setCapturing(false);
    }
  };

  const isReady = status === 'camera-ready';
  const isLoading = ['loading-models', 'starting-camera', 'detecting', 'saving'].includes(status);
  const isDone = status === 'done';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="text-center mb-2">
        <div className="text-3xl mb-1">📷</div>
        <h2 className="text-xl font-bold text-foreground">Register Your Face</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This allows you to log in with just your face in the future.
        </p>
      </div>

      {/* Webcam + canvas overlay */}
      <div className="relative rounded-xl overflow-hidden border border-border shadow" style={{ width: 320, height: 240 }}>
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ display: isLoading && status === 'loading-models' ? 'none' : 'block' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        />
        {(isLoading || isDone) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white gap-2 px-4 text-center">
            {!isDone && <Spin size="large" />}
            {isDone && <span className="text-3xl">✅</span>}
            <span className="text-sm mt-2">{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Status message when camera is ready */}
      {isReady && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">{statusMsg}</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-500 text-center max-w-xs">{statusMsg}</p>
      )}

      <div className="flex gap-3 w-full max-w-xs">
        <Button
          type="primary"
          block
          size="large"
          disabled={!isReady || capturing}
          loading={capturing}
          onClick={captureFace}
          className="rounded-xl h-11 font-semibold"
        >
          Capture Face
        </Button>
        <Button
          block
          size="large"
          onClick={() => { stopCamera(); onSkip(); }}
          className="rounded-xl h-11"
          disabled={isDone}
        >
          Skip
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        You can also register your face later from your profile settings.
      </p>
    </motion.div>
  );
};

export default FaceRegister;
