import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import { User, Mail, Phone, Globe, Edit, MapPin, Save, GraduationCap } from 'lucide-react';

export default function ProfilePage() {
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        headline: user?.headline || '',
        website: user?.website || '',
        twitter: user?.twitter || '',
        linkedin: user?.linkedin || '',
        youtube: user?.youtube || '',
        phone: user?.phone || '',
        country: user?.country || '',
        language: user?.language || 'English',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await dispatch(updateProfile(formData));
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-card p-8 rounded-2xl space-y-8">
                {/* Profile Header */}
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                        {user?.name?.[0].toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user?.name}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-muted text-xs font-medium capitalize">{user?.role}</span>
                    </div>
                    <div className="ml-auto">
                        <button className="p-2 rounded-lg hover:bg-muted">
                            <Edit className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Country</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="United States"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Headline</label>
                            <div className="relative">
                                <Edit className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="headline"
                                    value={formData.headline}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="Your professional headline"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">Twitter</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">𝕏</span>
                                    <input
                                        type="text"
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="username"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-blue-600 text-sm font-bold">in</span>
                                    <input
                                        type="text"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="username"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">YouTube</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-red-600 text-sm font-bold">▶</span>
                                    <input
                                        type="text"
                                        name="youtube"
                                        value={formData.youtube}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="channel"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border" />

                <div>
                    <h3 className="font-semibold mb-4">Account Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-muted/30">
                            <h4 className="font-medium mb-2">Change Password</h4>
                            <p className="text-sm text-muted-foreground mb-3">Update your password for security purposes.</p>
                            <button className="text-primary hover:underline text-sm">Change Password</button>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                            <h4 className="font-medium mb-2">Delete Account</h4>
                            <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all data.</p>
                            <button className="text-destructive hover:underline text-sm">Delete Account</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
