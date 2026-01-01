# 🚀 Quick Reference Card

## Start Everything (Copy-Paste Ready)

### 1️⃣ First Time Setup
```bash
# Get Gemini API Key (Free)
# Visit: https://aistudio.google.com/app/apikey

# Run automated setup
setup.bat  # Windows
# OR
chmod +x setup.sh && ./setup.sh  # macOS/Linux

# Add your API key to both:
# - backend'/.env
# - frontend/.env
```

### 2️⃣ Start Backend (Terminal 1)
```bash
cd backend'
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python main.py
```
✅ Backend running at: http://localhost:8000

### 3️⃣ Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

### 4️⃣ Test the Feature
1. Open app → Learning Hub
2. Select YouTube video
3. Click "Chapters" tab
4. Click "Generate Chapters"
5. Wait 10-30 seconds
6. View chapters! 🎉

---

## File Locations

```
campus-app-new/
├── backend'/
│   ├── main.py              ← Backend server
│   ├── requirements.txt     ← Python dependencies
│   └── .env                 ← GEMINI_API_KEY here
│
├── frontend/
│   ├── screens/
│   │   └── LectureVideoScreen.js  ← Modified
│   └── .env                 ← EXPO_PUBLIC_BACKEND_URL here
│
├── SUMMARY.md              ← Complete summary
├── README_INTEGRATION.md   ← Quick start
├── INTEGRATION_GUIDE.md    ← Detailed guide
├── API_EXAMPLES.md         ← API examples
├── setup.bat               ← Windows setup
└── setup.sh                ← macOS/Linux setup
```

---

## Essential Commands

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python main.py

# Test API
curl http://localhost:8000
```

### Frontend
```bash
# Install dependencies
npm install

# Start app
npm start

# Build for production
eas build --platform android
```

---

## Environment Variables

### backend'/.env
```env
GEMINI_API_KEY=your_key_here
PORT=8000
```

### frontend/.env
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## API Quick Reference

### Generate Chapters
```bash
POST http://localhost:8000/analyze

Body:
{
  "video_url": "https://youtube.com/watch?v=...",
  "api_provider": "gemini",
  "model": "gemini-2.0-flash-exp"
}
```

### Health Check
```bash
GET http://localhost:8000/health
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Backend won't start | Check Python version (3.8+) |
| "Failed to generate" | Verify backend is running at localhost:8000 |
| "API key not configured" | Add GEMINI_API_KEY to backend'/.env |
| "No transcript found" | Try different video with captions |

---

## Features Overview

### ✅ What Works
- Chapter generation for YouTube videos
- AI-powered summaries
- Timestamp extraction
- Beautiful UI with loading states
- Error handling
- Regenerate functionality

### ⚠️ Limitations
- YouTube videos only (not regular video files)
- Video must have captions/transcript
- Manual timestamp navigation (no auto-seek yet)

---

## Cost & Performance

### Gemini API (Recommended)
- **Cost**: FREE (1500 requests/day)
- **Speed**: 10-30 seconds per video
- **Quality**: Excellent

### OpenRouter (Alternative)
- **Cost**: ~$0.01-0.05 per request
- **Speed**: 15-45 seconds
- **Quality**: Excellent

---

## UI Components Added

### New Tab
- "Chapters" tab with video library icon
- Shows between "AI Summarizer" and "Quiz"

### Chapter Card
```
┌────────────────────────────────┐
│ ① 00:00  Introduction      ▶  │
│   Overview of the video        │
│   content and topics...        │
└────────────────────────────────┘
```

### Summary Card
```
┌────────────────────────────────┐
│ 📄 Video Summary               │
│ This video covers...           │
└────────────────────────────────┘
```

---

## Testing URLs

### Good YouTube Videos to Test
```
https://www.youtube.com/watch?v=Tn6-PIqc4UM
https://www.youtube.com/watch?v=w7ejDZ8SWv8
https://www.youtube.com/watch?v=GJNL5N8c9Vw
```

### Test API Directly
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://youtube.com/watch?v=Tn6-PIqc4UM","api_provider":"gemini"}'
```

---

## Documentation Files

1. **[SUMMARY.md](./SUMMARY.md)** - Complete integration summary
2. **[README_INTEGRATION.md](./README_INTEGRATION.md)** - Quick start guide  
3. **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Detailed setup
4. **[API_EXAMPLES.md](./API_EXAMPLES.md)** - API usage examples
5. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - This card

---

## Next Steps

1. ✅ Run setup script
2. ✅ Add API keys
3. ✅ Start backend
4. ✅ Start frontend
5. ✅ Test with YouTube video
6. 📖 Read full docs if needed

---

## Support

- **API Docs**: http://localhost:8000/docs
- **Gemini API**: https://aistudio.google.com
- **Issues**: Check INTEGRATION_GUIDE.md troubleshooting

---

**Print this card and keep it handy!** 📋
