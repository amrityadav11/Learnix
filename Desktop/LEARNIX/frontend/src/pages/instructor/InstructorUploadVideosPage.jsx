import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, FileVideo, Trash2, Check, AlertCircle, Loader } from 'lucide-react';
import api from '../../api/axios';
import { setUser } from '../../redux/slices/authSlice';
import instructorService from '../../services/instructorService';

export default function InstructorUploadVideosPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [uploadingLesson, setUploadingLesson] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [upgrading, setUpgrading] = useState(false);

    // Check if user is instructor
    useEffect(() => {
        if (user && user.role !== 'instructor' && user.role !== 'admin') {
            setError('You need to upgrade to instructor role to access this feature');
        }
    }, [user]);

    // Handle upgrade to instructor
    const handleBecomeInstructor = async () => {
        setUpgrading(true);
        setError('');
        try {
            const result = await instructorService.becomeInstructor();
            dispatch(setUser({ ...user, role: 'instructor' }));
            setSuccessMessage('Successfully upgraded to instructor!');
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to upgrade to instructor');
        } finally {
            setUpgrading(false);
        }
    };

    // Fetch instructor courses
    useEffect(() => {
        if (user?.role === 'instructor' || user?.role === 'admin') {
            const fetchCourses = async () => {
                try {
                    const res = await api.get('/courses/instructor');
                    setCourses(res.data.data);
                } catch (err) {
                    setError('Failed to load courses');
                    console.error(err);
                }
            };
            fetchCourses();
        }
    }, [user]);

    // Load modules when course is selected
    useEffect(() => {
        if (selectedCourse) {
            const course = courses.find(c => c._id === selectedCourse);
            if (course) {
                setModules(course.modules || []);
                setSelectedModule(null);
                setLessons([]);
            }
        }
    }, [selectedCourse, courses]);

    // Load lessons when module is selected
    useEffect(() => {
        if (selectedModule && modules.length > 0) {
            const module = modules.find(m => m._id === selectedModule);
            if (module) {
                setLessons(module.lessons || []);
            }
        }
    }, [selectedModule, modules]);

    // Handle video upload
    const handleVideoUpload = async (lessonId, file) => {
        if (!file) return;

        setUploadingLesson(lessonId);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('video', file);

        try {
            const res = await api.post(
                `/instructor/courses/${selectedCourse}/modules/${selectedModule}/lessons/${lessonId}/video`,
                formData
            );

            setSuccessMessage(`Video uploaded successfully! Duration: ${res.data.data.duration}s`);
            // Refresh course data
            const courseRes = await api.get(`/courses/${selectedCourse}`);
            setCourses(prev => prev.map(c => c._id === selectedCourse ? courseRes.data.data : c));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload video');
        } finally {
            setUploadingLesson(null);
        }
    };

    // Handle video delete
    const handleVideoDelete = async (lessonId) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;

        try {
            await api.delete(
                `/instructor/courses/${selectedCourse}/modules/${selectedModule}/lessons/${lessonId}/video`
            );
            setSuccessMessage('Video deleted successfully');
            // Refresh course data
            const courseRes = await api.get(`/courses/${selectedCourse}`);
            setCourses(prev => prev.map(c => c._id === selectedCourse ? courseRes.data.data : c));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete video');
        }
    };

    return (
        <div className="space-y-8">
            {/* Show upgrade prompt if user is not instructor */}
            {user && user.role !== 'instructor' && user.role !== 'admin' ? (
                <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
                    <AlertCircle className="w-16 h-16 text-yellow-500" />
                    <h2 className="text-2xl font-bold">Instructor Access Required</h2>
                    <p className="text-muted-foreground max-w-md text-center">
                        You need to upgrade to an instructor role to access this feature.
                    </p>
                    <button
                        onClick={handleBecomeInstructor}
                        disabled={upgrading}
                        className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
                    >
                        {upgrading ? 'Upgrading...' : 'Upgrade to Instructor'}
                    </button>
                </div>
            ) : (
                <>
                    <div>
                        <h1 className="text-3xl font-bold">Upload Course Videos</h1>
                        <p className="text-muted-foreground mt-2">Manage and upload videos for your course lessons</p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-green-800">{successMessage}</span>
                        </motion.div>
                    )}

                    {/* Course Selection */}
                    <div className="bg-card rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Select Course</h2>
                        <select
                            value={selectedCourse || ''}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Choose a course...</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCourse && (
                        <>
                            {/* Module Selection */}
                            <div className="bg-card rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-4">Select Module</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {modules.length === 0 ? (
                                        <p className="text-muted-foreground">No modules found. Create modules first.</p>
                                    ) : (
                                        modules.map(module => (
                                            <button
                                                key={module._id}
                                                onClick={() => setSelectedModule(module._id)}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${selectedModule === module._id
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-muted hover:border-primary'
                                                    }`}
                                            >
                                                <h3 className="font-bold">{module.title}</h3>
                                                <p className="text-sm text-muted-foreground">{module.lessons?.length || 0} lessons</p>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Lessons and Videos */}
                            {selectedModule && lessons.length > 0 && (
                                <div className="bg-card rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-6">Upload Videos for Lessons</h2>
                                    <div className="space-y-4">
                                        {lessons.map(lesson => (
                                            <motion.div
                                                key={lesson._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="p-4 bg-muted/50 rounded-lg border-2 border-muted"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{lesson.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{lesson.type}</p>
                                                        {lesson.videoUrl && (
                                                            <div className="mt-2 text-sm">
                                                                <span className="text-green-600 flex items-center gap-1">
                                                                    <Check className="w-4 h-4" /> Uploaded - {lesson.duration}s duration
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {lesson.videoUrl && (
                                                        <button
                                                            onClick={() => handleVideoDelete(lesson._id)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-600"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>

                                                {!lesson.videoUrl && (
                                                    <label className="flex items-center justify-center p-8 border-2 border-dashed border-primary/50 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            onChange={(e) => handleVideoUpload(lesson._id, e.target.files?.[0])}
                                                            disabled={uploadingLesson === lesson._id}
                                                            className="hidden"
                                                        />
                                                        <div className="text-center">
                                                            {uploadingLesson === lesson._id ? (
                                                                <>
                                                                    <Loader className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                                                                    <p className="text-primary font-medium">Uploading...</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                                                                    <p className="text-primary font-medium">Click to upload video</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">MP4, WebM, or other video formats</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </label>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
