import { ChatMessage } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Universal database row parser that maps Supabase records from both
 * `messages` and `chat_messages` tables into a standard ChatMessage object.
 */
export function parseDbMessage(item: any): ChatMessage {
  if (!item) {
    return {
      id: `msg-${Date.now()}`,
      senderId: 'usr-anon',
      senderName: 'User',
      senderRole: 'User',
      receiverId: 'ALL',
      receiverName: 'Recipient',
      message: '',
      timestamp: new Date().toISOString(),
      status: 'Delivered',
      isRead: false
    };
  }

  const rawMsg = item.message ?? item.content ?? item.text ?? item.body ?? '';
  const rawSenderId = item.sender_id ?? item.senderId ?? item.user_id ?? item.author_id ?? item.sender ?? 'usr-anon';
  const rawReceiverId = item.receiver_id ?? item.receiverId ?? item.recipient_id ?? item.channel_id ?? item.channel ?? item.to ?? 'ALL';
  const rawSenderName = item.sender_name ?? item.senderName ?? item.user_name ?? item.author_name ?? item.name ?? 'User';
  const rawReceiverName = item.receiver_name ?? item.receiverName ?? item.recipient_name ?? (rawReceiverId === 'ALL' ? 'Broadcast Channel (All FTs)' : 'Recipient');
  const rawTimestamp = item.timestamp ?? item.created_at ?? item.createdAt ?? new Date().toISOString();
  const rawTicketId = item.ticket_id ?? item.ticketId ?? '';
  const rawTicketType = item.ticket_type ?? item.ticketType ?? undefined;
  const rawStatus = item.status ?? 'Delivered';
  const rawIsRead = item.is_read !== undefined ? Boolean(item.is_read) : (item.isRead !== undefined ? Boolean(item.isRead) : false);
  const rawAttachmentUrl = item.attachment_url ?? item.attachmentUrl ?? item.media_url ?? '';
  const rawAttachmentName = item.attachment_name ?? item.attachmentName ?? '';

  return {
    id: String(item.id || `msg-${Date.now()}`),
    senderId: String(rawSenderId),
    senderName: String(rawSenderName),
    senderRole: item.sender_role ?? item.senderRole ?? 'User',
    receiverId: String(rawReceiverId),
    receiverName: String(rawReceiverName),
    ticketId: String(rawTicketId),
    ticketType: rawTicketType as any,
    message: String(rawMsg),
    timestamp: String(rawTimestamp),
    status: rawStatus,
    isRead: rawIsRead,
    seenAt: item.seen_at ?? item.seenAt,
    attachmentUrl: String(rawAttachmentUrl),
    attachmentName: String(rawAttachmentName),
    reactions: item.reactions || undefined
  };
}

export const chatService = {
  /**
   * Fetch historical messages from Supabase Realtime Database (messages / chat_messages) or Local Proxy
   */
  async getMessages(senderId?: string, receiverId?: string, ticketId?: string): Promise<ChatMessage[]> {
    // 1. Try fetching from Supabase `messages` table first
    try {
      let query = supabase.from('messages').select('*');

      if (ticketId) {
        query = query.eq('ticket_id', ticketId);
      } else if (receiverId === 'ALL') {
        query = query.or(`receiver_id.eq.ALL,receiver_id.is.null,receiver_id.eq.`);
      } else if (receiverId && receiverId.startsWith('CHANNEL_')) {
        query = query.or(`receiver_id.eq.${receiverId},receiver_id.eq.ALL,receiver_id.is.null`);
      } else if (senderId && receiverId) {
        query = query.or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId}),receiver_id.eq.ALL,receiver_id.is.null`);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(parseDbMessage);
      }
    } catch (err) {
      // ignore & try chat_messages table
    }

    // 2. Fallback to Supabase `chat_messages` table
    try {
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
        return data.map(parseDbMessage);
      }
    } catch (err) {
      console.warn('Supabase getMessages fallback notice:', err);
    }

    // 3. Fallback to Express backend `/api/messages`
    try {
      const params = new URLSearchParams();
      if (senderId) params.append('senderId', senderId);
      if (receiverId) params.append('receiverId', receiverId);
      if (ticketId) params.append('ticketId', ticketId);

      const res = await fetch(`/api/messages?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      return (data.messages || []).map(parseDbMessage);
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
      receiverName: msg.receiverName || (msg.receiverId === 'ALL' ? 'Broadcast Channel (All FTs)' : 'Recipient'),
      ticketId: msg.ticketId || '',
      ticketType: msg.ticketType,
      message: msg.message || '',
      timestamp: msg.timestamp || nowIso,
      status: 'Delivered',
      isRead: false,
      attachmentUrl: msg.attachmentUrl || '',
      attachmentName: msg.attachmentName || ''
    };

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
      content: payload.message,
      timestamp: payload.timestamp,
      status: payload.status,
      is_read: payload.isRead,
      attachment_url: payload.attachmentUrl,
      attachment_name: payload.attachmentName,
      created_at: nowIso
    };

    // 1. Post to Supabase `messages` table for instant realtime broadcasting
    try {
      const { error: msgErr } = await supabase.from('messages').insert([dbRecord]);
      if (msgErr) {
        // Try fallback to `chat_messages` table
        await supabase.from('chat_messages').insert([dbRecord]);
      }
    } catch (err) {
      console.warn('Supabase message push notice:', err);
    }

    // 2. Broadcast immediately over Supabase Realtime Channel for instant client sync
    try {
      const broadcastChannel = supabase.channel('chat_realtime_broadcast');
      await broadcastChannel.send({
        type: 'broadcast',
        event: 'INSERT',
        payload: dbRecord
      });
    } catch (e) {
      // ignore
    }

    // 3. Post to Express Proxy `/api/messages` for server mirror
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
        .from('messages')
        .update({ is_read: true, status: 'Read' })
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId);
    } catch (e) {
      // ignore
    }

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
      return parseDbMessage(data.message);
    } catch (err) {
      console.warn('Reaction error:', err);
      return null;
    }
  },

  /**
   * Subscribe to real-time message events via Supabase Realtime Channel
   * Listens for all INSERT and UPDATE postgres_changes on the `messages` table,
   * plus `chat_messages` and Realtime broadcast events.
   */
  subscribeToRealtimeMessages(
    onNewMessage: (msg: ChatMessage) => void,
    onStatusChange?: (status: 'Online' | 'Offline') => void
  ): () => void {
    let sseEventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    // 1. Primary: Supabase Realtime Subscription Channel
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const channelName = `realtime_messages_${uniqueId}`;
    let supabaseChannel: any = null;

    try {
      supabaseChannel = supabase
        .channel(channelName, {
          config: {
            broadcast: { self: true }
          }
        })
        // A. Listen to all INSERT events on `messages` table
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            if (!isSubscribed) return;
            if (onStatusChange) onStatusChange('Online');
            if (payload.new) {
              onNewMessage(parseDbMessage(payload.new));
            }
          }
        )
        // B. Listen to all UPDATE events on `messages` table (read receipts, status updates)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          (payload) => {
            if (!isSubscribed) return;
            if (onStatusChange) onStatusChange('Online');
            if (payload.new) {
              onNewMessage(parseDbMessage(payload.new));
            }
          }
        )
        // C. Listen to all wildcard events on `messages` table
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          (payload) => {
            if (!isSubscribed) return;
            if (onStatusChange) onStatusChange('Online');
            if (payload.new) {
              onNewMessage(parseDbMessage(payload.new));
            }
          }
        )
        // D. Dual Table Support: Listen to all INSERT & changes on `chat_messages` table
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload) => {
            if (!isSubscribed) return;
            if (onStatusChange) onStatusChange('Online');
            if (payload.new) {
              onNewMessage(parseDbMessage(payload.new));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
          (payload) => {
            if (!isSubscribed) return;
            if (onStatusChange) onStatusChange('Online');
            if (payload.new) {
              onNewMessage(parseDbMessage(payload.new));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_messages' },
          (payload) => {
            if (!isSubscribed) return;
            if (onStatusChange) onStatusChange('Online');
            if (payload.new) {
              onNewMessage(parseDbMessage(payload.new));
            }
          }
        )
        // E. Realtime Broadcast Channel Listener for instant message sync
        .on(
          'broadcast',
          { event: 'INSERT' },
          (payload) => {
            if (!isSubscribed) return;
            if (onStatusChange) onStatusChange('Online');
            if (payload.payload) {
              onNewMessage(parseDbMessage(payload.payload));
            }
          }
        )
        .on(
          'broadcast',
          { event: 'new_message' },
          (payload) => {
            if (!isSubscribed) return;
            if (onStatusChange) onStatusChange('Online');
            if (payload.payload) {
              onNewMessage(parseDbMessage(payload.payload));
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
    } catch (err) {
      console.warn('Supabase channel subscription error:', err);
    }

    // 2. Secondary: Express SSE Stream Backup
    try {
      sseEventSource = new EventSource('/api/messages/stream');
      sseEventSource.onopen = () => {
        if (onStatusChange) onStatusChange('Online');
      };

      sseEventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && (parsed.id || parsed.message || parsed.content)) {
            onNewMessage(parseDbMessage(parsed));
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
                const msgs: ChatMessage[] = (data.messages || []).map(parseDbMessage);
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
      if (supabaseChannel) {
        try {
          supabaseChannel.unsubscribe();
          supabase.removeChannel(supabaseChannel);
        } catch (e) {
          // ignore
        }
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

