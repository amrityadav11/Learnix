import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchCourses = createAsyncThunk('courses/fetchCourses', async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/courses', { params });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const fetchFeaturedCourses = createAsyncThunk('courses/fetchFeatured', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/courses/featured');
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const fetchCourseDetail = createAsyncThunk('courses/fetchCourseDetail', async (slug, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/courses/${slug}`);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const courseSlice = createSlice({
    name: 'courses',
    initialState: {
        courses: [],
        featured: [],
        trending: [],
        currentCourse: null,
        loading: false,
        error: null,
        total: 0,
        totalPages: 0,
        currentPage: 1,
    },
    reducers: {
        clearCurrentCourse: (state) => { state.currentCourse = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.courses = action.payload.courses;
                state.total = action.payload.total;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(fetchFeaturedCourses.fulfilled, (state, action) => {
                state.featured = action.payload.featured;
                state.trending = action.payload.trending;
            })
            .addCase(fetchCourseDetail.pending, (state) => { state.loading = true; })
            .addCase(fetchCourseDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCourse = action.payload;
            })
            .addCase(fetchCourseDetail.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
