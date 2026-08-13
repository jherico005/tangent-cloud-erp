import React, { useState, useEffect, useRef } from 'react';
import { AppUser, ChatMessage, ChatContact, ServiceRequest, EFSRRecord } from '../../types';
import { chatService } from '../../services/chatService';
import { ACCOUNT_CHANNELS_LIST, playTeamsNotificationSound, AccountChannelItem } from '../../data/accountChannels';
import { 
  MessageSquare, 
  X, 
  Send, 
  Paperclip, 
  Check, 
  CheckCheck, 
  Clock, 
  Radio, 
  Search, 
  FileText, 
  Smartphone, 
  Shield, 
  Filter, 
  Sparkles, 
  ChevronDown,
  Star,
  Smile,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';
import { TangentLogo } from '../common/TangentLogo';

interface RightSideChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  users: AppUser[];
  serviceRequests?: ServiceRequest[];
  efsrRecords?: EFSRRecord[];
}

const DEFAULT_USER_AVATARS: Record<string, string> = {
  'usr-001': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'usr-002': 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'usr-003': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'usr-004': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'user-001': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'user-002': 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'user-003': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'user-004': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
};

const getAvatarForUser = (userId?: string, name?: string, customAvatar?: string) => {
  if (customAvatar && customAvatar.trim()) return customAvatar;
  if (userId && DEFAULT_USER_AVATARS[userId]) return DEFAULT_USER_AVATARS[userId];
  const safeName = name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=1b497d&color=ffffff&bold=true`;
};

const formatMessageTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoString;
  }
};

const formatMessageFullDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    const datePart = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} • ${timePart}`;
  } catch (e) {
    return isoString;
  }
};

const getMessageDateHeader = (isoString: string) => {
  try {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today, ' + d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    return isoString;
  }
};

export const RightSideChatPanel: React.FC<RightSideChatPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  serviceRequests = [],
  efsrRecords = []
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact>({
    id: 'ALL',
    name: 'Broadcast Channel (All FTs)',
    role: 'Broadcast',
    status: 'Online',
    unreadCount: 0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [starredContactIds, setStarredContactIds] = useState<string[]>(['usr-004']);
  const [contactSearch, setContactSearch] = useState('');
  
  const [inputMessage, setInputMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [selectedTicketType, setSelectedTicketType] = useState<'eFSR' | 'SRN' | 'Merchant'>('SRN');
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  
  const [isOnline, setIsOnline] = useState(true);
  const [activeTicketFilter, setActiveTicketFilter] = useState<string>('ALL');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showReactionPickerForId, setShowReactionPickerForId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['👍', '❤️', '😂', '😮', '📁', '🎉', '👏', '🙏'];

  const isAdminOrDispatcher = 
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'super-admin' ||
    currentUser.role === 'Department Admin' ||
    currentUser.role === 'department-admin' ||
    currentUser.role === 'dispatcher';

  const fieldTechs = users.filter(u => 
    (u.role === 'Field Technician' || u.role === 'field-technician') &&
    (u.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
     u.employeeCode.toLowerCase().includes(contactSearch.toLowerCase()) ||
     u.department.toLowerCase().includes(contactSearch.toLowerCase()))
  );

  const toggleStarContact = (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredContactIds(prev => 
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      let history: ChatMessage[] = [];
      if (selectedContact.id === 'ALL') {
        history = await chatService.getMessages(undefined, 'ALL');
      } else {
        history = await chatService.getMessages(currentUser.id, selectedContact.id);
      }
      
      if (isMounted) {
        setMessages(history);
        chatService.markAsRead(selectedContact.id, currentUser.id);
      }
    };

    fetchHistory();

    const unsubscribe = chatService.subscribeToRealtimeMessages(
      (newMsg) => {
        if (!isMounted) return;
        if (newMsg.senderId !== currentUser.id) {
          playTeamsNotificationSound();
        }
        setMessages(prev => {
          const index = prev.findIndex(m => m.id === newMsg.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = newMsg;
            return updated;
          }

          const isRelevant = 
            newMsg.receiverId === 'ALL' ||
            (selectedContact.id.startsWith('CHANNEL_') && newMsg.receiverId === selectedContact.id) ||
            (newMsg.senderId === currentUser.id && newMsg.receiverId === selectedContact.id) ||
            (newMsg.senderId === selectedContact.id && newMsg.receiverId === currentUser.id) ||
            (newMsg.receiverId === currentUser.id);

          if (isRelevant) {
            return [...prev, newMsg];
          }
          return prev;
        });
      },
      (status) => {
        if (isMounted) setIsOnline(status === 'Online');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [selectedContact.id, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !attachment) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    const newMsg: Partial<ChatMessage> = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: selectedContact.id,
      receiverName: selectedContact.name,
      ticketId: selectedTicketId,
      ticketType: selectedTicketType,
      message: messageText,
      timestamp: new Date().toISOString(),
      status: 'Sending',
      isRead: false,
      attachmentUrl: attachment?.url || '',
      attachmentName: attachment?.name || ''
    };

    setMessages(prev => [...prev, newMsg as ChatMessage]);
    setAttachment(null);

    const sent = await chatService.sendMessage(newMsg);
    if (sent) {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'Delivered' } : m));

      // Auto-reply for Account Channels if FT or user posts a concern
      if (selectedContact.id.startsWith('CHANNEL_')) {
        const channelInfo = ACCOUNT_CHANNELS_LIST.find(c => c.id === selectedContact.id);
        if (channelInfo) {
          setTimeout(async () => {
            const replyMsg: Partial<ChatMessage> = {
              id: `msg-rep-${Date.now()}`,
              senderId: `rep-${channelInfo.code.toLowerCase()}`,
              senderName: channelInfo.csAgents.split(',')[0] || `${channelInfo.code} Account CS`,
              senderRole: 'Customer Service / Sales',
              receiverId: selectedContact.id,
              receiverName: selectedContact.name,
              ticketId: selectedTicketId,
              ticketType: selectedTicketType,
              message: `Received your inquiry regarding ${channelInfo.name}. Our assigned Sales Lead (${channelInfo.salesReps.split(',')[0]}) & CS Desk have logged this concern. Standing by to assist you!`,
              timestamp: new Date().toISOString(),
              status: 'Delivered',
              isRead: false
            };
            await chatService.sendMessage(replyMsg);
            playTeamsNotificationSound();
          }, 1200);
        }
      }
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    setShowReactionPickerForId(null);
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const currentReactions = { ...(m.reactions || {}) };
        const usersForEmoji = currentReactions[emoji] ? [...currentReactions[emoji]] : [];
        if (usersForEmoji.includes(currentUser.name)) {
          currentReactions[emoji] = usersForEmoji.filter(u => u !== currentUser.name);
          if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = [...usersForEmoji, currentUser.name];
        }
        return { ...m, reactions: currentReactions };
      }
      return m;
    }));

    await chatService.toggleReaction(messageId, emoji, currentUser.name);
  };

  const cannedResponses = isAdminOrDispatcher ? [
    'Please confirm terminal serial number 🔍',
    'SRN Approved for completion ✅',
    'Urgent dispatch update requested ⚡',
    'eFSR correction needed ⚠️',
    'Contact merchant manager on site 📞'
  ] : [
    'En route to merchant site 🚗',
    'Arrived on site at merchant 📍',
    'Signal verified 4 bars 📶',
    'eFSR submitted with signature 📄',
    'Terminal installed & tested OK 👌'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({ url: reader.result as string, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const displayedMessages = messages.filter(m => {
    if (activeTicketFilter === 'ALL') return true;
    return m.ticketId === activeTicketFilter;
  });

  const starredFTs = fieldTechs.filter(ft => starredContactIds.includes(ft.id));
  const regularFTs = fieldTechs.filter(ft => !starredContactIds.includes(ft.id));

  const isDark = theme === 'dark';

  return (
    <aside 
      className={`fixed right-0 top-0 h-full w-full sm:w-[450px] lg:w-[480px] xl:w-[500px] shadow-2xl border-l z-50 flex flex-col transition-transform duration-300 ease-in-out font-sans ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
    >
      {/* 1. Header Bar with Recipient Avatar */}
      <div className={`p-3.5 flex items-center justify-between shadow-md border-b ${
        isDark ? 'bg-[#1b497d] border-[#143962] text-white' : 'bg-[#1b497d] border-[#143962] text-white'
      }`}>
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="relative flex-shrink-0">
            <img 
              src={getAvatarForUser(selectedContact.id, selectedContact.name, selectedContact.avatar)} 
              alt={selectedContact.name} 
              className="w-9 h-9 rounded-full object-cover border border-cyan-400/60 shadow-md flex-shrink-0"
            />
            <span 
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1b497d] ${
                isOnline ? 'bg-emerald-400' : 'bg-slate-400'
              }`}
              title={isOnline ? 'Real-time Live SSE Connected' : 'Connecting / Polling Fallback'}
            />
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center space-x-1.5">
              <h3 className="font-extrabold text-xs tracking-tight truncate text-white">
                {selectedContact.name}
              </h3>
            </div>
            <p className="text-[10px] text-cyan-200 flex items-center gap-1 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isOnline ? 'Real-time Direct Sync' : 'Polling Sync'}</span>
              <span className="text-cyan-400/60">•</span>
              <span className="truncate">{currentUser.role}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-1.5 text-cyan-200 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
            title={isDark ? 'Switch Light Theme' : 'Switch Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-200" />}
          </button>

          <button 
            onClick={() => setShowContactPicker(!showContactPicker)}
            title="Switch Channel or Field Technician"
            className="p-1.5 text-cyan-200 hover:text-white hover:bg-white/10 rounded transition cursor-pointer flex items-center space-x-1"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
            title="Collapse Chat Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Account Representative Banner if an Account Channel is selected */}
      {selectedContact.id.startsWith('CHANNEL_') && (() => {
        const channel = ACCOUNT_CHANNELS_LIST.find(c => c.id === selectedContact.id);
        if (!channel) return null;
        return (
          <div className="bg-sky-950 border-b border-sky-800/60 p-2 px-3 text-[11px] text-sky-100 flex flex-col gap-0.5">
            <div className="flex items-center justify-between font-bold text-cyan-300 text-[10px]">
              <span className="uppercase tracking-wider flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${channel.badgeBg}`} />
                {channel.name} Representatives
              </span>
              <span className="bg-sky-900/80 px-1.5 py-0.2 text-[9px] rounded text-sky-200 border border-sky-700">Official Account Channel</span>
            </div>
            <div className="text-[10px] text-slate-200">
              <span className="font-semibold text-amber-300">💼 Sales Leads:</span> {channel.salesReps}
            </div>
            <div className="text-[10px] text-slate-200">
              <span className="font-semibold text-emerald-300">🎧 CS & Helpdesk:</span> {channel.csAgents}
            </div>
          </div>
        );
      })()}

      {/* 2. Contact & Channel Selector Drawer Dropdown */}
      {showContactPicker && (
        <div className="bg-slate-900 text-white p-3 border-b border-slate-700 space-y-2 text-xs z-10 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Chat Recipient / Channel</span>
            <button onClick={() => setShowContactPicker(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search channel name, FT code, dept..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white pl-8 pr-2 py-1 text-xs rounded focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Account Group Channels Section */}
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <div className="text-[10px] font-extrabold text-cyan-400 uppercase flex items-center gap-1">
              <span>🏢 Account Channels ({ACCOUNT_CHANNELS_LIST.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
              {ACCOUNT_CHANNELS_LIST.filter(c => 
                c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                c.code.toLowerCase().includes(contactSearch.toLowerCase()) ||
                c.salesReps.toLowerCase().includes(contactSearch.toLowerCase()) ||
                c.csAgents.toLowerCase().includes(contactSearch.toLowerCase())
              ).map(channel => (
                <button
                  key={channel.id}
                  onClick={() => {
                    setSelectedContact({
                      id: channel.id,
                      name: channel.name,
                      role: 'Account Group Channel',
                      status: 'Online',
                      unreadCount: 0
                    });
                    setShowContactPicker(false);
                  }}
                  className={`w-full p-2 rounded text-left transition flex items-center justify-between cursor-pointer ${
                    selectedContact.id === channel.id ? 'bg-[#1b497d] text-cyan-200 font-bold border border-cyan-400/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className={`px-1.5 py-0.5 text-[9px] font-black text-white rounded ${channel.badgeBg}`}>
                      {channel.code}
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold truncate">{channel.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">CS/Sales: {channel.salesReps.split(',')[0]}</div>
                    </div>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-800">Active</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedContact({
                id: 'ALL',
                name: 'Broadcast Channel (All FTs)',
                role: 'Broadcast',
                status: 'Online',
                unreadCount: 0,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              });
              setShowContactPicker(false);
            }}
            className={`w-full p-2 rounded text-left transition flex items-center justify-between cursor-pointer ${
              selectedContact.id === 'ALL' ? 'bg-[#1b497d] text-cyan-200 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs">📢 All Field Technicians (Broadcast)</div>
                <div className="text-[10px] text-slate-400 font-normal">Public dispatch announcement channel</div>
              </div>
            </div>
          </button>

          {starredFTs.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Starred Conversations ({starredFTs.length})</span>
              </div>
              {starredFTs.map(ft => (
                <button
                  key={ft.id}
                  onClick={() => {
                    setSelectedContact({
                      id: ft.id,
                      name: ft.name,
                      role: ft.role,
                      employeeCode: ft.employeeCode,
                      status: 'Online',
                      unreadCount: 0,
                      avatar: ft.avatar
                    });
                    setShowContactPicker(false);
                  }}
                  className={`w-full p-2 rounded text-left transition flex items-center justify-between ${
                    selectedContact.id === ft.id ? 'bg-[#1b497d] text-cyan-200 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <img 
                      src={getAvatarForUser(ft.id, ft.name, ft.avatar)} 
                      alt={ft.name} 
                      className="w-6 h-6 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                      <div className="text-xs">{ft.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{ft.employeeCode} • {ft.department}</div>
                    </div>
                  </div>
                  <button onClick={(e) => toggleStarContact(ft.id, e)} className="text-amber-400 hover:text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </button>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1 pt-1 max-h-48 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Field Technicians ({regularFTs.length})</div>
            {regularFTs.map(ft => (
              <button
                key={ft.id}
                onClick={() => {
                  setSelectedContact({
                    id: ft.id,
                    name: ft.name,
                    role: ft.role,
                    employeeCode: ft.employeeCode,
                    status: 'Online',
                    unreadCount: 0,
                    avatar: ft.avatar
                  });
                  setShowContactPicker(false);
                }}
                className={`w-full p-2 rounded text-left transition flex items-center justify-between ${
                  selectedContact.id === ft.id ? 'bg-[#1b497d] text-cyan-200 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <img 
                    src={getAvatarForUser(ft.id, ft.name, ft.avatar)} 
                    alt={ft.name} 
                    className="w-6 h-6 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <div className="text-xs">{ft.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{ft.employeeCode} • {ft.department}</div>
                  </div>
                </div>
                <button onClick={(e) => toggleStarContact(ft.id, e)} className="text-slate-500 hover:text-amber-400">
                  <Star className="w-3.5 h-3.5" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Ticket Link / Quick Filter Bar */}
      <div className={`px-3 py-1.5 border-b flex items-center justify-between text-[11px] ${
        isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex items-center space-x-1.5 font-medium overflow-x-auto">
          <Filter className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="text-[10px] font-bold text-slate-400 uppercase flex-shrink-0">Ticket Filter:</span>
          
          <button
            onClick={() => setActiveTicketFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex-shrink-0 ${
              activeTicketFilter === 'ALL' ? 'bg-[#1b497d] text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            All
          </button>

          {Array.from(new Set(messages.map(m => m.ticketId).filter(Boolean))).map(tId => (
            <button
              key={tId}
              onClick={() => setActiveTicketFilter(tId!)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition flex-shrink-0 ${
                activeTicketFilter === tId ? 'bg-[#1b497d] text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              #{tId}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chat Body / Message History */}
      <div className={`flex-1 overflow-y-auto p-3 space-y-3 text-xs ${
        isDark ? 'bg-slate-950' : 'bg-slate-100'
      }`}>
        {displayedMessages.map((msg, index) => {
          const isSelf = msg.senderId === currentUser.id;
          const isBroadcast = msg.receiverId === 'ALL' || (msg.message && msg.message.toUpperCase().includes('ANNOUNCEMENT'));
          
          // Daily Date Separator Logic
          const prevMsg = index > 0 ? displayedMessages[index - 1] : null;
          const currentDateHeader = getMessageDateHeader(msg.timestamp);
          const prevDateHeader = prevMsg ? getMessageDateHeader(prevMsg.timestamp) : null;
          const showDateHeader = currentDateHeader !== prevDateHeader;

          const senderAvatar = getAvatarForUser(
            msg.senderId, 
            msg.senderName, 
            isSelf ? currentUser.avatar : (selectedContact.avatar || DEFAULT_USER_AVATARS[msg.senderId])
          );

          if (isBroadcast && !isSelf) {
            return (
              <React.Fragment key={msg.id}>
                {showDateHeader && (
                  <div className="flex items-center justify-center my-3">
                    <div className="bg-slate-800 text-cyan-300 dark:bg-slate-800 dark:text-cyan-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-slate-700 shadow-xs flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>{currentDateHeader}</span>
                    </div>
                  </div>
                )}
                <div className={`my-2 p-3 rounded-lg text-xs space-y-1.5 border shadow-xs ${
                  isDark 
                    ? 'bg-red-950/40 border-red-500/50 text-red-400' 
                    : 'bg-red-50 border-red-300 text-red-600'
                }`}>
                  <div className={`flex items-center justify-between font-extrabold text-[11px] border-b pb-1 ${
                    isDark ? 'border-red-500/30 text-red-400' : 'border-red-200 text-red-700'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>{msg.senderName} ({msg.senderRole || 'Dept Admin'})</span>
                    </span>
                    <span className={`font-mono text-[9px] ${isDark ? 'text-red-400/80' : 'text-red-600/80'}`}>
                      {formatMessageFullDate(msg.timestamp)}
                    </span>
                  </div>
                  <p className="font-extrabold text-red-600 dark:text-red-400 leading-relaxed text-xs">
                    {msg.message}
                  </p>
                </div>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={msg.id}>
              {/* Date Header Divider */}
              {showDateHeader && (
                <div className="flex items-center justify-center my-3">
                  <div className="bg-slate-800 text-cyan-300 dark:bg-slate-800 dark:text-cyan-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-slate-700/80 shadow-xs flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>{currentDateHeader}</span>
                  </div>
                </div>
              )}

              <div 
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => {
                  setHoveredMessageId(null);
                  if (showReactionPickerForId !== msg.id) setShowReactionPickerForId(null);
                }}
                className={`relative group flex gap-2 my-1.5 ${isSelf ? 'flex-row-reverse items-end' : 'flex-row items-end'}`}
              >
                {/* Profile Picture Avatar for Sender and Receiver */}
                <img 
                  src={senderAvatar} 
                  alt={msg.senderName} 
                  className="w-7 h-7 rounded-full object-cover border border-slate-500/60 shadow-xs flex-shrink-0"
                />

                <div className={`flex flex-col max-w-[85%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  {/* Sender Sub-Header with Name & Full Date & Time */}
                  <div className={`text-[10px] font-semibold mb-0.5 px-1 flex items-center gap-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <span className="font-bold">{isSelf ? 'You' : msg.senderName}</span>
                    <span>•</span>
                    <span className="font-mono text-[9px] opacity-80">
                      {formatMessageFullDate(msg.timestamp)}
                    </span>
                  </div>

                  {/* Hover Reaction Toolbar */}
                  {(hoveredMessageId === msg.id || showReactionPickerForId === msg.id) && (
                    <div className={`absolute -top-3 z-20 bg-slate-800/95 backdrop-blur-xs border border-slate-700 rounded-full px-2 py-0.5 shadow-xl flex items-center space-x-1 animate-in fade-in zoom-in-95 duration-150 ${
                      isSelf ? 'right-10' : 'left-10'
                    }`}>
                      {emojis.slice(0, 5).map((emo) => (
                        <button
                          key={emo}
                          onClick={() => handleToggleReaction(msg.id, emo)}
                          className="hover:scale-125 active:scale-150 transition-transform duration-150 text-xs p-1"
                        >
                          {emo}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowReactionPickerForId(showReactionPickerForId === msg.id ? null : msg.id)}
                        className="text-slate-400 hover:text-white p-0.5 text-[10px]"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Message Bubble - Blue Background for Sender (isSelf)! */}
                  <div 
                    className={`rounded-2xl p-3 shadow-xs text-xs space-y-1.5 leading-relaxed relative ${
                      isSelf 
                        ? 'bg-blue-600 text-white rounded-tr-none border border-blue-500 shadow-md' 
                        : isDark 
                          ? 'bg-slate-800 text-white border border-slate-700 rounded-tl-none shadow-xs' 
                          : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {/* Linked Ticket Badge */}
                    {msg.ticketId && (
                      <div className={`p-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 border ${
                        isSelf 
                          ? 'bg-blue-800/60 text-cyan-200 border-blue-400/30' 
                          : isDark ? 'bg-black/20 text-cyan-300 border-cyan-400/20' : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        <FileText className="w-3 h-3 text-cyan-400" />
                        <span>{msg.ticketType || 'TICKET'}: #{msg.ticketId}</span>
                      </div>
                    )}

                    {/* Message Text */}
                    <p className={`whitespace-pre-wrap leading-relaxed ${
                      isSelf ? 'text-white font-medium' : isDark ? 'text-white font-medium' : 'text-slate-900 font-medium'
                    }`}>
                      {msg.message}
                    </p>

                    {/* Attachment Preview */}
                    {msg.attachmentUrl && (
                      <div className="pt-1">
                        {msg.attachmentUrl.startsWith('data:image') ? (
                          <img 
                            src={msg.attachmentUrl} 
                            alt={msg.attachmentName || 'Attachment'} 
                            className="max-h-40 rounded-lg border border-slate-600 object-cover shadow-sm"
                          />
                        ) : (
                          <a 
                            href={msg.attachmentUrl} 
                            download={msg.attachmentName || 'attachment'}
                            className="text-cyan-300 hover:text-cyan-200 font-bold underline text-[10px] flex items-center gap-1 p-1 bg-black/20 rounded"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{msg.attachmentName || 'Download File'}</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Reaction Pills */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {Object.entries(msg.reactions).map(([emo, usersRaw]) => {
                          const usersWhoReacted = (usersRaw || []) as string[];
                          const hasMyReaction = usersWhoReacted.includes(currentUser.name);
                          return (
                            <button
                              key={emo}
                              onClick={() => handleToggleReaction(msg.id, emo)}
                              title={`Reacted by: ${usersWhoReacted.join(', ')}`}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-transform duration-200 hover:scale-110 active:scale-125 ${
                                hasMyReaction
                                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-xs'
                                  : 'bg-black/20 border-slate-600 text-slate-300 hover:bg-black/40'
                              }`}
                            >
                              <span>{emo}</span>
                              <span className="text-[9px]">{usersWhoReacted.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Seen Status & Time Indicator */}
                    {isSelf && (
                      <div className="flex items-center justify-end space-x-1 text-[10px] font-medium text-blue-100 pt-1 border-t border-blue-500/40 mt-1">
                        {msg.status === 'Sending' && (
                          <>
                            <Clock className="w-3 h-3 text-blue-200 animate-spin" />
                            <span>Sending...</span>
                          </>
                        )}
                        {msg.status === 'Sent' && (
                          <>
                            <Check className="w-3 h-3 text-blue-200" />
                            <span>Sent {formatMessageTime(msg.timestamp)}</span>
                          </>
                        )}
                        {msg.status === 'Delivered' && (
                          <>
                            <CheckCheck className="w-3 h-3 text-blue-200" />
                            <span>Delivered</span>
                          </>
                        )}
                        {(msg.status === 'Read' || msg.isRead) && (
                          <span className="flex items-center gap-1 text-cyan-200 font-bold">
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
                            <span>Seen at {formatMessageTime(msg.seenAt || msg.timestamp)}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {displayedMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-400" />
            <p className="font-bold text-slate-300">No message history yet</p>
            <p className="text-[11px] text-slate-400">
              Start chatting with {selectedContact.name} or post a broadcast announcement.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Canned Responses Horizontal Pills */}
      <div className={`p-2 border-t overflow-x-auto flex items-center space-x-1.5 scrollbar-none ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <span className="text-[9px] font-bold text-slate-400 uppercase flex-shrink-0 flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Canned:
        </span>
        {cannedResponses.map((resp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputMessage(prev => prev ? `${prev} ${resp}` : resp)}
            className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition flex-shrink-0 border ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {resp}
          </button>
        ))}
      </div>

      {/* 6. Ticket Link Selector */}
      <div className={`px-3 py-1 border-t flex items-center space-x-2 text-[10px] ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <label className="font-bold text-slate-400 flex-shrink-0">Link Ticket:</label>
        <select
          value={selectedTicketId}
          onChange={(e) => {
            setSelectedTicketId(e.target.value);
            if (e.target.value.startsWith('FSR')) setSelectedTicketType('eFSR');
            else setSelectedTicketType('SRN');
          }}
          className={`border rounded px-2 py-0.5 text-[10px] font-mono flex-1 focus:outline-none ${
            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <option value="">-- Optional Ticket Link --</option>
          <optgroup label="Active SRNs">
            {serviceRequests.slice(0, 5).map(sr => (
              <option key={sr.id} value={sr.srn}>SRN #{sr.srn} - {sr.merchantName}</option>
            ))}
          </optgroup>
          <optgroup label="eFSR Reports">
            {efsrRecords.slice(0, 5).map(ef => (
              <option key={ef.id} value={ef.efsrNumber}>eFSR #{ef.efsrNumber} - {ef.merchantName}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Attachment Preview */}
      {attachment && (
        <div className="bg-cyan-950 p-2 border-t border-cyan-800 flex items-center justify-between text-xs text-cyan-200 font-bold">
          <div className="flex items-center space-x-1.5 truncate">
            <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">{attachment.name}</span>
          </div>
          <button onClick={() => setAttachment(null)} className="p-0.5 text-cyan-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 7. Bottom Input Bar */}
      <form onSubmit={handleSendMessage} className={`p-2.5 border-t flex items-center space-x-2 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf,.doc,.docx"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach File or Image"
          className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg transition"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${selectedContact.name}...`}
          className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none ${
            isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-300 text-slate-800'
          }`}
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() && !attachment}
          className="p-2 bg-[#1b497d] hover:bg-[#163c68] disabled:bg-slate-700 text-white rounded-lg transition flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
