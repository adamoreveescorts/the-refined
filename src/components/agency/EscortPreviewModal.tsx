
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Eye, User, MapPin, Calendar, DollarSign } from 'lucide-react';

interface EscortPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escort: any;
}

const EscortPreviewModal = ({ 
  open, 
  onOpenChange, 
  escort 
}: EscortPreviewModalProps) => {
  if (!escort) return null;

  const getStatusBadge = (status: string) => {
    const statusColors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Profile Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={escort.profile_picture} 
                alt={escort.display_name || 'Escort'} 
              />
              <AvatarFallback className="text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{escort.display_name || 'No name'}</h2>
                {getStatusBadge(escort.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                {escort.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {escort.location}
                  </div>
                )}
                {escort.age && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {escort.age} years old
                  </div>
                )}
                {escort.height && (
                  <div>Height: {escort.height}</div>
                )}
                {escort.hourly_rate && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {escort.hourly_rate}/hour
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {escort.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{escort.bio}</p>
            </div>
          )}

          {/* Services Section */}
          {escort.services && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Services</h3>
              <p className="text-muted-foreground">{escort.services}</p>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <div className="space-y-1 text-sm">
              {escort.email && (
                <div>
                  <span className="font-medium">Email:</span> {escort.email}
                </div>
              )}
            </div>
          </div>

          {escort.status === 'pending' && (
            <div className="bg-orange-50 p-4 rounded-md">
              <p className="text-sm text-orange-800">
                This profile is pending admin approval and is not yet visible to clients.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EscortPreviewModal;
