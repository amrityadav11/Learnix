import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, Send, Search, User, Phone, Video, MoreVertical } from 'lucide-react';
import { fetchConversations, sendMessage } from '../../redux/slices/messageSlice';
import LoadingScreen from '../../components/common/LoadingScreen';

const MessagesPage = () => {
    const dispatch = useDispatch();
    const { conversations, activeConversation, messages, loading } = useSelector((state) => state.messages || {
        conversations: [],
        activeConversation: null,
        messages: [],
        loading: false
    });

    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && selectedConversation) {
            dispatch(sendMessage({
                conversationId: selectedConversation._id,
                content: newMessage.trim(),
                receiverId: selectedConversation.participants.find(p => p._id !== 'currentUserId')?._id
            }));
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.participants.some(participant =>
            participant.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        const today = new Date();
        const messageDate = new Date(date);

        if (messageDate.toDateString() === today.toDateString()) {
            return formatTime(date);
        } else {
            return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (loading && conversations.length === 0) return <LoadingScreen />;

    return (
        <div className="h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex h-full">
                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-6 text-center">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No conversations found</p>
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => {
                                const otherParticipant = conversation.participants.find(p => p._id !== 'currentUserId');
                                const isActive = selectedConversation?._id === conversation._id;

                                return (
                                    <div
                                        key={conversation._id}
                                        onClick={() => setSelectedConversation(conversation)}
                                        className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${isActive ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                    {otherParticipant?.avatar ? (
                                                        <img
                                                            src={otherParticipant.avatar}
                                                            alt={otherParticipant.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </div>
                                                {otherParticipant?.isOnline && (
                                                    <div className="w-3 h-3 bg-green-500 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {otherParticipant?.name || 'Unknown User'}
                                                    </h3>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(conversation.lastMessage?.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate mt-1">
                                                    {conversation.lastMessage?.content || 'No messages yet'}
                                                </p>
                                            </div>
                                            {conversation.unreadCount > 0 && (
                                                <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                                    {conversation.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white"></div>
                                    </div>
                                    <div>
                                        <h2 className="font-medium text-gray-900">
                                            {selectedConversation.participants.find(p => p._id !== 'currentUserId')?.name || 'Unknown User'}
                                        </h2>
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                            Online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <Video className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message._id}
                                        className={`flex ${message.sender === 'currentUserId' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.sender === 'currentUserId'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}>
                                            <p className="text-sm">{message.content}</p>
                                            <p className={`text-xs mt-1 ${message.sender === 'currentUserId' ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex gap-3">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
                                        rows="1"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                                <p>Choose a conversation from the sidebar to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;