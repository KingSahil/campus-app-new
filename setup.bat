@echo off
echo ========================================
echo Campus App - AI Chapter Summarizer Setup
echo ========================================
echo.

echo [1/3] Setting up Backend...
cd backend'

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo Creating virtual environment...
if not exist venv (
    python -m venv venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Installing backend dependencies...
pip install -r requirements.txt

echo.
echo Checking for .env file...
if not exist .env (
    echo Creating .env file from template...
    (
        echo # Gemini API Key ^(Free tier available^)
        echo # Get it from: https://aistudio.google.com/app/apikey
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo.
        echo # OpenRouter API Key ^(Alternative, paid service^)
        echo # Get it from: https://openrouter.ai/keys
        echo # OPENROUTER_API_KEY=your_openrouter_api_key_here
        echo.
        echo # Server Port
        echo PORT=8000
    ) > .env
    echo.
    echo .env file created! Please edit backend'\.env and add your API key.
) else (
    echo .env file already exists.
)

cd ..

echo.
echo [2/3] Setting up Frontend...
cd frontend

echo.
echo Checking for .env file...
if not exist .env (
    echo Creating .env file from template...
    (
        echo # Gemini API Key for AI features
        echo EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
        echo.
        echo # Backend URL for chapter generation
        echo EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
    ) > .env
    echo.
    echo .env file created! Please edit frontend\.env and add your API key.
) else (
    echo .env file already exists.
)

cd ..

echo.
echo [3/3] Setup Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Add your API keys:
echo    - Edit backend'\.env and add GEMINI_API_KEY
echo    - Edit frontend\.env and add EXPO_PUBLIC_GEMINI_API_KEY
echo.
echo 2. Start the backend:
echo    cd backend'
echo    venv\Scripts\activate
echo    python main.py
echo.
echo 3. In a new terminal, start the frontend:
echo    cd frontend
echo    npm start
echo.
echo 4. Test the feature:
echo    - Open a YouTube video in the app
echo    - Click the "Chapters" tab
echo    - Click "Generate Chapters"
echo.
echo For detailed instructions, see INTEGRATION_GUIDE.md
echo ========================================
pause
