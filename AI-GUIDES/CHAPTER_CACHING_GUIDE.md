# Chapter Caching System

## Overview
The app now automatically saves AI-generated chapters and summaries to Supabase, so users don't need to regenerate them when revisiting a video.

## Database Setup

### 1. Run the Migration

Execute the migration to create the `video_chapters` table:

```bash
# Navigate to your Supabase project dashboard
# Go to SQL Editor and run the migration file:
frontend/supabase/migrations/20251228120000_create_video_chapters.sql
```

Or if using Supabase CLI:

```bash
cd frontend
supabase db push
```

### 2. Table Structure

**Table: `video_chapters`**
- `id` (uuid, primary key)
- `video_id` (uuid, foreign key to videos.id)
- `chapters` (jsonb) - Array of chapter objects
- `overall_summary` (text) - Video summary
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Chapter JSON Format:**
```json
[
  {
    "timestamp": "00:15",
    "title": "Introduction",
    "summary": "Overview of the topic..."
  },
  {
    "timestamp": "05:30",
    "title": "Main Concept",
    "summary": "Detailed explanation..."
  }
]
```

## How It Works

### Automatic Loading
When a user opens a video screen:
1. App checks if chapters exist in the database for this video
2. If found, loads them immediately (no API call needed)
3. User sees saved chapters instantly

### Generating New Chapters
When user clicks "Generate Chapters":
1. Calls backend AI API to analyze the video
2. Displays the generated chapters
3. **Automatically saves** to database
4. Next time user visits, chapters load from cache

### Re-generating Chapters
Users can click "Generate Chapters" again to:
- Get updated analysis
- Overwrite old chapters with new ones
- Database automatically updates via `upsert`

## Code Changes

### 1. New Functions in LectureVideoScreen.js

**`fetchSavedChapters()`**
- Runs on screen mount
- Loads chapters from Supabase
- Updates state if found

**`saveChaptersToDatabase(chapters, summary)`**
- Called after successful AI generation
- Upserts data (insert or update)
- Handles errors gracefully

### 2. Updated Flow

```
User opens video
    ↓
fetchSavedChapters() runs
    ↓
Chapters found? → Yes → Display immediately
    ↓ No
Show "Generate Chapters" button
    ↓
User clicks button
    ↓
generateChapters() calls AI API
    ↓
saveChaptersToDatabase() stores result
    ↓
Next visit: instant load
```

## Benefits

✅ **Faster UX** - Instant chapter loading on revisits  
✅ **Cost Savings** - Reduces AI API calls  
✅ **Offline-ish** - Works even if backend is down (for previously generated chapters)  
✅ **Persistent** - Data survives app restarts and navigation  
✅ **Smart Updates** - Easy to regenerate if needed  

## Testing

1. **First Visit**
   - Open a video
   - Should see "Generate Chapters" button
   - Click to generate
   - Chapters appear and save

2. **Return Visit**
   - Go back and re-open same video
   - Chapters should load immediately
   - No generation needed

3. **Refresh Test**
   - Generate chapters
   - Close app completely
   - Reopen same video
   - Chapters should still be there

## Troubleshooting

**Chapters not saving?**
- Check Supabase connection in `.env`
- Verify migration ran successfully
- Check browser console for errors
- Ensure `video.id` exists (required for foreign key)

**Old chapters won't update?**
- Click "Generate Chapters" again
- Upsert will replace old data
- Check `updated_at` timestamp in database

**RLS (Row Level Security) errors?**
- Ensure user is authenticated
- Verify RLS policies are enabled in migration
- Check Supabase logs for policy violations

## Database Queries

**View all saved chapters:**
```sql
SELECT 
  v.title,
  vc.overall_summary,
  jsonb_array_length(vc.chapters) as chapter_count,
  vc.updated_at
FROM video_chapters vc
JOIN videos v ON v.id = vc.video_id
ORDER BY vc.updated_at DESC;
```

**Clear chapters for a video:**
```sql
DELETE FROM video_chapters WHERE video_id = 'your-video-id';
```

**Check cache hit rate:**
```sql
SELECT 
  COUNT(DISTINCT vc.video_id) as videos_with_chapters,
  COUNT(DISTINCT v.id) as total_videos,
  ROUND(COUNT(DISTINCT vc.video_id)::numeric / NULLIF(COUNT(DISTINCT v.id), 0) * 100, 2) as cache_percentage
FROM videos v
LEFT JOIN video_chapters vc ON v.id = vc.video_id;
```
