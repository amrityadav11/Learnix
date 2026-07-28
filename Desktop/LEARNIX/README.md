# LEARNIX

A modern, production-ready full-stack learning marketplace similar to Udemy and Coursera.

## Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS + Shadcn UI
- Framer Motion
- Redux Toolkit
- React Router v6
- Axios
- React Player
- Lucide React Icons
- React Hot Toast

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.io
- Stripe + Razorpay
- Cloudinary
- Nodemailer
- Bcrypt
- Express Validator
- Helmet
- Rate Limiter
- Morgan

## Features

- ✅ Complete Authentication (JWT, OAuth, OTP)
- ✅ Course Management (CRUD, Publish/Unpublish, Duplicate)
- ✅ Video Player with progress tracking
- ✅ Payment Integration (Stripe + Razorpay)
- ✅ Admin Panel (Dashboard, Users, Courses, Orders, Analytics)
- ✅ Instructor Dashboard
- ✅ Real-time Chat & Notifications
- ✅ Quiz System (MCQ, True/False, Coding)
- ✅ Certificate Generation
- ✅ Blog System
- ✅ SEO Optimized
- ✅ PWA Support
- ✅ Dark/Light Mode
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Multi-language Support
- ✅ Referral System
- ✅ Affiliate Program
- ✅ Gamification (Badges, Achievements, Streak)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn
- Cloudinary account
- Stripe account
- Razorpay account

### Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

### Database Seed
```bash
cd backend
npm run seed
```

## API Documentation

Once the server is running, visit: `http://localhost:5000/api/docs`

## Default Test Accounts

After running the seed script:

- **Admin**: admin@learnix.com / Admin@123
- **Instructor**: sarah@learnix.com / Instructor@123
- **Student**: student@learnix.com / Student@123
- **Coupon**: WELCOME50 (50% off)

## Project Structure

```
learnix/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary, Passport
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, error handling, upload
│   │   ├── services/        # External integrations
│   │   ├── utils/           # Helpers (JWT, email, certificate)
│   │   └── socket/          # Socket.io handlers
│   └── uploads/            # File uploads
├── frontend/
│   └── src/
│       ├── api/            # Axios configuration
│       ├── assets/         # Images, fonts
│       ├── components/     # Reusable components
│       │   ├── ui/         # Shadcn components
│       │   ├── common/     # Shared components
│       │   └── layout/     # Layouts
│       ├── pages/          # Page components
│       ├── redux/          # Redux slices
│       └── utils/          # Helper functions
└── docker-compose.yml      # Docker configuration
```

## Environment Variables

### Backend (.env.example)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/learnix
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@learnix.com
FROM_NAME=LEARNIX

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

### Frontend (.env.example)
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_NAME=LEARNIX
```

## Docker Deployment

```bash
docker-compose up -d --build
```

## Deployment

### Backend (Render/Heroku)
1. Push to GitHub
2. Create new Web Service
3. Connect repository
4. Add environment variables
5. Deploy

### Frontend (Vercel/Netlify)
1. Push to GitHub
2. Import project
3. Add environment variables
4. Deploy

## Testing

```bash
# Backend
npm test

# Frontend
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@coursemarket.com or join our Discord server.

---

Made with ❤️ by CourseMart Team