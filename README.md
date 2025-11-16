# 🛍️ Davnex - Premium Accessories E-Commerce Store

A fully functional, modern e-commerce platform for selling premium accessories, built with Next.js 14, Firebase, and Paystack.

![Davnex Store](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Firebase](https://img.shields.io/badge/Firebase-Latest-orange) ![Paystack](https://img.shields.io/badge/Paystack-Integrated-green)

---

## ✨ Features

### 🛒 Customer Features

- **Modern Product Catalog** - Beautiful, responsive product browsing
- **Product Detail Pages** - High-quality images, descriptions, and specifications
- **Smart Shopping Cart** - Persistent cart that saves across browser sessions
- **Secure Checkout** - Integrated Paystack payment gateway for Nigerian Naira (₦)
- **Real-time Inventory** - Live stock status and product availability
- **Mobile Responsive** - Perfect experience on all devices

### 🎨 Admin Dashboard

- **Product Management** - Add, edit, and delete products with ease
- **Image Upload** - Direct image uploads to Firebase Storage
- **Inventory Tracking** - Monitor stock levels and featured products
- **Order Management** - View and track customer orders
- **No Coding Required** - User-friendly interface for non-technical users

### 🔒 Security & Performance

- **Secure Authentication** - Protected admin routes
- **Firestore Database** - Fast, scalable NoSQL database
- **Optimized Images** - Automatic image optimization
- **SEO Friendly** - Built with Next.js 14 App Router
- **Environment Variables** - Secure credential management

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

# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key
```

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
│   ├── admin/
│   │   ├── login/               # Admin login page
│   │   └── dashboard/           # Product management dashboard
│   ├── cart/                    # Shopping cart page
│   ├── checkout/                # Checkout & payment page
│   ├── product/[id]/            # Dynamic product detail pages
│   └── page.tsx                 # Homepage
├── components/
│   ├── admin/                   # Admin-only components
│   ├── sections/                # Homepage sections
│   ├── Header.tsx               # Site header with cart
│   ├── Footer.tsx               # Site footer
│   └── Logo.tsx                 # Davnex logo component
├── lib/
│   └── firebase.ts              # Firebase configuration
├── store/
│   ├── cartStore.ts             # Shopping cart state management
│   └── authStore.ts             # Admin authentication state
├── types/
│   └── index.ts                 # TypeScript type definitions
├── hooks/
│   └── useProducts.ts           # Product fetching hook
├── .env.local                   # Environment variables (DO NOT COMMIT)
├── QUICK_START.md               # 5-minute setup guide
└── SETUP_GUIDE.md               # Detailed setup instructions
```

---

## 🎯 Usage

### Admin Dashboard

1. **Login**

   - Navigate to `/admin/login`
   - Default credentials: `davo` / `davo`

2. **Add Products**

   - Click "Add New Product"
   - Fill in product details
   - Upload product image (PNG, JPG up to 10MB)
   - Set price in Nigerian Naira (₦)
   - Mark as "Featured" to show on homepage
   - Click "Add Product"

3. **Manage Products**
   - Edit existing products by clicking the edit icon
   - Delete products with the trash icon
   - Toggle stock status with checkbox

### Customer Shopping Flow

1. **Browse** - View products on homepage
2. **Select** - Click product to view details
3. **Add to Cart** - Click "Add to Cart" button
4. **Checkout** - Click cart icon, proceed to checkout
5. **Pay** - Complete payment via Paystack
6. **Confirm** - Receive order confirmation

---

## 🔧 Tech Stack

| Technology             | Purpose                         |
| ---------------------- | ------------------------------- |
| **Next.js 14**         | React framework with App Router |
| **TypeScript**         | Type-safe development           |
| **Tailwind CSS**       | Utility-first styling           |
| **Firebase Firestore** | NoSQL database                  |
| **Firebase Storage**   | Image file storage              |
| **Zustand**            | State management                |
| **Paystack**           | Payment processing              |
| **Lucide React**       | Icon library                    |

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

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.local`
4. Deploy!

### Environment Variables Required:

- All Firebase config variables
- Paystack public key
- (Optional) Admin credentials

---

## 📊 Features Breakdown

### Implemented ✅

- [x] Product catalog with Firebase integration
- [x] Product detail pages with image galleries
- [x] Shopping cart with persistence
- [x] Paystack checkout integration
- [x] Admin dashboard with CRUD operations
- [x] Image upload to Firebase Storage
- [x] Order tracking in Firestore
- [x] Mobile responsive design
- [x] Secure admin authentication
- [x] Real-time inventory management

### Future Enhancements 🚀

- [ ] Customer accounts and order history
- [ ] Product search functionality
- [ ] Product reviews and ratings
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Discount codes and promotions
- [ ] Multi-currency support
- [ ] Shipping cost calculator

---

## 🤝 Support

### Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fast setup
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed guide

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Paystack API Docs](https://paystack.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 📝 License

This project is for educational and commercial use.

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  'apple-gray': { ... },
  'apple-blue': '...',
}
```

### Update Logo

Replace content in `components/Logo.tsx`

### Modify Admin Credentials

Edit `store/authStore.ts`:

```typescript
login: (username: string, password: string) => {
  if (username === "your_username" && password === "your_password") {
    // ...
  }
};
```

---

## 🙏 Credits

Built with ❤️ using:

- Next.js 14
- Firebase by Google
- Paystack
- Tailwind CSS
- Lucide Icons

---

**Store URL:** http://localhost:3000  
**Admin Panel:** http://localhost:3000/admin/login  
**Default Login:** davo / davo

Happy Selling! 🎉
