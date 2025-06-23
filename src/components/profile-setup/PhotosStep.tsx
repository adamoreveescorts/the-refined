
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PhotosStepProps {
  profileData: any;
  onUpdate: (data: any) => Promise<void>;
  onComplete: () => void;
}

const PhotosStep = ({ profileData, onUpdate, onComplete }: PhotosStepProps) => {
  const [profilePicture, setProfilePicture] = useState(profileData.profile_picture || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(profileData.gallery_images || []);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setProfilePicture(url);
      toast.success('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (galleryImages.length + files.length > 10) {
      toast.error('Maximum 10 gallery images allowed');
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max 5MB)`);
        }
        return uploadImage(file);
      });

      const urls = await Promise.all(uploadPromises);
      setGalleryImages(prev => [...prev, ...urls]);
      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleContinue = async () => {
    try {
      await onUpdate({
        profile_picture: profilePicture,
        gallery_images: galleryImages
      });
      onComplete();
    } catch (error) {
      console.error('Error saving photos:', error);
      toast.error('Error saving photos');
    }
  };

  const canContinue = profilePicture || galleryImages.length > 0;

  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">Profile Picture *</Label>
          <p className="text-sm text-gray-600">
            This will be your main photo that appears in search results
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {profilePicture ? (
            <div className="relative">
              <img
                src={profilePicture}
                alt="Profile"
                className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={() => setProfilePicture('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No profile picture</p>
            </div>
          )}

          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden"
              id="profile-upload"
              disabled={isUploading}
            />
            <Label
              htmlFor="profile-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {profilePicture ? 'Change Photo' : 'Upload Photo'}
            </Label>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">Gallery Images (Optional)</Label>
          <p className="text-sm text-gray-600">
            Add up to 10 additional photos to showcase yourself (Recommended: 3-5 photos)
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeGalleryImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {galleryImages.length < 10 && (
            <Card className="border-dashed">
              <CardContent className="p-2">
                <div className="h-32 flex flex-col items-center justify-center">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                    id="gallery-upload"
                    disabled={isUploading}
                  />
                  <Label
                    htmlFor="gallery-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Photos</span>
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Uploading images...</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!canContinue || isUploading}
          className="px-8"
        >
          Continue
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Tips: Use high-quality, well-lit photos that show your personality!</p>
      </div>
    </div>
  );
};

export default PhotosStep;
