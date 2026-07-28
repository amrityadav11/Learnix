import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize2, CheckCircle, ChevronLeft, ChevronRight, BookOpen, FileText, Video } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { markLessonComplete } from '../../redux/slices/progressSlice';

export default function CoursePlayerPage() {
    const { courseId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [activeTab, setActiveTab] = useState('videos');

    const lessons = [
        { id: 1, title: 'Introduction', type: 'video', duration: 120, completed: false },
        { id: 2, title: 'Getting Started', type: 'video', duration: 300, completed: true },
        { id: 3, title: 'Core Concepts', type: 'video', duration: 480, completed: false },
        { id: 4, title: 'Practice Quiz', type: 'quiz', duration: 0, completed: false },
        { id: 5, title: 'Project Setup', type: 'pdf', duration: 0, completed: false },
    ];

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const newTime = parseFloat(e.target.value);
        playerRef.current.seekTo(newTime);
        setProgress(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
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
        // TODO: Call API to mark lesson complete
        const lessonIndex = lessons.findIndex(l => l.id === 1);
        lessons[lessonIndex].completed = true;
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
        // Auto complete lesson
        handleLessonComplete();
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Video Area */}
            <div className="flex-1 flex flex-col relative">
                <div
                    className="relative bg-black flex-1 flex items-center justify-center group"
                    onMouseMove={() => setShowControls(true)}
                >
                    <ReactPlayer
                        ref={playerRef}
                        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        playing={isPlaying}
                        volume={volume}
                        muted={isMuted}
                        playbackRate={playbackRate}
                        onReady={() => setDuration(playerRef.current.getDuration())}
                        onProgress={(state) => {
                            setCurrentTime(state.playedSeconds);
                            setProgress(state.played);
                        }}
                        onEnded={handleEnded}
                        width="100%"
                        height="100%"
                        style={{ borderRadius: '12px' }}
                    />

                    {/* Controls */}
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
                                {/* Play/Pause */}
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={handlePlayPause} className="text-white hover:text-primary">
                                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                                    </button>

                                    {/* Time */}
                                    <div className="text-white text-sm">
                                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} /{' '}
                                        {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                                    </div>

                                    {/* Volume */}
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

                                    {/* Settings */}
                                    <div className="relative">
                                        <button onClick={() => setShowSettings(!showSettings)} className="text-white">
                                            <Settings className="w-5 h-5" />
                                        </button>
                                        {showSettings && (
                                            <div className="absolute bottom-12 right-0 bg-black rounded-lg p-2 shadow-xl">
                                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                                    <button
                                                        key={rate}
                                                        onClick={() => handleRateChange(rate)}
                                                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                                    >
                                                        {rate}x
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Fullscreen */}
                                    <button onClick={handleFullscreen} className="text-white">
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Next lesson notification */}
                            <div className="absolute bottom-20 right-4">
                                <button
                                    onClick={handleLessonComplete}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Complete
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Lesson Info */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-muted-foreground">Lesson 3 of 45</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Core Concepts and Best Practices</h1>
                    <p className="text-muted-foreground">Learn the fundamental concepts that every developer should know...</p>

                    <div className="flex items-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Video className="w-4 h-4" />
                            <span>720p</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            <span>20 min</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-border bg-card/50 hidden xl:block">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="font-semibold">Course Content</h2>
                    <span className="text-xs text-muted-foreground">45 lessons • 8h 30m</span>
                </div>

                <div className="p-4 border-b border-border">
                    <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'videos' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Videos
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'resources' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Resources
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-180px)]">
                    {lessons.map((lesson, i) => (
                        <div
                            key={lesson.id}
                            onClick={() => {
                                // Navigate to lesson
                            }}
                            className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors ${i === 2 ? 'bg-primary/10 border-l-2 border-primary' : ''
                                }`}
                        >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                {lesson.type === 'video' ? <Video className="w-4 h-4" /> :
                                    lesson.type === 'quiz' ? <Settings className="w-4 h-4" /> :
                                        lesson.type === 'pdf' ? <FileText className="w-4 h-4" /> :
                                            <BookOpen className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-sm truncate ${i === 2 ? 'text-primary' : 'text-foreground'}`}>
                                    {lesson.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {lesson.type === 'video' ? `${Math.round(lesson.duration / 60)} min` :
                                        lesson.completed ? 'Completed' : 'Available'}
                                </p>
                            </div>
                            {lesson.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
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
