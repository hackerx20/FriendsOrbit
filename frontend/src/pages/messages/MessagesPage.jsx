import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';

// Icons
import { 
  MdSend, 
  MdSearch, 
  MdMoreVert,
  MdArrowBack,
  MdOnlinePrediction
} from 'react-icons/md';

import { useSocket } from '../../context/SocketContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MessagesPage = () => {
  const { userId } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  
  const { socket, isUserOnline, isUserTyping } = useSocket();

  // Get conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
     try {
       const res = await fetch('/api/messages/conversations');
       
       if (!res.ok) {
         throw new Error(`HTTP error! status: ${res.status}`);
       }
       
       const text = await res.text();
       if (!text) {
         return [];
       }
       
       const data = JSON.parse(text);
       return data;
     } catch (error) {
       console.error("Conversations error:", error);
       return [];
     }
    }
  });

  // Get messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedUser?.id],
    queryFn: async () => {
     try {
       if (!selectedUser) return [];
       
       const res = await fetch(`/api/messages/conversation/${selectedUser.id}`);
       
       if (!res.ok) {
         throw new Error(`HTTP error! status: ${res.status}`);
       }
       
       const text = await res.text();
       if (!text) {
         return [];
       }
       
       const data = JSON.parse(text);
       return data;
     } catch (error) {
       console.error("Messages error:", error);
       return [];
     }
    },
    enabled: !!selectedUser
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }) => {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['messages', selectedUser?.id]);
      queryClient.invalidateQueries(['conversations']);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Search users
  const { data: searchResults } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
     try {
       if (!searchQuery || searchQuery.length < 2) return [];
       
       const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
       
       if (!res.ok) {
         throw new Error(`HTTP error! status: ${res.status}`);
       }
       
       const text = await res.text();
       if (!text) {
         return [];
       }
       
       const data = JSON.parse(text);
       return data;
     } catch (error) {
       console.error("Search error:", error);
       return [];
     }
    },
    enabled: searchQuery.length >= 2
  });

  // Handle URL params
  useEffect(() => {
    if (userId && conversations) {
      const user = conversations.find(conv => conv.other_user.id === parseInt(userId))?.other_user;
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [userId, conversations]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['conversations']);
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, queryClient]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    sendMessageMutation.mutate({
      receiverId: selectedUser.id,
      content: message.trim()
    });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const startNewConversation = (user) => {
    setSelectedUser(user);
    setSearchQuery('');
  };

  return (
    <div className="flex-1 flex h-screen max-h-screen">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-base-300 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
            <input
              type="text"
              placeholder="Search people..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="p-4 border-b border-base-300">
            <h3 className="font-semibold mb-2">Search Results</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults?.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer"
                  onClick={() => startNewConversation(user)}
                >
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img src={user.profile_image || '/avatar-placeholder.png'} alt={user.username} />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-base-content/60">@{user.username}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : conversations?.length === 0 ? (
            <div className="p-4 text-center text-base-content/60">
              <p>No conversations yet</p>
              <p className="text-sm">Search for users to start chatting</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations?.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedUser?.id === conversation.other_user.id 
                      ? 'bg-primary/10' 
                      : 'hover:bg-base-200'
                  }`}
                  onClick={() => setSelectedUser(conversation.other_user)}
                >
                  <div className="avatar">
                    <div className="w-12 rounded-full relative">
                      <img 
                        src={conversation.other_user.profile_image || '/avatar-placeholder.png'} 
                        alt={conversation.other_user.username} 
                      />
                      {isUserOnline(conversation.other_user.id) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-100"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold truncate">{conversation.other_user.full_name}</p>
                      {conversation.last_message_time && (
                        <span className="text-xs text-base-content/60">
                          {formatMessageTime(conversation.last_message_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-base-content/60 truncate">
                        {isUserTyping(conversation.other_user.id) 
                          ? 'Typing...' 
                          : conversation.last_message || 'Start a conversation'
                        }
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="badge badge-primary badge-sm">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-base-300 flex items-center gap-3">
              <button 
                className="btn btn-ghost btn-sm btn-circle md:hidden"
                onClick={() => setSelectedUser(null)}
              >
                <MdArrowBack />
              </button>
              
              <div className="avatar">
                <div className="w-10 rounded-full relative">
                  <img 
                    src={selectedUser.profile_image || '/avatar-placeholder.png'} 
                    alt={selectedUser.username} 
                  />
                  {isUserOnline(selectedUser.id) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <Link 
                  to={`/profile/${selectedUser.username}`}
                  className="font-semibold hover:underline"
                >
                  {selectedUser.full_name}
                </Link>
                <p className="text-sm text-base-content/60">
                  {isUserOnline(selectedUser.id) ? 'Online' : 'Offline'}
                </p>
              </div>
              
              <button className="btn btn-ghost btn-sm btn-circle">
                <MdMoreVert />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <LoadingSpinner />
                </div>
              ) : messages?.length === 0 ? (
                <div className="text-center text-base-content/60">
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages?.map((msg, index) => {
                    const isOwn = msg.sender_id === selectedUser.id ? false : true;
                    const showAvatar = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                          <div className="avatar">
                            <div className={`w-8 rounded-full ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                              <img 
                                src={selectedUser.profile_image || '/avatar-placeholder.png'} 
                                alt={selectedUser.username} 
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                          <div className={`p-3 rounded-2xl ${
                            isOwn 
                              ? 'bg-primary text-primary-content rounded-br-md' 
                              : 'bg-base-200 rounded-bl-md'
                          }`}>
                            <p className="break-words">{msg.content}</p>
                          </div>
                          <p className={`text-xs text-base-content/60 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                            {formatMessageTime(msg.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input input-bordered flex-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn btn-primary btn-circle"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <MdSend />
                  )}
                </motion.button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdOutlineMessage className="w-12 h-12 text-base-content/60" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
              <p className="text-base-content/60">
                Send private messages to your friends and followers
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;