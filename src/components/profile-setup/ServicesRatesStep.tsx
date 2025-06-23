
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServicesRatesStepProps {
  profileData: any;
  onUpdate: (data: any) => Promise<void>;
  onComplete: () => void;
}

const ServicesRatesStep = ({ profileData, onUpdate, onComplete }: ServicesRatesStepProps) => {
  const [formData, setFormData] = useState({
    services: profileData.services || '',
    hourly_rate: profileData.hourly_rate || '',
    two_hour_rate: profileData.two_hour_rate || '',
    dinner_rate: profileData.dinner_rate || '',
    overnight_rate: profileData.overnight_rate || '',
    languages: profileData.languages || '',
    availability: profileData.availability || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onUpdate(formData);
      onComplete();
    } catch (error) {
      console.error('Error saving services and rates:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.services && formData.hourly_rate;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="services">Services Offered *</Label>
        <Textarea
          id="services"
          value={formData.services}
          onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
          placeholder="Describe the services you offer (companionship, dinner dates, etc.)"
          rows={4}
          required
        />
        <p className="text-sm text-gray-500">
          Be clear and professional about what you offer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="hourly_rate">Hourly Rate *</Label>
          <Input
            id="hourly_rate"
            value={formData.hourly_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
            placeholder="$200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="two_hour_rate">2-Hour Rate</Label>
          <Input
            id="two_hour_rate"
            value={formData.two_hour_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, two_hour_rate: e.target.value }))}
            placeholder="$350"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dinner_rate">Dinner Date Rate</Label>
          <Input
            id="dinner_rate"
            value={formData.dinner_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, dinner_rate: e.target.value }))}
            placeholder="$400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="overnight_rate">Overnight Rate</Label>
          <Input
            id="overnight_rate"
            value={formData.overnight_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, overnight_rate: e.target.value }))}
            placeholder="$800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="languages">Languages Spoken</Label>
        <Input
          id="languages"
          value={formData.languages}
          onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value }))}
          placeholder="English, Spanish, French"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Textarea
          id="availability"
          value={formData.availability}
          onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
          placeholder="Available weekdays 6pm-2am, weekends flexible. 2-hour minimum notice required."
          rows={3}
        />
        <p className="text-sm text-gray-500">
          Let clients know your typical availability and booking requirements
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-2">Pricing Tips</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Research similar escorts in your area for competitive pricing</li>
          <li>• Consider offering package deals for longer bookings</li>
          <li>• Be clear about what's included in your rates</li>
          <li>• You can always adjust your rates later</li>
        </ul>
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

export default ServicesRatesStep;
