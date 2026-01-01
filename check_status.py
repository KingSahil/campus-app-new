#!/usr/bin/env python3
"""
Quick status check for the Chapter Generation system
Run this to diagnose issues
"""
import os
import sys
import requests
from pathlib import Path

def check_backend_env():
    """Check backend .env configuration"""
    print("\n📋 Backend Environment Check")
    print("=" * 50)
    
    env_path = Path(__file__).parent / 'backend' / '.env'
    
    if not env_path.exists():
        print("❌ backend/.env file not found!")
        return False
    
    with open(env_path) as f:
        content = f.read()
        
    has_gemini = 'GEMINI_API_KEY=' in content and 'your_' not in content
    has_openrouter = 'OPENROUTER_API_KEY=' in content and 'your_' not in content
    
    print(f"{'✓' if has_gemini else '✗'} GEMINI_API_KEY: {'Configured' if has_gemini else 'Missing or placeholder'}")
    print(f"{'✓' if has_openrouter else '✗'} OPENROUTER_API_KEY: {'Configured' if has_openrouter else 'Missing or placeholder'}")
    
    if has_gemini:
        print("  ℹ️  Gemini (free) will be used as primary")
    if has_openrouter:
        print("  ℹ️  OpenRouter (paid) will be used as fallback")
    
    return has_gemini or has_openrouter

def check_backend_running():
    """Check if backend server is running"""
    print("\n🖥️  Backend Server Check")
    print("=" * 50)
    
    try:
        response = requests.get('http://localhost:8000', timeout=5)
        if response.status_code == 200:
            print("✓ Backend is running at http://localhost:8000")
            return True
        else:
            print(f"⚠️  Backend responded with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is NOT running")
        print("   Start it with: cd backend && python main.py")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

def check_backend_health():
    """Check backend health endpoint"""
    print("\n💊 Backend Health Check")
    print("=" * 50)
    
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_api():
    """Test chapter generation API"""
    print("\n🧪 API Test")
    print("=" * 50)
    print("Testing with sample YouTube video...")
    
    try:
        response = requests.post(
            'http://localhost:8000/analyze',
            json={
                'video_url': 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
                'api_provider': 'gemini',
                'model': 'gemini-2.0-flash-exp'
            },
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ API test successful!")
            print(f"  Generated {len(data.get('chapters', []))} chapters")
            return True
        elif response.status_code == 503:
            error = response.json()
            print(f"⚠️  Service unavailable (503): {error.get('detail', '')}")
            if 'quota' in error.get('detail', '').lower():
                print("  💡 Gemini quota exceeded. OpenRouter fallback may be needed.")
            return False
        else:
            print(f"❌ API test failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out (this is normal for first request, try again)")
        return False
    except Exception as e:
        print(f"❌ API test error: {e}")
        return False

def main():
    print("🔍 Chapter Generation System Status Check")
    print("=" * 50)
    
    checks = {
        'Environment': check_backend_env(),
        'Backend Running': check_backend_running(),
    }
    
    if checks['Backend Running']:
        checks['Health Check'] = check_backend_health()
        
        # Only test API if explicitly requested
        if '--test-api' in sys.argv:
            checks['API Test'] = test_api()
    
    print("\n📊 Summary")
    print("=" * 50)
    
    for check, passed in checks.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status} - {check}")
    
    all_passed = all(checks.values())
    
    if all_passed:
        print("\n🎉 All checks passed! System is ready.")
        return 0
    else:
        print("\n⚠️  Some checks failed. See details above.")
        print("\nQuick fixes:")
        if not checks.get('Environment'):
            print("  • Add API keys to backend/.env")
        if not checks.get('Backend Running'):
            print("  • Start backend: cd backend && python main.py")
        return 1

if __name__ == '__main__':
    exit(main())
