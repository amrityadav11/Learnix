import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, FileText, GraduationCap, CheckCircle } from 'lucide-react';

export default function CreateCoursePage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        category: '',
        subcategory: '',
        price: '',
        level: 'All Levels',
        requirements: [],
        whatYouLearn: [],
    });

    const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
    const categories = ['Programming', 'Web Development', 'Data Science', 'AI & ML', 'Business', 'Design'];

    const addRequirement = () => {
        setFormData({ ...formData, requirements: [...formData.requirements, ''] });
    };

    const addWhatYouLearn = () => {
        setFormData({ ...formData, whatYouLearn: [...formData.whatYouLearn, ''] });
    };

    const updateRequirement = (index, value) => {
        const updated = [...formData.requirements];
        updated[index] = value;
        setFormData({ ...formData, requirements: updated });
    };

    const updateWhatYouLearn = (index, value) => {
        const updated = [...formData.whatYouLearn];
        updated[index] = value;
        setFormData({ ...formData, whatYouLearn: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement API call
        alert('Course created successfully!');
        navigate('courses');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
                <p className="text-muted-foreground">Share your knowledge and help students learn new skills</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex flex-col items-center relative">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                        </div>
                        {s < 5 && (
                            <div
                                className={`absolute top-5 left-10 w-full h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl space-y-6">
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Course Basics</h2>
                        <div>
                            <label className="block text-sm font-medium mb-2">Course Title</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="e.g., Complete React.js Developer Course"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Make it descriptive and engaging</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Subtitle</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="A comprehensive guide to learning React.js"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="5"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="Describe your course in detail..."
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Course Details</h2>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                            >
                                <option value="">Select a category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Subcategory</label>
                            <input
                                type="text"
                                value={formData.subcategory}
                                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="e.g., Frontend Development"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Level</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                            >
                                {levels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="49.99"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Discount (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value="0"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="20"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Requirements</h2>
                        <p className="text-sm text-muted-foreground mb-4">What students need to know before taking this course</p>
                        {formData.requirements.map((req, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => updateRequirement(i, e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder={`Requirement ${i + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = formData.requirements.filter((_, j) => j !== i);
                                        setFormData({ ...formData, requirements: updated });
                                    }}
                                    className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addRequirement}
                            className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm font-medium"
                        >
                            + Add Requirement
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">What You'll Learn</h2>
                        <p className="text-sm text-muted-foreground mb-4">List the skills students will gain from this course</p>
                        {formData.whatYouLearn.map((item, i) => (
                            <div key={i} className="flex gap-2">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updateWhatYouLearn(i, e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder={`Skill or topic ${i + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = formData.whatYouLearn.filter((_, j) => j !== i);
                                        setFormData({ ...formData, whatYouLearn: updated });
                                    }}
                                    className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addWhatYouLearn}
                            className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm font-medium"
                        >
                            + Add Learning Objective
                        </button>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Upload Course Content</h2>
                        <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">Upload Video Lessons</h3>
                            <p className="text-sm text-muted-foreground mb-4">Drag and drop video files or click to browse</p>
                            <button type="button" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                                Browse Files
                            </button>
                        </div>
                        <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">Upload Resources</h3>
                            <p className="text-sm text-muted-foreground mb-4">PDFs, code files, and other materials</p>
                            <button type="button" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                                Browse Files
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-6">
                    <button
                        type="button"
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="px-6 py-3 rounded-xl border border-border hover:bg-muted font-medium disabled:opacity-50"
                    >
                        Back
                    </button>
                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={() => setStep(s => Math.min(5, s + 1))}
                            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                        >
                            Publish Course
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
