import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const links = {
    Company: [
        { label: 'About Us', to: '/about' },
        { label: 'Careers', to: '/careers' },
        { label: 'Contact', to: '/contact' },
        { label: 'Blog', to: '/blogs' },
    ],
    Support: [
        { label: 'Help Center', to: '/help' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Refund Policy', to: '/refunds' },
    ],
    Social: [
        { label: 'Facebook', to: 'https://facebook.com' },
        { label: 'Twitter', to: 'https://twitter.com' },
        { label: 'LinkedIn', to: 'https://linkedin.com' },
        { label: 'YouTube', to: 'https://youtube.com' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg gradient-text">LEARNIX</span>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-4">
                            Learn anything, anywhere. Access thousands of courses from expert instructors and begin your learning journey today.
                        </p>
                        <div className="flex gap-4">
                            {links.Social.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.to}
                                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                                >
                                    {item.label.substring(0, 2)}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(links).filter(([k]) => k !== 'Social').map(([title, items]) => (
                        <div key={title}>
                            <h3 className="font-semibold mb-4 text-foreground">{title}</h3>
                            <ul className="space-y-2">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            to={item.to}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Stay Updated</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Subscribe to our newsletter for course updates, discounts, and educational tips.
                        </p>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} LEARNIX. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link to="/privacy" className="hover:text-primary">Privacy</Link>
                        <Link to="/terms" className="hover:text-primary">Terms</Link>
                        <Link to="/sitemap" className="hover:text-primary">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
