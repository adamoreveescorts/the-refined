
import { useState, useRef, useCallback } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check your permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const photoUrl = URL.createObjectURL(blob);
        setCapturedPhoto(photoUrl);
        setPhotoBlob(blob);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, []);

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoBlob(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (photoBlob) {
      onPhotoCapture(photoBlob);
    }
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

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {!isStreaming && !capturedPhoto && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={startCamera} size="lg">
                <Camera className="h-5 w-5 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {isStreaming && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

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
          {isStreaming && (
            <>
              <Button variant="outline" onClick={onCancel}>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCapture;
