import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { createSession, setActiveSession, deleteSession } from '../store/chatSlice';
import { ChatInterface } from '../components/Chat/ChatInterface';
import { format } from 'date-fns';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';

export function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { sessions, activeSessionId } = useSelector((state: RootState) => state.chat);
  const [deleteDialog, setDeleteDialog] = React.useState<{ isOpen: boolean; sessionId: string | null }>({
    isOpen: false,
    sessionId: null
  });

  // Create initial session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      dispatch(createSession());
    } else if (!activeSessionId) {
      dispatch(setActiveSession(sessions[0].id));
    }
  }, [dispatch, sessions.length, activeSessionId]);

  const activeSession = sessions.find(session => session.id === activeSessionId);

  const handleDeleteClick = (sessionId: string) => {
    setDeleteDialog({ isOpen: true, sessionId });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.sessionId) {
      dispatch(deleteSession(deleteDialog.sessionId));
      setDeleteDialog({ isOpen: false, sessionId: null });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Your Conversations</h2>
          <button
            onClick={() => dispatch(createSession())}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all duration-200"
          >
            Start New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  session.id === activeSessionId 
                    ? 'bg-blue-50 border border-blue-100' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => dispatch(setActiveSession(session.id))}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs">
                      AI
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {format(new Date(session.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.messages.length} messages
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(session.id);
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeSession ? (
          <ChatInterface session={activeSession} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation or start a new chat
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, sessionId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
      />
    </div>
  );
} 