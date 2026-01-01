# Integration Architecture

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     Campus App Frontend                      │
│                      (React Native)                           │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ HTTP POST /analyze
                            │ {video_url, api_provider, model}
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Backend API Server                         │
│                       (FastAPI)                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  1. Receive video URL                                  │  │
│  │  2. Extract YouTube video ID                           │  │
│  │  3. Fetch transcript from YouTube                      │  │
│  │  4. Format transcript with timestamps                  │  │
│  │  5. Send to AI for analysis                           │  │
│  │  6. Parse AI response                                  │  │
│  │  7. Return chapters + summary                          │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────┬──────────────────────────────┬───────────────────┘
            │                              │
            │                              │
            ▼                              ▼
┌───────────────────────┐    ┌────────────────────────────────┐
│  YouTube Transcript   │    │       AI Service               │
│       API             │    │  (Gemini / OpenRouter)         │
│                       │    │                                │
│  • Fetch captions     │    │  • Analyze transcript          │
│  • Multiple languages │    │  • Identify topic changes      │
│  • Time-stamped text  │    │  • Generate chapter titles     │
└───────────────────────┘    │  • Create summaries            │
                             │  • Generate overall summary    │
                             └────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│   User       │
│   Action     │
└──────┬───────┘
       │
       │ Clicks "Generate Chapters"
       ▼
┌──────────────────────────────┐
│  LectureVideoScreen.js       │
│  generateChapters()          │
└──────┬───────────────────────┘
       │
       │ fetch(BACKEND_URL/analyze)
       ▼
┌──────────────────────────────┐
│  Backend: main.py            │
│  /analyze endpoint           │
└──────┬───────────────────────┘
       │
       │ extract_video_id()
       ▼
┌──────────────────────────────┐
│  YouTube Transcript API      │
│  Fetch captions              │
└──────┬───────────────────────┘
       │
       │ Return transcript[]
       ▼
┌──────────────────────────────┐
│  Backend: main.py            │
│  Format transcript with      │
│  timestamps                  │
└──────┬───────────────────────┘
       │
       │ call_gemini() or call_openrouter()
       ▼
┌──────────────────────────────┐
│  AI Service                  │
│  Analyze & Generate          │
└──────┬───────────────────────┘
       │
       │ Return JSON {chapters[], summary}
       ▼
┌──────────────────────────────┐
│  Backend: main.py            │
│  Parse AI response           │
└──────┬───────────────────────┘
       │
       │ Return VideoResponse
       ▼
┌──────────────────────────────┐
│  LectureVideoScreen.js       │
│  setChapters()               │
│  setOverallSummary()         │
└──────┬───────────────────────┘
       │
       │ Render UI
       ▼
┌──────────────────────────────┐
│  User sees chapters          │
│  with timestamps & summaries │
└──────────────────────────────┘
```

## Component Structure

```
LectureVideoScreen.js
├── State Management
│   ├── chapters: Chapter[]
│   ├── loadingChapters: boolean
│   ├── overallSummary: string
│   └── (other existing states...)
│
├── Functions
│   ├── generateChapters()      ← NEW
│   ├── handleSeekToTimestamp() ← NEW
│   └── (other existing functions...)
│
├── UI Tabs
│   ├── Upvotes
│   ├── Discussion
│   ├── AI Summarizer
│   ├── Chapters               ← NEW
│   └── Quiz
│
└── Render Logic
    ├── renderTabContent()
    │   └── case 'chapters':   ← NEW
    │       ├── chaptersCard (if no chapters)
    │       └── chaptersList (if chapters exist)
    │           ├── overallSummaryCard
    │           ├── chaptersHeader
    │           └── chapterCard[]
    └── (other render logic...)
```

## Backend Structure

```
main.py
├── Models (Pydantic)
│   ├── VideoRequest
│   ├── TranscriptSegment
│   ├── Chapter
│   └── VideoResponse
│
├── Helper Functions
│   ├── extract_video_id()
│   ├── format_timestamp()
│   ├── call_openrouter()
│   └── call_gemini()
│
└── Endpoints
    ├── GET  /
    ├── POST /analyze           ← MAIN ENDPOINT
    ├── GET  /transcript/{id}
    └── GET  /health
```

## State Flow

```
Initial State:
chapters = []
loadingChapters = false
overallSummary = ''

User clicks "Generate":
chapters = []
loadingChapters = true  ← Loading starts
overallSummary = ''

API Success:
chapters = [...4 chapters]
loadingChapters = false  ← Loading ends
overallSummary = "This video..."

API Error:
chapters = []
loadingChapters = false  ← Loading ends
overallSummary = ''
Alert shown to user
```

## API Request/Response Flow

```
Frontend Request:
POST http://localhost:8000/analyze
Content-Type: application/json

{
  "video_url": "https://youtube.com/watch?v=ABC123",
  "api_provider": "gemini",
  "model": "gemini-2.0-flash-exp"
}

Backend Processing:
1. Extract video_id = "ABC123"
2. Fetch transcript from YouTube
   → [{text: "...", start: 0.0, duration: 2.5}, ...]
3. Format transcript:
   → "[00:00] Introduction to React\n[00:03] Today we'll learn..."
4. Send to Gemini API
5. Receive AI response:
   → {chapters: [...], overall_summary: "..."}
6. Format response

Backend Response:
200 OK
Content-Type: application/json

{
  "video_id": "ABC123",
  "transcript": [...],
  "chapters": [
    {
      "timestamp": "00:00",
      "title": "Introduction",
      "summary": "Overview of the video..."
    },
    ...
  ],
  "summary": "This video covers..."
}

Frontend Processing:
1. Parse JSON response
2. setChapters(response.chapters)
3. setOverallSummary(response.summary)
4. Re-render UI with chapters
```

## Error Handling Flow

```
┌─────────────────────┐
│  User Action        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Try-Catch Block    │
└──────┬──────────────┘
       │
       ├─── Success ──────► Display Chapters
       │
       └─── Error ────────┐
                          │
            ┌─────────────▼──────────────┐
            │  Check Error Type          │
            └─────────────┬──────────────┘
                          │
            ┌─────────────┴──────────────┐
            │                            │
            ▼                            ▼
    ┌───────────────┐          ┌────────────────┐
    │ Network Error │          │  API Error     │
    │ (Backend down)│          │ (No transcript)│
    └───────┬───────┘          └────────┬───────┘
            │                           │
            └──────────┬────────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Alert.alert()      │
            │  Show error message │
            └─────────────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  setLoadingChapters │
            │  (false)            │
            └─────────────────────┘
```

## UI Component Hierarchy

```
LectureVideoScreen
│
├── SafeAreaView
│   │
│   ├── Header
│   │   ├── BackButton
│   │   ├── Title
│   │   └── MoreButton
│   │
│   ├── VideoContainer
│   │   ├── YoutubePlayer (if YouTube)
│   │   └── DirectVideoPlayer (if direct)
│   │
│   ├── TabsContainer
│   │   ├── Tab: Upvotes
│   │   ├── Tab: Discussion
│   │   ├── Tab: AI Summarizer
│   │   ├── Tab: Chapters        ← NEW
│   │   └── Tab: Quiz
│   │
│   ├── ScrollView (Content)
│   │   │
│   │   └── ChaptersTab         ← NEW
│   │       │
│   │       ├── (If no chapters)
│   │       │   └── chaptersCard
│   │       │       ├── Icon
│   │       │       ├── Description
│   │       │       ├── Warning (if not YouTube)
│   │       │       └── GenerateButton
│   │       │
│   │       └── (If chapters exist)
│   │           ├── overallSummaryCard
│   │           │   ├── summaryHeader
│   │           │   │   ├── Icon
│   │           │   │   └── Title
│   │           │   └── summaryText
│   │           │
│   │           ├── chaptersHeader
│   │           │   ├── Title (count)
│   │           │   └── RegenerateButton
│   │           │
│   │           └── chapterCard[] (map)
│   │               ├── chapterLeft
│   │               │   ├── chapterNumber
│   │               │   └── chapterInfo
│   │               │       ├── timestamp
│   │               │       ├── title
│   │               │       └── summary
│   │               └── playIcon
│   │
│   └── BottomNav
│
└── (Styles)
```

## Technology Stack

```
Frontend
├── React Native
├── Expo
├── expo-video
├── react-native-youtube-iframe
└── Fetch API

Backend
├── Python 3.8+
├── FastAPI
├── youtube-transcript-api
├── httpx
├── python-dotenv
└── pydantic

AI Services
├── Google Gemini (gemini-2.0-flash-exp)
└── OpenRouter (claude-3.5-sonnet)
```

## Deployment Architecture (Production)

```
┌──────────────────────────────────────────────┐
│         Mobile App (iOS/Android)             │
│              React Native                    │
└──────────────┬───────────────────────────────┘
               │
               │ HTTPS
               ▼
┌──────────────────────────────────────────────┐
│       Cloud Hosting Service                  │
│    (Railway / Render / Heroku)               │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │     FastAPI Backend                │     │
│  │     (Containerized)                │     │
│  └────────────┬───────────────────────┘     │
│               │                             │
│               │ Environment Variables:       │
│               │ - GEMINI_API_KEY            │
│               │ - PORT                      │
│               │                             │
└───────────────┼─────────────────────────────┘
                │
                ├──► YouTube API
                └──► Gemini/OpenRouter API
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│         Environment Variables           │
│                                         │
│  Frontend (.env)                        │
│  ├── EXPO_PUBLIC_GEMINI_API_KEY        │
│  └── EXPO_PUBLIC_BACKEND_URL           │
│                                         │
│  Backend (.env)                         │
│  ├── GEMINI_API_KEY                    │
│  ├── OPENROUTER_API_KEY (optional)     │
│  └── PORT                               │
│                                         │
│  ✅ Not committed to Git (.gitignore)  │
│  ✅ Loaded at runtime only              │
│  ✅ Different per environment           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         CORS Configuration              │
│                                         │
│  Backend CORS Middleware:               │
│  ├── allow_origins: ["*"]              │
│  ├── allow_credentials: True            │
│  ├── allow_methods: ["*"]              │
│  └── allow_headers: ["*"]              │
│                                         │
│  ⚠️  For production, restrict origins   │
└─────────────────────────────────────────┘
```

---

This architecture diagram shows the complete integration structure from frontend to backend to AI services. All components work together to deliver the chapter generation feature.
