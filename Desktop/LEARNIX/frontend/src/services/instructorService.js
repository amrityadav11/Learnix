import api from '../api/axios';

/**
 * Instructor Service
 */
export const instructorService = {
    /**
     * Convert current user to instructor
     */
    becomeInstructor: async () => {
        try {
            const res = await api.put('/auth/become-instructor');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};
