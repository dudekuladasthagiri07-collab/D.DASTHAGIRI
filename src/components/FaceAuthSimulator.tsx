import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export const FaceAuthSimulator: React.FC<Props> = ({
  onSuccess,
  title = 'Facial Biometric Verification',
  subtitle = 'Position your face inside the frame and blink when requested',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusText, setStatusText] = useState('Camera initialization...');
  const [isComplete, setIsComplete] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStatusText('Align face in center frame');
      } catch (err) {
        console.warn('Camera access prevented or unavailable, falling back to simulated feed:', err);
        setCameraError(true);
        setStatusText('Simulated Face Sensor Ready');
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startScanProcess = () => {
    setIsScanning(true);
    setScanProgress(0);
    setStatusText('Detecting facial landmarks...');

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setScanProgress(current);

      if (current === 30) setStatusText('Matching iris & nodal points...');
      if (current === 60) setStatusText('Verifying liveness (blink detected)...');
      if (current === 90) setStatusText('Validating against Govt Aadhaar Vault...');

      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setIsComplete(true);
        setStatusText('Facial Biometric Authenticated!');
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    }, 250);
  };

  return (
    <div id="face-auth-container" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl text-slate-800 max-w-md mx-auto border border-slate-200 shadow-sm">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Biometric AI Scanner
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Video / Scanning Viewport */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-200 bg-slate-50 flex items-center justify-center shadow-inner">
        {!cameraError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-100">
              <Camera className="w-10 h-10 text-slate-400 animate-pulse" />
            </div>
            <span className="text-xs text-slate-500 font-mono">SIMULATED CAMERA FEED</span>
          </div>
        )}

        {/* Framing Overlay Brackets */}
        <div className="absolute inset-0 pointer-events-none p-6 flex items-center justify-center">
          <div className="w-full h-full rounded-full border-2 border-dashed border-indigo-400/60 animate-spin-slow" />
        </div>

        {/* Scan line effect */}
        {isScanning && (
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_#10b981] transition-all duration-300"
            style={{ top: `${scanProgress}%` }}
          />
        )}

        {/* Completion Success Overlay */}
        {isComplete && (
          <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in">
            <CheckCircle2 className="w-16 h-16 text-white mb-2 animate-bounce" />
            <span className="text-sm font-bold">Face Matched 99.8%</span>
          </div>
        )}
      </div>

      {/* Progress & Status */}
      <div className="w-full mt-4 text-center">
        <p className="text-xs font-semibold text-indigo-700 mb-2">{statusText}</p>

        {isScanning && (
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        )}

        {!isScanning && !isComplete && (
          <button
            id="start-face-scan-btn"
            onClick={startScanProcess}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Camera className="w-4 h-4" /> Start Face Scan Verification
          </button>
        )}

        {isComplete && (
          <div className="text-xs text-emerald-700 font-medium flex items-center justify-center gap-1.5 py-2">
            <CheckCircle2 className="w-4 h-4" /> Biometric Token Hash Verified
          </div>
        )}
      </div>
    </div>
  );
};
