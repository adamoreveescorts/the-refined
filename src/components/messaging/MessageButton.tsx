
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessagingDialog } from './MessagingDialog';

interface MessageButtonProps {
  escortId: string;
  escortName: string;
}

export const MessageButton = ({ escortId, escortName }: MessageButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartConversation = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to send messages');
        return;
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', user.id)
        .eq('escort_id', escortId)
        .single();

      if (!existingConversation) {
        // Create new conversation
        const { error } = await supabase
          .from('conversations')
          .insert({
            client_id: user.id,
            escort_id: escortId
          });

        if (error) {
          console.error('Error creating conversation:', error);
          toast.error('Failed to start conversation');
          return;
        }
      }

      setIsOpen(true);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        className="btn-gold" 
        size="lg" 
        onClick={handleStartConversation}
        disabled={loading}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        {loading ? 'Starting...' : `Message ${escortName}`}
      </Button>
      
      <MessagingDialog 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        escortId={escortId}
        escortName={escortName}
      />
    </>
  );
};
