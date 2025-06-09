
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Clock } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-grow py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gold/10 rounded-xl">
                <MessageSquare className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Messages</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  Your conversations
                  {currentUserRole && (
                    <Badge variant="secondary" className="capitalize bg-gold/20 text-gold-dark border-gold/30">
                      {currentUserRole}
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </div>

          {conversations.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No messages yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {currentUserRole === 'client' 
                    ? 'Start a conversation by messaging an escort from their profile page. Your conversations will appear here.'
                    : 'Conversations will appear here when clients message you. Check back soon!'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-border bg-card hover:bg-accent/5 group"
                  onClick={() => setSelectedConversation({
                    userId: conversation.other_user.id,
                    userName: conversation.other_user.display_name || 'Unknown User'
                  })}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-border">
                          <AvatarImage src={conversation.other_user.profile_picture} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-base font-semibold text-foreground truncate group-hover:text-gold transition-colors">
                              {conversation.other_user.display_name || 'Unknown User'}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className="text-xs capitalize border-muted-foreground/30 text-muted-foreground bg-muted/30"
                            >
                              {conversation.other_user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3">
                            {conversation.unread_count > 0 && (
                              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1">
                                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                              </Badge>
                            )}
                            {conversation.last_message && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(conversation.last_message.created_at)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {conversation.last_message ? (
                          <p className="text-sm text-muted-foreground truncate leading-relaxed">
                            <span className={conversation.last_message.sender_id === currentUserId ? "text-foreground/70" : ""}>
                              {conversation.last_message.sender_id === currentUserId && 'You: '}
                            </span>
                            {conversation.last_message.content}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No messages yet</p>
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
