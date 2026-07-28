import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, GraduationCap } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Have questions? We're here to help. Reach out to our team.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-card p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Subject</label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="How can we help?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Message</label>
                            <textarea
                                required
                                rows="4"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="Type your message here..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                            {!loading && <Send className="w-4 h-4" />}
                        </button>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="bg-card p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Mail className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Email</h3>
                                    <p className="text-muted-foreground">support@learnix.com</p>
                                    <p className="text-muted-foreground">help@learnix.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Phone</h3>
                                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                                    <p className="text-muted-foreground">Mon-Fri: 9AM-6PM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Office</h3>
                                    <p className="text-muted-foreground">123 Education Street</p>
                                    <p className="text-muted-foreground">San Francisco, CA 94102</p>
                                    <p className="text-muted-foreground">United States</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-purple-600 text-white p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="mb-6 opacity-90">
                            Check our help center for answers to common questions.
                        </p>
                        <button className="w-full py-3 rounded-xl bg-white text-primary font-semibold hover:bg-gray-100 transition-colors">
                            Visit Help Center
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: MessageSquare, label: 'Chat Support', action: 'Live chat available' },
                            { icon: Mail, label: 'Email Support', action: '24-hour response' },
                            { icon: Phone, label: 'Phone Support', action: 'Business hours only' },
                            { icon: Globe, label: 'Community', action: 'Join our forum' },
                        ].map((item, i) => (
                            <div key={i} className="bg-muted/30 p-4 rounded-xl text-center">
                                <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <h3 className="font-semibold mb-1">{item.label}</h3>
                                <p className="text-xs text-muted-foreground">{item.action}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
