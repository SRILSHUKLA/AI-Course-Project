#!/usr/bin/env python3
"""
Startup script for the Deepfake Detection System
"""

import os
import sys
from pathlib import Path

def main():
    # Change to the deepfake_detector directory
    os.chdir(Path(__file__).parent)

    print("🚀 Starting Deepfake Detection System...")
    print("📁 Checking files...")

    # Check if model file exists
    if not Path("best_resnet50_f1.pth").exists():
        print("❌ Error: Model file 'resnet50_deepfake_finetuned_continue.pth' not found!")
        print("   Please ensure the trained model file is in the deepfake_detector directory.")
        sys.exit(1)

    # Check if required directories exist
    required_dirs = ["backend", "static", "uploads"]
    for dir_name in required_dirs:
        if not Path(dir_name).exists():
            print(f"❌ Error: Required directory '{dir_name}' not found!")
            sys.exit(1)

    print("✅ All required files found!")
    print("🌐 Starting FastAPI server...")

    # Import and run the FastAPI app
    try:
        from backend.main import app
        import uvicorn

        print("📱 Server starting on http://localhost:8000")
        print("🔗 Open your browser and navigate to the URL above")
        print("⚡ Press Ctrl+C to stop the server")

        uvicorn.run(app, host="0.0.0.0", port=8000)

    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
