
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import PhotoEditor from './PhotoEditor';

interface PhotoGalleryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentGallery: string[] | null;
  onGalleryUpdate: (newGallery: string[]) => void;
}

interface GalleryImage {
  url: string;
  isProfilePicture: boolean;
}

const PhotoGalleryManager = ({ 
  isOpen, 
  onClose, 
  userId, 
  currentGallery, 
  onGalleryUpdate 
}: PhotoGalleryManagerProps) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadGalleryImages();
    }
  }, [isOpen, currentGallery]);

  const loadGalleryImages = async () => {
    try {
      // Get current profile to check profile picture
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_picture, gallery_images')
        .eq('id', userId)
        .single();

      if (profile) {
        const images: GalleryImage[] = [];
        
        // Add profile picture if it exists
        if (profile.profile_picture) {
          images.push({
            url: profile.profile_picture,
            isProfilePicture: true
          });
        }

        // Add gallery images
        if (profile.gallery_images && Array.isArray(profile.gallery_images)) {
          profile.gallery_images.forEach(url => {
            if (url !== profile.profile_picture) {
              images.push({
                url,
                isProfilePicture: false
              });
            }
          });
        }

        setGalleryImages(images);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast.error('Failed to load gallery');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      // Set the selected file and show editor
      setSelectedImageFile(file);
      setShowPhotoEditor(true);
      break; // Process one file at a time
    }
  };

  const handlePhotoEditorSave = async (editedFile: File) => {
    try {
      setUploading(true);
      
      const fileExt = editedFile.name.split('.').pop();
      const fileName = `${userId}/gallery-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, editedFile);

      if (error) {
        console.error("Storage upload error:", error);
        toast.error("Failed to upload image");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update gallery images in database
      const updatedGallery = [...(currentGallery || []), publicUrl];
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gallery_images: updatedGallery })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating gallery:', updateError);
        toast.error('Failed to update gallery');
        return;
      }

      onGalleryUpdate(updatedGallery);
      setShowPhotoEditor(false);
      setSelectedImageFile(null);
      toast.success("Image uploaded successfully");
      loadGalleryImages();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleEditExistingImage = (imageUrl: string) => {
    // For editing existing images, we'll need to download and convert to File
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], 'existing-image.jpg', { type: blob.type });
        setSelectedImageFile(file);
        setEditingImageUrl(imageUrl);
        setShowPhotoEditor(true);
      })
      .catch(error => {
        console.error('Error loading image for editing:', error);
        toast.error('Failed to load image for editing');
      });
  };

  const handleEditedImageSave = async (editedFile: File) => {
    if (!editingImageUrl) {
      handlePhotoEditorSave(editedFile);
      return;
    }

    try {
      setUploading(true);
      
      const fileExt = editedFile.name.split('.').pop();
      const fileName = `${userId}/gallery-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, editedFile);

      if (error) {
        console.error("Storage upload error:", error);
        toast.error("Failed to upload edited image");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Replace the old image URL with the new one
      const updatedGallery = (currentGallery || []).map(url => 
        url === editingImageUrl ? publicUrl : url
      );
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gallery_images: updatedGallery })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating gallery:', updateError);
        toast.error('Failed to update gallery');
        return;
      }

      onGalleryUpdate(updatedGallery);
      setShowPhotoEditor(false);
      setSelectedImageFile(null);
      setEditingImageUrl(null);
      toast.success("Image updated successfully");
      loadGalleryImages();
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string, isProfilePicture: boolean) => {
    try {
      if (isProfilePicture) {
        // Clear profile picture
        const { error } = await supabase
          .from('profiles')
          .update({ profile_picture: null })
          .eq('id', userId);

        if (error) throw error;
        toast.success('Profile picture removed');
      } else {
        // Remove from gallery
        const updatedGallery = (currentGallery || []).filter(url => url !== imageUrl);
        
        const { error } = await supabase
          .from('profiles')
          .update({ gallery_images: updatedGallery })
          .eq('id', userId);

        if (error) throw error;
        onGalleryUpdate(updatedGallery);
        toast.success('Image removed from gallery');
      }

      loadGalleryImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleSetAsProfilePicture = async (imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture: imageUrl })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Profile picture updated');
      loadGalleryImages();
    } catch (error) {
      console.error('Error setting profile picture:', error);
      toast.error('Failed to set profile picture');
    }
  };

  const handlePhotoEditorCancel = () => {
    setShowPhotoEditor(false);
    setSelectedImageFile(null);
    setEditingImageUrl(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Photo Gallery</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="gallery-upload"
                disabled={uploading}
              />
              <label htmlFor="gallery-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload & Edit Photos"}
                  </span>
                </Button>
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                Select multiple images to upload. Each will open in the editor for blur adjustments.
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="relative aspect-square">
                      <img
                        src={image.url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                      
                      {/* Overlay with controls */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditExistingImage(image.url)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          {!image.isProfilePicture && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetAsProfilePicture(image.url)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(image.url, image.isProfilePicture)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Profile Picture Badge */}
                      {image.isProfilePicture && (
                        <Badge className="absolute top-2 left-2 bg-gold text-white">
                          Profile
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {galleryImages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No photos in your gallery yet.</p>
                <p className="text-sm">Upload some photos to get started!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Editor Dialog */}
      <Dialog open={showPhotoEditor} onOpenChange={setShowPhotoEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Your Photo</DialogTitle>
          </DialogHeader>
          {selectedImageFile && (
            <PhotoEditor
              imageFile={selectedImageFile}
              onSave={editingImageUrl ? handleEditedImageSave : handlePhotoEditorSave}
              onCancel={handlePhotoEditorCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoGalleryManager;
