import { GraduationCap, Users, Award, BookOpen, Star, Globe, TrendingUp, CheckCircle } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="space-y-20">
            <section className="container mx-auto px-4 text-center py-20">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">About LEARNIX</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    We're on a mission to make high-quality education accessible to everyone, anywhere.
                </p>
            </section>

            <section className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                        <p className="text-muted-foreground mb-6">
                            LEARNIX was founded with a simple yet powerful vision: to democratize education and make it accessible to learners worldwide, regardless of their background or location.
                        </p>
                        <p className="text-muted-foreground mb-6">
                            We believe that education is the key to unlocking potential and creating a better future. Our platform connects learners with expert instructors who are passionate about sharing their knowledge.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center" />
                                ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-bold text-foreground">150K+</span> learners
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4 translate-y-8">
                            <div className="p-6 bg-card rounded-2xl">
                                <Users className="w-8 h-8 text-primary mb-4" />
                                <h3 className="font-bold text-xl mb-2">500K+</h3>
                                <p className="text-sm text-muted-foreground">Active Students</p>
                            </div>
                            <div className="p-6 bg-card rounded-2xl">
                                <Award className="w-8 h-8 text-green-500 mb-4" />
                                <h3 className="font-bold text-xl mb-2">5K+</h3>
                                <p className="text-sm text-muted-foreground">Courses</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-6 bg-card rounded-2xl">
                                <GraduationCap className="w-8 h-8 text-blue-500 mb-4" />
                                <h3 className="font-bold text-xl mb-2">500+</h3>
                                <p className="text-sm text-muted-foreground">Expert Instructors</p>
                            </div>
                            <div className="p-6 bg-card rounded-2xl">
                                <Star className="w-8 h-8 text-yellow-500 mb-4" />
                                <h3 className="font-bold text-xl mb-2">98%</h3>
                                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        These values guide everything we do at LEARNIX
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: BookOpen, title: 'Accessibility', desc: 'Education should be available to everyone, anytime, anywhere.' },
                        { icon: Star, title: 'Excellence', desc: 'We maintain the highest standards in course quality and instruction.' },
                        { icon: Globe, title: 'Global Impact', desc: 'Making a positive difference in learners lives worldwide.' },
                        { icon: TrendingUp, title: 'Innovation', desc: 'Continuously improving our platform with the latest tech.' },
                        { icon: CheckCircle, title: 'Integrity', desc: 'Building trust through transparency and honesty.' },
                        { icon: Users, title: 'Community', desc: 'Creating a supportive learning environment for all.' },
                    ].map((value, i) => (
                        <div key={i} className="p-6 bg-card rounded-2xl hover:shadow-xl transition-all">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                                <value.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                            <p className="text-muted-foreground">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container mx-auto px-4">
                <div className="bg-primary text-primary-foreground rounded-3xl p-12 text-center">
                    <h2 className="text-3xl font-bold mb-8">By the Numbers</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Students', value: '500K+' },
                            { label: 'Courses', value: '5K+' },
                            { label: 'Instructors', value: '500+' },
                            { label: 'Completion Rate', value: '95%' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <h3 className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</h3>
                                <p className="opacity-90">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
