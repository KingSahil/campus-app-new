# Learning Hub Database Setup

This guide will help you set up the database for the Learning Hub feature with server-side storage.

## Prerequisites

You need to have either:
- **Supabase** account with a project, OR
- **Insforge** account with a project

## Setup Instructions

### 1. Run Database Migrations

You need to run the SQL migration files in your database. There are two migration files:

1. `20251227120000_create_learning_hub_schema.sql` - Creates the tables (subjects, topics, videos)
2. `20251227120001_seed_learning_hub_data.sql` - Adds sample data (optional)

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20251227120000_create_learning_hub_schema.sql`
5. Click **Run** to execute
6. Repeat for the seed data file (optional): `supabase/migrations/20251227120001_seed_learning_hub_data.sql`

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

#### Option C: Using Insforge Dashboard

1. Go to your Insforge project dashboard
2. Navigate to the SQL or Database section
3. Execute the migration files in order

### 2. Verify Environment Variables

Make sure your `.env.local` file has the correct credentials:

```env
# Supabase/Insforge Configuration
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key

# OR for Insforge
EXPO_PUBLIC_INSFORGE_URL=your-insforge-url
EXPO_PUBLIC_INSFORGE_ANON_KEY=your-insforge-anon-key
```

### 3. Database Schema

The following tables will be created:

#### `subjects`
- `id` (uuid, primary key)
- `name` (text) - Subject name (e.g., "Physics")
- `topics_preview` (text) - Preview of topics
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `topics`
- `id` (uuid, primary key)
- `subject_id` (uuid) - References subjects
- `name` (text) - Topic name
- `video_count` (int) - Auto-updated count of videos
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `videos`
- `id` (uuid, primary key)
- `topic_id` (uuid) - References topics
- `title` (text) - Video title
- `url` (text) - Video URL
- `thumbnail` (text) - Thumbnail image URL
- `duration` (text) - Video duration
- `upvotes` (int) - Number of upvotes
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 4. Features

- **Auto-updating video counts**: When you add or delete videos, the topic's video count automatically updates
- **Cascading deletes**: Deleting a subject removes all its topics and videos
- **Row Level Security (RLS)**: All authenticated users can view and manage learning content
- **Automatic timestamps**: Created/updated timestamps are managed automatically

### 5. Testing

1. Start your Expo app: `npx expo start`
2. Navigate to the Learning Hub
3. Try adding a new subject
4. Add topics to your subject
5. Add videos to your topics

All data will be stored in your database and persist across sessions!

## API Functions

The `lib/learningHub.js` file provides these functions:

### Subjects
- `getSubjects()` - Fetch all subjects
- `createSubject(name, topicsPreview)` - Create a new subject
- `updateSubject(id, updates)` - Update a subject
- `deleteSubject(id)` - Delete a subject

### Topics
- `getTopicsBySubject(subjectId)` - Fetch topics for a subject
- `createTopic(subjectId, name)` - Create a new topic
- `updateTopic(id, updates)` - Update a topic
- `deleteTopic(id)` - Delete a topic

### Videos
- `getVideosByTopic(topicId)` - Fetch videos for a topic
- `createVideo(topicId, title, url)` - Create a new video
- `updateVideo(id, updates)` - Update a video
- `deleteVideo(id)` - Delete a video
- `upvoteVideo(id, currentUpvotes)` - Upvote a video

## Troubleshooting

### Error: "Failed to load subjects"
- Check that your database credentials in `.env.local` are correct
- Verify the migrations have been run successfully
- Check that RLS policies are enabled

### Error: "Failed to add subject"
- Ensure you're authenticated (logged in)
- Check RLS policies allow inserts for authenticated users
- Verify network connection

### Videos not displaying
- Check that the topic has a valid `id`
- Verify the videos table exists in your database
- Check console logs for specific error messages

## Security Notes

- All tables use Row Level Security (RLS)
- Only authenticated users can access the data
- Consider adjusting policies for admin-only content management if needed
- API keys in `.env.local` should never be committed to version control

## Next Steps

You can enhance the Learning Hub by:
1. Adding user-specific content (my subjects, my videos)
2. Implementing video playback tracking
3. Adding comments and ratings
4. Creating playlists or courses
5. Adding search and filtering capabilities
