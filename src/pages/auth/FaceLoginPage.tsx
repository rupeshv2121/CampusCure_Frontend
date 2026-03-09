import { faceLogin } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { Button, Card, Spin } from 'antd';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Status =
  | 'loading-models'
  | 'starting-camera'
  | 'camera-ready'
  | 'scanning'
  | 'success'
  | 'error';

const SCAN_TIMEOUT_MS = 30_000; // stop scanning after 30 seconds

const FaceLoginPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const [status, setStatus] = useState<Status>('loading-models');
  const [statusMsg, setStatusMsg] = useState('Loading face recognition models…');
  const [faceWarning, setFaceWarning] = useState<string | null>(null);
  const scanStartRef = useRef<number>(0);

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirect(user.role, user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Load models then start camera
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setStatus('loading-models');
        setStatusMsg('Loading face recognition models…');
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        if (cancelled) return;

        setStatus('starting-camera');
        setStatusMsg('Starting webcam…');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('camera-ready');
        setStatusMsg('Hold your face steady — scanning…');
        scanStartRef.current = Date.now();
        startAutoScan();
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Initialization failed.';
        setStatus('error');
        setStatusMsg(msg.includes('camera') || msg.includes('Permission')
          ? 'Camera access denied. Please allow camera permission and reload.'
          : 'Failed to load face recognition models. Please reload the page.'
        );
      }
    };

    init();
    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAutoScan = useCallback(() => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    const scan = async () => {
      if (!scanningRef.current || !videoRef.current) return;

      // ── Timeout check ──────────────────────────────────────────────
      const elapsed = Date.now() - scanStartRef.current;
      if (elapsed >= SCAN_TIMEOUT_MS) {
        scanningRef.current = false;
        setFaceWarning(null);
        setStatus('error');
        setStatusMsg('No face detected within 30 seconds. Please try again.');
        toast.error('Scanning timed out — no face detected.');
        stopCamera();
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (!scanningRef.current) return;

        // Draw overlays on canvas
        if (canvasRef.current && videoRef.current) {
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resized = faceapi.resizeResults(detections, dims);
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resized);
        }

        if (detections.length === 0) {
          setFaceWarning('No face detected — please look directly at the camera.');
        } else if (detections.length > 1) {
          setFaceWarning('Multiple faces detected — only one face should be visible.');
        } else {
          // Exactly one face — attempt login
          setFaceWarning(null);
          scanningRef.current = false;
          setStatus('scanning');
          setStatusMsg('Face detected! Authenticating…');

          const descriptor = Array.from(detections[0].descriptor);
          const response = await faceLogin(descriptor);

          setStatus('success');
          setStatusMsg(`Welcome, ${response.user.name}!`);
          toast.success(`Welcome back, ${response.user.name}!`);
          stopCamera();
          login(response.token, response.user);
          navigate(getRoleRedirect(response.user.role, response.user));
          return;
        }
      } catch (err) {
        if (!scanningRef.current) return;
        const msg = err instanceof Error ? err.message : 'Authentication failed.';
        if (msg.includes('not recognized') || msg.includes('pending approval')) {
          scanningRef.current = false;
          setFaceWarning(null);
          setStatus('error');
          setStatusMsg(msg);
          toast.error(msg);
          stopCamera();
          return;
        }
        // Transient error — keep scanning
      }

      // Schedule next scan frame
      if (scanningRef.current) {
        setTimeout(scan, 600);
      }
    };

    setTimeout(scan, 800);
  }, [login, navigate, stopCamera]);

  const handleRetry = () => {
    setStatus('loading-models');
    setStatusMsg('Reloading…');
    window.location.reload();
  };

  const isLoading = ['loading-models', 'starting-camera', 'scanning'].includes(status);
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, hsl(214 100% 97%), hsl(214 60% 92%))' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg" styles={{ body: { padding: 32 } }}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎓</div>
            <h1 className="text-2xl font-bold text-foreground">Face Login</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Look at the camera to authenticate
            </p>
          </div>

          {/* Camera view */}
          <div className="flex justify-center mb-4">
            <div
              className="relative rounded-xl overflow-hidden border-2 shadow-md"
              style={{
                width: 320,
                height: 240,
                borderColor: isSuccess ? '#22c55e' : isError ? '#ef4444' : 'hsl(214 60% 80%)',
              }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              />
              {(isLoading || isSuccess) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white gap-3 px-4 text-center">
                  {isSuccess ? <span className="text-4xl">✅</span> : <Spin size="large" />}
                  <span className="text-sm">{statusMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status messages */}
          {status === 'camera-ready' && !faceWarning && (
            <p className="text-center text-sm text-muted-foreground mb-2">{statusMsg}</p>
          )}

          {/* Real-time face warning */}
          {status === 'camera-ready' && faceWarning && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
              <span>⚠️</span>
              <span>{faceWarning}</span>
            </div>
          )}

          {isError && (
            <div className="text-center mb-4">
              <p className="text-sm text-red-500 mb-3">{statusMsg}</p>
              <Button onClick={handleRetry} className="rounded-xl">
                Try Again
              </Button>
            </div>
          )}

          {/* Scanning indicator + countdown */}
          {status === 'camera-ready' && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Scanning for your face… (times out after 30s)
            </div>
          )}

          <div className="text-center mt-4 space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Use password instead? </span>
              <Link
                to="/login"
                className="text-sm font-medium"
                style={{ color: 'hsl(214 100% 50%)' }}
              >
                Password Login
              </Link>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">No account? </span>
              <Link
                to="/register"
                className="text-sm font-medium"
                style={{ color: 'hsl(214 100% 50%)' }}
              >
                Register
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default FaceLoginPage;
