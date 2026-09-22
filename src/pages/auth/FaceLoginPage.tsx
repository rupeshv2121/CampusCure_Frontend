import { verifyFace, type FaceChallenge } from '@/api/auth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { Spin } from 'antd';
import * as faceapi from 'face-api.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Status =
  | 'loading-models'
  | 'starting-camera'
  | 'camera-ready'
  | 'scanning'
  | 'success'
  | 'error';

const SCAN_TIMEOUT_MS = 30_000; // stop scanning after 30 seconds

/**
 * CC-60: samples taken from separate moments, not one frame.
 *
 * A photograph held to the camera produces near-identical descriptors every
 * frame; a live face does not sit that still. The server rejects a set whose
 * members are too alike. Must match FACE_REQUIRED_SAMPLES on the backend.
 */
const REQUIRED_SAMPLES = 3;
const SAMPLE_GAP_MS = 450;

const features = [
  {
    title: 'A second step, not a shortcut',
    description:
      'Your password has already been checked. This confirms it is you.',
  },
  {
    title: 'Matched against your account only',
    description:
      'Compared with your own enrolled face, never searched across users.',
  },
  {
    title: 'Designed for campus use',
    description: 'Authentication flow for students, faculty, and admins.',
  },
];

const FaceLoginPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const [status, setStatus] = useState<Status>('loading-models');
  const [statusMsg, setStatusMsg] = useState('Loading face recognition models…');
  const [faceWarning, setFaceWarning] = useState<string | null>(null);
  const scanStartRef = useRef<number>(0);
  const samplesRef = useRef<number[][]>([]);
  const [collected, setCollected] = useState(0);

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * CC-60: this page is no longer reachable on its own.
   *
   * The challenge is handed over by the password step. Without one there is
   * nothing to verify against, so there is nowhere to go but back to login -
   * which is the point: a face alone is not a way in.
   */
  const challenge = (location.state as { challenge?: FaceChallenge } | null)
    ?.challenge;

  useEffect(() => {
    if (!challenge && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [challenge, isAuthenticated, navigate]);

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
          // Exactly one face. CC-60: collect several samples spaced apart
          // rather than authenticating on the first frame - a still photo
          // yields near-identical descriptors and the server rejects that.
          setFaceWarning(null);
          setStatus('scanning');

          samplesRef.current.push(Array.from(detections[0].descriptor));
          setCollected(samplesRef.current.length);

          if (samplesRef.current.length < REQUIRED_SAMPLES) {
            setStatusMsg(
              `Hold still — ${samplesRef.current.length} of ${REQUIRED_SAMPLES} captured`,
            );
            setTimeout(scan, SAMPLE_GAP_MS);
            return;
          }

          scanningRef.current = false;
          setStatusMsg('Verifying…');

          if (!challenge) {
            navigate('/login', { replace: true });
            return;
          }

          const response = await verifyFace(challenge, samplesRef.current);

          setStatus('success');
          setStatusMsg(`Welcome, ${response.user.name}!`);
          toast.success(`Welcome back, ${response.user.name}!`);
          stopCamera();
          login(response.token, response.user, response.refreshToken);
          navigate(getRoleRedirect(response.user.role, response.user));
          return;
        }
      } catch (err) {
        if (!scanningRef.current) return;
        const msg = err instanceof Error ? err.message : 'Verification failed.';

        // A rejected verification is terminal for this challenge - it is
        // attempt-capped server-side, so silently rescanning would burn the
        // remaining tries without telling anyone.
        if (msg.toLowerCase().includes('verification failed')) {
          scanningRef.current = false;
          setFaceWarning(null);
          setStatus('error');
          setStatusMsg(
            'We could not verify your face. Sign in again to retry.',
          );
          toast.error(msg);
          stopCamera();
          return;
        }
        // Transient detection error — drop the partial set and keep scanning.
        samplesRef.current = [];
        setCollected(0);
      }

      // Schedule next scan frame
      if (scanningRef.current) {
        setTimeout(scan, 600);
      }
    };

    setTimeout(scan, 800);
  }, [challenge, login, navigate, stopCamera]);

  const handleRetry = () => {
    // Reloading would land here with no challenge in history state, and the
    // challenge is attempt-capped anyway - the password step is the way back.
    navigate('/login', { replace: true });
  };

  const isLoading = ['loading-models', 'starting-camera', 'scanning'].includes(status);
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const ringColor = isSuccess
    ? 'ring-green-500'
    : isError
    ? 'ring-red-500'
    : status === 'camera-ready'
    ? 'ring-brand-500'
    : 'ring-border';

  return (
    <AuthSplitLayout
      showcaseTitle={
        <>
          <span className="cc-gradient-text--onDark">Face ID</span>
        </>
      }
      showcaseDescription="Look at your camera and sign in instantly with a biometric flow built for campus operations."
      highlights={features}
      formEyebrow="Face Login"
      formTitle="Authenticate with your face"
      formDescription="Center your face in the frame and hold steady while we verify your identity."
      footer={
        <div className="flex flex-col items-center gap-1 text-sm">
          <span className="text-muted-foreground">
            Use password instead?{' '}
            <Link to="/login" className="font-semibold text-brand-700 transition-colors hover:text-brand-800">
              Password Login
            </Link>
          </span>
          <span className="text-muted-foreground">
            No account?{' '}
            <Link to="/register" className="font-semibold text-brand-700 transition-colors hover:text-brand-800">
              Register
            </Link>
          </span>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className={`relative overflow-hidden rounded-3xl ring-2 ${ringColor} shadow-[0_16px_42px_rgba(15,23,42,0.20)] transition-all duration-300`}
          style={{ width: 320, height: 240 }}
        >
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ pointerEvents: 'none' }}
          />

          {(isLoading || isSuccess) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-950/70 px-4 text-center text-white backdrop-blur-sm">
              {isSuccess ? <span className="text-5xl">✅</span> : <Spin size="large" />}
              <span className="text-sm font-medium">{statusMsg}</span>
            </div>
          )}

          {status === 'camera-ready' && !isError && (
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-brand-300/50 animate-pulse" />
          )}
        </div>

        {status === 'camera-ready' && !faceWarning && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {statusMsg}
          </div>
        )}

        {/* CC-60: the capture is several samples, so it needs to look like
            several samples - otherwise a user moves away after the first. */}
        {(status === 'scanning' || collected > 0) && status !== 'success' && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {Array.from({ length: REQUIRED_SAMPLES }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    i < collected ? 'bg-emerald-500' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{statusMsg}</span>
          </div>
        )}

        {status === 'camera-ready' && faceWarning && (
          <div className="flex w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
            <span>⚠️</span>
            <span>{faceWarning}</span>
          </div>
        )}

        {isError && (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex w-full items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span className="shrink-0">✗</span>
              <span>{statusMsg}</span>
            </div>
            <button
              onClick={handleRetry}
              className="cc-btn cc-btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
};

export default FaceLoginPage;
