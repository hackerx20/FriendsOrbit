import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Icons
import { 
  MdSend, 
  MdAdd, 
  MdDelete,
  MdEdit,
  MdSmartToy,
  MdPerson,
  MdArrowBack
} from 'react-icons/md';

import LoadingSpinner from '../../components/common/LoadingSpinner';

const AIChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Get chat sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['aiChatSessions'],
    queryFn: async () => {
      const res = await fetch('/api/ai-chat/sessions');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    }
  });

  // Get messages for selected session
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['aiChatMessages', selectedSession?.id],
    queryFn: async () => {
      if (!selectedSession) return [];
      const res = await fetch(`/api/ai-chat/sessions/${selectedSession.id}/messages`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    enabled: !!selectedSession
  });

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionName = 'New Chat') => {
      const res = await fetch('/api/ai-chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries(['aiChatSessions']);
      setSelectedSession(newSession);
      navigate(`/ai-chat/${newSession.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content }) => {
      const res = await fetch(`/api/ai-chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['aiChatMessages', selectedSession?.id]);
      queryClient.invalidateQueries(['aiChatSessions']);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Update session name
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, sessionName }) => {
      const res = await fetch(`/api/ai-chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['aiChatSessions']);
      setEditingSessionId(null);
      setEditingName('');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete session
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId) => {
      const res = await fetch(`/api/ai-chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['aiChatSessions']);
      if (selectedSession && deleteSessionMutation.variables === selectedSession.id) {
        setSelectedSession(null);
        navigate('/ai-chat');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Handle URL params
  useEffect(() => {
    if (sessionId && sessions) {
      const session = sessions.find(s => s.id === parseInt(sessionId));
      if (session) {
        setSelectedSession(session);
      }
    }
  }, [sessionId, sessions]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedSession) return;

    sendMessageMutation.mutate({
      sessionId: selectedSession.id,
      content: message.trim()
    });
  };

  const handleCreateSession = () => {
    createSessionMutation.mutate();
  };

  const handleEditSession = (session) => {
    setEditingSessionId(session.id);
    setEditingName(session.session_name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) return;
    updateSessionMutation.mutate({
      sessionId: editingSessionId,
      sessionName: editingName.trim()
    });
  };

  const handleDeleteSession = (sessionId) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  return (
    <div className="flex-1 flex h-screen max-h-screen">
      {/* Sessions List */}
      <div className={`w-full md:w-80 border-r border-base-300 flex flex-col ${selectedSession ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MdSmartToy className="text-primary" />
              AI Chat
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary btn-sm btn-circle"
              onClick={handleCreateSession}
              disabled={createSessionMutation.isPending}
            >
              {createSessionMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <MdAdd />
              )}
            </motion.button>
          </div>
          <p className="text-sm text-base-content/60">
            Chat with AI assistant powered by GPT
          </p>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto">
          {sessionsLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : sessions?.length === 0 ? (
            <div className="p-4 text-center text-base-content/60">
              <MdSmartToy className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
              <p>No chat sessions yet</p>
              <p className="text-sm">Create your first AI chat session</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {sessions?.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.02 }}
                  className={`group p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedSession?.id === session.id 
                      ? 'bg-primary/10' 
                      : 'hover:bg-base-200'
                  }`}
                  onClick={() => {
                    setSelectedSession(session);
                    navigate(`/ai-chat/${session.id}`);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <MdSmartToy className="text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.id ? (
                        <input
                          type="text"
                          className="input input-sm input-bordered w-full"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') {
                              setEditingSessionId(null);
                              setEditingName('');
                            }
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <p className="font-medium truncate">{session.session_name}</p>
                          <p className="text-xs text-base-content/60">
                            {session.message_count} messages • {format(new Date(session.updated_at), 'MMM dd')}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs btn-circle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSession(session);
                        }}
                      >
                        <MdEdit className="w-3 h-3" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                      >
                        <MdDelete className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedSession ? 'hidden md:flex' : 'flex'}`}>
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-base-300 flex items-center gap-3">
              <button 
                className="btn btn-ghost btn-sm btn-circle md:hidden"
                onClick={() => {
                  setSelectedSession(null);
                  navigate('/ai-chat');
                }}
              >
                <MdArrowBack />
              </button>
              
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <MdSmartToy className="text-primary" />
              </div>
              
              <div className="flex-1">
                <h2 className="font-semibold">{selectedSession.session_name}</h2>
                <p className="text-sm text-base-content/60">AI Assistant</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <LoadingSpinner />
                </div>
              ) : messages?.length === 0 ? (
                <div className="text-center text-base-content/60">
                  <MdSmartToy className="w-16 h-16 mx-auto mb-4 text-primary/50" />
                  <p className="text-lg font-medium mb-2">Start a conversation</p>
                  <p className="text-sm">Ask me anything! I'm here to help.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages?.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <MdSmartToy className="text-primary w-4 h-4" />
                          </div>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-1' : ''}`}>
                          <div className={`p-3 rounded-2xl ${
                            isUser 
                              ? 'bg-primary text-primary-content rounded-br-md' 
                              : 'bg-base-200 rounded-bl-md'
                          }`}>
                            <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className={`text-xs text-base-content/60 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </p>
                        </div>

                        {isUser && (
                          <div className="w-8 h-8 bg-base-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <MdPerson className="w-4 h-4" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              
              {sendMessageMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <MdSmartToy className="text-primary w-4 h-4" />
                  </div>
                  <div className="bg-base-200 rounded-2xl rounded-bl-md p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-base-content/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-base-content/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-base-content/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask me anything..."
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
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdSmartToy className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">AI Chat Assistant</h2>
              <p className="text-base-content/60 mb-4">
                Get help, ask questions, or just have a conversation
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
                onClick={handleCreateSession}
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <MdAdd /> Start New Chat
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatPage;