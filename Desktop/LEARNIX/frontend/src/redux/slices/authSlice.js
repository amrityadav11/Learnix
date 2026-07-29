import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/auth/me');
        return data.user;
    } catch {
        return rejectWithValue(null);
    }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/login', credentials);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/register', userData);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
    await api.post('/auth/logout');
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
    try {
        const { data } = await api.put('/auth/update-profile', profileData);
        return data.user;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (token, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Verification failed');
    }
});

export const resendVerificationEmail = createAsyncThunk('auth/resendVerificationEmail', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/send-otp');
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to resend email');
    }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (passwords, { rejectWithValue }) => {
    try {
        const { data } = await api.put('/auth/change-password', passwords);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to change password');
    }
});

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (formData, { rejectWithValue }) => {
    try {
        const { data } = await api.put('/auth/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.avatar;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Avatar upload failed');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, loading: true, error: null },
    reducers: {
        clearError: (state) => { state.error = null; },
        setUser: (state, action) => { state.user = action.payload; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => { state.loading = true; })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
            .addCase(fetchCurrentUser.rejected, (state) => { state.loading = false; state.user = null; })
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                // Store token in localStorage for Authorization header
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
                toast.success(action.payload.message || 'Login successful!');
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload || 'Login failed');
            })
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                // Store token in localStorage for Authorization header
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
                toast.success(action.payload.message || 'Registration successful!');
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload || 'Registration failed');
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                // Clear token from localStorage
                localStorage.removeItem('token');
                toast.success('Logged out successfully.');
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                toast.success('Profile updated!');
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                if (state.user) state.user.avatar = action.payload;
                toast.success('Avatar updated!');
            })
            .addCase(changePassword.fulfilled, () => {
                toast.success('Password changed successfully!');
            })
            .addCase(changePassword.rejected, (_, action) => {
                toast.error(action.payload || 'Failed to change password');
            });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
