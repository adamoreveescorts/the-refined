
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoStepProps {
  profileData: any;
  onUpdate: (data: any) => Promise<void>;
  onComplete: () => void;
}

const BasicInfoStep = ({ profileData, onUpdate, onComplete }: BasicInfoStepProps) => {
  const [formData, setFormData] = useState({
    display_name: profileData.display_name || '',
    bio: profileData.bio || '',
    location: profileData.location || '',
    age: profileData.age || '',
    height: profileData.height || '',
    ethnicity: profileData.ethnicity || '',
    hair_color: profileData.hair_color || '',
    eye_color: profileData.eye_color || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onUpdate(formData);
      onComplete();
    } catch (error) {
      console.error('Error saving basic info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.display_name && formData.bio && formData.location && formData.age;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name *</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
            placeholder="How should clients know you?"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, State"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="65"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            placeholder="18"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            value={formData.height}
            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            placeholder="5'6&quot;"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ethnicity">Ethnicity</Label>
          <Select
            value={formData.ethnicity}
            onValueChange={(value) => setFormData(prev => ({ ...prev, ethnicity: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ethnicity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caucasian">Caucasian</SelectItem>
              <SelectItem value="african-american">African American</SelectItem>
              <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
              <SelectItem value="asian">Asian</SelectItem>
              <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hair_color">Hair Color</Label>
          <Select
            value={formData.hair_color}
            onValueChange={(value) => setFormData(prev => ({ ...prev, hair_color: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hair color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blonde">Blonde</SelectItem>
              <SelectItem value="brunette">Brunette</SelectItem>
              <SelectItem value="black">Black</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="auburn">Auburn</SelectItem>
              <SelectItem value="gray">Gray</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">About You *</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell potential clients about yourself, your personality, and what makes you special..."
          rows={6}
          required
        />
        <p className="text-sm text-gray-500">
          This will be the first thing clients see. Make it engaging and authentic!
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="px-8"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
};

export default BasicInfoStep;
