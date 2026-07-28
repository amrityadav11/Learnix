const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const Blog = require('../models/Blog');
const Settings = require('../models/Settings');
const Coupon = require('../models/Coupon');

const categories = [
    { name: 'Programming', slug: 'programming', icon: '💻', color: '#6366f1' },
    { name: 'Web Development', slug: 'web-development', icon: '🌐', color: '#8b5cf6' },
    { name: 'AI & Machine Learning', slug: 'ai-machine-learning', icon: '🤖', color: '#a855f7' },
    { name: 'Data Science', slug: 'data-science', icon: '📊', color: '#06b6d4' },
    { name: 'Cyber Security', slug: 'cyber-security', icon: '🔒', color: '#ef4444' },
    { name: 'Cloud Computing', slug: 'cloud-computing', icon: '☁️', color: '#3b82f6' },
    { name: 'Blockchain', slug: 'blockchain', icon: '⛓️', color: '#f59e0b' },
    { name: 'Digital Marketing', slug: 'digital-marketing', icon: '📱', color: '#10b981' },
    { name: 'Graphic Design', slug: 'graphic-design', icon: '🎨', color: '#ec4899' },
    { name: 'Business', slug: 'business', icon: '💼', color: '#84cc16' },
    { name: 'Finance', slug: 'finance', icon: '💰', color: '#f97316' },
    { name: 'Photography', slug: 'photography', icon: '📷', color: '#14b8a6' },
    { name: 'Music', slug: 'music', icon: '🎵', color: '#8b5cf6' },
    { name: 'Health & Fitness', slug: 'health-fitness', icon: '💪', color: '#22c55e' },
    { name: 'Language Learning', slug: 'language-learning', icon: '🗣️', color: '#6366f1' },
    { name: 'Video Editing', slug: 'video-editing', icon: '🎬', color: '#f43f5e' },
    { name: 'UPSC & Government Exams', slug: 'upsc-government', icon: '🏛️', color: '#0ea5e9' },
    { name: 'Communication Skills', slug: 'communication-skills', icon: '🎤', color: '#7c3aed' },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Course.deleteMany({}),
            Blog.deleteMany({}),
            Settings.deleteMany({}),
            Coupon.deleteMany({}),
        ]);
        console.log('🗑️ Cleared existing data');

        // Create admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@learnix.com',
            password: 'Admin@123',
            role: 'admin',
            isEmailVerified: true,
        });
        console.log('👤 Admin created: admin@learnix.com / Admin@123');

        // Create instructors
        const instructor1 = await User.create({
            name: 'Dr. Sarah Johnson',
            email: 'sarah@learnix.com',
            password: 'Instructor@123',
            role: 'instructor',
            isEmailVerified: true,
            isApprovedInstructor: true,
            bio: 'Senior software engineer with 10+ years of experience.',
            headline: 'Full Stack Developer & Educator',
        });

        const instructor2 = await User.create({
            name: 'Prof. Michael Chen',
            email: 'michael@learnix.com',
            password: 'Instructor@123',
            role: 'instructor',
            isEmailVerified: true,
            isApprovedInstructor: true,
            bio: 'AI researcher and educator passionate about ML.',
            headline: 'AI/ML Expert & Researcher',
        });
        console.log('👩‍🏫 Instructors created');

        // Create student
        const student = await User.create({
            name: 'John Student',
            email: 'student@learnix.com',
            password: 'Student@123',
            role: 'student',
            isEmailVerified: true,
        });
        console.log('🎓 Student created: student@learnix.com / Student@123');

        // Create categories
        const createdCategories = await Category.insertMany(categories);
        const catMap = {};
        createdCategories.forEach(c => { catMap[c.slug] = c._id; });
        console.log('📁 Categories created');

        // Create sample courses
        const coursesData = [
            {
                title: 'Complete React.js Developer Course 2024',
                subtitle: 'Build modern web apps with React, Redux, and Next.js',
                description: 'Master React.js from the ground up. This comprehensive course covers everything from React basics to advanced patterns, Redux state management, and Next.js for production apps.',
                instructor: instructor1._id,
                category: catMap['web-development'],
                price: 49.99,
                discount: 20,
                level: 'Beginner',
                language: 'English',
                requirements: ['Basic JavaScript knowledge', 'HTML & CSS familiarity'],
                whatYouLearn: ['React hooks & state management', 'Redux Toolkit', 'Next.js', 'REST APIs', 'Authentication'],
                status: 'published',
                isPublished: true,
                isApproved: true,
                isFeatured: true,
                totalLessons: 85,
                duration: 129600,
                tags: ['react', 'javascript', 'web development', 'frontend'],
            },
            {
                title: 'Python for Data Science & Machine Learning',
                subtitle: 'From Python basics to ML models - complete bootcamp',
                description: 'Learn Python programming and dive into data science, machine learning, and AI. Hands-on projects with real datasets.',
                instructor: instructor2._id,
                category: catMap['data-science'],
                price: 59.99,
                discount: 15,
                level: 'Beginner',
                language: 'English',
                requirements: ['No prior experience needed', 'A computer with internet connection'],
                whatYouLearn: ['Python fundamentals', 'NumPy & Pandas', 'Scikit-learn', 'TensorFlow basics', 'Data visualization'],
                status: 'published',
                isPublished: true,
                isApproved: true,
                isFeatured: true,
                isTrending: true,
                totalLessons: 120,
                duration: 216000,
                tags: ['python', 'machine learning', 'data science', 'AI'],
            },
            {
                title: 'Node.js & Express Backend Development',
                subtitle: 'Build scalable REST APIs with Node.js, Express and MongoDB',
                description: 'Comprehensive backend development course covering Node.js, Express, MongoDB, authentication, and deployment.',
                instructor: instructor1._id,
                category: catMap['programming'],
                price: 44.99,
                discount: 10,
                level: 'Intermediate',
                language: 'English',
                requirements: ['JavaScript knowledge', 'Basic understanding of HTTP'],
                whatYouLearn: ['Node.js & Express', 'MongoDB & Mongoose', 'JWT Authentication', 'REST API design', 'Deployment'],
                status: 'published',
                isPublished: true,
                isApproved: true,
                isTrending: true,
                totalLessons: 95,
                duration: 158400,
                tags: ['nodejs', 'express', 'mongodb', 'backend'],
            },
            {
                title: 'AWS Cloud Practitioner Certification Prep',
                subtitle: 'Pass the AWS CCP exam with confidence',
                description: 'Complete preparation for AWS Cloud Practitioner certification. Covers all exam domains with practice tests.',
                instructor: instructor2._id,
                category: catMap['cloud-computing'],
                price: 39.99,
                discount: 25,
                level: 'Beginner',
                language: 'English',
                requirements: ['No AWS experience needed', 'Basic IT knowledge helpful'],
                whatYouLearn: ['AWS core services', 'Cloud architecture', 'Security & compliance', 'Pricing & billing', 'Practice exam tips'],
                status: 'published',
                isPublished: true,
                isApproved: true,
                isFeatured: true,
                totalLessons: 60,
                duration: 72000,
                tags: ['aws', 'cloud', 'certification', 'devops'],
            },
        ];

        // Create courses one by one to trigger pre-save hooks
        const courses = [];
        for (const courseData of coursesData) {
            const course = await Course.create(courseData);
            courses.push(course);
        }
        console.log('📚 Sample courses created');

        // Create settings
        await Settings.create({
            siteName: 'LEARNIX',
            siteDescription: 'Learn anything, anywhere. Access thousands of courses from expert instructors.',
            currency: 'USD',
            currencySymbol: '$',
            instructorCommission: 70,
            platformFee: 30,
            requireEmailVerification: false, // false for easy testing
            enableStripe: true,
            enableRazorpay: true,
            testimonials: [
                { name: 'Alice Kumar', role: 'Web Developer', content: 'This platform completely transformed my career!', rating: 5 },
                { name: 'Bob Smith', role: 'Data Analyst', content: 'Best learning platform I have ever used.', rating: 5 },
                { name: 'Carol Jones', role: 'ML Engineer', content: 'The courses are detailed, engaging, and practical.', rating: 5 },
            ],
        });

        // Create sample coupon
        await Coupon.create({
            code: 'WELCOME50',
            description: 'Welcome discount - 50% off your first purchase',
            type: 'percentage',
            discount: 50,
            maxDiscount: 30,
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            createdBy: admin._id,
        });
        console.log('🎟️ Sample coupon created: WELCOME50');

        // Create sample blog
        await Blog.create({
            title: 'Top 10 Programming Languages to Learn in 2024',
            excerpt: 'Discover the most in-demand programming languages that will supercharge your career.',
            content: `<h2>The Programming Landscape in 2024</h2>
<p>The tech world moves fast, and staying ahead means knowing which languages are worth your time. Here are the top 10 programming languages to learn this year...</p>
<h3>1. Python</h3>
<p>Python continues to dominate in data science, AI, and web development. Its simplicity makes it perfect for beginners.</p>
<h3>2. JavaScript/TypeScript</h3>
<p>The language of the web. With TypeScript adding type safety, JavaScript is more powerful than ever.</p>
<h3>3. Rust</h3>
<p>Systems programming language known for memory safety and performance.</p>`,
            author: admin._id,
            category: 'Technology',
            tags: ['programming', 'career', 'technology'],
            isPublished: true,
            publishedAt: new Date(),
        });
        console.log('📝 Sample blog created');

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin:      admin@learnix.com / Admin@123');
        console.log('   Instructor: sarah@learnix.com / Instructor@123');
        console.log('   Instructor: michael@learnix.com / Instructor@123');
        console.log('   Student:    student@learnix.com / Student@123');
        console.log('   Coupon:     WELCOME50\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDB();
