
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, Undo, Redo } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoEditorProps {
  imageFile: File;
  onSave: (editedFile: File) => void;
  onCancel: () => void;
}

interface BlurAction {
  x: number;
  y: number;
  radius: number;
  blurAmount: number;
}

const PhotoEditor = ({ imageFile, onSave, onCancel }: PhotoEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [blurRadius, setBlurRadius] = useState([20]);
  const [blurIntensity, setBlurIntensity] = useState([10]);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    loadImage();
  }, [imageFile]);

  const loadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Store original image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setOriginalImageData(imageData);
      
      // Initialize history
      setHistory([imageData]);
      setHistoryIndex(0);
    };
    
    img.src = URL.createObjectURL(imageFile);
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const applyBlur = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a temporary canvas for the blur effect
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Copy current canvas to temp canvas
    tempCtx.drawImage(canvas, 0, 0);

    // Apply blur filter to the entire temp canvas
    tempCtx.filter = `blur(${blurIntensity[0]}px)`;
    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.drawImage(canvas, 0, 0);

    // Reset filter
    tempCtx.filter = 'none';

    // Create a circular mask and apply the blurred area
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, blurRadius[0], 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to canvas size
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    
    applyBlur(x * scaleX, y * scaleY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to canvas size
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    
    applyBlur(x * scaleX, y * scaleY);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const prevIndex = historyIndex - 1;
      ctx.putImageData(history[prevIndex], 0, 0);
      setHistoryIndex(prevIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const nextIndex = historyIndex + 1;
      ctx.putImageData(history[nextIndex], 0, 0);
      setHistoryIndex(nextIndex);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const editedFile = new File([blob], imageFile.name, {
          type: imageFile.type,
          lastModified: Date.now(),
        });
        onSave(editedFile);
        toast.success('Photo edited successfully');
      }
    }, imageFile.type);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Edit Photo</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-96 border cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ display: 'block', margin: '0 auto' }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Blur Radius: {blurRadius[0]}px
          </label>
          <Slider
            value={blurRadius}
            onValueChange={setBlurRadius}
            max={50}
            min={5}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Blur Intensity: {blurIntensity[0]}px
          </label>
          <Slider
            value={blurIntensity}
            onValueChange={setBlurIntensity}
            max={20}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
        <strong>How to use:</strong> Click and drag on the image to blur areas. 
        Adjust the radius and intensity using the sliders above.
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PhotoEditor;
