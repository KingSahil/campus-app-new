# 🔧 Backend Connection Troubleshooting Guide

## Error: "Failed to fetch" or "Network request failed"

This error means your frontend cannot connect to the backend server.

---

## Quick Fix Steps

### Step 1: Check if Backend is Running

Open a new terminal and run:
```bash
cd backend'
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started server process
```

**Test it:** Open http://localhost:8000 in your browser. You should see the API welcome message.

---

### Step 2: Platform-Specific Backend URL

The code now automatically handles different platforms:

| Platform | Backend URL | Notes |
|----------|-------------|-------|
| **iOS Simulator** | `http://localhost:8000` | Works automatically |
| **Android Emulator** | `http://10.0.2.2:8000` | Special Android emulator IP |
| **Web** | `http://localhost:8000` | Works automatically |
| **Physical Device** | `http://YOUR_IP:8000` | Need to set in .env |

---

### Step 3: For Physical Devices (Phone/Tablet)

If testing on a real device, you need your computer's IP address:

**Find Your IP:**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**macOS/Linux:**
```bash
ifconfig
# or
hostname -I
```

**Update frontend/.env:**
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
```

**Important:** Your phone/tablet must be on the same WiFi network as your computer!

---

### Step 4: Verify .env Configuration

**frontend/.env should have:**
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000  # or your IP for physical devices
```

**backend'/.env should have:**
```env
GEMINI_API_KEY=your_key_here
PORT=8000
```

---

## Testing the Backend

### Test 1: Direct Browser Access
Open http://localhost:8000 in your browser

**Expected Result:**
```json
{
  "message": "YouTube Transcript & Chapter Generator API",
  "endpoints": {
    "POST /analyze": "Analyze a YouTube video and generate chapters",
    "GET /transcript/{video_id}": "Get transcript only for a video"
  }
}
```

### Test 2: Health Check
Open http://localhost:8000/health

**Expected Result:**
```json
{
  "status": "healthy"
}
```

### Test 3: API Documentation
Open http://localhost:8000/docs

You should see the Swagger UI interface.

---

## Common Issues & Solutions

### Issue 1: "Address already in use" when starting backend

**Problem:** Port 8000 is already in use

**Solution:**
```bash
# Windows: Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

Or change the port in `backend'/.env`:
```env
PORT=8001
```
And update frontend/.env:
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

---

### Issue 2: Backend starts but app can't connect (Android Emulator)

**Problem:** Using `localhost` instead of `10.0.2.2`

**Solution:** The code now handles this automatically. But if needed, set:
```env
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:8000
```

---

### Issue 3: Backend starts but app can't connect (Physical Device)

**Problem:** Device not on same network or using localhost

**Solution:**
1. Ensure device is on same WiFi as computer
2. Find your computer's IP address (see Step 3 above)
3. Update frontend/.env with your IP:
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
   ```
4. Restart Expo: `npm start` and reload app

---

### Issue 4: "Failed to fetch" even though backend is running

**Problem:** Firewall blocking connections or wrong URL

**Solution:**
1. **Check firewall:** Allow Python through Windows Firewall
2. **Verify URL:** Check console logs for "Using backend URL: ..."
3. **Test backend:** Open http://localhost:8000 in browser
4. **Restart both:** Stop backend and frontend, then restart

---

### Issue 5: Module 'expo-constants' not found

**Problem:** Missing dependency after code update

**Solution:**
```bash
cd frontend
npm install expo-constants
# or
npx expo install expo-constants
```

Then restart the app:
```bash
npm start
```

---

## Step-by-Step Debugging

### 1. Start Backend (Terminal 1)
```bash
cd backend'
venv\Scripts\activate
python main.py
```

**Expected output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 2. Test Backend in Browser
Open: http://localhost:8000

**If this fails:** Backend setup issue - check Python, dependencies, .env

**If this works:** Backend is running correctly ✓

### 3. Check Frontend Logs (Terminal 2)
```bash
cd frontend
npm start
```

Look for logs when you click "Generate Chapters":
```
Using backend URL: http://localhost:8000  # or 10.0.2.2 for Android
```

### 4. Test Chapter Generation

In the app:
1. Go to Learning Hub
2. Select a YouTube video
3. Click "Chapters" tab
4. Click "Generate Chapters"

**Check console for errors:**
- If you see "Using backend URL: ..." → Good, request is being made
- If you see "Backend Connection Error" → Connection failed
- Check the error message for specific guidance

---

## Quick Checklist

Before asking for help, verify:

- [ ] Backend is running (`python main.py` in backend' folder)
- [ ] http://localhost:8000 works in browser
- [ ] http://localhost:8000/health returns `{"status": "healthy"}`
- [ ] Backend .env has `GEMINI_API_KEY` set
- [ ] Frontend .env has `EXPO_PUBLIC_BACKEND_URL` set (if needed)
- [ ] Both frontend and backend have been restarted
- [ ] For Android emulator: Using `http://10.0.2.2:8000`
- [ ] For physical device: Using your computer's IP and same WiFi

---

## Still Not Working?

### Check Backend Logs
Look at the terminal where backend is running. You should see:
```
INFO:     127.0.0.1:xxxxx - "POST /analyze HTTP/1.1" 200 OK
```

If you don't see this, the request isn't reaching the backend.

### Check Frontend Console
In Expo dev tools, check the console for detailed error messages.

### Test with cURL
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://youtube.com/watch?v=Tn6-PIqc4UM","api_provider":"gemini"}'
```

If this works but the app doesn't, it's a frontend configuration issue.

---

## Platform-Specific URLs Summary

```javascript
// iOS Simulator
http://localhost:8000  ✓

// Android Emulator
http://10.0.2.2:8000  ✓ (automatically handled)

// Web
http://localhost:8000  ✓

// Physical Device
http://YOUR_COMPUTER_IP:8000  (e.g., http://192.168.1.100:8000)
```

---

## Need More Help?

1. Check all steps in this guide
2. Restart both backend and frontend
3. Test backend in browser first
4. Check firewall settings
5. Verify both devices on same network (for physical devices)

**The code has been updated to provide better error messages** - read the alert carefully, it will tell you exactly what's wrong!
