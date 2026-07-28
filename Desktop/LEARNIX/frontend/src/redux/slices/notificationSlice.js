import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/notifications');
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id, { rejectWithValue }) => {
    try {
        await api.put(`/notifications/${id}/read`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
    try {
        await api.put('/notifications/read-all');
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/notifications/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.read) state.unreadCount += 1;
        },
        markOneRead: (state, action) => {
            const n = state.notifications.find(i => i._id === action.payload);
            if (n && !n.read) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications || action.payload.data || [];
                state.unreadCount = action.payload.unreadCount || 0;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const n = state.notifications.find(i => i._id === action.payload);
                if (n && !n.read) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => { n.read = true; });
                state.unreadCount = 0;
                toast.success('All notifications marked as read');
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const idx = state.notifications.findIndex(n => n._id === action.payload);
                if (idx !== -1) {
                    if (!state.notifications[idx].read) state.unreadCount = Math.max(0, state.unreadCount - 1);
                    state.notifications.splice(idx, 1);
                }
            });
    },
});

export const { addNotification, markOneRead } = notificationSlice.actions;
export default notificationSlice.reducer;
