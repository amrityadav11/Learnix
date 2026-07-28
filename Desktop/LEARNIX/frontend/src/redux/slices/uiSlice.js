import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        theme: localStorage.getItem('theme') || 'light',
        sidebarOpen: false,
        mobileSidebarOpen: false,
    },
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
            document.documentElement.classList.toggle('dark', state.theme === 'dark');
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
            document.documentElement.classList.toggle('dark', action.payload === 'dark');
        },
        toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
        toggleMobileSidebar: (state) => { state.mobileSidebarOpen = !state.mobileSidebarOpen; },
        closeMobileSidebar: (state) => { state.mobileSidebarOpen = false; },
    },
});

export const { toggleTheme, setTheme, toggleSidebar, toggleMobileSidebar, closeMobileSidebar } = uiSlice.actions;
export default uiSlice.reducer;
