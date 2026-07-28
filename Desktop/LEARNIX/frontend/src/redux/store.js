import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import cartReducer from './slices/cartSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import progressReducer from './slices/progressSlice';
import certificateReducer from './slices/certificateSlice';
import messageReducer from './slices/messageSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: courseReducer,
        cart: cartReducer,
        notifications: notificationReducer,
        ui: uiReducer,
        progress: progressReducer,
        certificates: certificateReducer,
        messages: messageReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: { ignoredActions: ['persist/PERSIST'] } }),
});
