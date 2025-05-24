# Environment Setup Guide

## Running Without Backend (Current Configuration)

The project is currently configured to run without a backend API. All API configurations have been commented out.

## To Re-enable Backend Connections

When you have a backend API available, follow these steps:

### 1. Create a `.env` file in the project root:

```env
# Environment type
VITE_ENV=local

# Backend Configuration
VITE_BACKEND_BASE_URL=http://localhost:3001
# Replace with your actual backend URL

# Organization Configuration
VITE_ORGANIZATION_ID=1

# API Keys (Replace with your actual API keys)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### 2. Re-enable API configurations:

#### In `vite.config.ts`:
Uncomment the server proxy configuration:
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

#### In `src/utils/axiosConfig.ts`:
Uncomment the baseURL configuration:
```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
});
```

#### In `src/Socket.ts`:
Uncomment the socket connection and event listeners:
```typescript
constructor() {
  console.log('[SocketService] Initializing socket connection...');
  this.socket = io(import.meta.env.VITE_BACKEND_BASE_URL, {
    transports: ['websocket'],
  });
  // ... rest of event listeners
}
```

#### In API files:
- `src/modules/Public/apis/apis.tsx`
- `src/modules/Settings/CustomerAgreement/apis/apis.tsx`

Uncomment the BASE_URL assignments:
```typescript
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
```

## Current Status

✅ **Vite proxy**: Disabled
✅ **Axios configuration**: Disabled  
✅ **Socket.IO connection**: Disabled with mock implementation
✅ **API BASE_URL**: Set to empty string

The project should now start without backend connection errors. 