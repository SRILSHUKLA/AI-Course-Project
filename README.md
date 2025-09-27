# Deepfake Detection System

An AI-powered web application for detecting deepfake images using a fine-tuned ResNet50 model. Features a modern React frontend with a sleek navy blue theme and security motifs, backed by a FastAPI backend.

## Features

- 🛡️ **Advanced AI Detection**: Uses a fine-tuned ResNet50 model for accurate deepfake detection
- ⚛️ **React Frontend**: Modern, responsive React application with sleek UI
- 🎨 **Navy Blue Theme**: Security-focused design with navy blue color scheme
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Analysis**: Fast image processing and instant results
- 🔒 **Security Focused**: Built with security and protection as core design principles

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
- Trained model file: `resnet50_deepfake_finetuned_continue.pth`

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
   - Place `resnet50_deepfake_finetuned_continue.pth` in the `deepfake_detector` folder

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

1. **Upload an image**:

   - Click "Choose File" or drag and drop an image onto the upload area
   - The image will be previewed before analysis

2. **Analyze the image**:

   - Click "Analyze Image" to process it with your trained model
   - Wait for the AI to analyze the image

3. **View results**:
   - See if the image is classified as "REAL" or "FAKE (Deepfake Detected)"
   - View the confidence level of the prediction
   - Use "Analyze Another Image" to test more images

## API Endpoints

- `GET /` - Main web interface (served by FastAPI)
- `POST /predict` - Analyze uploaded image
  - **Input**: Image file via multipart form data
  - **Output**: JSON with prediction, confidence, and status

## Model Details

The system uses a ResNet50 model that has been fine-tuned for binary classification:

- **Input**: 224x224 RGB images
- **Classes**: 2 (Real vs Deepfake)
- **Architecture**: ResNet50 with custom classification head
- **Normalization**: ImageNet normalization values

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

- File type validation (images only)
- File size limits (10MB max)
- Error handling for malformed uploads
- Secure model loading with error handling
- CORS middleware for frontend-backend communication

## Troubleshooting

**Model loading fails**:

- Ensure `resnet50_deepfake_finetuned_continue.pth` is in the correct directory
- Check that the model file is not corrupted

**CUDA not available**:

- The application will automatically use CPU if CUDA is not available
- For better performance, ensure CUDA is properly installed

**Port conflicts**:

- Backend runs on port 8000
- Frontend runs on port 3000
- If ports are busy, modify them in the respective configuration files

**React build issues**:

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## Development

### Frontend Development

- Edit `frontend/src/App.js` for React component changes
- Edit `frontend/src/App.css` for styling changes
- Run `npm start` for development server with hot reload

### Backend Development

- Edit `backend/main.py` for API and model logic changes
- The backend serves both the API and the initial HTML interface

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
   - Ensure the model file is accessible to the backend

## License

This project is for educational and research purposes. Ensure you have proper rights to use any trained models and datasets.

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Ensure the model file is correctly placed and not corrupted
4. Check that both frontend and backend are running properly
