# Demo Mode Setup - Complete Guide

## Overview

The project has been successfully configured to run in demo mode without requiring a backend API. All API configurations have been commented out and replaced with demo data and authentication.

## ✅ What's Been Configured

### 1. **Authentication System**
- **Demo Users Created**: 3 different user types with different permissions
- **Local Storage Persistence**: User sessions persist across browser refreshes
- **Role-Based Access**: Different users have different module access

### 2. **Demo Credentials**
| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@demo.com | demo123 | Full access to all modules |
| **Manager** | manager@demo.com | demo123 | Fleet management focused |
| **Dispatcher** | dispatcher@demo.com | demo123 | Dispatch and orders focused |

### 3. **Subscription Plans & Modules**
- **Free Trial**: Basic access to core features
- **Fleet Management**: Vehicle and driver management
- **Subscription Rental**: Rental-specific features  
- **Dispatch Centre**: Order and dispatch management

### 4. **Disabled API Components**
- ✅ Vite proxy configuration (commented out)
- ✅ Axios base URL (set to empty string)
- ✅ Socket.IO connections (mock implementation)
- ✅ API interceptors (commented out)
- ✅ Google OAuth (disabled with user-friendly message)
- ✅ Stripe payments (conditional loading with fallback)
- ✅ Alert/notification APIs (demo data)

### 5. **Demo Data Available**
- **User profiles** with roles and permissions
- **Subscription plans** and module access
- **Alerts/notifications** with sample data
- **System plans** configuration

## 🚀 How to Run

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   - Open your browser to the Vite dev server URL (usually `http://localhost:5173`)

3. **Login with demo credentials:**
   - Use any of the demo credentials listed above
   - The login page displays available credentials for convenience

## 🔧 Features Working in Demo Mode

### ✅ **Fully Functional**
- User authentication and session management
- Role-based navigation and module access
- Subscription plan checking
- User profile management
- Logout functionality
- Alert/notification system (with demo data)
- Module permission checking

### ⚠️ **Limited/Mock Functionality**
- API calls return demo data or are disabled
- Real-time features (Socket.IO) are mocked
- Payment processing shows informational messages
- File uploads and external integrations are disabled

## 🔄 Re-enabling Backend (When Available)

When you have a backend API ready, follow these steps:

### 1. **Create `.env` file:**
```env
VITE_ENV=production
VITE_BACKEND_BASE_URL=http://localhost:3001
VITE_ORGANIZATION_ID=1
VITE_MAPBOX_ACCESS_TOKEN=your_token_here
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
```

### 2. **Uncomment API configurations:**

**In `vite.config.ts`:**
```typescript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_BACKEND_BASE_URL,
      changeOrigin: true,
    },
  },
},
```

**In `src/utils/axiosConfig.ts`:**
```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
});
```

**In `src/Socket.ts`:**
```typescript
this.socket = io(import.meta.env.VITE_BACKEND_BASE_URL, {
  transports: ['websocket'],
});
```

### 3. **Restore API functions:**
- Uncomment API calls in login/logout functions
- Restore axios interceptors
- Re-enable real API endpoints in various modules

## 📁 Key Files Modified

### **Authentication & User Management**
- `src/utils/demoData.ts` - Demo user data and authentication
- `src/modules/auth/pages/Login.tsx` - Demo login implementation
- `src/modules/Public/apis/apis.tsx` - Demo logout functionality

### **Configuration Files**
- `vite.config.ts` - Proxy configuration disabled
- `src/utils/axiosConfig.ts` - Base URL and interceptors disabled
- `src/Socket.ts` - WebSocket connection mocked

### **Core Features**
- `src/modules/core/apis/apis.tsx` - Alert system with demo data
- `src/modules/core/layouts/NavBar.tsx` - Demo logout
- `src/components/header/UserDropdown.tsx` - Demo logout
- `src/App.tsx` - Demo inactivity logout

### **Documentation**
- `ENV_SETUP.md` - Environment setup guide
- `DEMO_MODE_SETUP.md` - This comprehensive guide

## 🎯 User Experience

### **Login Page**
- Displays "Demo Mode" in the title
- Shows available demo credentials
- Provides helpful error messages for invalid credentials

### **Navigation**
- Module access is controlled by user roles and subscription plans
- Different users see different navigation options
- Locked features show appropriate messages

### **Notifications**
- Demo alerts are available for testing
- Alert system works with sample data
- "Learn More" functionality navigates to map (when available)

## 🔍 Troubleshooting

### **Common Issues:**

1. **"Must provide a proper URL as target" error:**
   - ✅ **Fixed**: Proxy configuration is now commented out

2. **Stripe loading errors:**
   - ✅ **Fixed**: Conditional loading with fallback message

3. **Socket connection errors:**
   - ✅ **Fixed**: Mock socket implementation

4. **Navigation throttling warnings:**
   - ✅ **Fixed**: Demo authentication prevents redirect loops

### **If you encounter issues:**
1. Clear browser localStorage: `localStorage.clear()`
2. Restart the development server
3. Check browser console for any remaining API calls
4. Verify demo credentials are being used

## 📊 Demo User Capabilities

### **Admin User (admin@demo.com)**
- Full access to all modules and features
- Can access super admin features
- Has premium module access (AI features, advanced analytics)

### **Manager User (manager@demo.com)**
- Fleet management focused
- Basic operations access
- Limited to essential features

### **Dispatcher User (dispatcher@demo.com)**
- Dispatch and order management
- Customer management
- Map and routing features

## 🎉 Success!

Your project is now fully configured for demo mode! Users can:
- ✅ Login with demo credentials
- ✅ Navigate through the application
- ✅ Experience role-based access control
- ✅ Test subscription plan features
- ✅ Use the application without any backend dependencies

The demo mode provides a complete user experience while maintaining the ability to easily re-enable backend functionality when needed. 