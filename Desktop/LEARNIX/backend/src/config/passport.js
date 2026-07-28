const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        user.googleId = profile.id;
                        user.provider = 'google';
                        if (!user.avatar) user.avatar = profile.photos[0]?.value;
                        await user.save();
                    } else {
                        user = await User.create({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            googleId: profile.id,
                            provider: 'google',
                            avatar: profile.photos[0]?.value || '',
                            isEmailVerified: true,
                        });
                    }
                }
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.SERVER_URL}/api/v1/auth/github/callback`,
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
                let user = await User.findOne({ githubId: profile.id });
                if (!user) {
                    user = await User.findOne({ email });
                    if (user) {
                        user.githubId = profile.id;
                        user.provider = 'github';
                        if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
                        await user.save();
                    } else {
                        user = await User.create({
                            name: profile.displayName || profile.username,
                            email,
                            githubId: profile.id,
                            provider: 'github',
                            avatar: profile.photos?.[0]?.value || '',
                            isEmailVerified: true,
                        });
                    }
                }
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
