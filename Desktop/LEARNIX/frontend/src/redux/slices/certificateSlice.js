import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const fetchCertificates = createAsyncThunk(
    'certificates/fetchCertificates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/certificates');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch certificates');
        }
    }
);

export const generateCertificate = createAsyncThunk(
    'certificates/generateCertificate',
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/certificates/generate/${courseId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to generate certificate');
        }
    }
);

export const downloadCertificate = createAsyncThunk(
    'certificates/downloadCertificate',
    async (certificateId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/certificates/${certificateId}/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to download certificate');
        }
    }
);

const certificateSlice = createSlice({
    name: 'certificates',
    initialState: {
        certificates: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetCertificates: (state) => {
            state.certificates = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch certificates
            .addCase(fetchCertificates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCertificates.fulfilled, (state, action) => {
                state.loading = false;
                state.certificates = action.payload.data || [];
            })
            .addCase(fetchCertificates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Generate certificate
            .addCase(generateCertificate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateCertificate.fulfilled, (state, action) => {
                state.loading = false;
                state.certificates.unshift(action.payload.data);
            })
            .addCase(generateCertificate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Download certificate
            .addCase(downloadCertificate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(downloadCertificate.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(downloadCertificate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, resetCertificates } = certificateSlice.actions;
export default certificateSlice.reducer;