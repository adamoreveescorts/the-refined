
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
}

interface MessagingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  escortId: string;
  escortName: string;
}

export const MessagingDialog = ({ isOpen, onClose, escortId, escortName }: MessagingDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConversation();
      getCurrentUser();
    }
  }, [isOpen, escortId]);

  useEffect(() => {
    if (conversationId) {
      const channel = supabase
        .channel(`conversation_${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const newMsg = payload.new as Message;
            // Only add the message if it's not already in the state (to avoid duplicates)
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMsg.id);
              if (exists) return prev;
              return [...prev, newMsg];
            });
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create conversation
      let { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', user.id)
        .eq('escort_id', escortId)
        .single();

      if (!conversation) {
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            client_id: user.id,
            escort_id: escortId
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating conversation:', error);
          return;
        }
        conversation = newConversation;
      }

      setConversationId(conversation.id);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !currentUserId) return;

    const messageContent = newMessage.trim();
    setLoading(true);
    setNewMessage(''); // Clear input immediately

    // Create a temporary message object for immediate UI update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: messageContent,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      read_at: null
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    setTimeout(scrollToBottom, 100);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: messageContent
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        // Remove the temporary message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setNewMessage(messageContent); // Restore the message content
        return;
      }

      // Replace the temporary message with the real one from the database
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? data as Message : msg
        ));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message');
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageContent); // Restore the message content
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Message {escortName}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender_id === currentUserId
                      ? 'bg-gold text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === currentUserId ? 'text-gold-light' : 'text-gray-500'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={loading || !newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
