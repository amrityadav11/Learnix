const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        siteName: { type: String, default: 'LEARNIX' },
        siteDescription: { type: String, default: 'Learn anything, anywhere.' },
        siteUrl: { type: String },
        siteLogo: { type: String },
        siteFavicon: { type: String },
        contactEmail: { type: String },
        supportEmail: { type: String },
        phone: { type: String },
        address: { type: String },
        currency: { type: String, default: 'USD' },
        currencySymbol: { type: String, default: '$' },
        instructorCommission: { type: Number, default: 70 }, // % instructor gets
        platformFee: { type: Number, default: 30 },
        maintenanceMode: { type: Boolean, default: false },
        allowRegistration: { type: Boolean, default: true },
        allowInstructorRegistration: { type: Boolean, default: true },
        requireEmailVerification: { type: Boolean, default: true },
        requireInstructorApproval: { type: Boolean, default: true },
        maxFileSize: { type: Number, default: 100 }, // MB
        enableStripe: { type: Boolean, default: true },
        enableRazorpay: { type: Boolean, default: true },
        enableFreeCourses: { type: Boolean, default: true },
        heroSlider: [{ image: String, title: String, subtitle: String, link: String }],
        testimonials: [{ name: String, avatar: String, role: String, content: String, rating: Number }],
        socialLinks: {
            facebook: String,
            twitter: String,
            instagram: String,
            youtube: String,
            linkedin: String,
        },
        seoKeywords: { type: String },
        googleAnalyticsId: { type: String },
        facebookPixelId: { type: String },
        newsletterEnabled: { type: Boolean, default: true },
        enableChat: { type: Boolean, default: true },
        enableReviews: { type: Boolean, default: true },
        enableCertificates: { type: Boolean, default: true },
        enableReferral: { type: Boolean, default: true },
        referralBonus: { type: Number, default: 10 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
