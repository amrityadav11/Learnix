import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const markLessonComplete = createAsyncThunk('progress/markComplete', async ({ courseId, lessonId, watchPosition, moduleId }, { rejectWithValue }) => {
    try {
        const { data } = await api.post(`/progress/${courseId}/complete-lesson`, { lessonId, watchPosition, moduleId });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const updateWatchPosition = createAsyncThunk('progress/updateWatch', async ({ courseId, lessonId, position, watchTime }, { rejectWithValue }) => {
    try {
        const { data } = await api.put(`/progress/${courseId}/watch-position`, { lessonId, position, watchTime });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const progressSlice = createSlice({
    name: 'progress',
    initialState: {
        currentProgress: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearProgress: (state) => { state.currentProgress = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(markLessonComplete.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(markLessonComplete.fulfilled, (state, action) => { state.loading = false; state.currentProgress = action.payload.progress; })
            .addCase(markLessonComplete.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(updateWatchPosition.fulfilled, (state, action) => { state.currentProgress = action.payload.progress; });
    },
});

export const { clearProgress } = progressSlice.actions;
export default progressSlice.reducer;
