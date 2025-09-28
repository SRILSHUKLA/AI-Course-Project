# Deepfake Detection System

An AI-powered web application for detecting deepfakes in images, audio, and videos. Uses a fine-tuned ResNet50 model for visual content (images and video frames), and a wav2vec2-based model for audio. Features a modern React frontend with a sleek navy blue theme and security motifs, backed by a FastAPI backend.

## Features

- 🛡️ **Multi-Modal AI Detection**:
  - Image: Fine-tuned ResNet50 for deepfake image classification
  - Audio: wav2vec2-large-xlsr model for audio deepfake detection
  - Video: Frame-by-frame analysis using ResNet50 on extracted video frames
- ⚛️ **React Frontend**: Modern, responsive React application with tabbed interface for different media types
- 🎨 **Navy Blue Theme**: Security-focused design with navy blue color scheme
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Analysis**: Fast processing with loading indicators and instant results
- 🔒 **Security Focused**: Built with security and protection as core design principles, including file validation and secure model loading

## Project Structure

```
deepfake_detector/
├── backend/
│   └── main.py              # FastAPI backend with model inference
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # React component styles
│   │   └── ...
│   ├── public/
│   └── package.json
├── static/                 # Legacy static files (for reference)
├── uploads/                # Directory for uploaded images
├── requirements.txt        # Python dependencies
├── start.py               # Startup script
└── README.md              # This file
```

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- Trained model file: `best_resnet50_f1.pth` (for image/video detection)

## Installation

1. **Navigate to the project directory**:

   ```bash
   cd deepfake_detector
   ```

2. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**:

   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Ensure your trained model is in the root directory**:
   - Place `best_resnet50_f1.pth` in the `deepfake_detector` folder

## Usage

### Option 1: Using the Startup Script (Recommended)

1. **Start both backend and frontend**:

   ```bash
   python start.py
   ```

2. **Open your browser and navigate to**:
   ```
   http://localhost:3000
   ```

### Option 2: Manual Setup

1. **Start the FastAPI backend** (in one terminal):

   ```bash
   cd backend
   python main.py
   ```

2. **Start the React frontend** (in another terminal):

   ```bash
   cd frontend
   npm start
   ```

3. **Open your browser and navigate to**:
   ```
   http://localhost:3000
   ```

## How to Use

The application features three tabs for different media types: Image, Audio, and Video Detection.

### Image Detection

1. **Switch to Image tab**.
2. **Upload an image**:
   - Click "Choose File" or drag and drop an image (JPEG, PNG, up to 10MB).
   - Preview the image.
3. **Analyze**:
   - Click "Analyze Image".
4. **View results**:
   - "REAL" (green) or "FAKE (Deepfake Detected)" (red) with confidence percentage.

### Audio Detection

1. **Switch to Audio tab**.
2. **Upload an audio file**:
   - Click "Choose File" or drag and drop (MP3, WAV, up to 50MB).
   - See selected file name.
3. **Analyze**:
   - Click "Analyze Audio".
4. **View results**:
   - "REAL" or "FAKE (Deepfake Detected)" based on voice manipulation detection.

### Video Detection

1. **Switch to Video tab**.
2. **Upload a video**:
   - Click "Choose File" or drag and drop (MP4, AVI, up to 100MB).
   - Preview the video with controls.
3. **Analyze**:
   - Click "Analyze Video" (processes up to 200 frames).
4. **View results**:
   - Aggregated prediction from frames: "REAL" or "FAKE (Deepfake Detected)" with average confidence.

Use "Analyze Another [Media Type]" to reset and test more files. Results include a confidence meter for reliability assessment.

## API Endpoints

- `GET /` - Serves the legacy HTML interface (for reference; main app is React at /3000)
- `POST /predict` - Analyze uploaded image
  - **Input**: Image file (multipart/form-data)
  - **Output**: JSON `{ "prediction": "REAL"|"FAKE (Deepfake Detected)", "confidence": float, "status": "verified"|"warning" }`
- `POST /predict_audio` - Analyze uploaded audio
  - **Input**: Audio file (multipart/form-data, MP3/WAV)
  - **Output**: JSON (same format as above; placeholder if model unavailable)
- `POST /predict_video` - Analyze uploaded video
  - **Input**: Video file (multipart/form-data, MP4/AVI)
  - **Output**: JSON (same format; aggregates frame predictions)

## Model Details

### Image/Video Detection (Visual)

- **Model**: Fine-tuned ResNet50
- **Input**: 224x224 RGB images/frames
- **Classes**: 2 (Real=1, Deepfake=0)
- **Architecture**: ResNet50 backbone + custom FC layers (1024→512→2) with dropout and batch norm
- **Normalization**: ImageNet means/std ([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
- **Video Processing**: Extracts up to 200 evenly spaced frames, predicts per frame, averages fake probability (>0.5 = FAKE)

### Audio Detection

- **Model**: wav2vec2-large-xlsr-deepfake-audio-classification (Hugging Face)
- **Input**: 16kHz audio waveforms
- **Classes**: Binary (Real vs Fake) via audio classification pipeline
- **Framework**: Transformers + PyTorch
- **Fallback**: Placeholder results if model fails to load

## Customization

### Theme Colors

The navy blue theme can be customized in `frontend/src/App.css`:

- Primary color: `#4A90E2`
- Background gradients: `#1a1a2e`, `#16213e`, `#0f3460`
- Real results: `#4CAF50` (green)
- Fake results: `#f44336` (red)

### Model Configuration

Modify model parameters in `backend/main.py`:

- `NUM_CLASSES`: Number of output classes
- `MODEL_PATH`: Path to your trained model
- Transform pipeline for image preprocessing

## Security Features

- File type validation (image/audio/video MIME checks)
- File size limits (10MB images, 50MB audio, 100MB video)
- Error handling for malformed/invalid uploads
- Secure model loading with try-catch and fallback
- Temporary file cleanup for video processing (prevents disk leaks)
- CORS middleware for secure frontend-backend communication

## Troubleshooting

**Model loading fails**:

- Ensure `best_resnet50_f1.pth` is in the root directory and not corrupted
- For audio: Check internet for Hugging Face download; fallback to placeholder

**Video processing errors** (e.g., OpenCV VideoCapture fails):

- Ensure video format is supported (MP4/AVI); try re-encoding if needed
- Check OpenCV installation: `pip install opencv-python==4.8.1.78`

**CUDA not available**:

- App auto-falls back to CPU; install CUDA for GPU acceleration (Torch supports it)

**Port conflicts**:

- Backend: 8000 (change in uvicorn.run)
- Frontend: 3000 (change in package.json scripts)

**Audio model unavailable**:

- Results show "Analysis Unavailable"; ensure Transformers library is installed and retry

**React build issues**:

- Clear node_modules: `rm -rf frontend/node_modules && cd frontend && npm install`
- Clear cache: `npm cache clean --force`

**File upload errors**:

- Check file size limits and MIME types
- For videos, ensure no corruption; test with small clips first

## Development

### Frontend Development (React)

- Edit `frontend/src/App.js` for tab logic, upload handling, and UI components
- Edit `frontend/src/App.css` for styling (tabs, previews, results)
- Run `cd frontend && npm start` for hot reload on http://localhost:3000

### Backend Development (FastAPI)

- Edit `backend/main.py` for endpoints (/predict, /predict_audio, /predict_video), model loading, and processing logic
- Test API: Use tools like Postman or curl for file uploads
- Run `uvicorn backend.main:app --reload` for development

### Adding New Features

- Update TODO.md for tracking
- For new models: Add loading in main.py, endpoint, and frontend tab
- Ensure requirements.txt includes dependencies

## Production Deployment

1. **Build the React app**:

   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Configure production settings**:

   - Update CORS settings in `backend/main.py` for your domain
   - Set appropriate environment variables
   - Configure your web server to serve the built React app

3. **Deploy**:

- Deploy the FastAPI backend to your server
- Serve the built React app from the `frontend/build` directory
- Ensure `best_resnet50_f1.pth` is accessible to the backend (for image/video detection)
- Audio model downloads automatically from Hugging Face on first use

## License

This project is for educational and research purposes. Ensure you have proper rights to use any trained models and datasets.

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Ensure the model file is correctly placed and not corrupted
4. Check that both frontend and backend are running properly
