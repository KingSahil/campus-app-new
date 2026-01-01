# YouTube Transcript & Chapter Generator API

A Python backend API that fetches YouTube video transcripts and uses AI (via OpenRouter) to generate chapters and summaries with timestamps.

## Features

- 📝 Fetch YouTube video transcripts
- 🤖 AI-powered chapter generation
- 📊 Video summarization based on timestamps
- 🚀 Fast and async API with FastAPI
- 🔌 OpenRouter integration (supports multiple AI models)

## Prerequisites

- Python 3.8 or higher
- OpenRouter API key ([Get one here](https://openrouter.ai/))

## Installation

1. Clone this repository or navigate to the project directory:
```bash
cd youtubetranscript
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
  ```bash
  venv\Scripts\activate
  ```
- macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Set up environment variables:
```bash
# Copy the example env file
copy .env.example .env

# Edit .env and add your OpenRouter API key
OPENROUTER_API_KEY=your_actual_api_key_here
PORT=8000
```

## Usage

### Start the server

```bash
python main.py
```

Or use uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### POST /analyze

Analyze a YouTube video and generate chapters with AI.

**Request:**
```json
{
  "video_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "model": "anthropic/claude-3.5-sonnet"
}
```

**Response:**
```json
{
  "video_id": "VIDEO_ID",
  "transcript": [
    {
      "text": "Transcript text",
      "start": 0.0,
      "duration": 2.5
    }
  ],
  "chapters": [
    {
      "timestamp": "00:00",
      "title": "Introduction",
      "summary": "Brief summary of the introduction"
    }
  ],
  "summary": "Overall video summary"
}
```

**Supported Models:**
- `anthropic/claude-3.5-sonnet` (default)
- `openai/gpt-4-turbo`
- `openai/gpt-3.5-turbo`
- `google/gemini-pro`
- And many more from [OpenRouter](https://openrouter.ai/models)

### GET /transcript/{video_id}

Get only the transcript for a YouTube video.

**Response:**
```json
{
  "video_id": "VIDEO_ID",
  "transcript": [
    {
      "text": "Transcript text",
      "start": 0.0,
      "duration": 2.5
    }
  ]
}
```

### GET /health

Health check endpoint.

## Example Usage

### Using cURL:

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "model": "anthropic/claude-3.5-sonnet"
  }'
```

### Using Python:

```python
import requests

response = requests.post(
    "http://localhost:8000/analyze",
    json={
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "model": "anthropic/claude-3.5-sonnet"
    }
)

data = response.json()
print(f"Video Summary: {data['summary']}")
for chapter in data['chapters']:
    print(f"{chapter['timestamp']} - {chapter['title']}")
```

### Using JavaScript (fetch):

```javascript
fetch('http://localhost:8000/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    model: 'anthropic/claude-3.5-sonnet'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Project Structure

```
youtubetranscript/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create from .env.example)
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## Error Handling

The API handles various error cases:
- Invalid YouTube URLs
- Videos with disabled transcripts
- Videos without available transcripts
- OpenRouter API errors
- Missing API keys

## Development

To run in development mode with auto-reload:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## License

MIT

## Contributing

Feel free to open issues or submit pull requests!
