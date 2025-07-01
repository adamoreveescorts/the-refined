
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Edit, Trash2, Eye, EyeOff, X, AlertCircle, Video, Image, Play } from 'lucide-react';
import PhotoEditor from '../PhotoEditor';

interface AdminPhotoGalleryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
  onGalleryUpdate: () => void;
}

const AdminPhotoGalleryManager = ({ 
  isOpen, 
  onClose, 
  profileId, 
  profileName,
  onGalleryUpdate
}: AdminPhotoGalleryManagerProps) => {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<string[]>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadGalleryImages();
    }
  }, [isOpen, profileId]);

  const loadGalleryImages = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('profile_picture, gallery_images, gallery_videos')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error loading gallery:', error);
        toast.error('Failed to load gallery');
        return;
      }

      if (profile) {
        setProfilePictureUrl(profile.profile_picture);
        setGalleryImages(profile.gallery_images || []);
        setGalleryVideos(profile.gallery_videos || []);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast.error('Failed to load gallery');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) {
        toast.error(`${file.name} is not a supported media file`);
        continue;
      }

      // Check file size limits
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for videos, 5MB for images
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max ${isVideo ? '50MB' : '5MB'})`);
        continue;
      }

      // Check video duration if it's a video
      if (isVideo) {
        const duration = await getVideoDuration(file);
        if (duration > 60) {
          toast.error(`${file.name} is longer than 1 minute`);
          continue;
        }
        
        await handleVideoUpload(file);
      } else if (isImage) {
        // Set the selected file and show editor for images
        setSelectedImageFile(file);
        setShowPhotoEditor(true);
        break; // Process one file at a time
      }
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}/video-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (error) {
        console.error("Storage upload error:", error);
        toast.error("Failed to upload video");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const updatedVideos = [...galleryVideos, publicUrl];
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gallery_videos: updatedVideos })
        .eq('id', profileId);

      if (updateError) {
        console.error('Error updating video gallery:', updateError);
        toast.error('Failed to update video gallery');
        return;
      }

      toast.success("Video uploaded successfully");
      loadGalleryImages();
      onGalleryUpdate();
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoEditorSave = async (editedFile: File) => {
    try {
      setUploading(true);
      
      const fileExt = editedFile.name.split('.').pop();
      const fileName = `${profileId}/gallery-${Date.now()}.${fileExt}`;

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

      const updatedGallery = [...galleryImages, publicUrl];
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gallery_images: updatedGallery })
        .eq('id', profileId);

      if (updateError) {
        console.error('Error updating gallery:', updateError);
        toast.error('Failed to update gallery');
        return;
      }

      setShowPhotoEditor(false);
      setSelectedImageFile(null);
      toast.success("Image uploaded successfully");
      loadGalleryImages();
      onGalleryUpdate();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleEditExistingImage = (imageUrl: string) => {
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
      const fileName = `${profileId}/gallery-${Date.now()}.${fileExt}`;

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

      const updatedGallery = galleryImages.map(url => 
        url === editingImageUrl ? publicUrl : url
      );
      
      const updateData: any = { gallery_images: updatedGallery };
      if (profilePictureUrl === editingImageUrl) {
        updateData.profile_picture = publicUrl;
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);

      if (updateError) {
        console.error('Error updating gallery:', updateError);
        toast.error('Failed to update gallery');
        return;
      }

      setShowPhotoEditor(false);
      setSelectedImageFile(null);
      setEditingImageUrl(null);
      toast.success("Image updated successfully");
      loadGalleryImages();
      onGalleryUpdate();
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoUrl: string) => {
    try {
      const updatedVideos = galleryVideos.filter(url => url !== videoUrl);
      
      const { error } = await supabase
        .from('profiles')
        .update({ gallery_videos: updatedVideos })
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success('Video removed successfully');
      loadGalleryImages();
      onGalleryUpdate();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const updatedGallery = galleryImages.filter(url => url !== imageUrl);
      
      const updateData: any = { gallery_images: updatedGallery };
      if (profilePictureUrl === imageUrl) {
        updateData.profile_picture = null;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success('Image removed successfully');
      loadGalleryImages();
      onGalleryUpdate();
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
        .eq('id', profileId);

      if (error) throw error;
      toast.success('Profile picture updated');
      loadGalleryImages();
      onGalleryUpdate();
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Photos & Videos - {profileName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="admin-gallery-upload"
                disabled={uploading}
              />
              <label htmlFor="admin-gallery-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Photos & Videos"}
                  </span>
                </Button>
              </label>
              
              <p className="text-sm text-muted-foreground mt-2">
                Upload photos and videos to this profile's gallery and choose which photo to set as profile picture.
                <br />
                <span className="text-xs">
                  Photos: Max 5MB each | Videos: Max 50MB, 1 minute duration
                </span>
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Photos */}
              {galleryImages.map((imageUrl, index) => (
                <Card key={`image-${index}`} className="relative group">
                  <CardContent className="p-2">
                    <div className="relative aspect-square">
                      <img
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                      
                      <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                        <Image className="h-3 w-3" />
                      </Badge>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditExistingImage(imageUrl)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          {profilePictureUrl !== imageUrl ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetAsProfilePicture(imageUrl)}
                              title="Set as profile picture"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetAsProfilePicture('')}
                              title="Remove as profile picture"
                            >
                              <EyeOff className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(imageUrl)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {profilePictureUrl === imageUrl && (
                        <Badge className="absolute top-2 left-2 bg-gold text-white">
                          Profile
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Videos */}
              {galleryVideos.map((videoUrl, index) => (
                <Card key={`video-${index}`} className="relative group">
                  <CardContent className="p-2">
                    <div className="relative aspect-square">
                      <video
                        src={videoUrl}
                        className="w-full h-full object-cover rounded-md"
                        controls={false}
                        muted
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white bg-black bg-opacity-50 rounded-full p-3" />
                      </div>
                      
                      <Badge className="absolute top-2 right-2 bg-purple-500 text-white">
                        <Video className="h-3 w-3" />
                      </Badge>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteVideo(videoUrl)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {galleryImages.length === 0 && galleryVideos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No photos or videos in this profile's gallery yet.</p>
                <p className="text-sm">Upload some content to get started!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Editor Dialog */}
      <Dialog open={showPhotoEditor} onOpenChange={setShowPhotoEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
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

export default AdminPhotoGalleryManager;
