#!/bin/bash

echo "========================================"
echo "Campus App - AI Chapter Summarizer Setup"
echo "========================================"
echo ""

echo "[1/3] Setting up Backend..."
cd backend' || exit

echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/downloads/"
    exit 1
fi

python3 --version

echo ""
echo "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

echo ""
echo "Activating virtual environment..."
source venv/bin/activate

echo ""
echo "Installing backend dependencies..."
pip install -r requirements.txt

echo ""
echo "Checking for .env file..."
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cat > .env << EOF
# Gemini API Key (Free tier available)
# Get it from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# OpenRouter API Key (Alternative, paid service)
# Get it from: https://openrouter.ai/keys
# OPENROUTER_API_KEY=your_openrouter_api_key_here

# Server Port
PORT=8000
EOF
    echo ""
    echo ".env file created! Please edit backend'/.env and add your API key."
else
    echo ".env file already exists."
fi

cd ..

echo ""
echo "[2/3] Setting up Frontend..."
cd frontend || exit

echo ""
echo "Checking for .env file..."
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cat > .env << EOF
# Gemini API Key for AI features
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL for chapter generation
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EOF
    echo ""
    echo ".env file created! Please edit frontend/.env and add your API key."
else
    echo ".env file already exists."
fi

cd ..

echo ""
echo "[3/3] Setup Complete!"
echo "========================================"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Add your API keys:"
echo "   - Edit backend'/.env and add GEMINI_API_KEY"
echo "   - Edit frontend/.env and add EXPO_PUBLIC_GEMINI_API_KEY"
echo ""
echo "2. Start the backend:"
echo "   cd backend'"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "4. Test the feature:"
echo "   - Open a YouTube video in the app"
echo "   - Click the 'Chapters' tab"
echo "   - Click 'Generate Chapters'"
echo ""
echo "For detailed instructions, see INTEGRATION_GUIDE.md"
echo "========================================"
