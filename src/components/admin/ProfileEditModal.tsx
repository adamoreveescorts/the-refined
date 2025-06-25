import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface ProfileEditModalProps {
  profile: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: () => void;
}

const ProfileEditModal = ({ profile, open, onOpenChange, onProfileUpdate }: ProfileEditModalProps) => {
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    age: '',
    height: '',
    weight: '',
    ethnicity: '',
    body_type: '',
    hair_color: '',
    eye_color: '',
    cup_size: '',
    nationality: '',
    smoking: '',
    drinking: '',
    services: '',
    rates: '',
    languages: '',
    availability: '',
    status: 'pending',
    featured: false,
    verified: false,
    is_active: false,
    rating: 4.5,
    profile_picture: '',
    tattoos: false,
    piercings: false,
    hourly_rate: '',
    two_hour_rate: '',
    dinner_rate: '',
    overnight_rate: '',
    incall_hourly_rate: '',
    outcall_hourly_rate: '',
    incall_two_hour_rate: '',
    outcall_two_hour_rate: '',
    incall_dinner_rate: '',
    outcall_dinner_rate: '',
    incall_overnight_rate: '',
    outcall_overnight_rate: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        age: profile.age || '',
        height: profile.height || '',
        weight: profile.weight || '',
        ethnicity: profile.ethnicity || '',
        body_type: profile.body_type || '',
        hair_color: profile.hair_color || '',
        eye_color: profile.eye_color || '',
        cup_size: profile.cup_size || '',
        nationality: profile.nationality || '',
        smoking: profile.smoking || '',
        drinking: profile.drinking || '',
        services: profile.services || '',
        rates: profile.rates || '',
        languages: profile.languages || '',
        availability: profile.availability || '',
        status: profile.status || 'pending',
        featured: profile.featured || false,
        verified: profile.verified || false,
        is_active: profile.is_active || false,
        rating: profile.rating || 4.5,
        profile_picture: profile.profile_picture || '',
        tattoos: profile.tattoos || false,
        piercings: profile.piercings || false,
        hourly_rate: profile.hourly_rate || '',
        two_hour_rate: profile.two_hour_rate || '',
        dinner_rate: profile.dinner_rate || '',
        overnight_rate: profile.overnight_rate || '',
        incall_hourly_rate: profile.incall_hourly_rate || '',
        outcall_hourly_rate: profile.outcall_hourly_rate || '',
        incall_two_hour_rate: profile.incall_two_hour_rate || '',
        outcall_two_hour_rate: profile.outcall_two_hour_rate || '',
        incall_dinner_rate: profile.incall_dinner_rate || '',
        outcall_dinner_rate: profile.outcall_dinner_rate || '',
        incall_overnight_rate: profile.incall_overnight_rate || '',
        outcall_overnight_rate: profile.outcall_overnight_rate || ''
      });
    }
  }, [profile]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update form data with new image URL
      setFormData({ ...formData, profile_picture: publicUrl });
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePicture = () => {
    setFormData({ ...formData, profile_picture: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      onProfileUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Section */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.profile_picture} />
                <AvatarFallback>
                  {formData.display_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById('profile-picture-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  {formData.profile_picture && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeProfilePicture}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="rates">Rates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="services">Services</Label>
                <Textarea
                  id="services"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ethnicity">Ethnicity</Label>
                  <Select value={formData.ethnicity || "not_specified"} onValueChange={(value) => setFormData({ ...formData, ethnicity: value === "not_specified" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="Asian">Asian</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="Caucasian">Caucasian</SelectItem>
                      <SelectItem value="Hispanic">Hispanic</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="body_type">Body Type</Label>
                  <Select value={formData.body_type || "not_specified"} onValueChange={(value) => setFormData({ ...formData, body_type: value === "not_specified" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="Petite">Petite</SelectItem>
                      <SelectItem value="Slim">Slim</SelectItem>
                      <SelectItem value="Athletic">Athletic</SelectItem>
                      <SelectItem value="Average">Average</SelectItem>
                      <SelectItem value="Curvy">Curvy</SelectItem>
                      <SelectItem value="Full Figured">Full Figured</SelectItem>
                      <SelectItem value="BBW">BBW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hair_color">Hair Color</Label>
                  <Select value={formData.hair_color || "not_specified"} onValueChange={(value) => setFormData({ ...formData, hair_color: value === "not_specified" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hair color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="Blonde">Blonde</SelectItem>
                      <SelectItem value="Brunette">Brunette</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="Red">Red</SelectItem>
                      <SelectItem value="Auburn">Auburn</SelectItem>
                      <SelectItem value="Grey">Grey</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eye_color">Eye Color</Label>
                  <Select value={formData.eye_color || "not_specified"} onValueChange={(value) => setFormData({ ...formData, eye_color: value === "not_specified" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select eye color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="Blue">Blue</SelectItem>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Green">Green</SelectItem>
                      <SelectItem value="Hazel">Hazel</SelectItem>
                      <SelectItem value="Grey">Grey</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cup_size">Cup Size</Label>
                  <Select value={formData.cup_size || "not_specified"} onValueChange={(value) => setFormData({ ...formData, cup_size: value === "not_specified" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cup size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="DD">DD</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                      <SelectItem value="F">F+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tattoos"
                    checked={formData.tattoos}
                    onCheckedChange={(checked) => setFormData({ ...formData, tattoos: !!checked })}
                  />
                  <Label htmlFor="tattoos">Has Tattoos</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="piercings"
                    checked={formData.piercings}
                    onCheckedChange={(checked) => setFormData({ ...formData, piercings: !!checked })}
                  />
                  <Label htmlFor="piercings">Has Piercings</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smoking">Smoking</Label>
                  <Select value={formData.smoking || "not_specified"} onValueChange={(value) => setFormData({ ...formData, smoking: value === "not_specified" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="Non-smoker">Non-smoker</SelectItem>
                      <SelectItem value="Light smoker">Light smoker</SelectItem>
                      <SelectItem value="Social smoker">Social smoker</SelectItem>
                      <SelectItem value="Regular smoker">Regular smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="drinking">Drinking</Label>
                  <Select value={formData.drinking || "not_specified"} onValueChange={(value) => setFormData({ ...formData, drinking: value === "not_specified" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="Non-drinker">Non-drinker</SelectItem>
                      <SelectItem value="Light drinker">Light drinker</SelectItem>
                      <SelectItem value="Social drinker">Social drinker</SelectItem>
                      <SelectItem value="Regular drinker">Regular drinker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rates" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Incall Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incall_hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="incall_hourly_rate"
                      type="number"
                      value={formData.incall_hourly_rate}
                      onChange={(e) => setFormData({ ...formData, incall_hourly_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="incall_two_hour_rate">2 Hour Rate ($)</Label>
                    <Input
                      id="incall_two_hour_rate"
                      type="number"
                      value={formData.incall_two_hour_rate}
                      onChange={(e) => setFormData({ ...formData, incall_two_hour_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="incall_dinner_rate">Dinner Rate ($)</Label>
                    <Input
                      id="incall_dinner_rate"
                      type="number"
                      value={formData.incall_dinner_rate}
                      onChange={(e) => setFormData({ ...formData, incall_dinner_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="incall_overnight_rate">Overnight Rate ($)</Label>
                    <Input
                      id="incall_overnight_rate"
                      type="number"
                      value={formData.incall_overnight_rate}
                      onChange={(e) => setFormData({ ...formData, incall_overnight_rate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Outcall Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="outcall_hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="outcall_hourly_rate"
                      type="number"
                      value={formData.outcall_hourly_rate}
                      onChange={(e) => setFormData({ ...formData, outcall_hourly_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="outcall_two_hour_rate">2 Hour Rate ($)</Label>
                    <Input
                      id="outcall_two_hour_rate"
                      type="number"
                      value={formData.outcall_two_hour_rate}
                      onChange={(e) => setFormData({ ...formData, outcall_two_hour_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="outcall_dinner_rate">Dinner Rate ($)</Label>
                    <Input
                      id="outcall_dinner_rate"
                      type="number"
                      value={formData.outcall_dinner_rate}
                      onChange={(e) => setFormData({ ...formData, outcall_dinner_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="outcall_overnight_rate">Overnight Rate ($)</Label>
                    <Input
                      id="outcall_overnight_rate"
                      type="number"
                      value={formData.outcall_overnight_rate}
                      onChange={(e) => setFormData({ ...formData, outcall_overnight_rate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Legacy Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate">Legacy Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="two_hour_rate">Legacy 2 Hour Rate ($)</Label>
                    <Input
                      id="two_hour_rate"
                      type="number"
                      value={formData.two_hour_rate}
                      onChange={(e) => setFormData({ ...formData, two_hour_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dinner_rate">Legacy Dinner Rate ($)</Label>
                    <Input
                      id="dinner_rate"
                      type="number"
                      value={formData.dinner_rate}
                      onChange={(e) => setFormData({ ...formData, dinner_rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="overnight_rate">Legacy Overnight Rate ($)</Label>
                    <Input
                      id="overnight_rate"
                      type="number"
                      value={formData.overnight_rate}
                      onChange={(e) => setFormData({ ...formData, overnight_rate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rates">Legacy Rates (Text)</Label>
                  <Textarea
                    id="rates"
                    value={formData.rates}
                    onChange={(e) => setFormData({ ...formData, rates: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                  />
                  <Label htmlFor="verified">Verified</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
