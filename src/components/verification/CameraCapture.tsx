
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onPhotoCapture: (photoBlob: Blob) => void;
  onCancel: () => void;
}

const CameraCapture = ({ onPhotoCapture, onCancel }: CameraCaptureProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const waitForVideoElement = async (maxAttempts = 10): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkVideo = () => {
        attempts++;
        console.log(`Checking for video element, attempt ${attempts}`);
        
        if (videoRef.current) {
          console.log('Video element found!');
          resolve(videoRef.current);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.error('Video element not found after maximum attempts');
          reject(new Error('Video element not available'));
          return;
        }
        
        setTimeout(checkVideo, 100);
      };
      
      checkVideo();
    });
  };

  const setupVideoStream = async (video: HTMLVideoElement, stream: MediaStream): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Video setup timeout'));
      }, 10000);

      const onLoadedMetadata = () => {
        console.log('Video metadata loaded');
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('error', onError);
        clearTimeout(timeout);
        resolve();
      };

      const onError = (error: Event) => {
        console.error('Video error:', error);
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('error', onError);
        clearTimeout(timeout);
        reject(new Error('Video failed to load'));
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);

      video.srcObject = stream;
      video.load();
    });
  };

  const startCamera = async () => {
    console.log('Starting camera...');
    setIsLoading(true);
    setCameraError(null);
    
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('Camera stream obtained:', stream);
      const videoTracks = stream.getVideoTracks();
      console.log('Video tracks:', videoTracks.length);
      
      if (videoTracks.length === 0) {
        throw new Error('No video track available in stream');
      }

      console.log('Waiting for video element...');
      const video = await waitForVideoElement();
      
      console.log('Setting up video stream...');
      await setupVideoStream(video, stream);
      
      streamRef.current = stream;
      
      // Start playing the video
      try {
        await video.play();
        console.log('Video is now playing');
        setIsStreaming(true);
      } catch (playError) {
        console.error('Error playing video:', playError);
        throw new Error('Failed to start video playback');
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Clean up stream if it was created
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      let errorMessage = 'Unable to access camera';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure a camera is connected.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = useCallback(() => {
    console.log('Capturing photo...');
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      console.error('Video or canvas ref not available, or not streaming');
      toast.error('Camera not ready. Please ensure camera is active.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Could not get canvas context');
      toast.error('Failed to initialize capture. Please try again.');
      return;
    }

    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video not ready for capture');
      toast.error('Video not ready. Please wait a moment and try again.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('Drawing video to canvas:', video.videoWidth, 'x', video.videoHeight);
    
    // Mirror the image horizontally to match what user sees
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();
    
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('Photo captured, blob size:', blob.size);
        const photoUrl = URL.createObjectURL(blob);
        setCapturedPhoto(photoUrl);
        setPhotoBlob(blob);
        stopCamera();
      } else {
        console.error('Failed to create blob from canvas');
        toast.error('Failed to capture photo. Please try again.');
      }
    }, 'image/jpeg', 0.8);
  }, [isStreaming]);

  const retakePhoto = () => {
    console.log('Retaking photo...');
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    setCapturedPhoto(null);
    setPhotoBlob(null);
    setCameraError(null);
    startCamera();
  };

  const confirmPhoto = () => {
    console.log('Confirming photo...');
    if (photoBlob) {
      onPhotoCapture(photoBlob);
    }
  };

  const handleCancel = () => {
    console.log('Cancelling camera capture...');
    stopCamera();
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    onCancel();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Photo Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Take a clear photo of yourself that matches your profile picture. 
            Make sure your face is clearly visible and well-lit.
          </p>
        </div>

        {cameraError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 text-center">{cameraError}</p>
          </div>
        )}

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {!isStreaming && !capturedPhoto && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={startCamera} size="lg">
                <Camera className="h-5 w-5 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p>Starting camera...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
            style={{ transform: 'scaleX(-1)' }}
          />

          {capturedPhoto && (
            <img
              src={capturedPhoto}
              alt="Captured verification photo"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-center gap-4">
          {isStreaming && !isLoading && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={capturePhoto}>
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            </>
          )}

          {capturedPhoto && (
            <>
              <Button variant="outline" onClick={retakePhoto}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button onClick={confirmPhoto}>
                <Check className="h-4 w-4 mr-2" />
                Use This Photo
              </Button>
            </>
          )}

          {!isStreaming && !capturedPhoto && !isLoading && cameraError && (
            <Button variant="outline" onClick={handleCancel}>
              Back
            </Button>
          )}

          {isLoading && (
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCapture;
