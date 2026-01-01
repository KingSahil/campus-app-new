from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
import os
from dotenv import load_dotenv
import httpx
from typing import List, Optional
import re
import google.genai as genai
from google.genai import types
import json
# Load environment variables
load_dotenv()

app = FastAPI(
    title="YouTube Transcript & Chapter Generator API",
    description="API to fetch YouTube transcripts and generate chapters using AI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class VideoRequest(BaseModel):
    video_url: str
    model: Optional[str] = "anthropic/claude-3-haiku"
    languages: Optional[List[str]] = None  # e.g., ['hi', 'en', 'es']
    api_provider: Optional[str] = "openrouter"  # 'openrouter' or 'gemini'

class TranscriptSegment(BaseModel):
    text: str
    start: float
    duration: float

class Chapter(BaseModel):
    timestamp: str
    title: str
    summary: str

class VideoResponse(BaseModel):
    video_id: str
    transcript: List[TranscriptSegment]
    chapters: List[Chapter]
    summary: str

# Helper functions
def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
        r'youtube\.com\/v\/([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    raise ValueError("Invalid YouTube URL")

def format_timestamp(seconds: float) -> str:
    """Convert seconds to HH:MM:SS or MM:SS format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"

async def call_openrouter(transcript_text: str, model: str) -> dict:
    """Call OpenRouter API to generate chapters and summary"""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    
    prompt = f"""You are a helpful assistant that analyzes YouTube video transcripts and creates structured chapters with summaries.

Given the following video transcript with timestamps, please:
1. Identify major topic changes and create chapters
2. For each chapter, provide:
   - A timestamp (in seconds) where the chapter starts
   - A descriptive title
   - A brief summary (2-3 sentences)
3. Create an overall video summary (3-4 sentences)

Transcript:
{transcript_text}

Please respond in the following JSON format:
{{
    "chapters": [
        {{
            "timestamp_seconds": 0,
            "title": "Chapter Title",
            "summary": "Brief summary of this chapter"
        }}
    ],
    "overall_summary": "Overall video summary"
}}"""

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            print(f"🔄 Calling OpenRouter API with model: {model}")
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "http://localhost:8000",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "response_format": {"type": "json_object"}
                }
            )
            
            # Check response status
            if not response.is_success:
                error_text = response.text
                print(f"❌ OpenRouter API error: {response.status_code} - {error_text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"OpenRouter API error: {response.status_code} - {error_text[:200]}"
                )
            
            result = response.json()
            
            # Check for error in response
            if "error" in result:
                error_msg = result["error"].get("message", str(result["error"]))
                print(f"❌ OpenRouter returned error: {error_msg}")
                raise HTTPException(status_code=500, detail=f"OpenRouter error: {error_msg}")
            
            # Parse the AI response
            ai_content = result["choices"][0]["message"]["content"]
            parsed_content = json.loads(ai_content)
            
            print(f"✓ OpenRouter API call successful")
            return parsed_content
            
        except httpx.HTTPError as e:
            print(f"❌ HTTP error calling OpenRouter: {str(e)}")
            raise HTTPException(status_code=500, detail=f"OpenRouter API error: {str(e)}")
        except (KeyError, json.JSONDecodeError) as e:
            print(f"❌ Failed to parse OpenRouter response: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"OpenRouter API error: {str(e)}")
        except (KeyError, json.JSONDecodeError) as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")

async def call_gemini(transcript_text: str, model: str = "gemini-2.0-flash-exp") -> dict:
    """Call Google Gemini API to generate chapters and summary"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        # Create Gemini client
        client = genai.Client(api_key=api_key)
        
        prompt = f"""You are a helpful assistant that analyzes YouTube video transcripts and creates structured chapters with summaries.

Given the following video transcript with timestamps in [MM:SS] or [HH:MM:SS] format, please:
1. Identify major topic changes and create 5-8 chapters
2. For each chapter, YOU MUST use the EXACT timestamp from the transcript where that topic begins
3. Extract the timestamp in seconds from the [timestamp] markers in the transcript
4. Provide a descriptive title and brief summary (2-3 sentences) for each chapter
5. Create an overall video summary (3-4 sentences)

IMPORTANT: Use ONLY the timestamps that appear in the transcript. Do NOT make up or estimate timestamps.

Transcript:
{transcript_text}

Please respond in the following JSON format:
{{
    "chapters": [
        {{
            "timestamp_seconds": 0,
            "title": "Chapter Title",
            "summary": "Brief summary of this chapter"
        }}
    ],
    "overall_summary": "Overall video summary"
}}"""
        
        # Generate content with proper model name
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        # Parse response
        parsed_content = json.loads(response.text)
        return parsed_content
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# Routes
@app.get("/")
async def root():
    return {
        "message": "YouTube Transcript & Chapter Generator API",
        "endpoints": {
            "POST /analyze": "Analyze a YouTube video and generate chapters",
            "GET /transcript/{video_id}": "Get transcript only for a video"
        }
    }

@app.post("/analyze", response_model=VideoResponse)
async def analyze_video(request: VideoRequest):
    """
    Analyze a YouTube video: fetch transcript and generate chapters with AI
    Auto-fallback: Tries Gemini first, falls back to OpenRouter if quota exceeded
    """
    try:
        # Extract video ID
        video_id = extract_video_id(request.video_url)
        
        # Fetch transcript
        try:
            # Try to fetch transcript in specified languages or any available language
            if request.languages:
                # User specified languages
                fetched_transcript = YouTubeTranscriptApi().fetch(video_id, languages=request.languages)
            else:
                # Try common languages including Hindi, English, Spanish, etc.
                try:
                    fetched_transcript = YouTubeTranscriptApi().fetch(video_id, languages=['en'])
                except NoTranscriptFound:
                    # If English not found, try to get any available transcript
                    transcript_list = YouTubeTranscriptApi().list(video_id)
                    # Get the first available transcript
                    if transcript_list:
                        first_transcript = next(iter(transcript_list), None)
                        if first_transcript:
                            fetched_transcript = first_transcript.fetch()
                        else:
                            raise NoTranscriptFound(video_id)
                    else:
                        raise NoTranscriptFound(video_id)
        except TranscriptsDisabled:
            raise HTTPException(status_code=404, detail="Transcripts are disabled for this video")
        except NoTranscriptFound:
            raise HTTPException(status_code=404, detail="No transcript found for this video in any language")
        
        # Format transcript for AI
        transcript_text = "\n".join([
            f"[{format_timestamp(snippet.start)}] {snippet.text}"
            for snippet in fetched_transcript.snippets
        ])
        
        # Get AI analysis with automatic fallback
        ai_response = None
        used_provider = request.api_provider or "gemini"
        
        # Try Gemini first (if requested or as default)
        if used_provider == "gemini":
            try:
                ai_response = await call_gemini(transcript_text, request.model or "gemini-2.0-flash-exp")
            except HTTPException as e:
                # Check if it's a quota/rate limit error (429)
                if "429" in str(e.detail) or "RESOURCE_EXHAUSTED" in str(e.detail) or "quota" in str(e.detail).lower():
                    print(f"⚠️  Gemini quota exceeded, falling back to OpenRouter...")
                    # Check if OpenRouter is available
                    if os.getenv("OPENROUTER_API_KEY"):
                        try:
                            ai_response = await call_openrouter(transcript_text, "anthropic/claude-3-haiku")
                            used_provider = "openrouter (fallback)"
                            print(f"✓ Successfully used OpenRouter as fallback")
                        except Exception as fallback_error:
                            raise HTTPException(
                                status_code=503, 
                                detail=f"Gemini quota exceeded and OpenRouter fallback failed. Please try again later or configure OPENROUTER_API_KEY. Error: {str(fallback_error)}"
                            )
                    else:
                        raise HTTPException(
                            status_code=503,
                            detail="Gemini quota exceeded. Please configure OPENROUTER_API_KEY in .env for automatic fallback, or wait for quota reset."
                        )
                else:
                    # Re-raise if it's not a quota error
                    raise
        else:
            # Use OpenRouter directly if requested
            ai_response = await call_openrouter(transcript_text, request.model or "anthropic/claude-3-haiku")
        
        # Format chapters
        chapters = [
            Chapter(
                timestamp=format_timestamp(ch["timestamp_seconds"]),
                title=ch["title"],
                summary=ch["summary"]
            )
            for ch in ai_response.get("chapters", [])
        ]
        
        # Format transcript segments
        transcript_segments = [
            TranscriptSegment(
                text=snippet.text,
                start=snippet.start,
                duration=snippet.duration
            )
            for snippet in fetched_transcript.snippets
        ]
        
        # Log which provider was used
        print(f"✓ Chapters generated successfully using: {used_provider}")
        
        return VideoResponse(
            video_id=video_id,
            transcript=transcript_segments,
            chapters=chapters,
            summary=ai_response.get("overall_summary", "")
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/transcript/{video_id}")
async def get_transcript(video_id: str):
    """
    Get transcript only for a YouTube video
    """
    try:
        fetched_transcript = YouTubeTranscriptApi().fetch(video_id)
        
        transcript_segments = [
            TranscriptSegment(
                text=snippet.text,
                start=snippet.start,
                duration=snippet.duration
            )
            for snippet in fetched_transcript.snippets
        ]
        
        return {
            "video_id": video_id,
            "transcript": transcript_segments
        }
        
    except TranscriptsDisabled:
        raise HTTPException(status_code=404, detail="Transcripts are disabled for this video")
    except NoTranscriptFound:
        raise HTTPException(status_code=404, detail="No transcript found for this video")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
