
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, User, Send } from 'lucide-react';

interface Conversation {
  id: string;
  client_id: string;
  escort_id: string;
  updated_at: string;
  client_profile: {
    display_name: string;
    profile_picture: string;
  };
  escort_profile: {
    display_name: string;
    profile_picture: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  admin_reply: boolean;
}

const AdminMessagingTab = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          client_id,
          escort_id,
          updated_at
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (!conversationsData) return;

      // Fetch profiles and last messages for each conversation
      const processedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          // Get client profile
          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('display_name, profile_picture')
            .eq('id', conv.client_id)
            .single();

          // Get escort profile
          const { data: escortProfile } = await supabase
            .from('profiles')
            .select('display_name, profile_picture')
            .eq('id', conv.escort_id)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .is('read_at', null);

          return {
            ...conv,
            client_profile: clientProfile || { display_name: 'Unknown Client', profile_picture: '' },
            escort_profile: escortProfile || { display_name: 'Unknown Escort', profile_picture: '' },
            last_message: lastMessage,
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(processedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessageAsEscort = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: selectedConversation.escort_id,
          content: newMessage.trim(),
          admin_reply: true
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedConversation.id);
      fetchConversations();
      toast.success('Message sent as escort');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-gold/10 border border-gold'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={conversation.escort_profile.profile_picture} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {conversation.escort_profile.display_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ↔ {conversation.client_profile.display_name}
                          </p>
                        </div>
                      </div>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-gold text-white text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages View */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedConversation ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedConversation.escort_profile.profile_picture} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedConversation.escort_profile.display_name} ↔ {selectedConversation.client_profile.display_name}
                  </p>
                  <p className="text-sm text-gray-500">Replying as escort</p>
                </div>
              </div>
            ) : (
              'Select a conversation'
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[500px]">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === selectedConversation.escort_id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender_id === selectedConversation.escort_id
                            ? 'bg-gold text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender_id === selectedConversation.escort_id
                              ? 'text-gold-light'
                              : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                          {message.admin_reply && (
                            <Badge variant="outline" className="text-xs ml-2">
                              Admin Reply
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Reply as escort..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessageAsEscort();
                    }
                  }}
                  disabled={sending}
                />
                <Button 
                  onClick={sendMessageAsEscort}
                  disabled={sending || !newMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to view messages
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessagingTab;
