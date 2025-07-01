
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const LOCATION_OPTIONS = [
  'All Locations',
  // Australia
  'Sydney',
  'Melbourne', 
  'Brisbane',
  'Perth',
  'Adelaide',
  'Gold Coast',
  'Canberra',
  'Darwin',
  'Hobart',
  'Cairns',
  // Thailand
  'Bangkok',
  'Phuket'
];

export const LocationSelector = ({ value, onValueChange, placeholder = "Select location", className }: LocationSelectorProps) => {
  return (
    <Select 
      value={value || 'all'} 
      onValueChange={(selectedValue) => onValueChange(selectedValue === 'all' ? '' : selectedValue)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 text-gray-900 z-50">
        <SelectItem value="all">All Locations</SelectItem>
        {LOCATION_OPTIONS.slice(1).map((location) => (
          <SelectItem key={location} value={location}>
            {location}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
