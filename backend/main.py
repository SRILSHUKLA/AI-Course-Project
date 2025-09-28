from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import os
from pathlib import Path
import librosa
import numpy as np
from transformers import pipeline


app = FastAPI(title="Deepfake Detection System", description="AI-powered deepfake detection using ResNet50")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Model configuration
NUM_CLASSES = 2
MODEL_PATH = "best_resnet50_f1.pth"

# Image transforms (matching the training configuration)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Load the trained model
def load_model():
    try:
        # Load pretrained ResNet50
        model = models.resnet50(pretrained=False)

        # Replace the final fully connected layer to match training architecture
        in_f = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Linear(in_f, 1024),
            nn.BatchNorm1d(1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(1024, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.4),
            nn.Linear(512, NUM_CLASSES)
        )

        # Load the trained weights
        if os.path.exists(MODEL_PATH):
            sd = torch.load(MODEL_PATH, map_location=device, weights_only=False)
            if "model_state" in sd:
                model.load_state_dict(sd["model_state"])
                print("Loaded checkpoint dict -> model_state")
            else:
                model.load_state_dict(sd)
                print("Loaded plain state_dict")
        else:
            raise FileNotFoundError(f"Checkpoint {MODEL_PATH} not found")
        model = model.to(device)
        model.eval()

        print("Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        raise HTTPException(status_code=500, detail="Failed to load model")

# Initialize model
model = load_model()

# Audio model configuration
AUDIO_MODEL_ID = "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification"

# Load audio model and processor
def load_audio_model():
    try:
        audio_pipe = pipeline(
            "audio-classification",
            model=AUDIO_MODEL_ID,
            framework="pt"
        )
        print("Audio model loaded successfully!")
        return audio_pipe
    except Exception as e:
        print(f"Error loading audio model: {e}")
        print("Audio model not available, audio detection will return placeholder results")
        return None

# Initialize audio model
audio_model = load_audio_model()

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deepfake Detection System</title>
        <link rel="stylesheet" href="/static/styles.css">
    </head>
    <body>
        <div class="container">
            <header>
                <div class="logo">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2L36 10V30L20 38L4 30V10L20 2Z" stroke="#4A90E2" stroke-width="2" fill="none"/>
                        <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" fill="#4A90E2" opacity="0.3"/>
                        <circle cx="20" cy="20" r="4" fill="#4A90E2"/>
                    </svg>
                    <h1>Deepfake Detection System</h1>
                </div>
                <p class="subtitle">Advanced AI-powered security for digital media verification</p>
            </header>

            <main>
                <div class="tabs">
                    <button class="tab-button active" data-tab="image">Image Detection</button>
                    <button class="tab-button" data-tab="audio">Audio Detection</button>
                </div>

                <div class="tab-content" id="image-tab">
                    <div class="upload-section">
                        <div class="upload-box" id="uploadBox">
                            <div class="upload-icon">
                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M32 8V44M32 8L20 20M32 8L44 20" stroke="#4A90E2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M8 44V52C8 53.1046 8.89543 54 10 54H54C55.1046 54 56 53.1046 56 52V44" stroke="#4A90E2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <h3>Upload Image for Analysis</h3>
                            <p>Drag and drop an image here or click to browse</p>
                            <input type="file" id="fileInput" accept="image/*" hidden>
                            <button id="uploadBtn" class="btn-primary">Choose File</button>
                        </div>

                        <div class="preview-section" id="previewSection" style="display: none;">
                            <div class="image-preview">
                                <img id="previewImage" src="" alt="Preview">
                            </div>
                            <button id="analyzeBtn" class="btn-primary">Analyze Image</button>
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="audio-tab" style="display: none;">
                    <div class="upload-section">
                        <div class="upload-box" id="audioUploadBox">
                            <div class="upload-icon">
                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M32 8C24.268 8 18 14.268 18 22V32C18 39.732 24.268 46 32 46C39.732 46 46 39.732 46 32V22C46 14.268 39.732 8 32 8Z" stroke="#4A90E2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M50 32C50 42.493 41.493 51 31 51C20.507 51 12 42.493 12 32" stroke="#4A90E2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M32 51V58" stroke="#4A90E2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M26 58H38" stroke="#4A90E2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <h3>Upload Audio for Analysis</h3>
                            <p>Drag and drop an audio file here or click to browse</p>
                            <input type="file" id="audioFileInput" accept="audio/*" hidden>
                            <button id="audioUploadBtn" class="btn-primary">Choose File</button>
                        </div>

                        <div class="preview-section" id="audioPreviewSection" style="display: none;">
                            <div class="audio-preview">
                                <p id="audioFileName">Selected file: </p>
                            </div>
                            <button id="analyzeAudioBtn" class="btn-primary">Analyze Audio</button>
                        </div>
                    </div>
                </div>

                <div class="results-section" id="resultsSection" style="display: none;">
                    <div class="results-card">
                        <div class="result-header">
                            <h3>Analysis Results</h3>
                            <div class="security-badge">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L18 4V8C18 13 14 17 10 18C6 17 2 13 2 8V4L10 2Z" stroke="#4A90E2" stroke-width="2" fill="none"/>
                                    <path d="M10 14L14 10L10 6L6 10L10 14Z" fill="#4A90E2"/>
                                </svg>
                                AI-Powered Security
                            </div>
                        </div>

                        <div class="result-content">
                            <div class="prediction-result" id="predictionResult">
                                <!-- Results will be displayed here -->
                            </div>

                            <div class="confidence-meter">
                                <div class="confidence-label">Confidence Level</div>
                                <div class="confidence-bar">
                                    <div class="confidence-fill" id="confidenceFill"></div>
                                </div>
                                <div class="confidence-value" id="confidenceValue">0%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <p>&copy; 2024 Deepfake Detection System. Protecting digital authenticity with AI.</p>
            </footer>
        </div>

        <script src="/static/script.js"></script>
    </body>
    </html>
    """

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')

        # Apply transforms
        image_tensor = transform(image).unsqueeze(0).to(device)

        # Make prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)

        # Convert to Python types
        predicted_class = predicted.item()
        confidence_value = confidence.item() * 100

        # Determine result
        if predicted_class == 1:
            result = "REAL"
            status = "verified"
        else:
            result = "FAKE (Deepfake Detected)"
            status = "warning"

        return {
            "prediction": result,
            "confidence": round(confidence_value, 2),
            "status": status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/predict_audio")
async def predict_audio(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")

        if audio_model is None:
            # Return placeholder result if model not available
            return {
                "prediction": "Analysis Unavailable",
                "confidence": 0,
                "status": "error"
            }

        # Read and process audio
        contents = await file.read()
        # Load audio with librosa, resample to 16kHz
        audio, sr = librosa.load(io.BytesIO(contents), sr=16000)

        # Use pipeline for prediction
        results = audio_model(audio)

        # Get the top prediction
        top_result = results[0]
        label = top_result['label']
        confidence_value = top_result['score'] * 100

        # Determine result based on label
        if 'real' in label.lower() or label.lower() == 'real':
            result = "REAL"
            status = "verified"
        else:
            result = "FAKE (Deepfake Detected)"
            status = "warning"

        return {
            "prediction": result,
            "confidence": round(confidence_value, 2),
            "status": status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
