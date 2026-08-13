import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { ChatMessage } from '../../types';
import { TangentLogo } from '../common/TangentLogo';

interface ChatFloatingTriggerProps {
  onClick: () => void;
  isOpen: boolean;
  currentUserId: string;
}

export const ChatFloatingTrigger: React.FC<ChatFloatingTriggerProps> = ({
  onClick,
  isOpen,
  currentUserId
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(1); // Default 1 for unread broadcast demo

  useEffect(() => {
    let isMounted = true;
    const updateUnread = async () => {
      const msgs = await chatService.getMessages();
      if (isMounted) {
        const unread = msgs.filter(m => !m.isRead && m.senderId !== currentUserId);
        setUnreadCount(unread.length);
      }
    };

    updateUnread();

    const unsubscribe = chatService.subscribeToRealtimeMessages((newMsg) => {
      if (isMounted && newMsg.senderId !== currentUserId && !isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUserId, isOpen]);

  if (isOpen) return null; // Hide floating trigger when chat drawer is open on the right

  return (
    <button
      onClick={onClick}
      title="Open Tangent Live Chat & Dispatch Messaging"
      className="fixed right-5 bottom-5 z-40 bg-[#163c68] hover:bg-[#123054] text-white p-2.5 rounded-full shadow-2xl border-2 border-cyan-400 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group font-sans"
    >
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring indicator for notifications */}
        {unreadCount > 0 && (
          <span className="absolute -inset-1.5 rounded-full bg-cyan-400/40 animate-ping opacity-75"></span>
        )}

        {/* Tangent Circular Logo Icon */}
        <TangentLogo className="w-8 h-8 rounded-full shadow-inner transform group-hover:rotate-6 transition-transform duration-300" />
        
        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-3 -right-3 bg-red-600 text-white font-black text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {/* Label Tooltip Text */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-extrabold pl-0 group-hover:pl-2.5 text-cyan-200 tracking-wide uppercase">
        Tangent Chat
      </span>
    </button>
  );
};
