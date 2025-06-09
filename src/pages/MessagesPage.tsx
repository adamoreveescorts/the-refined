
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User } from 'lucide-react';
import { MessagingDialog } from '@/components/messaging/MessagingDialog';

interface Conversation {
  id: string;
  client_id: string;
  escort_id: string;
  updated_at: string;
  other_user: {
    id: string;
    display_name: string;
    profile_picture: string;
    role: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    fetchConversations();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      
      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setCurrentUserRole(profile.role);
      }
    }
  };

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to view messages');
        return;
      }

      // Fetch conversations where user is either client or escort
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          client_id,
          escort_id,
          updated_at
        `)
        .or(`client_id.eq.${user.id},escort_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
        return;
      }

      if (!conversationsData) return;

      // Process conversations to get other user info and last message
      const processedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherUserId = conv.client_id === user.id ? conv.escort_id : conv.client_id;
          
          // Get other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, profile_picture, role')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count (messages not sent by current user and not read)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            other_user: profile || { 
              id: otherUserId, 
              display_name: 'Unknown User', 
              profile_picture: '', 
              role: 'client' 
            },
            last_message: lastMessage,
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(processedConversations);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
            <p>Loading messages...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-serif font-bold text-navy mb-2">Messages</h1>
            <p className="text-charcoal">
              Your conversations
              {currentUserRole && (
                <Badge variant="outline" className="ml-2 capitalize">
                  {currentUserRole}
                </Badge>
              )}
            </p>
          </div>

          {conversations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600">
                  {currentUserRole === 'client' 
                    ? 'Start a conversation by messaging an escort from their profile.'
                    : 'Conversations will appear here when clients message you.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedConversation({
                    userId: conversation.other_user.id,
                    userName: conversation.other_user.display_name || 'Unknown User'
                  })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.other_user.profile_picture} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.other_user.display_name || 'Unknown User'}
                            </h3>
                            <Badge variant="outline" className="text-xs capitalize">
                              {conversation.other_user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            {conversation.unread_count > 0 && (
                              <Badge className="bg-gold text-white">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {conversation.last_message && formatTime(conversation.last_message.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        {conversation.last_message && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.last_message.sender_id === currentUserId && 'You: '}
                            {conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedConversation && (
        <MessagingDialog
          isOpen={!!selectedConversation}
          onClose={() => setSelectedConversation(null)}
          escortId={selectedConversation.userId}
          escortName={selectedConversation.userName}
        />
      )}
    </div>
  );
};

export default MessagesPage;
