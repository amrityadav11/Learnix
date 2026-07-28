# Quick Start Guide - LEARNIX

## 🚀 System Status
- ✅ Backend: http://localhost:3001
- ✅ Frontend: http://localhost:5173  
- ✅ MongoDB: localhost:27017

## 🔐 Login Credentials

### Admin Account
```
Email: admin@learnix.com
Password: Admin@123
```
**Access**: Create courses, manage users, view stats

### Student Account
```
Email: student@learnix.com
Password: Student@123
```
**Access**: Browse, purchase, learn courses

### Instructor Account
```
Email: sarah@learnix.com
Password: Instructor@123
```
**Access**: Create and manage courses

---

## 📝 Complete User Journey

### For Students: Browse → Buy → Learn

1. **Homepage** → http://localhost:5173
   - See featured courses and categories

2. **View Course Details** → Click any course
   - See full curriculum
   - Check what you'll learn
   - View instructor info
   - See reviews and ratings

3. **Add to Cart** → Click "Add to Cart" button
   - Courses added to Redux cart

4. **Go to Checkout** → Click "Cart" or navigate to `/checkout`
   - See all items with thumbnails
   - Apply coupon: `WELCOME50` (50% off)
   - Select payment method:
     - **Razorpay** (India): UPI, Cards, Net Banking
     - **Stripe** (International): Visa, Mastercard

5. **Complete Payment**
   - For **Razorpay**: Redirects to Razorpay payment page
   - For **Stripe**: Redirects to Stripe checkout
   - Auto-enrollment after successful payment

6. **View My Learning** → /dashboard/my-learning
   - See all enrolled courses
   - Click "Continue Learning" to watch

7. **Watch Course** → /learn/:courseId
   - Video player with controls
   - Sidebar with all lessons/quizzes/PDFs
   - Mark lesson complete
   - Progress auto-saves

8. **View Orders** → /dashboard/orders
   - See all purchase history
   - Invoice details
   - Payment status
   - Links to courses

---

### For Admin: Create Courses

1. **Login** with admin account
   - Email: admin@learnix.com
   - Password: Admin@123

2. **Go to Admin Panel** → /admin
   - Click "Manage Courses"

3. **Create New Course** → Click "Add Course"
   - Fill in form:
     - **Title**: Course name
     - **Description**: What it covers
     - **Category**: Select from dropdown
     - **Price**: In USD
     - **Level**: Beginner/Intermediate/Advanced
     - **Language**: English/Hindi/Spanish/etc
     - **Upload Thumbnail**: Drag-and-drop or click
     - **What You Will Learn**: Add learning points
     - **Requirements**: Add prerequisites

4. **Create Course**
   - Course auto-published ✅
   - Appears on homepage immediately
   - Visible in courses listing
   - Students can purchase

5. **View Dashboard** → /admin (Home)
   - See total users, courses, orders, revenue
   - View recent orders
   - Check top-performing courses

6. **Manage Users** → /admin/users
   - View all users
   - Change roles
   - Suspend/activate accounts

---

## 🛒 Key Features Checklist

### ✅ Course Creation
- [x] Upload thumbnail/logo
- [x] Add what students will learn
- [x] Set requirements
- [x] Auto-publish for admin
- [x] Show instructor info

### ✅ Shopping & Payment
- [x] Add to cart button
- [x] Cart page with thumbnails
- [x] Coupon code system (WELCOME50)
- [x] Payment gateway selection
- [x] Razorpay integration
- [x] Stripe integration

### ✅ Student Enrollment
- [x] Auto-enroll after payment
- [x] Show in "My Learning"
- [x] Track progress percentage
- [x] Continue learning button

### ✅ Course Player
- [x] Video player with controls
- [x] Play/pause, seek, volume, speed
- [x] Fullscreen mode
- [x] Sidebar lessons list
- [x] Mark lesson complete
- [x] Progress tracking

### ✅ Order History
- [x] View all orders
- [x] See invoice details
- [x] Check payment status
- [x] Link to courses
- [x] Show instructor info

### ✅ Certificates
- [x] Auto-generate on 100% completion
- [x] Store certificate ID
- [x] View certificate link

---

## 🧪 Test the Complete Flow

### 1. Add Course to Cart
```
1. Login as student@coursemarket.com
2. Go to /courses
3. Click on any course (e.g., "React.js Developer Course")
4. Click "Add to Cart"
5. See toast: "Added to cart"
```

### 2. Checkout with Coupon
```
1. Click cart icon or go to /checkout
2. See course with thumbnail and price
3. Scroll to coupon section
4. Enter: WELCOME50
5. Click "Apply"
6. See discount calculated (50% off)
7. Final amount shown
```

### 3. Select Payment Gateway
```
1. Choose Razorpay (India) or Stripe (International)
2. Click "Pay $[amount]"
3. Razorpay: Opens payment window
4. Stripe: Redirects to checkout
5. Complete payment (use test cards)
```

### 4. Auto-Enrollment
```
1. After payment success
2. Redirects to /payment/success
3. Auto-enrolled in course
4. Course appears in My Learning
5. See progress at 0%
```

### 5. Watch Course
```
1. Go to /dashboard/my-learning
2. See enrolled course with thumbnail
3. Click "Continue Learning"
4. Video player opens
5. Watch video, control playback
6. Click "Mark Complete" at the end
7. Progress updates to next lesson
```

### 6. View Order
```
1. Go to /dashboard/orders
2. See order with invoice number
3. See payment method and amount
4. See course in order
5. Click "Learn" to continue course
```

---

## 📱 API Endpoints (For Testing)

### Courses
```
GET /api/v1/courses - All published courses
GET /api/v1/courses/featured - Featured/trending courses
POST /api/v1/courses - Create course (admin/instructor)
PUT /api/v1/courses/:id/thumbnail - Upload thumbnail
```

### Orders
```
GET /api/v1/orders/my-orders - Student's orders
POST /api/v1/orders/stripe/create-session - Stripe checkout
POST /api/v1/orders/razorpay/create - Razorpay checkout
POST /api/v1/orders/apply-coupon - Validate coupon
```

### Progress
```
GET /api/v1/progress/my-learning - Enrolled courses
POST /api/v1/progress/:courseId/complete-lesson - Mark complete
```

---

## 🎓 Test Data

### Courses Available
1. **Complete React.js Developer Course 2024** - Dr. Sarah Johnson - $39.99
2. **Python for Data Science & ML** - Prof. Michael Chen - $50.99
3. **Node.js & Express Backend** - Dr. Sarah Johnson - $40.49
4. **AWS Cloud Practitioner** - Prof. Michael Chen - $29.99

### Coupon Codes
- **WELCOME50** - 50% discount on any purchase

### Categories (18 total)
- Programming, Web Development, AI & ML, Data Science
- Cyber Security, Cloud Computing, Blockchain, Marketing
- Design, Business, Finance, Photography, Music
- Health & Fitness, Language, Video Editing, UPSC, Communication

---

## 🐛 Troubleshooting

### Course Not Showing After Creation?
- [x] Check course status: Should be "published"
- [x] Check isPublished: Should be true
- [x] Check isApproved: Should be true
- [x] Hard refresh: Ctrl+Shift+R (browser cache)

### Payment Not Working?
- [x] Razorpay: Check API keys in .env
- [x] Stripe: Check SECRET_KEY in .env
- [x] Make sure using test card numbers
- [x] Check browser console for errors

### Can't See "My Learning"?
- [x] Must be logged in as student
- [x] Must have completed checkout
- [x] Check /api/v1/progress/my-learning response
- [x] Should show enrolled courses

### Video Not Playing?
- [x] Check CoursePlayerPage component
- [x] Verify lesson has videoUrl
- [x] Check browser console for CORS errors
- [x] Ensure course has modules with lessons

---

## 📞 Support

For issues:
1. Check browser console (F12)
2. Check network tab for failed requests
3. Check backend logs (node console)
4. Verify MongoDB connection
5. Check .env configuration

---

**Everything is ready to use!** 🎉

Start with logging in as a student and browsing courses. Try the complete checkout flow with the WELCOME50 coupon code.
