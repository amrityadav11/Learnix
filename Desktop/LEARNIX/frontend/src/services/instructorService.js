import api from '../api/axios';

/**
 * Convert current user to instructor
 */
export const becomeInstructor = async () => {
    try {
        const res = await api.put('/auth/become-instructor');
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export default {
    becomeInstructor,
};
