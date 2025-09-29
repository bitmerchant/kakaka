// pages/VipChatPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ViewState, ChatChannel, ChatMessage, ChatUser, ChatRole, ChatReaction, ThemeSettings, NotificationPrefs } from '../types';
import { CHAT_MOCK_CHANNELS, CHAT_MOCK_MESSAGES, CHAT_MOCK_USERS, CHAT_ROLES, KACC_LOGS_MOCK } from '../constants';
import { HashtagIcon, LockClosedIcon, SparklesIcon, UsersIcon, ArrowUpRightIcon, ChatBubbleLeftRightIcon, PinIcon, DotsHorizontalIcon, ArrowDownIcon, PaperAirplaneIcon, ChevronDownIcon, ChevronUpIcon, MenuIcon, XIcon } from '../components/Icons';
import { KairosAvatarDefault, KairosAvatarCoupon, KairosAvatarRoulette, KairosAvatarTrophy, KairosAvatarStore, KairosAvatarGift } from '../components/Icons';
import ChatUserProfileModal from '../components/ChatUserProfileModal';
import AdminPanel from '../components/AdminPanel';

const AVATAR_COMPONENTS_MAP = {
    kairosAvatarDefault: KairosAvatarDefault,
    kairosAvatarCoupon: KairosAvatarCoupon,
    kairosAvatarRoulette: KairosAvatarRoulette,
    kairosAvatarTrophy: KairosAvatarTrophy,
    kairosAvatarStore: KairosAvatarStore,
    kairosAvatarGift: KairosAvatarGift,
};

const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const ROLE_ICONS: Record<string, string> = {
    ceo: '👑',
    admin: '🛡️',
    dev: '🧠',
    mod: '🔧',
    beta: '🧪',
    vip: '🌐',
};


const Message: React.FC<{ 
    message: ChatMessage, 
    author?: ChatUser, 
    role?: ChatRole,
    currentUser: ChatUser,
    onProfileClick: (user: ChatUser) => void,
    onPin: (messageId: string) => void,
    onReact: (messageId: string, emoji: string) => void
}> = ({ message, author, role, currentUser, onProfileClick, onPin, onReact }) => {

    const renderContent = (content: string) => {
        const mentionRegex = /(@\w+)/g;
        const parts = content.split(mentionRegex);
        return parts.map((part, index) => {
            if (mentionRegex.test(part)) {
                const isMe = part.toLowerCase() === `@${currentUser.nickname.toLowerCase()}`;
                return <span key={index} className={`chat-mention ${isMe ? 'chat-mention-me' : ''}`}>{part}</span>;
            }
            return part;
        });
    };

    if (message.type === 'system') {
        const isAlert = message.content.includes('⚠️');
        const isHack = message.content.includes('KAIROS_OS');
        return (
            <div className={`chat-message-system ${isAlert ? 'text-yellow-400 font-semibold' : ''} ${isHack ? 'font-mono text-green-400' : ''}`}>
                {message.content}
            </div>
        );
    }

    if (!author || !role || author.isBanned) return null; // Do not render messages from banned users

    let DisplayAvatarComponent = AVATAR_COMPONENTS_MAP[author.profileIconId || 'kairosAvatarDefault'] || KairosAvatarDefault;

    return (
        <div className="relative flex items-start p-2 rounded-md hover:bg-slate-700/40 transition-colors group">
             <button onClick={() => onProfileClick(author)} className="flex-shrink-0 cursor-pointer">
                <DisplayAvatarComponent className="w-10 h-10 rounded-full mr-4 mt-1" />
            </button>
            <div className="flex-grow">
                <div className="flex items-baseline space-x-2">
                    <button onClick={() => onProfileClick(author)} className="font-semibold cursor-pointer flex items-center" style={{ color: role.color }} title={role.name}>
                        <span className="mr-1.5 text-base" role="img" aria-label={role.name}>{ROLE_ICONS[author.roleId] || '👤'}</span>
                        {author.nickname}
                    </button>
                    <span className="text-xs text-slate-500">{formatTimestamp(message.timestamp)}</span>
                </div>
                <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">{renderContent(message.content)}</div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {message.reactions?.map(reaction => (
                        <button key={reaction.emoji} onClick={() => onReact(message.id, reaction.emoji)} className={`chat-reaction ${reaction.users.includes(currentUser.id) ? 'chat-reaction-reacted' : ''}`}>
                            <span>{reaction.emoji}</span>
                            <span className="text-xs font-semibold ml-1.5">{reaction.count}</span>
                        </button>
                    ))}
                </div>
            </div>
             <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-slate-800 border border-slate-600 rounded-md shadow-lg">
                <button onClick={() => onPin(message.id)} title="Fixar Mensagem" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-l-md"><PinIcon className="w-4 h-4"/></button>
                <button title="Responder" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700"><DotsHorizontalIcon className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

const VipChatPage: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const { user, isAuthenticated, updateUserSettings } = useAuth();
    const [activeChannel, setActiveChannel] = useState<ChatChannel>(CHAT_MOCK_CHANNELS[0]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionSuggestions, setMentionSuggestions] = useState<ChatUser[]>([]);
    const [collapsedRoles, setCollapsedRoles] = useState<Set<string>>(new Set());
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [isChannelsOpen, setIsChannelsOpen] = useState(false);
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    
    // Manage local state for mutable data
    const [chatUsers, setChatUsers] = useState<ChatUser[]>(CHAT_MOCK_USERS);
    const [chatChannels, setChatChannels] = useState<ChatChannel[]>(CHAT_MOCK_CHANNELS);
    const [systemLogs, setSystemLogs] = useState<any[]>(KACC_LOGS_MOCK);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isAtBottomRef = useRef(true);

    const pinnedMessage = messages.find(m => m.isPinned);

    const scrollToBottom = useCallback(() => {
        messagesContainerRef.current?.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, []);
    
    useEffect(() => {
        const sortedMessages = CHAT_MOCK_MESSAGES
            .filter(m => m.channelId === activeChannel.id)
            .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(sortedMessages);
        setShowNewMessagesButton(false);
    }, [activeChannel]);
    
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container) {
            const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
            isAtBottomRef.current = atBottom;
            if (atBottom) {
                setShowNewMessagesButton(false);
            }
        }
    };

    const onlineUsers = chatUsers.filter(u => u.status !== 'offline' && !u.isBanned);
    
    const handleNewMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAt = textBeforeCursor.lastIndexOf('@');

        if (lastAt !== -1) {
            const query = textBeforeCursor.substring(lastAt + 1);
            if (!/\s/.test(query)) {
                setMentionQuery(query);
                const suggestions = onlineUsers.filter(u => 
                    u.nickname.toLowerCase().startsWith(query.toLowerCase()) && 
                    u.id !== user?.id
                );
                setMentionSuggestions(suggestions.slice(0, 5));
            } else {
                setMentionQuery(null);
                setMentionSuggestions([]);
            }
        } else {
            setMentionQuery(null);
            setMentionSuggestions([]);
        }
    };

    const handleMentionSelect = (nickname: string) => {
        if (!textareaRef.current) return;
    
        const textarea = textareaRef.current;
        const value = textarea.value;
        const cursorPos = textarea.selectionStart;
    
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAt = textBeforeCursor.lastIndexOf('@');
    
        if (lastAt === -1) return;
    
        const newValue = 
            value.substring(0, lastAt) + 
            `@${nickname} ` + 
            value.substring(cursorPos);
        
        setNewMessage(newValue);
    
        setMentionQuery(null);
        setMentionSuggestions([]);
    
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = lastAt + nickname.length + 2;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const currentUserForChat: ChatUser = chatUsers.find(u => u.nickname === user?.nickname) || {
        id: user?.id || 'guest_user',
        nickname: user?.nickname || 'Visitante',
        profileIconId: user?.profileIconId || 'kairosAvatarDefault',
        isVip: user?.isVip || false,
        isAdmin: false,
        status: 'online', 
        masteryLevel: user?.kairosMasteryLevel,
        roleId: 'vip',
        bio: `Membro VIP KAIROS.`
    };

    const addSystemMessage = (text: string, channelId: string = activeChannel.id) => {
        const sysMsg: ChatMessage = {
            id: `sys_${Date.now()}`,
            channelId: channelId,
            authorId: 'system',
            content: text,
            timestamp: Date.now(),
            type: 'system'
        };
        // Add to global mock messages to persist across channel switches in this session
        CHAT_MOCK_MESSAGES.push(sysMsg);
        // If it's for the active channel, update the view
        if(channelId === activeChannel.id) {
             setMessages(prev => [...prev, sysMsg]);
             setTimeout(scrollToBottom, 0);
        }
    };
    
    const addLog = (action: string, details: string) => {
        const newLog = {
            id: Date.now(),
            timestamp: Date.now(),
            user: currentUserForChat.nickname,
            action,
            details
        };
        setSystemLogs(prev => [newLog, ...prev]);
    };

    const handleBroadcast = (message: string, type: 'normal' | 'alert' | 'hack') => {
        let prefix = "KAIROS_OS: ";
        if (type === 'alert') prefix = "⚠️ KAIROS_OS: ";
        
        // Broadcast to all channels
        chatChannels.forEach(channel => {
            addSystemMessage(prefix + message, channel.id);
        });
        addLog('Enviou Broadcast', `Tipo: ${type}, Mensagem: ${message.substring(0, 30)}...`);
    };
    
    const handleAddChannel = (name: string, isPrivate: boolean) => {
        const newChannel: ChatChannel = {
            id: `channel_${Date.now()}`,
            name: name.toLowerCase().replace(/\s+/g, '-'),
            description: `Nova sala VIP criada por ${currentUserForChat.nickname}.`,
            isPrivate: isPrivate,
            isLocked: false,
        };
        setChatChannels(prev => [...prev, newChannel]);
        addLog('Criou Sala', `Sala #${newChannel.name} criada.`);
    };


    const handleCommand = (command: string) => {
        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case '/kairos22338933bitmerchant':
                setIsAdminPanelOpen(true);
                addLog('Acessou Painel KACC', `Acesso concedido no canal #${activeChannel.name}`);
                break;
            // other commands can be handled here
            default:
                addSystemMessage(`Comando "${cmd}" não reconhecido.`);
                break;
        }
    };


    const handleSendMessage = () => {
        const content = newMessage.trim();
        if (content === '' || !user || currentUserForChat.isFrozen) return;
        
        if (currentUserForChat.isFrozen) {
            addSystemMessage('❄️ Sua sessão está congelada. Você não pode enviar mensagens.');
            return;
        }

        if (content.startsWith('/')) {
            handleCommand(content);
            setNewMessage('');
            return;
        }

        const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            channelId: activeChannel.id,
            authorId: user.id,
            content: content,
            timestamp: Date.now(),
            type: 'user'
        };

        // Add the new message to the state and the mock data source
        setMessages(prev => [...prev, newMsg]);
        CHAT_MOCK_MESSAGES.push(newMsg);
        setNewMessage('');
        
        // Always scroll to bottom after sending a message for immediate feedback
        setTimeout(() => {
            scrollToBottom();
        }, 0);
    };

    const handlePinMessage = (messageId: string) => {
        setMessages(prev => {
            const targetMessage = prev.find(m => m.id === messageId);
            if (!targetMessage) return prev;
    
            const isCurrentlyPinned = !!targetMessage.isPinned;
            const newPinState = !isCurrentlyPinned;
    
            const updatedMessages = prev.map(m => ({
                ...m,
                isPinned: (m.id === messageId) ? newPinState : false
            }));
    
            let systemMessageContent: string | null = null;
            if (newPinState) {
                systemMessageContent = `📌 ${currentUserForChat.nickname} fixou uma mensagem.`;
            } else {
                systemMessageContent = `📌 ${currentUserForChat.nickname} desafixou uma mensagem.`;
            }
    
            addSystemMessage(systemMessageContent);
    
            return updatedMessages;
        });
    };
    
    const handleReaction = (messageId: string, emoji: string) => {
        if(!user) return;
        setMessages(prev => prev.map(m => {
            if (m.id !== messageId) return m;
            
            const reactions = m.reactions ? [...m.reactions] : [];
            let reaction = reactions.find(r => r.emoji === emoji);
            
            if (reaction) {
                if (reaction.users.includes(user.id)) {
                    reaction.users = reaction.users.filter(uid => uid !== user.id);
                    reaction.count--;
                } else {
                    reaction.users.push(user.id);
                    reaction.count++;
                }
            } else {
                reactions.push({ emoji, count: 1, users: [user.id] });
            }
            
            return { ...m, reactions: reactions.filter(r => r.count > 0) };
        }));
    };
    
    const toggleRoleCollapse = (roleId: string) => {
        setCollapsedRoles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(roleId)) {
                newSet.delete(roleId);
            } else {
                newSet.add(roleId);
            }
            return newSet;
        });
    };

    const handleStartPrivateMessage = (targetUser: ChatUser) => {
        if (!user) return;
        const channelId = `pm_${[user.id, targetUser.id].sort().join('_')}`;

        const existingChannel = chatChannels.find(c => c.id === channelId);

        if (existingChannel) {
            setActiveChannel(existingChannel);
        } else {
            const newChannel: ChatChannel = {
                id: channelId,
                name: `@${targetUser.nickname}`,
                description: `Conversa privada com ${targetUser.nickname}`,
                isPrivate: true,
                isLocked: false,
                isDirectMessage: true,
                participants: [user.id, targetUser.id]
            };
            setChatChannels(prev => [newChannel, ...prev]);
            setActiveChannel(newChannel);
        }
        setSelectedUser(null);
        setIsUsersOpen(false); // Close sidebar on mobile
    };

    if (!isAuthenticated || !user?.isVip) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center bg-slate-900 p-4">
                <LockClosedIcon className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold text-red-400 mb-2">Acesso VIP Requerido</h1>
                <p className="text-slate-300 max-w-md mb-6">O Chat KAIROS é um benefício exclusivo para membros VIP. Adquira o Pacote KAIROS ULTIMATE para se juntar à conversa.</p>
                <button onClick={() => onNavigate('main')} className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-md transition-colors flex items-center gap-2"><ArrowUpRightIcon className="w-5 h-5" />Ver Pacote KAIROS</button>
            </div>
        );
    }

    
    return (
        <>
            <div className="chat-grid bg-slate-800 text-slate-300">
                <div className="chat-servers-column bg-slate-900 p-2 flex flex-col items-center space-y-3"><div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white cursor-pointer" title="KAIROS VIP">KV</div></div>
                <div className={`chat-channels-column bg-slate-800 p-2 flex flex-col ${isChannelsOpen ? 'chat-sidebar-open' : ''}`}>
                    <header className="p-2 font-bold text-lg border-b border-slate-700 mb-2 flex items-center justify-between">
                        <span>Salas VIP</span>
                        <button onClick={() => setIsChannelsOpen(false)} className="chat-mobile-button md:hidden">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        {chatChannels.map(channel => (
                            <button key={channel.id} onClick={() => { setActiveChannel(channel); setIsChannelsOpen(false); }} className={`w-full flex items-center p-2 rounded-md text-left transition-colors ${activeChannel.id === channel.id ? 'bg-sky-500/30 text-white' : 'hover:bg-slate-700'}`}>
                                {channel.isPrivate ? <LockClosedIcon className="w-4 h-4 mr-2 text-slate-400"/> : <HashtagIcon className="w-5 h-5 mr-2 text-slate-400" />}
                                <span className={channel.isLocked ? 'line-through text-slate-500' : ''}>{channel.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <header className="chat-header bg-slate-700/50 p-3 flex items-center justify-between border-b border-slate-700 shadow-md z-10">
                    <div className="flex items-center">
                        <button onClick={() => setIsChannelsOpen(true)} className="chat-mobile-button md:hidden mr-2">
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <HashtagIcon className="w-6 h-6 mr-2 text-slate-400 hidden md:block" />
                        <h2 className="font-semibold text-xl text-white">{activeChannel.name}</h2>
                    </div>
                    <button onClick={() => setIsUsersOpen(true)} className="chat-mobile-button md:hidden">
                        <UsersIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="chat-messages-column bg-slate-900 flex flex-col overflow-hidden relative">
                    {(isChannelsOpen || isUsersOpen) && (
                        <div
                            className="chat-backdrop md:hidden"
                            onClick={() => {
                                setIsChannelsOpen(false);
                                setIsUsersOpen(false);
                            }}
                        ></div>
                    )}
                    {pinnedMessage && (
                        <div className="chat-pinned-bar p-2 flex items-center text-sm text-amber-200 cursor-pointer flex-shrink-0">
                           <PinIcon className="w-4 h-4 mr-2 text-amber-300" />
                           <span className="font-semibold mr-1">Fixado:</span>
                           <span className="truncate">{chatUsers.find(u => u.id === pinnedMessage.authorId)?.nickname}: {pinnedMessage.content}</span>
                        </div>
                    )}
                    <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                        {messages.map((msg, index) => {
                             const author = chatUsers.find(u => u.id === msg.authorId);
                             const role = author ? CHAT_ROLES.find(r => r.id === author.roleId) : undefined;

                            const prevMessage = messages[index-1];
                            const addSeparator = index > 0 && 
                                                 msg.type === 'user' && 
                                                 (prevMessage.type === 'system' || prevMessage.authorId !== msg.authorId);

                            return (
                                <React.Fragment key={msg.id}>
                                    {addSeparator && <div className="chat-message-separator" />}
                                    <Message message={msg} author={author} role={role} currentUser={currentUserForChat} onProfileClick={setSelectedUser} onPin={handlePinMessage} onReact={handleReaction} />
                                </React.Fragment>
                            );
                        })}
                    </div>
                     {showNewMessagesButton && (
                        <button onClick={scrollToBottom} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg animate-bounce flex items-center gap-2"><ArrowDownIcon className="w-4 h-4"/> Novas Mensagens</button>
                    )}
                </main>
                <div className="chat-input-column bg-slate-700/50 p-4 border-t border-slate-700">
                    <div className="relative">
                        {mentionQuery !== null && mentionSuggestions.length > 0 && (
                            <div className="chat-mention-suggestion-box custom-scrollbar absolute bottom-full mb-2 w-full max-w-sm bg-slate-900 border border-slate-600 rounded-lg shadow-lg p-2 z-20">
                                <p className="text-xs text-slate-400 px-2 pb-1 font-semibold">Mencionar usuário</p>
                                <ul>
                                    {mentionSuggestions.map(u => {
                                        const role = CHAT_ROLES.find(r => r.id === u.roleId);
                                        let DisplayAvatarComponent = AVATAR_COMPONENTS_MAP[u.profileIconId || 'kairosAvatarDefault'] || KairosAvatarDefault;
                                        return (
                                            <li key={u.id}>
                                                <button onClick={() => handleMentionSelect(u.nickname)} className="w-full flex items-center p-2 rounded-md hover:bg-sky-500/20 text-left">
                                                    <DisplayAvatarComponent className="w-6 h-6 rounded-full mr-2" />
                                                    <span className="text-sm font-medium" style={{ color: role?.color }}>{u.nickname}</span>
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}
                        <div className="bg-slate-600 rounded-lg flex items-center pr-2">
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={handleNewMessageChange}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={activeChannel.isLocked ? "Esta sala está trancada." : `Escreva sua mensagem em #${activeChannel.name}...`}
                                className="w-full bg-transparent p-3 text-sm text-slate-200 placeholder-slate-400 resize-none focus:outline-none disabled:bg-slate-700"
                                rows={1}
                                disabled={activeChannel.isLocked || currentUserForChat.isFrozen}
                            />
                            <button onClick={handleSendMessage} className="text-sky-400 hover:text-sky-300 disabled:text-slate-500 p-2" disabled={!newMessage.trim() || activeChannel.isLocked || currentUserForChat.isFrozen}><PaperAirplaneIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
                <aside className={`chat-users-column bg-slate-800 p-3 overflow-y-auto custom-scrollbar ${isUsersOpen ? 'chat-sidebar-open' : ''}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700 md:hidden">
                        <h3 className="text-lg font-bold text-white">Membros Online</h3>
                        <button onClick={() => setIsUsersOpen(false)} className="chat-mobile-button">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    {CHAT_ROLES.map(role => {
                        const usersInRole = onlineUsers.filter(u => u.roleId === role.id);
                        if (usersInRole.length === 0) return null;
                        const isCollapsed = collapsedRoles.has(role.id);

                        return (
                            <div key={role.id} className="mb-2 mt-2">
                                <button onClick={() => toggleRoleCollapse(role.id)} className="w-full flex justify-between items-center p-1 rounded-md hover:bg-slate-700/50 transition-colors">
                                    <h3 className="text-sm font-bold uppercase text-slate-400">{role.name} — {usersInRole.length}</h3>
                                    {isCollapsed ? <ChevronDownIcon className="w-4 h-4 text-slate-500" /> : <ChevronUpIcon className="w-4 h-4 text-slate-500" />}
                                </button>
                                {!isCollapsed && (
                                    <div className="space-y-2 pt-2">
                                        {usersInRole.map(chatUser => {
                                            let DisplayAvatarComponent = AVATAR_COMPONENTS_MAP[chatUser.profileIconId || 'kairosAvatarDefault'] || KairosAvatarDefault;
                                            return (
                                                <button key={chatUser.id} onClick={() => { setSelectedUser(chatUser); setIsUsersOpen(false); }} className="w-full flex items-center p-1.5 rounded-md hover:bg-slate-700 cursor-pointer text-left">
                                                    <div className="relative mr-3">
                                                        <DisplayAvatarComponent className="w-8 h-8 rounded-full" />
                                                        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-800 ${chatUser.status === 'online' ? 'bg-green-400' : (chatUser.status === 'away' ? 'bg-amber-400' : (chatUser.status === 'stealth' ? 'bg-purple-500' : 'bg-red-500'))}`}></span>
                                                    </div>
                                                    <span className={`font-medium text-sm ${chatUser.isFrozen ? 'line-through text-slate-500' : ''}`} style={{ color: role?.color }}>{chatUser.nickname}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </aside>
            </div>
            {isAdminPanelOpen && (
              <AdminPanel 
                isOpen={isAdminPanelOpen}
                onClose={() => setIsAdminPanelOpen(false)}
                adminUser={currentUserForChat}
                users={chatUsers}
                channels={chatChannels}
                logs={systemLogs}
                onBroadcast={handleBroadcast}
                onUpdateUser={(userId, updates) => setChatUsers(prev => prev.map(u => u.id === userId ? {...u, ...updates} : u))}
                onUpdateChannel={(channelId, updates) => setChatChannels(prev => prev.map(c => c.id === channelId ? {...c, ...updates} : c))}
                onAddChannel={handleAddChannel}
                onAddLog={addLog}
                updateUserSettings={updateUserSettings}
              />
            )}
            <ChatUserProfileModal user={selectedUser} currentUser={currentUserForChat} isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} onStartPrivateMessage={handleStartPrivateMessage} />
        </>
    );
};

export default VipChatPage;