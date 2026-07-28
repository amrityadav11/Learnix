# Course Marketplace - Complete Feature Test Guide

## ✅ Features Implemented

### 1. Add to Cart + Payment Gateway Selection

**Location**: Course Detail Page (`/courses/:slug`)

**Features**:
- ✅ **"Add to Cart" Button** - Adds course to cart with toast notification
- ✅ **"Buy Now" Button** - Direct checkout (alternative option)
- ✅ **Cart Storage** - Persisted in localStorage
- ✅ **Payment Gateway Selection**:
  - Razorpay (UPI, Cards, Net Banking - for India)
  - Stripe (International Cards)
- ✅ **Coupon Application** - WELCOME50 (50% discount)
- ✅ **Real-time Total Calculation** - With discounts

---

### 2. Course Creation with Enhanced Features

**Location**: Admin Dashboard → Manage Courses → Add Course

**Features Added**:
- ✅ **Thumbnail/Logo Upload** - Drag & drop or click to upload
- ✅ **"What You'll Learn" Section** - Add multiple learning points
- ✅ **Instructor Info Display** - Shows admin as creator
- ✅ **Auto-Publish** - Admin-created courses immediately published
- ✅ **Real-time Preview** - See thumbnail preview before upload

---

## 📋 Step-by-Step Test Instructions

### Test 1: Add Course to Cart and Checkout with Razorpay

#### Prerequisites:
- Frontend running on: `http://localhost:5173`
- Backend running on: `http://localhost:3001`

#### Steps:

1. **Navigate to any course**
   - Go to `http://localhost:5173/`
   - Click on any course card or use "Explore Courses"

2. **Click "Add to Cart"**
   - Should see: "Added to cart!" toast notification
   - Course appears in sidebar with cart icon updated

3. **View Cart**
   - Click cart icon or go to `/cart`
   - Should see course with thumbnail, title, instructor, price

4. **Apply Coupon**
   - Enter: `WELCOME50`
   - Click "Apply"
   - Should see: "Coupon applied! You saved $XX" (50% off)

5. **Proceed to Checkout**
   - Click "Proceed to Checkout" button
   - See payment method selection

6. **Select Razorpay**
   - Click "Razorpay" option
   - Should show: UPI, Cards, Net Banking badge

7. **Click "Pay $XX" Button**
   - Razorpay modal opens
   - Test with card: 4111 1111 1111 1111
   - OTP: 123456
   - Verify payment success

---

### Test 2: Create Course with Thumbnail and Learning Points

#### Prerequisites:
- Logged in as admin: `admin@learnix.com` / `Admin@123`
- Admin Dashboard accessible

#### Steps:

1. **Navigate to Manage Courses**
   - Go to `/admin` → "Manage Courses"

2. **Click "Add Course" Button**
   - Should see modal with enhanced form

3. **Upload Thumbnail**
   - Click image upload area
   - Select any JPG/PNG file
   - Should see image preview

4. **Fill Course Details**
   - Title: "Advanced Web Development 2024"
   - Description: "Learn modern web technologies..."
   - Category: Select any (e.g., Web Development)
   - Price: 99.99
   - Level: Intermediate
   - Language: English

5. **Add Learning Points**
   - "React.js Fundamentals"
   - "Advanced State Management"
   - "Next.js & SSR"
   - Click "+ Add more learning points" to add more

6. **Review Instructor Info**
   - Should show: "Admin User" as instructor
   - Shows: "This course will be created by and assigned to the admin account"

7. **Create Course**
   - Click "Create Course" button
   - Should see: "Course created and published with thumbnail!" toast
   - Modal closes

8. **Verify Course Appears**
   - Check courses list - should show new course with "published" status
   - Go to homepage - should appear in featured section
   - Check `/courses` page - should be listed

9. **View Course Details**
   - Click on created course
   - Verify:
     - ✅ Thumbnail displays correctly
     - ✅ "What you'll learn" section shows learning points
     - ✅ Instructor section shows admin info
     - ✅ Add to Cart button present

---

### Test 3: Complete Purchase Flow

#### Prerequisites:
- Cart has at least 1 course
- Coupon applied (optional)

#### Steps:

1. **From Course Detail Page**
   - Click "Add to Cart"

2. **Go to Checkout**
   - Navigate to `/checkout`

3. **Review Items**
   - Verify course appears with correct price
   - Verify thumbnail displays

4. **Apply Coupon (Optional)**
   - Apply: WELCOME50
   - Verify discount shown

5. **Select Payment Method**
   - Choose Razorpay or Stripe

6. **Complete Payment**
   - Click "Pay $XX" button
   - Fill payment details
   - Verify success page: `/payment/success`

7. **Verify Enrollment**
   - Go to `/dashboard/my-learning`
   - Course should appear in "My Courses"

---

## 🔍 API Endpoints Verification

### Course Endpoints:
```bash
# Get all published courses
GET http://localhost:3001/api/v1/courses

# Get featured courses
GET http://localhost:3001/api/v1/courses/featured

# Create course (admin auto-publishes)
POST http://localhost:3001/api/v1/courses
Body: {
  title: "Course Name",
  description: "Description",
  category: "categoryId",
  price: 99.99,
  whatYouLearn: ["Point 1", "Point 2"],
  level: "Beginner",
  language: "English"
}

# Upload thumbnail
PUT http://localhost:3001/api/v1/courses/:id/thumbnail
FormData: { thumbnail: File }
```

### Order Endpoints:
```bash
# Apply coupon
POST http://localhost:3001/api/v1/orders/apply-coupon
Body: { code: "WELCOME50", totalAmount: 99.99 }

# Create Razorpay order
POST http://localhost:3001/api/v1/orders/razorpay/create
Body: { courseIds: [...], couponCode: "WELCOME50" }

# Create Stripe session
POST http://localhost:3001/api/v1/orders/stripe/create-session
Body: { courseIds: [...], couponCode: "WELCOME50" }
```

---

## 🎯 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@learnix.com | Admin@123 |
| Instructor | sarah@learnix.com | Instructor@123 |
| Student | student@learnix.com | Student@123 |

## 💳 Test Payment Cards

| Provider | Card Number | Expiry | CVV | OTP |
|----------|------------|--------|-----|-----|
| Razorpay | 4111 1111 1111 1111 | Any Future | Any 3 digits | 123456 |
| Stripe | 4242 4242 4242 4242 | 12/25 | 123 | N/A |

---

## ✅ All Features Checklist

- [x] Add to Cart button on course detail page
- [x] Cart persistence in localStorage
- [x] Coupon code application (WELCOME50)
- [x] Payment gateway selection (Razorpay + Stripe)
- [x] Course creation with thumbnail upload
- [x] "What you'll learn" section in course creation
- [x] Instructor info displayed in course details
- [x] Auto-publish for admin-created courses
- [x] Real-time price calculation with discounts
- [x] Payment success flow
- [x] Course enrollment after purchase
- [x] Cart page with remove functionality

---

## 🐛 Troubleshooting

### Issue: Cart is empty after refresh
**Solution**: Check browser's localStorage. The cart is stored in `localStorage.getItem('cart')`

### Issue: Course not showing after creation
**Solution**: 
1. Verify status is "published" in admin courses list
2. Refresh the homepage
3. Check that `isPublished: true` in database

### Issue: Payment gateway not loading
**Solution**:
1. Check internet connection (APIs need to load external scripts)
2. Verify API keys in `.env` files
3. Check browser console for errors

### Issue: Thumbnail not uploading
**Solution**:
1. Verify image size < 5MB
2. Check CORS configuration on Cloudinary
3. Verify `CLOUDINARY_*` env variables are set

---

## 📝 Notes

- Courses created by admins are immediately published (status: "published", isPublished: true)
- Courses created by instructors remain in draft status until admin approval
- Cart is stored locally and persists across sessions
- Coupon code "WELCOME50" provides 50% discount
- Both Razorpay (India) and Stripe (International) are supported
- All course details (thumbnail, learning points, instructor) are displayed on detail page

---

## 🚀 Next Steps

1. Test each feature following the step-by-step guide
2. Verify all API responses are 200/201
3. Check browser console for errors
4. Test on different devices/browsers
5. Verify database records are created correctly

**Happy Testing! 🎉**
