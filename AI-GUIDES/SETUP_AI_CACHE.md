# AI Cache Setup Guide

This guide will help you set up database tables to cache AI Q&A and Quiz results.

## Steps to Enable AI Caching

### 1. Run the Database Migration

Go to your Supabase Dashboard and execute the migration:

1. Open **Supabase Dashboard** (https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `frontend/supabase/migrations/20251228120100_create_ai_cache_tables.sql`
6. Click **Run** or press `Ctrl + Enter`

### 2. Verify Tables Were Created

Run this query in the SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('video_ai_questions', 'video_quizzes');
```

You should see both tables listed.

### 3. How It Works

#### AI Q&A Caching
- When a user asks a question, the app first checks if the same question was asked before for this video
- If found, it displays the cached answer instantly
- If not found, it calls the backend API and saves the answer to the database
- Unique constraint on `(video_id, question)` ensures each question is answered once per video

#### Quiz Caching
- When a quiz is generated for a video, it's automatically saved to the database
- When the user refreshes or goes back to the same video, the quiz loads from cache
- Unique constraint on `video_id` ensures one quiz per video

### 4. Testing

1. **Test AI Q&A Caching:**
   - Go to a video
   - Navigate to "Ask AI" tab
   - Ask a question (e.g., "What is the main topic of this video?")
   - Wait for the answer
   - Refresh the app or go back and return to the video
   - Ask the same question again
   - The answer should appear instantly from cache

2. **Test Quiz Caching:**
   - Go to a video
   - Navigate to "Quiz" tab
   - Click "Generate Quiz"
   - Wait for the quiz to load
   - Refresh the app or go back and return to the video
   - Navigate to "Quiz" tab
   - The quiz should automatically appear without clicking "Generate Quiz"

### 5. Data Structure

#### video_ai_questions Table
```
- id (uuid, primary key)
- video_id (text) - matches video.id from videos table
- question (text) - user's question
- answer (text) - AI-generated answer
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE(video_id, question)
```

#### video_quizzes Table
```
- id (uuid, primary key)
- video_id (text, unique) - matches video.id from videos table
- quiz_data (jsonb) - array of quiz questions with options and answers
- created_at (timestamp)
- updated_at (timestamp)
```

### 6. Database Policies

Both tables have public RLS policies (same as `video_chapters`):
- ✅ Public read access
- ✅ Public insert access
- ✅ Public update access
- ✅ Public delete access

This ensures all users can access cached data without authentication issues.

### 7. Performance

- Indexes are created on `video_id` columns for fast lookups
- `video_ai_questions` also has an index on `created_at` for chronological queries
- JSONB storage for quiz data allows flexible schema and efficient queries

## Troubleshooting

### Migration Fails with "relation already exists"
The tables might already be created. Run:
```sql
DROP TABLE IF EXISTS video_ai_questions CASCADE;
DROP TABLE IF EXISTS video_quizzes CASCADE;
```
Then run the migration again.

### RLS Policy Errors (42501)
If you get permission errors when saving:
```sql
-- Disable RLS temporarily to diagnose
ALTER TABLE video_ai_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_quizzes DISABLE ROW LEVEL SECURITY;
```

Then re-enable with public policies:
```sql
ALTER TABLE video_ai_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_quizzes ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Allow public access" ON video_ai_questions FOR ALL USING (true);
CREATE POLICY "Allow public access" ON video_quizzes FOR ALL USING (true);
```

### Cached Answers Not Appearing
1. Check browser/app console for errors
2. Verify `video.id` is not null
3. Check that question text matches exactly (case-sensitive)
4. Verify data exists in Supabase Table Editor

## Benefits

✅ **Instant Responses** - Cached answers appear immediately  
✅ **Reduced API Costs** - No redundant calls to Gemini/OpenRouter  
✅ **Better UX** - Users get consistent answers to common questions  
✅ **Offline Support** - Cached data works even if backend is down  
✅ **Quiz Persistence** - Students can retake the same quiz without regenerating  

---

**Note**: The frontend code automatically handles caching. No additional configuration needed after running the migration!
