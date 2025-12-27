# Auth0 Setup Guide for Campus App

## Step 1: Create Auth0 Account

1. Go to [https://auth0.com/](https://auth0.com/)
2. Click "Sign Up" and create a free account
3. Once logged in, you'll be in the Auth0 Dashboard

## Step 2: Create a New Application

1. In the Auth0 Dashboard, click "Applications" → "Applications" in the left sidebar
2. Click "Create Application"
3. Name it "Campus App" (or any name you prefer)
4. Select "Native" as the application type
5. Click "Create"

## Step 3: Configure Application Settings

1. Once created, go to the "Settings" tab
2. **Find and copy these values:**
   - **Domain**: (looks like `dev-xxxxx.us.auth0.com`)
   - **Client ID**: (looks like `aBcD1234...`)

3. **Add Allowed Callback URLs:**
   ```
   exp://127.0.0.1:8081, exp://127.0.0.1:8082, campusapp://callback
   ```

4. **Add Allowed Logout URLs:**
   ```
   exp://127.0.0.1:8081, exp://127.0.0.1:8082, campusapp://logout
   ```

5. **Add Allowed Web Origins:**
   ```
   http://localhost:8081, http://localhost:8082
   ```

6. Click "Save Changes" at the bottom

## Step 4: Enable Google Connection

1. In the Auth0 Dashboard, click "Authentication" → "Social" in the left sidebar
2. Find "Google" and click it
3. Click "Continue" and follow the prompts
4. You'll need to:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Copy Client ID and Client Secret from Google to Auth0
5. In Auth0's Google settings, add these Allowed Callback URLs:
   ```
   https://YOUR_DOMAIN.auth0.com/login/callback
   ```
   (Replace YOUR_DOMAIN with your actual Auth0 domain)
6. Click "Save"

## Step 5: Update Your App Code

1. Open `lib/auth0.js`
2. Replace the placeholder values:
   ```javascript
   const AUTH0_DOMAIN = 'dev-xxxxx.us.auth0.com'; // Your Auth0 domain
   const AUTH0_CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // Your Client ID
   ```

## Step 6: Test the Setup

1. Start your Expo app:
   ```bash
   npx expo start
   ```

2. Test the sign-in flow:
   - Open the app
   - Click "Sign in with Google"
   - You should be redirected to Google login
   - After signing in, you should be redirected back to your app

## Troubleshooting

### Issue: "Redirect URI mismatch"
- Make sure you added ALL callback URLs in Auth0 settings
- Check that your `app.json` scheme matches the callback URLs

### Issue: "Invalid state"
- Clear app cache: `npx expo start -c`
- Make sure you're using the correct Auth0 domain

### Issue: "Connection not found"
- Verify Google connection is enabled in Auth0 Dashboard
- Check that Google OAuth credentials are properly configured

## Current Setup Status

- ✅ Auth0 library installed (expo-auth-session, expo-crypto)
- ✅ auth0.js configuration file created
- ✅ SignInScreen updated to use Auth0
- ✅ DashboardScreen updated to use Auth0
- ❌ **NEEDS SETUP**: Auth0 account and credentials

## Next Steps

1. Complete Steps 1-5 above
2. Update `lib/auth0.js` with your credentials
3. Run `npx expo start` to test

---

**Note**: Keep your Auth0 credentials secure and never commit them to a public repository!
