
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface SendAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  followerCount?: number;
}

const SendAnnouncementModal = ({ isOpen, onClose, followerCount = 0 }: SendAnnouncementModalProps) => {
  const [announcement, setAnnouncement] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!announcement.trim()) {
      toast.error('Please write an announcement before sending');
      return;
    }

    setSending(true);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Announcement sent to ${followerCount} followers!`);
    setAnnouncement('');
    setSending(false);
    onClose();
  };

  const handleClose = () => {
    setAnnouncement('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Announcement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Send an announcement to all {followerCount} of your followers
            </p>
            <Textarea
              placeholder="What would you like to announce to your followers?"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="min-h-24"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {announcement.length}/500
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !announcement.trim()}>
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Announcement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendAnnouncementModal;
