import { ChatMessage } from '../types';

export const chatService = {
  /**
   * Fetch historical messages for a user or ticket
   */
  async getMessages(senderId?: string, receiverId?: string, ticketId?: string): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams();
      if (senderId) params.append('senderId', senderId);
      if (receiverId) params.append('receiverId', receiverId);
      if (ticketId) params.append('ticketId', ticketId);

      const res = await fetch(`/api/messages?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      return data.messages || [];
    } catch (err) {
      console.warn('Chat service fetch error:', err);
      return [];
    }
  },

  /**
   * Send a new chat message
   */
  async sendMessage(msg: Partial<ChatMessage>): Promise<ChatMessage | null> {
    try {
      const payload = {
        id: msg.id || `msg-${Date.now()}`,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderRole,
        receiverId: msg.receiverId || 'ALL',
        receiverName: msg.receiverName || 'Recipient',
        ticketId: msg.ticketId || '',
        ticketType: msg.ticketType || '',
        message: msg.message,
        timestamp: new Date().toISOString(),
        status: 'Delivered',
        isRead: false,
        attachmentUrl: msg.attachmentUrl || '',
        attachmentName: msg.attachmentName || ''
      };

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      return data.message;
    } catch (err) {
      console.error('Send message error:', err);
      return null;
    }
  },

  /**
   * Mark messages as read between sender and receiver
   */
  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    try {
      await fetch('/api/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId })
      });
    } catch (err) {
      console.warn('Mark as read notice:', err);
    }
  },

  /**
   * Toggle emoji reaction on a message
   */
  async toggleReaction(messageId: string, emoji: string, userName: string): Promise<ChatMessage | null> {
    try {
      const res = await fetch('/api/messages/react', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji, userName })
      });
      if (!res.ok) throw new Error('Failed to toggle reaction');
      const data = await res.json();
      return data.message;
    } catch (err) {
      console.warn('Reaction error:', err);
      return null;
    }
  },

  /**
   * Subscribe to real-time message events via SSE with HTTP Polling fallback
   */
  subscribeToRealtimeMessages(
    onNewMessage: (msg: ChatMessage) => void,
    onStatusChange?: (status: 'Online' | 'Offline') => void
  ): () => void {
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    try {
      eventSource = new EventSource('/api/messages/stream');

      eventSource.onopen = () => {
        if (onStatusChange) onStatusChange('Online');
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.id && parsed.message) {
            onNewMessage(parsed as ChatMessage);
          }
        } catch (e) {
          // ignore non-json ping data
        }
      };

      eventSource.onerror = () => {
        if (onStatusChange) onStatusChange('Offline');
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        // Start fallback polling every 3 seconds if SSE breaks
        if (!fallbackInterval && isSubscribed) {
          let lastFetchedCount = 0;
          fallbackInterval = setInterval(async () => {
            if (!isSubscribed) return;
            try {
              const res = await fetch('/api/messages');
              if (res.ok) {
                const data = await res.json();
                const msgs: ChatMessage[] = data.messages || [];
                if (msgs.length > lastFetchedCount) {
                  // send newest messages
                  const newMsgs = msgs.slice(lastFetchedCount);
                  newMsgs.forEach(m => onNewMessage(m));
                  lastFetchedCount = msgs.length;
                }
                if (onStatusChange) onStatusChange('Online');
              }
            } catch (e) {
              if (onStatusChange) onStatusChange('Offline');
            }
          }, 3000);
        }
      };
    } catch (e) {
      if (onStatusChange) onStatusChange('Offline');
    }

    // Unsubscribe cleanup function
    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }
};
