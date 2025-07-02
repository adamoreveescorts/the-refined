
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

export const ImageZoomModal = ({ isOpen, onClose, imageUrl, altText }: ImageZoomModalProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      const newZoomLevel = zoomLevel < 3 ? zoomLevel + 0.5 : 1;
      setZoomLevel(newZoomLevel);
      
      if (newZoomLevel === 1) {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleClose = () => {
    resetZoom();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Controls */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <Button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.5, 3))}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.5, 1))}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              onClick={resetZoom}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              disabled={zoomLevel === 1}
            >
              <span className="text-xs">1:1</span>
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Zoom level indicator */}
          <div className="absolute top-4 left-4 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {Math.round(zoomLevel * 100)}%
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 text-white px-4 py-2 rounded-full text-sm text-center">
            {zoomLevel === 1 ? 'Click image to zoom in' : 'Click to zoom further • Drag to pan'}
          </div>

          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt={altText}
            className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
              zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            style={{
              transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            }}
            onClick={handleImageClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
