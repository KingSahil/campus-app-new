# AI Chapter Summarizer Integration Guide

This guide explains how to integrate the backend AI summarizer with the campus app to generate chapters with timestamps and summaries for YouTube videos.

## Overview

The integration adds:
- **AI-powered chapter generation** for YouTube videos
- **Automatic timestamps** for each chapter
- **Chapter summaries** with detailed descriptions
- **Overall video summary**
- **Interactive chapter navigation** (click to jump to timestamp)

## Architecture

```
Frontend (React Native)
    ↓
    ├─ LectureVideoScreen.js (New "Chapters" tab)
    ↓
Backend (FastAPI - Python)
    ↓
    ├─ YouTube Transcript API (fetch captions)
    ↓
    └─ Gemini/OpenRouter AI (generate chapters)
```

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend'
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend'` folder:

```bash
# For Gemini API (Recommended - Free tier available)
GEMINI_API_KEY=your_gemini_api_key_here

# OR for OpenRouter API (Paid service)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Server port
PORT=8000
```

**Get API Keys:**
- **Gemini API**: https://aistudio.google.com/app/apikey (Free tier available)
- **OpenRouter API**: https://openrouter.ai/keys (Paid service)

#### Start Backend Server

```bash
python main.py
```

The server will run at `http://localhost:8000`

**Verify it's working:**
- Open http://localhost:8000 in your browser
- You should see: `{"message": "YouTube Transcript & Chapter Generator API"}`

### 2. Frontend Setup

#### Configure Environment Variables

Create a `.env` file in the `frontend` folder (or copy `.env.example`):

```bash
# Your existing Gemini API key for AI Summarizer and Quiz
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL for chapter generation
# Local development:
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000

# Production (when you deploy):
# EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

#### Install/Update Dependencies

```bash
cd frontend
npm install
```

### 3. Testing the Integration

1. **Start the backend** (in `backend'` folder):
   ```bash
   python main.py
   ```

2. **Start the frontend** (in `frontend` folder):
   ```bash
   npm start
   # or
   expo start
   ```

3. **Test the feature:**
   - Navigate to Learning Hub
   - Select any YouTube video
   - Click on the **"Chapters"** tab
   - Click **"Generate Chapters"**
   - Wait for AI to process (takes 10-30 seconds)
   - View generated chapters with timestamps
   - Click on any chapter to jump to that timestamp

## Features Implemented

### 1. Chapters Tab
- New tab in video screen with chapter icon
- Shows all generated chapters in a scrollable list
- Each chapter displays:
  - Chapter number
  - Timestamp (MM:SS or HH:MM:SS)
  - Title
  - Summary (2-3 sentences)

### 2. Chapter Generation
- Button to trigger AI chapter generation
- Only works for YouTube videos
- Disabled for non-YouTube videos with warning
- Loading indicator during generation
- Success/error notifications

### 3. Overall Video Summary
- Displays at top of chapters list
- 3-4 sentence summary of entire video
- Helps users quickly understand video content

### 4. Chapter Navigation
- Click any chapter to seek to that timestamp
- Play icon on each chapter card
- Visual feedback on interaction

### 5. Regenerate Function
- Refresh button to regenerate chapters
- Useful if initial generation wasn't satisfactory
- Maintains same UI state

## API Details

### Backend Endpoint

**POST** `/analyze`

**Request Body:**
```json
{
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "api_provider": "gemini",
  "model": "gemini-2.0-flash-exp"
}
```

**Response:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "transcript": [...],
  "chapters": [
    {
      "timestamp": "00:00",
      "title": "Introduction",
      "summary": "Overview of the video content..."
    },
    {
      "timestamp": "02:45",
      "title": "Main Topic",
      "summary": "Detailed explanation of..."
    }
  ],
  "summary": "Overall video summary goes here..."
}
```

### Alternative API Providers

You can use either:

1. **Gemini** (Recommended):
   ```json
   {
     "api_provider": "gemini",
     "model": "gemini-2.0-flash-exp"
   }
   ```

2. **OpenRouter**:
   ```json
   {
     "api_provider": "openrouter",
     "model": "anthropic/claude-3.5-sonnet"
   }
   ```

## Troubleshooting

### "Failed to generate chapters" error

**Possible causes:**
1. Backend server not running
   - Solution: Start the server with `python main.py`

2. Wrong backend URL in `.env`
   - Solution: Verify `EXPO_PUBLIC_BACKEND_URL=http://localhost:8000`

3. API key not configured
   - Solution: Add `GEMINI_API_KEY` or `OPENROUTER_API_KEY` to backend `.env`

4. YouTube video has no transcript
   - Solution: Some videos don't have captions; try a different video

### "Only available for YouTube videos" warning

- Chapter generation only works for YouTube videos
- The feature detects non-YouTube URLs and shows a warning
- Use YouTube links like: `https://www.youtube.com/watch?v=VIDEO_ID`

### CORS errors

If you see CORS errors in the browser console:
- The backend already has CORS enabled for all origins
- Make sure backend is running before making requests

### Slow generation

- Chapter generation can take 10-60 seconds depending on:
  - Video length
  - AI model used
  - API response time
- Gemini is typically faster than OpenRouter
- Loading indicator shows progress

## Code Changes Summary

### Files Modified

1. **frontend/screens/LectureVideoScreen.js**
   - Added `chapters`, `loadingChapters`, `overallSummary` state
   - Added `generateChapters()` function
   - Added `handleSeekToTimestamp()` function
   - Added "Chapters" tab in UI
   - Added chapter card styles

2. **frontend/.env.example**
   - Added `EXPO_PUBLIC_BACKEND_URL` configuration

### New Files Created

1. **INTEGRATION_GUIDE.md** (this file)
   - Setup instructions
   - API documentation
   - Troubleshooting guide

## Production Deployment

### Backend Deployment

Deploy your backend to a cloud service:

**Options:**
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **Google Cloud Run**: https://cloud.google.com/run
- **AWS Lambda**: https://aws.amazon.com/lambda

**After deployment:**
1. Get your production URL (e.g., `https://your-app.railway.app`)
2. Update frontend `.env`:
   ```bash
   EXPO_PUBLIC_BACKEND_URL=https://your-app.railway.app
   ```

### Frontend Deployment

When building for production:
```bash
eas build --platform android
# or
eas build --platform ios
```

Make sure `.env` has the production backend URL before building.

## Future Enhancements

Potential improvements:
- [ ] Actual video seeking for YouTube player (requires YouTube player ref)
- [ ] Cache generated chapters in Supabase
- [ ] Show chapter markers on video progress bar
- [ ] Allow users to edit/customize chapters
- [ ] Add chapter search/filter
- [ ] Export chapters as PDF/text file
- [ ] Real-time chapter generation progress
- [ ] Support for video files (not just YouTube)

## Support

For issues or questions:
1. Check backend logs: `python main.py` output
2. Check frontend console: Expo dev tools
3. Verify API keys are correct
4. Test backend directly: http://localhost:8000/docs

## License

Same as the parent project.
