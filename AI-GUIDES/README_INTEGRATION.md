# AI Chapter Summarizer Integration ✨

Successfully integrated the YouTube Chapter Summarizer backend with your campus app!

## What Was Added

### ✅ Backend Features
- FastAPI server that fetches YouTube transcripts
- AI-powered chapter generation using Gemini/OpenRouter
- **Automatic fallback**: Tries Gemini first, switches to OpenRouter if quota exceeded
- Automatic timestamp extraction
- Chapter summaries (2-3 sentences each)
- Overall video summary

### ✅ Frontend Features
- New **"Chapters"** tab in video screen
- Generate chapters button (YouTube videos only)
- Beautiful chapter cards with:
  - Chapter number
  - Timestamp (MM:SS or HH:MM:SS)
  - Title
  - Summary
  - Play button to jump to timestamp
- Overall video summary card
- Regenerate button
- Loading states & error handling

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Backend Setup:**
```bash
cd backend'
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

2. **Create backend'/.env:**
```env
GEMINI_API_KEY=your_key_here
PORT=8000
```

3. **Create frontend/.env:**
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
```

4. **Start Backend:**
```bash
cd backend'
python main.py
```

5. **Start Frontend:**
```bash
cd frontend
npm start
```

## Get API Keys

- **Gemini API** (Free): https://aistudio.google.com/app/apikey
- **OpenRouter** (Paid): https://openrouter.ai/keys

## Usage

1. Open the app
2. Navigate to **Learning Hub**
3. Select any **YouTube video**
4. Click the **"Chapters"** tab
5. Click **"Generate Chapters"**
6. Wait 10-30 seconds
7. View and navigate chapters!

## Files Changed

### Modified Files
- `frontend/screens/LectureVideoScreen.js`
  - Added chapters state
  - Added `generateChapters()` function
  - Added chapters tab UI
  - Added chapter navigation
  - Added chapter styles

### New Files
- `INTEGRATION_GUIDE.md` - Detailed setup & troubleshooting
- `frontend/.env.example` - Environment template
- `setup.bat` - Windows setup script
- `setup.sh` - macOS/Linux setup script
- `README_INTEGRATION.md` - This file

## Architecture

```
┌─────────────────┐
│  React Native   │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP POST /analyze
         │ { video_url, api_provider, model }
         ▼
┌─────────────────┐
│   FastAPI       │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌───────────┐
│YouTube │ │ Gemini/   │
│Transcript│OpenRouter│
└────────┘ └───────────┘
```

## Features Demo

### Before Generation
```
┌─────────────────────────────────┐
│      Video Chapters             │
├─────────────────────────────────┤
│  🎬 Generate AI-powered         │
│     chapters with timestamps    │
│                                 │
│  [Generate Chapters]            │
└─────────────────────────────────┘
```

### After Generation
```
┌─────────────────────────────────┐
│      Video Summary              │
├─────────────────────────────────┤
│  This video covers the main     │
│  concepts of React Native...    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  1  00:00  Introduction         │
│     Overview of the video...    │  ▶
├─────────────────────────────────┤
│  2  02:45  Main Concepts        │
│     Detailed explanation...     │  ▶
├─────────────────────────────────┤
│  3  08:15  Advanced Topics      │
│     Deep dive into...           │  ▶
└─────────────────────────────────┘
```

## Troubleshooting

### "Gemini quota exceeded"
- **Solution 1**: Wait for quota reset (midnight PST)
- **Solution 2**: Add OpenRouter key to backend/.env for automatic fallback
- **Solution 3**: Check usage at https://ai.dev/usage

### Backend won't start
- Check Python version: `python --version` (need 3.8+)
- Check if port 8000 is available
- Verify API key in `.env`

### "Failed to generate chapters"
- Ensure backend is running: http://localhost:8000
- Check `EXPO_PUBLIC_BACKEND_URL` in frontend `.env`
- Verify the video has captions/transcript
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed help

### CORS errors
- Backend has CORS enabled by default
- Try restarting the backend server

## API Documentation

Once backend is running, view interactive docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Production Deployment

### Backend
Deploy to Railway, Render, or Heroku, then update:
```env
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### Frontend
Build with updated .env:
```bashdocumentation:
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Setup & troubleshooting
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Connection issues
- [API_FALLBACK.md](./API_FALLBACK.md) - Gemini/OpenRouter fallback system

📖 See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for:
- Detailed setup instructions
- API documentation
- Troubleshooting guide
- Production deployment

🐛 Common Issues:
1. Make sure both backend and frontend are running
2. Verify API keys are correct
3. Test with YouTube videos that have captions
4. Check browser console for errors

## What's Next?

Potential enhancements:
- [ ] Real video player seeking (YouTube API integration)
- [x] Automatic API fallback (Gemini → OpenRouter)
- [ ] Cache chapters in Supabase
- [ ] Chapter search/filter
- [ ] Export chapters as PDF
- [ ] Chapter editing
- [ ] Progress markers on video timeline

Enjoy your new AI-powered chapter summarizer! 🚀
