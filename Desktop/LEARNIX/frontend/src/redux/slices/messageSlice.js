import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const fetchConversations = createAsyncThunk(
    'messages/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/messages/conversations');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
        }
    }
);

export const fetchMessages = createAsyncThunk(
    'messages/fetchMessages',
    async (conversationId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/messages/${conversationId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

export const sendMessage = createAsyncThunk(
    'messages/sendMessage',
    async ({ conversationId, content, receiverId }, { rejectWithValue }) => {
        try {
            const response = await api.post('/messages', {
                conversationId,
                content,
                receiverId
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

export const markAsRead = createAsyncThunk(
    'messages/markAsRead',
    async (conversationId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/messages/${conversationId}/read`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
        }
    }
);

const messageSlice = createSlice({
    name: 'messages',
    initialState: {
        conversations: [],
        messages: [],
        activeConversation: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setActiveConversation: (state, action) => {
            state.activeConversation = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        resetMessages: (state) => {
            state.conversations = [];
            state.messages = [];
            state.activeConversation = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch conversations
            .addCase(fetchConversations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload.data || [];
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch messages
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload.data || [];
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Send message
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.messages.push(action.payload.data);
            })

            // Mark as read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const conversation = state.conversations.find(c => c._id === action.payload.conversationId);
                if (conversation) {
                    conversation.unreadCount = 0;
                }
            });
    },
});

export const { clearError, setActiveConversation, addMessage, resetMessages } = messageSlice.actions;
export default messageSlice.reducer;