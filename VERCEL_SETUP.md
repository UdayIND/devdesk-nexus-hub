# Vercel Environment Variables Setup

## Required Environment Variables

Set these in your Vercel Dashboard (Settings > Environment Variables):

### Core API Configuration
- `VITE_API_BASE_URL` = `https://devdesk-nexus-hub.onrender.com`

### Application Settings  
- `VITE_APP_NAME` = `DevDesk Nexus Hub`
- `VITE_APP_VERSION` = `1.0.0`
- `VITE_APP_ENVIRONMENT` = `production`
- `NODE_ENV` = `production`

### Optional (for future features)
- `VITE_GITHUB_CLIENT_ID` = (leave empty for now)
- `VITE_GOOGLE_CLIENT_ID` = (leave empty for now)  
- `VITE_FIGMA_ACCESS_TOKEN` = (leave empty for now)

## Setup Instructions

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `devdesk-nexus-hub` project
3. Navigate to **Settings** > **Environment Variables**
4. Add each variable above for **All Environments** (Production, Preview, Development)
5. Redeploy your application

## Testing Signup/Login

After setting the environment variables:

1. Your app will try to connect to your Render backend first
2. If the backend is not available (404 errors), it will automatically use fallback authentication
3. Fallback mode allows you to test all features while your backend is being developed
4. Users can sign up/login with any email/password combination in fallback mode

## Backend Status

Currently, your Render backend at `https://devdesk-nexus-hub.onrender.com` returns 404 errors for all endpoints. This means:

- API endpoints like `/api/auth/signup`, `/api/auth/signin` are not implemented yet
- The frontend will automatically use fallback mode
- All dashboard features will work with mock data

## Next Steps

1. Set the environment variables on Vercel
2. Redeploy your application  
3. Test signup/login (should work with fallback mode)
4. Implement the backend API endpoints on Render for full functionality 