import { ChatMessage } from '../types';
import { supabase } from '../lib/supabase';

export const chatService = {
  /**
   * Fetch historical messages from Supabase Realtime Database or Local Proxy
   */
  async getMessages(senderId?: string, receiverId?: string, ticketId?: string): Promise<ChatMessage[]> {
    try {
      // 1. Try fetching directly from Supabase `chat_messages` table
      let query = supabase.from('chat_messages').select('*');

      if (ticketId) {
        query = query.eq('ticket_id', ticketId);
      } else if (receiverId === 'ALL') {
        query = query.or(`receiver_id.eq.ALL,receiver_id.is.null`);
      } else if (receiverId && receiverId.startsWith('CHANNEL_')) {
        query = query.or(`receiver_id.eq.${receiverId},receiver_id.eq.ALL`);
      } else if (senderId && receiverId) {
        query = query.or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId}),receiver_id.eq.ALL`);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || `msg-${Date.now()}`,
          senderId: item.sender_id || item.senderId || 'usr-anon',
          senderName: item.sender_name || item.senderName || 'User',
          senderRole: item.sender_role || item.senderRole || 'User',
          receiverId: item.receiver_id || item.receiverId || 'ALL',
          receiverName: item.receiver_name || item.receiverName || 'Recipient',
          ticketId: item.ticket_id || item.ticketId || '',
          ticketType: (item.ticket_type || item.ticketType || undefined) as any,
          message: item.message || '',
          timestamp: item.timestamp || item.created_at || new Date().toISOString(),
          status: item.status || 'Delivered',
          isRead: item.is_read !== undefined ? item.is_read : (item.isRead || false),
          attachmentUrl: item.attachment_url || item.attachmentUrl || '',
          attachmentName: item.attachment_name || item.attachmentName || ''
        }));
      }
    } catch (err) {
      console.warn('Supabase getMessages notice, checking Express proxy:', err);
    }

    // 2. Fallback to Express backend `/api/messages`
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
   * Send a new chat message to Supabase Realtime Database & Express Proxy
   */
  async sendMessage(msg: Partial<ChatMessage>): Promise<ChatMessage | null> {
    const msgId = msg.id || `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

    const payload: ChatMessage = {
      id: msgId,
      senderId: msg.senderId || 'usr-anon',
      senderName: msg.senderName || 'User',
      senderRole: msg.senderRole || 'User',
      receiverId: msg.receiverId || 'ALL',
      receiverName: msg.receiverName || 'Recipient',
      ticketId: msg.ticketId || '',
      ticketType: msg.ticketType,
      message: msg.message || '',
      timestamp: msg.timestamp || nowIso,
      status: 'Delivered',
      isRead: false,
      attachmentUrl: msg.attachmentUrl || '',
      attachmentName: msg.attachmentName || ''
    };

    // 1. Post to Supabase `chat_messages` table for instant multi-device broadcasting!
    try {
      const dbRecord = {
        id: payload.id,
        sender_id: payload.senderId,
        sender_name: payload.senderName,
        sender_role: payload.senderRole,
        receiver_id: payload.receiverId,
        receiver_name: payload.receiverName,
        ticket_id: payload.ticketId,
        ticket_type: payload.ticketType,
        message: payload.message,
        timestamp: payload.timestamp,
        status: payload.status,
        is_read: payload.isRead,
        attachment_url: payload.attachmentUrl,
        attachment_name: payload.attachmentName,
        created_at: nowIso
      };

      const { error } = await supabase.from('chat_messages').insert([dbRecord]);
      if (error) {
        console.warn('Supabase chat_messages insert notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase message push notice:', err);
    }

    // 2. Also post to Express Proxy `/api/messages` for server mirror
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Mirror notice
    }

    return payload;
  },

  /**
   * Mark messages as read between sender and receiver in Supabase & Backend
   */
  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true, status: 'Read' })
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId);
    } catch (e) {
      // ignore
    }

    try {
      await fetch('/api/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId })
      });
    } catch (err) {
      // ignore
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
   * Subscribe to real-time message events via Supabase Realtime Channel
   */
  subscribeToRealtimeMessages(
    onNewMessage: (msg: ChatMessage) => void,
    onStatusChange?: (status: 'Online' | 'Offline') => void
  ): () => void {
    let sseEventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    // 1. Primary: Supabase Realtime Subscription Channel
    const channelName = `realtime_chat_messages_${Date.now()}`;
    const supabaseChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (!isSubscribed) return;
          if (onStatusChange) onStatusChange('Online');

          if (payload.new) {
            const item: any = payload.new;
            const newMsg: ChatMessage = {
              id: item.id || `msg-${Date.now()}`,
              senderId: item.sender_id || item.senderId || 'usr-anon',
              senderName: item.sender_name || item.senderName || 'User',
              senderRole: item.sender_role || item.senderRole || 'User',
              receiverId: item.receiver_id || item.receiverId || 'ALL',
              receiverName: item.receiver_name || item.receiverName || 'Recipient',
              ticketId: item.ticket_id || item.ticketId || '',
              ticketType: (item.ticket_type || item.ticketType || undefined) as any,
              message: item.message || '',
              timestamp: item.timestamp || item.created_at || new Date().toISOString(),
              status: item.status || 'Delivered',
              isRead: item.is_read !== undefined ? item.is_read : (item.isRead || false),
              attachmentUrl: item.attachment_url || item.attachmentUrl || '',
              attachmentName: item.attachment_name || item.attachmentName || ''
            };
            onNewMessage(newMsg);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (onStatusChange) onStatusChange('Online');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (onStatusChange) onStatusChange('Offline');
        }
      });

    // 2. Secondary: Express SSE Stream Backup
    try {
      sseEventSource = new EventSource('/api/messages/stream');
      sseEventSource.onopen = () => {
        if (onStatusChange) onStatusChange('Online');
      };

      sseEventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.id && parsed.message) {
            onNewMessage(parsed as ChatMessage);
          }
        } catch (e) {
          // ignore
        }
      };

      sseEventSource.onerror = () => {
        if (sseEventSource) {
          sseEventSource.close();
          sseEventSource = null;
        }

        // 3. Tertiary: Polling Fallback
        if (!fallbackInterval && isSubscribed) {
          let lastCount = 0;
          fallbackInterval = setInterval(async () => {
            if (!isSubscribed) return;
            try {
              const res = await fetch('/api/messages');
              if (res.ok) {
                const data = await res.json();
                const msgs: ChatMessage[] = data.messages || [];
                if (msgs.length > lastCount) {
                  const newMsgs = msgs.slice(lastCount);
                  newMsgs.forEach(m => onNewMessage(m));
                  lastCount = msgs.length;
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
      // SSE fallback handled
    }

    // Unsubscribe Cleanup
    return () => {
      isSubscribed = false;
      try {
        supabase.removeChannel(supabaseChannel);
      } catch (e) {
        // ignore
      }
      if (sseEventSource) {
        sseEventSource.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }
};
