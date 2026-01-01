# API Usage Examples

## Example 1: Generate Chapters with Gemini

### Request
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "api_provider": "gemini",
    "model": "gemini-2.0-flash-exp"
  }'
```

### Response
```json
{
  "video_id": "dQw4w9WgXcQ",
  "transcript": [
    {
      "text": "Welcome to this tutorial on React Native",
      "start": 0.0,
      "duration": 2.5
    },
    {
      "text": "Today we'll learn about components",
      "start": 2.5,
      "duration": 3.2
    }
  ],
  "chapters": [
    {
      "timestamp": "00:00",
      "title": "Introduction to React Native",
      "summary": "Overview of React Native framework and what we'll cover in this tutorial. Setting up the development environment and creating our first app."
    },
    {
      "timestamp": "02:45",
      "title": "Core Components",
      "summary": "Deep dive into React Native's core components including View, Text, and Image. Understanding the component lifecycle and props."
    },
    {
      "timestamp": "08:15",
      "title": "State Management",
      "summary": "Managing application state with useState and useEffect hooks. Best practices for state management in React Native applications."
    },
    {
      "timestamp": "15:30",
      "title": "Navigation",
      "summary": "Implementing navigation between screens using React Navigation. Setting up stack, tab, and drawer navigators."
    }
  ],
  "summary": "This comprehensive React Native tutorial covers everything from basic setup to advanced navigation patterns. Learn about core components, state management, and building production-ready mobile applications."
}
```

## Example 2: Generate Chapters with OpenRouter (Claude)

### Request
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "api_provider": "openrouter",
    "model": "anthropic/claude-3.5-sonnet"
  }'
```

### Response
```json
{
  "video_id": "dQw4w9WgXcQ",
  "transcript": [...],
  "chapters": [...],
  "summary": "..."
}
```

## Example 3: Get Transcript Only

### Request
```bash
curl -X GET "http://localhost:8000/transcript/dQw4w9WgXcQ"
```

### Response
```json
{
  "video_id": "dQw4w9WgXcQ",
  "transcript": [
    {
      "text": "Welcome to this tutorial",
      "start": 0.0,
      "duration": 2.5
    },
    {
      "text": "Today we'll learn about...",
      "start": 2.5,
      "duration": 3.2
    }
  ]
}
```

## Example 4: Frontend Integration (React Native)

### JavaScript/TypeScript Code
```javascript
const generateChapters = async () => {
  setLoadingChapters(true);
  
  try {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: 'https://www.youtube.com/watch?v=VIDEO_ID',
        api_provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate chapters');
    }

    const data = await response.json();
    
    // Use the data
    setChapters(data.chapters || []);
    setOverallSummary(data.summary || '');
    
    console.log('Generated', data.chapters.length, 'chapters');
    
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', error.message);
  } finally {
    setLoadingChapters(false);
  }
};
```

## Example 5: Error Handling

### Invalid URL
```json
// Request
{
  "video_url": "not a youtube url"
}

// Response (400 Bad Request)
{
  "detail": "Invalid YouTube URL"
}
```

### No Transcript Available
```json
// Request
{
  "video_url": "https://www.youtube.com/watch?v=INVALID_ID"
}

// Response (404 Not Found)
{
  "detail": "No transcript found for this video in any language"
}
```

### Missing API Key
```json
// Response (500 Internal Server Error)
{
  "detail": "Gemini API key not configured"
}
```

## Example 6: Health Check

### Request
```bash
curl -X GET "http://localhost:8000/health"
```

### Response
```json
{
  "status": "healthy"
}
```

## Example 7: Using Different Languages

### Request with Language Preference
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "api_provider": "gemini",
    "model": "gemini-2.0-flash-exp",
    "languages": ["hi", "en"]
  }'
```

This will prefer Hindi transcript, but fall back to English if Hindi is not available.

## Supported Models

### Gemini Models (via Google AI)
- `gemini-2.0-flash-exp` (Recommended - Fast & Free)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

### OpenRouter Models (Paid)
- `anthropic/claude-3.5-sonnet` (Recommended - High Quality)
- `anthropic/claude-3-opus`
- `openai/gpt-4-turbo`
- `openai/gpt-4`
- `google/gemini-pro`
- `meta-llama/llama-3-70b`

## Response Times

Typical response times:
- Short videos (< 5 min): 5-15 seconds
- Medium videos (5-20 min): 15-30 seconds
- Long videos (> 20 min): 30-60 seconds

Factors affecting speed:
- Video length
- Transcript availability
- AI model used (Gemini is typically faster)
- Network latency
- API provider load

## Rate Limits

### Gemini API (Free Tier)
- 60 requests per minute
- 1500 requests per day

### OpenRouter
- Varies by model
- Pay-per-request pricing

## Best Practices

1. **Cache Results**: Store generated chapters in your database to avoid regenerating
2. **Handle Errors**: Always implement proper error handling
3. **Show Progress**: Display loading indicators during generation
4. **Validate URLs**: Check if URL is a valid YouTube link before calling API
5. **Set Timeouts**: Use request timeouts (120s recommended)
6. **Monitor Costs**: Track API usage if using paid services

## Testing with cURL

### Test Basic Connectivity
```bash
curl http://localhost:8000
```

### Test Chapter Generation
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "api_provider": "gemini"}' \
  -w "\n\nTime: %{time_total}s\n"
```

### Test with Verbose Output
```bash
curl -v -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "api_provider": "gemini"}'
```
