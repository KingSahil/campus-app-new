# 🔄 API Fallback System

## Automatic Gemini → OpenRouter Fallback

The backend now automatically switches from Gemini to OpenRouter when quotas are exceeded.

## How It Works

```
User requests chapters
    ↓
Try Gemini API first (free)
    ↓
    ├─ Success? → Return chapters ✓
    │
    └─ Quota exceeded (429)?
        ↓
        Try OpenRouter (paid) automatically
        ↓
        ├─ Success? → Return chapters ✓
        │
        └─ Failed? → Show helpful error message
```

## Configuration

### Option 1: Only Gemini (Free)
**backend/.env:**
```env
GEMINI_API_KEY=your_gemini_key_here
PORT=8000
```

**Behavior:**
- ✓ Uses Gemini (free)
- ✗ Fails when quota exceeded
- Error message: "Gemini quota exceeded. Please configure OPENROUTER_API_KEY for automatic fallback."

### Option 2: Gemini + OpenRouter Fallback (Recommended)
**backend/.env:**
```env
GEMINI_API_KEY=your_gemini_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
PORT=8000
```

**Behavior:**
- ✓ Uses Gemini first (free)
- ✓ Automatically falls back to OpenRouter when Gemini quota exceeded
- ✓ Seamless experience for users
- ⚠️ OpenRouter charges per request (~$0.01-0.05)

### Option 3: Only OpenRouter (Paid)
**frontend/.env:**
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Request body:**
```javascript
{
  video_url: "...",
  api_provider: "openrouter",  // Force OpenRouter
  model: "anthropic/claude-3.5-sonnet"
}
```

## Error Messages Explained

### ✓ Success with Gemini
```
Console: ✓ Chapters generated successfully using: gemini
```

### ✓ Success with Fallback
```
Console: ⚠️  Gemini quota exceeded, falling back to OpenRouter...
Console: ✓ Successfully used OpenRouter as fallback
Console: ✓ Chapters generated successfully using: openrouter (fallback)
```

### ✗ Gemini Quota Exceeded (No Fallback)
```
Error 503: Gemini quota exceeded. Please configure OPENROUTER_API_KEY 
in .env for automatic fallback, or wait for quota reset.
```

### ✗ Both Failed
```
Error 503: Gemini quota exceeded and OpenRouter fallback failed. 
Please try again later or configure OPENROUTER_API_KEY.
```

## Gemini API Quotas

### Free Tier Limits
- **Requests per minute**: 15
- **Requests per day**: 1500
- **Tokens per minute**: 32,000

### When Quotas Reset
- **Per minute**: Every 60 seconds
- **Per day**: Midnight PST (UTC-8)

### Rate Limit Error
```json
{
  "error": {
    "code": 429,
    "message": "Resource exhausted. Quota exceeded.",
    "status": "RESOURCE_EXHAUSTED"
  }
}
```

## OpenRouter Pricing

### Claude 3.5 Sonnet (Recommended)
- **Input**: ~$0.003 per 1K tokens
- **Output**: ~$0.015 per 1K tokens
- **Typical chapter generation**: $0.01 - $0.05 per video

### Other Models Available
- GPT-4 Turbo: Higher quality, higher cost
- Gemini Pro: Similar to free tier but paid
- Llama 3: Lower cost alternative

## Get OpenRouter API Key

1. Visit: https://openrouter.ai/keys
2. Sign up / Log in
3. Create new API key
4. Add credits to account (minimum $5)
5. Copy key to backend/.env

## Testing the Fallback

### Test 1: Force Gemini Quota Error
Make 15+ requests in 1 minute to trigger rate limit:

```bash
# Repeat this command quickly 15 times
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://youtube.com/watch?v=VIDEO_ID","api_provider":"gemini"}'
```

**Expected:** 16th request should automatically use OpenRouter

### Test 2: Monitor Backend Logs
Watch terminal where backend is running:

```
INFO: 127.0.0.1 - "POST /analyze HTTP/1.1" 200 OK
✓ Chapters generated successfully using: gemini

# After quota exceeded:
⚠️  Gemini quota exceeded, falling back to OpenRouter...
✓ Successfully used OpenRouter as fallback
✓ Chapters generated successfully using: openrouter (fallback)
```

## Cost Management

### Monitor Gemini Usage
- Dashboard: https://ai.dev/usage?tab=rate-limit
- Shows requests per day/minute
- Resets at midnight PST

### Monitor OpenRouter Usage
- Dashboard: https://openrouter.ai/usage
- Shows token usage and costs
- Set spending limits

### Best Practices

1. **Use Gemini as primary** (free tier)
2. **Add OpenRouter as fallback** (peace of mind)
3. **Monitor usage daily** (avoid surprises)
4. **Cache chapters in database** (avoid repeated API calls)
5. **Set rate limits in app** (prevent abuse)

## Recommended Setup

For development and light usage:
```env
# Use only Gemini
GEMINI_API_KEY=your_key
```

For production or heavy usage:
```env
# Use both with automatic fallback
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
```

## Future Enhancement: Cache System

To minimize API calls, implement chapter caching:

```javascript
// Pseudo-code
async function getChapters(videoUrl) {
  // Check Supabase cache first
  const cached = await supabase
    .from('video_chapters')
    .select('*')
    .eq('video_url', videoUrl)
    .single();
  
  if (cached) {
    return cached.chapters;
  }
  
  // If not cached, generate and save
  const chapters = await generateChapters(videoUrl);
  await supabase
    .from('video_chapters')
    .insert({ video_url: videoUrl, chapters });
  
  return chapters;
}
```

This would dramatically reduce API usage!

## Summary

✅ **Current Implementation:**
- Tries Gemini first (free)
- Automatically falls back to OpenRouter if quota exceeded
- Provides clear error messages
- Logs which provider was used

✅ **What You Need:**
- GEMINI_API_KEY (required)
- OPENROUTER_API_KEY (optional but recommended)

✅ **Benefits:**
- Zero downtime
- Seamless user experience
- Cost-effective (uses free tier first)
- Reliable fallback when needed

🎉 The system is now production-ready with automatic failover!
