# 🛍️ Davnex - Premium Accessories E-Commerce & Lodge Internet Hub

A comprehensive platform combining premium accessories e-commerce with Lodge Internet services, built with Next.js 14, Firebase, and Paystack.

![Davnex Store](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Firebase](https://img.shields.io/badge/Firebase-Latest-orange) ![Paystack](https://img.shields.io/badge/Paystack-Integrated-green) ![Lodge Internet](https://img.shields.io/badge/Lodge%20Internet-Active-brightgreen)

---

## ✨ Features

### 🛍️ **E-Commerce Store Features**

#### 🛒 Customer Features

- **Modern Product Catalog** - Beautiful, responsive product browsing with advanced filtering
- **Category Navigation** - Apple Store-style horizontal category navigation
- **Product Detail Pages** - High-quality image galleries, descriptions, and specifications
- **Smart Shopping Cart** - Persistent cart that saves across browser sessions
- **Discount System** - Show original prices with discount percentages and badges
- **Inventory Management** - Smart stock tracking with "Out of Stock", "Back in Stock" badges
- **Coming Soon Products** - Countdown timers for unreleased products
- **Secure Checkout** - Integrated Paystack payment gateway for Nigerian Naira (₦)
- **Mobile Responsive** - Perfect experience on all devices

#### 🎨 Admin Dashboard

- **Product Management** - Add, edit, and delete products with advanced options
- **Category Management** - Create and organize product categories
- **Section Management** - Organize homepage sections and layout
- **Inventory Tracking** - Monitor stock levels, featured products, and availability dates
- **Order Management** - View, track, and manage customer orders
- **Image Upload** - Direct uploads to Cloudinary CDN for optimized images
- **No Coding Required** - User-friendly interface for non-technical users

### 🌐 **Lodge Internet System**

#### 📱 Device Access Codes (WiFi Plans)

- **Multi-Device Plans** - 3-device and 5-device WiFi access plans
- **Instant Code Generation** - Encrypted access codes for secure WiFi access
- **Automated Email Delivery** - Customers receive access codes via email instantly
- **Purchase Logging** - Complete audit trail of all code purchases
- **Admin Code Management** - Bulk code upload, monitoring, and management
- **Paystack Integration** - Secure payment processing for data plans

#### 📺 TV Unlimited Subscriptions

- **Subscription Management** - Duration-based TV access plans
- **User Account System** - Individual dashboards for TV subscribers
- **MAC Address Encryption** - Secure storage of device identifiers
- **Admin Activation Control** - Manual subscription activation workflow
- **Automated Expiry Management** - Smart checking and notification system
- **Renewal System** - Easy subscription renewal process

#### 📧 Advanced Email Notification System

- **Device Code Emails** - Instant delivery of access codes with plan details
- **TV Subscription Lifecycle** - Creation, activation, expiry warnings, and expired notifications
- **Admin Notifications** - Real-time alerts for new subscriptions requiring activation
- **Custom Email Templates** - Professional HTML emails with branding
- **Email Preferences** - User control over notification types

#### 👨‍💼 Lodge Internet Admin Features

- **Data Code Dashboard** - Monitor code inventory, add bulk codes, view purchase logs
- **TV User Management** - Activate subscriptions, manage users, handle renewals
- **Purchase Analytics** - Track revenue, popular plans, and user activity
- **Automated Expiry Monitoring** - Daily cron jobs check subscriptions and send notifications (see [CRON_JOB_GUIDE.md](./CRON_JOB_GUIDE.md))
- **Customer Feedback** - Review system and complaint management
- **MAC Address Migration** - Tools for updating user device information

### 🔒 Security & Performance

- **Data Encryption** - AES-256 encryption for sensitive data (access codes, MAC addresses)
- **Secure Authentication** - Protected admin routes with role-based access
- **Firebase Security Rules** - Comprehensive database access controls
- **Firestore Database** - Fast, scalable NoSQL database with real-time updates
- **Optimized Images** - Automatic image optimization via Cloudinary CDN
- **Email Security** - Secure SMTP with app passwords and rate limiting
- **Environment Variables** - Secure credential management for all services
- **SEO Friendly** - Built with Next.js 14 App Router for optimal performance

---

## 🚀 Quick Start

**⚡ 5-Minute Setup** - Read **[QUICK_START.md](./QUICK_START.md)** for the fastest way to get running!

**📚 Detailed Guide** - Read **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for complete instructions.

### Prerequisites

- Node.js 18+ installed
- A Firebase account (free)
- A Paystack account (free to start)

### Installation

1. **Clone and Install**

```bash
git clone <your-repo>
cd davnex
npm install
```

2. **Configure Environment Variables**

Copy `.env.local` and add your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Paystack Configuration (Payment Processing)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
NEXT_PUBLIC_PAYSTACK_SECRET_KEY=sk_test_your_secret_key

# Cloudinary Configuration (Image CDN)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Admin Authentication
ADMIN_USERNAME=davo
ADMIN_PASSWORD=davo

# Lodge Internet Security (Server-side only)
DATA_CODE_SECRET_KEY=your_32_byte_hex_encryption_key

# Cron Job Authentication
CRON_SECRET=xkV0OTYlC2pnn4cVRQ8D3yZsXJhtmFvRw7LECcGVE1U=

# Email Configuration (SMTP)
EMAIL_APP_PASSWORD=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
ADMIN_EMAIL=admin_notifications@gmail.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Environment Variables Explained

| Variable                   | Purpose                              | Required |
| -------------------------- | ------------------------------------ | -------- |
| `NEXT_PUBLIC_FIREBASE_*`   | Firebase SDK configuration           | ✅ Yes   |
| `NEXT_PUBLIC_PAYSTACK_*`   | Payment processing                   | ✅ Yes   |
| `NEXT_PUBLIC_CLOUDINARY_*` | Image hosting & optimization         | ✅ Yes   |
| `ADMIN_USERNAME/PASSWORD`  | Admin dashboard access               | ✅ Yes   |
| `DATA_CODE_SECRET_KEY`     | Encrypts Lodge Internet access codes | ✅ Yes   |
| `CRON_SECRET`              | Authenticates automated cron jobs    | ✅ Yes   |
| `EMAIL_APP_PASSWORD`       | Gmail SMTP authentication            | ✅ Yes   |
| `EMAIL_FROM`               | Sender email address                 | ✅ Yes   |
| `ADMIN_EMAIL`              | Receives subscription notifications  | ✅ Yes   |
| `NEXT_PUBLIC_BASE_URL`     | Used in email templates              | ✅ Yes   |

3. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
davnex/
├── app/                          # Next.js 14 App Router
│   ├── (main)/                   # Main e-commerce application
│   │   ├── admin/
│   │   │   ├── dashboard/        # Product & content management
│   │   │   ├── data-codes/       # Lodge Internet code management
│   │   │   ├── tv-users/         # TV subscription management
│   │   │   └── purchase-logs/    # Sales analytics & logs
│   │   ├── api/
│   │   │   ├── data-codes/       # Device access code APIs
│   │   │   │   ├── claim/        # Code purchase & delivery
│   │   │   │   ├── add/          # Bulk code upload
│   │   │   │   └── feedback/     # Customer feedback system
│   │   │   ├── tv/               # TV subscription APIs
│   │   │   │   ├── purchase/     # Subscription creation
│   │   │   │   ├── activate/     # Admin activation
│   │   │   │   └── check-expiry/ # Automated expiry management
│   │   │   └── email/            # Email notification APIs
│   │   ├── cart/                 # E-commerce shopping cart
│   │   ├── checkout/             # Payment processing
│   │   ├── product/[id]/         # Dynamic product pages
│   │   ├── category/[slug]/      # Category browsing
│   │   └── page.tsx              # E-commerce homepage
│   ├── (standalone)/             # Standalone applications
│   │   └── internet/             # Lodge Internet portal
│   │       ├── page.tsx          # Device & TV plan selection
│   │       ├── dashboard/        # TV user dashboard
│   │       └── login/            # TV user authentication
│   └── layout.tsx                # Root layout
├── components/
│   ├── admin/                    # Admin-only components
│   │   └── ProtectedRoute.tsx    # Authentication middleware
│   ├── sections/                 # Homepage sections
│   │   ├── ComingSoonSection.tsx # Product countdown timers
│   │   ├── DynamicSection.tsx    # Configurable product sections
│   │   └── LatestProducts.tsx    # Featured product displays
│   ├── AuthModal.tsx             # User authentication modal
│   ├── CategoryNavigation.tsx    # Horizontal category bar
│   ├── CountdownTimer.tsx        # Coming soon product countdown
│   ├── Header.tsx                # Site navigation with cart
│   ├── Footer.tsx                # Site footer
│   └── ProductBadge.tsx          # Dynamic product status badges
├── lib/
│   ├── firebase.ts               # Firebase configuration
│   ├── cloudinary.ts             # Image upload service
│   ├── dataCodeCrypto.ts         # Access code encryption
│   ├── macAddressCrypto.ts       # Device ID encryption
│   ├── productUtils.ts           # Product badge & availability logic
│   ├── sections.ts               # Homepage section management
│   └── email/
│       ├── emailService.ts       # SMTP email delivery
│       └── emailTemplates.ts     # HTML email templates
├── store/
│   ├── cartStore.ts              # E-commerce cart state
│   ├── authStore.ts              # Admin authentication
│   └── userStore.ts              # User session management
├── types/
│   └── index.ts                  # TypeScript definitions for all entities
├── hooks/
│   ├── useProducts.ts            # Product fetching & management
│   └── useRecentlyViewed.ts      # User browsing history
├── .env.local                    # Environment variables (secrets)
├── vercel.json                   # Vercel deployment & cron configuration
├── CRON_JOB_GUIDE.md             # Automated expiry monitoring guide
├── EMAIL_NOTIFICATIONS_GUIDE.md # Email system documentation
├── QUICK_START.md                # 5-minute setup guide
└── TIMESTAMP_FIX.md              # Firebase timestamp handling guide
```

### Key Directories Explained

#### `app/(main)/` - E-Commerce Platform

- **Admin dashboards** with full CRUD for products, categories, orders, and Lodge Internet services
- **API routes** for all business logic including payments, notifications, and data management
- **Customer-facing pages** for browsing, shopping, and checkout

#### `app/(standalone)/internet/` - Lodge Internet Portal

- **Standalone application** for Lodge Internet services separate from e-commerce
- **Device code purchasing** with instant delivery and Paystack integration
- **TV subscription management** with user dashboards and account creation

#### `lib/email/` - Advanced Email System

- **Professional HTML templates** for all customer communications
- **Automated lifecycle emails** for subscriptions, renewals, and expiry warnings
- **Admin notifications** for new subscriptions requiring activation

#### Security & Encryption (`lib/...Crypto.ts`)

- **AES-256 encryption** for sensitive access codes and device identifiers
- **Hash functions** for secure data storage while maintaining admin visibility
- **Environment variable protection** for all encryption keys

---

## 🎯 Usage

### 🛍️ E-Commerce Admin Dashboard

1. **Login**
   - Navigate to `/admin/login`
   - Default credentials: `davo` / `davo`

2. **Product Management**
   - Click "Add New Product"
   - Upload images via Cloudinary
   - Set pricing with optional discount display
   - Configure stock quantities and availability dates
   - Set category and featured status
   - **Coming Soon Products**: Set future availability date for countdown timer

3. **Category Management**
   - Create product categories with images
   - Set display order for navigation bar
   - Enable/disable categories dynamically

4. **Order Management**
   - View all customer orders with status tracking
   - Update order status (packing → on-the-way → delivered)
   - Monitor payment status and delivery methods

### 🌐 Lodge Internet Management

#### Data Codes (WiFi Access)

1. **Code Management** (`/admin/data-codes`)
   - **Bulk Upload**: Upload hundreds of encrypted access codes
   - **Monitor Inventory**: Track code availability by plan (3-device, 5-device)
   - **Purchase Logs**: View all code sales with customer details
   - **Customer Feedback**: Review customer reviews and handle complaints

2. **Customer Purchase Flow**
   - Customer selects device plan (3 or 5 devices) at `/internet`
   - Pays via Paystack integration
   - Receives encrypted access code via email instantly
   - Code is permanently deleted from inventory

#### TV Unlimited Subscriptions

1. **Subscription Management** (`/admin/tv-users`)
   - **Pending Tab**: New subscriptions requiring activation
   - **Active Tab**: Currently active subscribers with expiry dates
   - **Expired Tab**: Expired subscriptions needing renewal
   - **Manual Activation**: Approve subscriptions after payment

2. **TV User Dashboard** (`/internet/dashboard`)
   - Users can view subscription status, expiry dates
   - Access renewal options
   - Update account information

3. **Automated Features** (🕐 **[CRON_JOB_GUIDE.md](./CRON_JOB_GUIDE.md)**)
   - **Daily Cron Jobs**: Automated subscription monitoring via Vercel Cron or GitHub Actions
   - **Expiry Checking**: Automatic daily checks for expiring/expired subscriptions at 9 AM UTC
   - **24-Hour Warnings**: Email notifications sent to customers 24 hours before expiry
   - **Expiry Notifications**: Automatic status updates and customer notifications when subscriptions expire
   - **Admin Summaries**: Daily email reports with statistics and actionable insights
   - **MAC Address Security**: Device identifiers encrypted for privacy

### 📧 Email System

The platform automatically sends professional HTML emails for:

#### Device Codes

- **Purchase Confirmation**: Includes access code, plan details, and usage instructions
- **Sent to**: Customer immediately after payment

#### TV Subscriptions

- **Creation**: Welcome email with subscription details (pending activation)
- **Activation**: Confirmation when admin activates subscription
- **Expiry Warning**: 24-hour reminder with renewal link
- **Expired**: Service inactive notification with renewal options
- **Admin Alerts**: New subscription notifications requiring activation

### 🛒 Customer Shopping Flow

#### E-Commerce

1. **Browse** - View products with category filtering
2. **Filter** - Use category navigation or search
3. **Select** - Click product for detailed view with image gallery
4. **Add to Cart** - Smart cart with quantity management
5. **Checkout** - Secure Paystack payment processing
6. **Track** - Order status updates and email notifications

#### Lodge Internet

1. **Select Plan** - Choose device (WiFi) or TV plan at `/internet`
2. **Payment** - Secure Paystack processing
3. **Device Codes**: Instant email delivery with access instructions
4. **TV Subscriptions**: Account creation + admin activation workflow
5. **Management** - Dashboard access for TV users
6. **Select** - Click product to view details
7. **Add to Cart** - Click "Add to Cart" button
8. **Checkout** - Click cart icon, proceed to checkout
9. **Pay** - Complete payment via Paystack
10. **Confirm** - Receive order confirmation

---

## 🔧 Tech Stack

### Core Technologies

| Technology             | Purpose                         |
| ---------------------- | ------------------------------- |
| **Next.js 14**         | React framework with App Router |
| **TypeScript**         | Type-safe development           |
| **Tailwind CSS**       | Utility-first styling           |
| **Firebase Firestore** | NoSQL database                  |
| **Firebase Storage**   | File storage (legacy products)  |
| **Zustand**            | State management                |

### Payment & Services

| Service        | Purpose                  |
| -------------- | ------------------------ |
| **Paystack**   | Payment processing       |
| **Cloudinary** | CDN & image optimization |
| **Nodemailer** | Email delivery service   |

### Lodge Internet Technologies

| Technology              | Purpose                         |
| ----------------------- | ------------------------------- |
| **Crypto (Node.js)**    | AES-256 encryption for codes    |
| **MAC Address Hashing** | Secure device identification    |
| **SMTP Email**          | Transactional notifications     |
| **Firebase Auth**       | User authentication & sessions  |
| **Automated Cron Jobs** | Expiry checking & notifications |

### Development Tools

| Tool                   | Purpose                         |
| ---------------------- | ------------------------------- |
| **Lucide React**       | Icon library                    |
| **React Hot Toast**    | Notification system             |
| **Firebase Admin SDK** | Server-side Firebase operations |

---

## 💳 Payment Testing

Use these test cards in **test mode**:

| Card Number         | CVV | Expiry     | Result  |
| ------------------- | --- | ---------- | ------- |
| 4084 0840 8408 4081 | 408 | Any future | Success |
| 5060 6666 6666 6666 | 123 | Any future | Success |

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - It contains your secret keys
2. **Change default admin password** - Edit `store/authStore.ts` before production
3. **Use Firebase security rules** - Already configured in setup guide
4. **Enable Paystack live mode** - Only after completing business verification

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Prepare for Deployment**

   ```bash
   npm run build  # Test build locally
   ```

2. **Deploy to Vercel**
   - Push code to GitHub/GitLab
   - Import project in [Vercel](https://vercel.com)
   - Add all environment variables from `.env.local`
   - Deploy!

3. **Post-Deployment Setup**
   - Update `NEXT_PUBLIC_BASE_URL` with your domain
   - Configure Gmail app passwords for production email
   - Switch Paystack to live mode (after business verification)
   - Set up Cloudinary production environment

### Environment Variables for Production

**⚠️ Required for deployment:**

```env
# All NEXT_PUBLIC_* variables (Firebase, Paystack, Cloudinary)
# EMAIL_* variables for notifications
# DATA_CODE_SECRET_KEY for Lodge Internet security
# ADMIN_* credentials (change defaults!)
```

**Critical Security:**

- Generate new encryption keys for `DATA_CODE_SECRET_KEY`
- Change default admin credentials
- Enable Firebase security rules
- Use Paystack live keys only after verification

---

## 🔐 Security Notes

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different encryption keys for production
   - Rotate keys periodically for enhanced security

2. **Admin Security**
   - Change default admin password immediately
   - Use strong passwords (12+ characters)
   - Consider implementing 2FA for production

3. **Payment Security**
   - Test thoroughly with Paystack test cards
   - Enable live mode only after business verification
   - Monitor transactions for unusual activity

4. **Email Security**
   - Use app passwords, never regular passwords
   - Monitor email sending limits and quotas
   - Set up email authentication (SPF, DKIM)

5. **Database Security**
   - Firebase security rules are configured
   - Regular backups recommended for production
   - Monitor usage and set billing alerts

## 📊 Features Breakdown

### ✅ E-Commerce Features (Implemented)

- [x] **Product Management**: Full CRUD with advanced options (discounts, stock, coming soon dates)
- [x] **Category System**: Apple Store-style navigation with dynamic categories
- [x] **Advanced Inventory**: Stock badges, coming soon countdown timers, back-in-stock alerts
- [x] **Shopping Cart**: Persistent cart with quantity management and session storage
- [x] **Secure Checkout**: Paystack integration with Nigerian Naira support
- [x] **Order Tracking**: Complete order lifecycle management with status updates
- [x] **Admin Dashboard**: Comprehensive management interface with analytics
- [x] **Image Management**: Cloudinary CDN integration with automatic optimization
- [x] **Mobile Responsive**: Perfect experience across all device sizes

### ✅ Lodge Internet Features (Implemented)

#### Device Access Codes (WiFi)

- [x] **Instant Code Delivery**: Encrypted access codes via email within seconds
- [x] **Multi-Device Plans**: 3-device and 5-device WiFi access options
- [x] **Bulk Code Management**: Admin tools for uploading and managing thousands of codes
- [x] **Purchase Analytics**: Complete sales tracking and customer insights
- [x] **Customer Feedback**: Review system and complaint management
- [x] **Security**: AES-256 encryption for all access codes

#### TV Unlimited Subscriptions

- [x] **Subscription Lifecycle**: Complete flow from purchase to activation to expiry
- [x] **User Dashboards**: Individual subscriber portals with account management
- [x] **Admin Controls**: Manual activation, user management, and analytics
- [x] **MAC Address Security**: Encrypted device identifier storage
- [x] **Automated Expiry**: Daily checking with email notifications
- [x] **Renewal System**: Seamless subscription renewal workflow

#### Email Notification System

- [x] **Professional Templates**: HTML emails with consistent branding
- [x] **Device Code Emails**: Instant delivery with plan details and instructions
- [x] **TV Subscription Emails**: Creation, activation, expiry warnings, and expired notifications
- [x] **Admin Notifications**: Real-time alerts for actions requiring attention
- [x] **SMTP Integration**: Reliable email delivery via Gmail/SMTP

### 🔐 Security Features (Implemented)

- [x] **Data Encryption**: AES-256 for sensitive codes and device identifiers
- [x] **Firebase Security Rules**: Comprehensive database access controls
- [x] **Admin Authentication**: Secure login with protected routes
- [x] **Environment Security**: All secrets properly configured in environment variables
- [x] **Payment Security**: Paystack integration with test/live mode support
- [x] **Email Security**: App passwords and secure SMTP configuration

### 🚀 Future Enhancements

#### E-Commerce Improvements

- [ ] **Customer Accounts**: User registration and order history
- [ ] **Product Search**: Full-text search with filters and sorting
- [ ] **Product Reviews**: Customer rating and review system
- [ ] **Wishlist System**: Save products for later purchase
- [ ] **Multi-currency**: Support for USD, GBP alongside NGN
- [ ] **Shipping Calculator**: Dynamic shipping costs based on location

#### Lodge Internet Enhancements

- [ ] **Self-Service Activation**: Automated TV subscription activation
- [ ] **Usage Analytics**: Data usage tracking for device codes
- [ ] **Bulk Renewals**: Admin tools for bulk subscription management
- [ ] **Mobile App**: React Native app for Lodge Internet users
- [ ] **API Integration**: Third-party integrations for enhanced services
- [ ] **Advanced Reporting**: Business intelligence and analytics dashboard

#### System-Wide Improvements

- [ ] **Progressive Web App**: PWA features for better mobile experience
- [ ] **Real-time Notifications**: WebSocket-based live updates
- [ ] **Backup Systems**: Automated data backup and recovery
- [ ] **Multi-language**: Internationalization support
- [ ] **Performance Monitoring**: Error tracking and performance analytics

---

## 🤝 Support

### Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fast setup and new features guide
- **[CRON_JOB_GUIDE.md](./CRON_JOB_GUIDE.md)** - Automated TV subscription expiry monitoring
- **[EMAIL_NOTIFICATIONS_GUIDE.md](./EMAIL_NOTIFICATIONS_GUIDE.md)** - Complete email system documentation
- **[TIMESTAMP_FIX.md](./TIMESTAMP_FIX.md)** - Firebase timestamp handling guide

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Paystack API Docs](https://paystack.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Nodemailer Guide](https://nodemailer.com/about/)

---

## 📝 License

This project is for educational and commercial use. Built for Davnex Store and Lodge Internet services.

---

## 🙏 Credits

Built with ❤️ using:

- **Next.js 14** - React framework with App Router
- **Firebase** - Database, authentication, and hosting
- **Paystack** - Nigerian payment processing
- **Cloudinary** - Image optimization and CDN
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type-safe development
- **Nodemailer** - Email delivery service
- **Lucide React** - Beautiful icons

---

## 🌐 Application URLs

### E-Commerce Store

- **Store Homepage:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login
- **Product Catalog:** http://localhost:3000 (main page)
- **Shopping Cart:** http://localhost:3000/cart
- **Checkout:** http://localhost:3000/checkout

### Lodge Internet Portal

- **Internet Portal:** http://localhost:3000/internet
- **TV User Dashboard:** http://localhost:3000/internet/dashboard
- **TV User Login:** http://localhost:3000/internet/login

### Admin Management

- **Main Dashboard:** http://localhost:3000/admin/dashboard
- **Data Codes Management:** http://localhost:3000/admin/data-codes
- **TV Users Management:** http://localhost:3000/admin/tv-users
- **Purchase Logs:** http://localhost:3000/admin/purchase-logs

### Default Credentials

- **Admin Login:** `davo` / `davo`
- **Change these in production!**

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

---

**Davnex - Premium Accessories & Lodge Internet Services** 🎉

_Combining the best of e-commerce with innovative internet service delivery._
