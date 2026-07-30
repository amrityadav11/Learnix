import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize2, CheckCircle, ChevronLeft, ChevronRight, BookOpen, FileText, Video, Loader } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CoursePlayerPage() {
    const { courseId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const [course, setCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState(0);
    const [selectedLesson, setSelectedLesson] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courseProgress, setCourseProgress] = useState(null);

    // Fetch course data
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/courses/${courseId}`);
                if (data.success && data.course.modules && data.course.modules.length > 0) {
                    setCourse(data.course);
                    setSelectedModule(0);
                    setSelectedLesson(0);
                } else {
                    toast.error('Course content not found');
                    navigate('/dashboard/my-learning');
                }
            } catch (err) {
                toast.error('Failed to load course');
                navigate('/dashboard/my-learning');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, navigate]);

    // Fetch progress
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const { data } = await api.get(`/progress/${courseId}`);
                setCourseProgress(data.progress);
            } catch (err) {
                console.error('Failed to fetch progress:', err);
            }
        };
        if (course) fetchProgress();
    }, [course, courseId]);

    const currentModule = course?.modules?.[selectedModule];
    const currentLesson = currentModule?.lessons?.[selectedLesson];
    const totalLessons = course?.modules?.reduce((sum, m) => sum + m.lessons.length, 0) || 0;
    const completedLessons = courseProgress?.completedLessons?.length || 0;

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const newTime = parseFloat(e.target.value);
        playerRef.current?.seekTo(newTime, 'seconds');
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
        if (isMuted) setVolume(0.5);
    };

    const handleRateChange = (rate) => {
        setPlaybackRate(rate);
        setShowSettings(false);
    };

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleLessonComplete = async () => {
        try {
            await api.post(`/progress/${courseId}/mark-complete`, {
                lessonId: currentLesson._id,
                moduleId: currentModule._id
            });
            toast.success('Lesson marked as complete!');
            // Refresh progress
            const { data } = await api.get(`/progress/${courseId}`);
            setCourseProgress(data.progress);
        } catch (err) {
            toast.error('Failed to mark lesson complete');
        }
    };

    const handleNextLesson = () => {
        if (currentLesson && !courseProgress?.completedLessons?.includes(currentLesson._id)) {
            handleLessonComplete();
        }

        if (selectedLesson < currentModule.lessons.length - 1) {
            setSelectedLesson(selectedLesson + 1);
            setIsPlaying(true);
        } else if (selectedModule < course.modules.length - 1) {
            setSelectedModule(selectedModule + 1);
            setSelectedLesson(0);
            setIsPlaying(true);
        } else {
            toast.success('Course completed! 🎉');
        }
    };

    const handlePrevLesson = () => {
        if (selectedLesson > 0) {
            setSelectedLesson(selectedLesson - 1);
        } else if (selectedModule > 0) {
            setSelectedModule(selectedModule - 1);
            setSelectedLesson(course.modules[selectedModule - 1].lessons.length - 1);
        }
    };

    // Auto-hide controls
    useEffect(() => {
        let timeout;
        if (isPlaying) {
            timeout = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [isPlaying]);

    // Handle video ended
    const handleEnded = () => {
        setIsPlaying(false);
        handleNextLesson();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!course || !currentModule || !currentLesson) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Course content not available</p>
                    <button onClick={() => navigate('/dashboard/my-learning')} className="text-primary hover:underline">
                        Back to My Learning
                    </button>
                </div>
            </div>
        );
    }

    const isLessonCompleted = courseProgress?.completedLessons?.includes(currentLesson._id);

    return (
        <div className="flex h-screen bg-background">
            {/* Video Area */}
            <div className="flex-1 flex flex-col relative">
                <div
                    className="relative bg-black flex-1 flex items-center justify-center group"
                    onMouseMove={() => setShowControls(true)}
                >
                    {currentLesson.type === 'video' && currentLesson.videoUrl ? (
                        <>
                            <ReactPlayer
                                ref={playerRef}
                                url={currentLesson.videoUrl}
                                playing={isPlaying}
                                volume={isMuted ? 0 : volume}
                                muted={isMuted}
                                playbackRate={playbackRate}
                                onReady={() => {
                                    if (playerRef.current) {
                                        setDuration(playerRef.current.getDuration());
                                    }
                                }}
                                onProgress={(state) => {
                                    setCurrentTime(state.playedSeconds);
                                    setProgress(state.played);
                                }}
                                onEnded={handleEnded}
                                width="100%"
                                height="100%"
                                controls={false}
                            />

                            {/* Video Controls */}
                            {showControls && (
                                <>
                                    {/* Seek bar */}
                                    <div className="absolute bottom-20 left-0 right-0 px-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max={duration || 100}
                                            value={currentTime}
                                            onChange={handleSeek}
                                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                        />
                                    </div>

                                    {/* Bottom controls */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <button onClick={handlePlayPause} className="text-white hover:text-primary">
                                                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                                            </button>

                                            <div className="text-white text-sm">
                                                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button onClick={handleToggleMute} className="text-white">
                                                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                                </button>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={isMuted ? 0 : volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                                />
                                            </div>

                                            <div className="relative">
                                                <button onClick={() => setShowSettings(!showSettings)} className="text-white">
                                                    <Settings className="w-5 h-5" />
                                                </button>
                                                {showSettings && (
                                                    <div className="absolute bottom-12 right-0 bg-black rounded-lg p-2 shadow-xl z-50">
                                                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                                            <button
                                                                key={rate}
                                                                onClick={() => handleRateChange(rate)}
                                                                className={`block w-full text-left px-4 py-2 text-sm ${playbackRate === rate ? 'bg-primary text-white' : 'text-white hover:bg-white/10'}`}
                                                            >
                                                                {rate}x
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <button onClick={handleFullscreen} className="text-white">
                                                <Maximize2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : currentLesson.type === 'quiz' ? (
                        <div className="flex items-center justify-center flex-col gap-4">
                            <BookOpen className="w-16 h-16 text-muted-foreground" />
                            <p className="text-white text-xl">Quiz: {currentLesson.title}</p>
                            <button
                                onClick={handleLessonComplete}
                                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                            >
                                Start Quiz
                            </button>
                        </div>
                    ) : currentLesson.type === 'pdf' ? (
                        <div className="flex items-center justify-center flex-col gap-4">
                            <FileText className="w-16 h-16 text-muted-foreground" />
                            <p className="text-white text-xl">{currentLesson.title}</p>
                            {currentLesson.pdfUrl && (
                                <a
                                    href={currentLesson.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                                >
                                    Download PDF
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center flex-col gap-4">
                            <Video className="w-16 h-16 text-muted-foreground" />
                            <p className="text-white text-xl">{currentLesson.title}</p>
                            <p className="text-muted-foreground">{currentLesson.content}</p>
                        </div>
                    )}

                    {/* Mark Complete Button */}
                    {currentLesson.type === 'video' && (
                        <div className="absolute bottom-24 right-4">
                            <button
                                onClick={handleLessonComplete}
                                disabled={isLessonCompleted}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isLessonCompleted
                                        ? 'bg-green-600 text-white opacity-70'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                {isLessonCompleted ? 'Completed' : 'Mark Complete'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Lesson Info */}
                <div className="p-6 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={handlePrevLesson} className="text-muted-foreground hover:text-foreground disabled:opacity-40" disabled={selectedModule === 0 && selectedLesson === 0}>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-muted-foreground">
                            Lesson {completedLessons + 1} of {totalLessons}
                        </span>
                        <button onClick={handleNextLesson} className="text-muted-foreground hover:text-foreground">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
                    <p className="text-muted-foreground">{currentLesson.description}</p>

                    <div className="flex items-center gap-6 mt-6">
                        {currentLesson.type === 'video' && (
                            <>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Video className="w-4 h-4" />
                                    <span>{currentLesson.duration ? `${Math.round(currentLesson.duration / 60)} min` : 'Video'}</span>
                                </div>
                            </>
                        )}
                        {isLessonCompleted && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Completed</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar - Course Modules */}
            <div className="w-80 border-l border-border bg-card/50 hidden lg:flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="font-semibold mb-1">Course Content</h2>
                    <span className="text-xs text-muted-foreground">{totalLessons} lessons • Progress: {Math.round((completedLessons / totalLessons) * 100)}%</span>
                    <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(completedLessons / totalLessons) * 100}%` }} />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    {course.modules.map((module, modIdx) => (
                        <div key={module._id}>
                            <div className="p-3 font-medium text-sm bg-muted/30 border-b border-border sticky top-0">
                                {modIdx + 1}. {module.title}
                            </div>
                            {module.lessons.map((lesson, lesIdx) => {
                                const isSelected = selectedModule === modIdx && selectedLesson === lesIdx;
                                const isCompleted = courseProgress?.completedLessons?.includes(lesson._id);
                                return (
                                    <button
                                        key={lesson._id}
                                        onClick={() => {
                                            setSelectedModule(modIdx);
                                            setSelectedLesson(lesIdx);
                                            setIsPlaying(false);
                                        }}
                                        className={`w-full text-left flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors border-l-2 ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent'
                                            }`}
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            {lesson.type === 'video' ? <Video className="w-4 h-4" /> :
                                                lesson.type === 'quiz' ? <Settings className="w-4 h-4" /> :
                                                    lesson.type === 'pdf' ? <FileText className="w-4 h-4" /> :
                                                        <BookOpen className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium text-sm truncate ${isSelected ? 'text-primary' : ''}`}>
                                                {lesson.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {lesson.type === 'video' && lesson.duration ? `${Math.round(lesson.duration / 60)} min` : lesson.type}
                                            </p>
                                        </div>
                                        {isCompleted && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-border">
                    <button
                        onClick={() => navigate('/dashboard/my-learning')}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                    >
                        Back to My Learning
                    </button>
                </div>
            </div>
        </div>
    );
}
