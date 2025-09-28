// DOM elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const predictionResult = document.getElementById('predictionResult');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceValue = document.getElementById('confidenceValue');

// Audio elements
const audioUploadBox = document.getElementById('audioUploadBox');
const audioFileInput = document.getElementById('audioFileInput');
const audioUploadBtn = document.getElementById('audioUploadBtn');
const audioPreviewSection = document.getElementById('audioPreviewSection');
const audioFileName = document.getElementById('audioFileName');
const analyzeAudioBtn = document.getElementById('analyzeAudioBtn');

// Video elements
const videoUploadBox = document.getElementById('videoUploadBox');
const videoFileInput = document.getElementById('videoFileInput');
const videoUploadBtn = document.getElementById('videoUploadBtn');
const videoPreviewSection = document.getElementById('videoPreviewSection');
const previewVideo = document.getElementById('previewVideo');
const videoFileName = document.getElementById('videoFileName');
const analyzeVideoBtn = document.getElementById('analyzeVideoBtn');

// Tab elements
const tabButtons = document.querySelectorAll('.tab-button');
const imageTab = document.getElementById('image-tab');
const audioTab = document.getElementById('audio-tab');
const videoTab = document.getElementById('video-tab');

let selectedFile = null;
let selectedAudioFile = null;
let selectedVideoFile = null;

// Event listeners
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFileSelect);

// Drag and drop functionality
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files } });
    }
});

uploadBox.addEventListener('click', () => {
    if (!selectedFile) {
        fileInput.click();
    }
});

analyzeBtn.addEventListener('click', analyzeImage);

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        if (tab === 'image') {
            imageTab.style.display = 'block';
            audioTab.style.display = 'none';
            videoTab.style.display = 'none';
        } else if (tab === 'audio') {
            imageTab.style.display = 'none';
            audioTab.style.display = 'block';
            videoTab.style.display = 'none';
        } else if (tab === 'video') {
            imageTab.style.display = 'none';
            audioTab.style.display = 'none';
            videoTab.style.display = 'block';
        }
        // Reset when switching tabs
        resetApp();
        resetAudioApp();
        resetVideoApp();
    });
});

// Audio event listeners
audioUploadBtn.addEventListener('click', () => audioFileInput.click());
audioFileInput.addEventListener('change', handleAudioFileSelect);

// Audio drag and drop
audioUploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    audioUploadBox.classList.add('dragover');
});

audioUploadBox.addEventListener('dragleave', () => {
    audioUploadBox.classList.remove('dragover');
});

audioUploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    audioUploadBox.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleAudioFileSelect({ target: { files } });
    }
});

audioUploadBox.addEventListener('click', () => {
    if (!selectedAudioFile) {
        audioFileInput.click();
    }
});

analyzeAudioBtn.addEventListener('click', analyzeAudio);

// Video event listeners
videoUploadBtn.addEventListener('click', () => videoFileInput.click());
videoFileInput.addEventListener('change', handleVideoFileSelect);

// Video drag and drop
videoUploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    videoUploadBox.classList.add('dragover');
});

videoUploadBox.addEventListener('dragleave', () => {
    videoUploadBox.classList.remove('dragover');
});

videoUploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    videoUploadBox.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleVideoFileSelect({ target: { files } });
    }
});

videoUploadBox.addEventListener('click', () => {
    if (!selectedVideoFile) {
        videoFileInput.click();
    }
});

analyzeVideoBtn.addEventListener('click', analyzeVideo);

// Handle audio file selection
function handleAudioFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
        showNotification('Please select a valid audio file.', 'error');
        return;
    }

    // Validate file size (max 50MB for audio)
    if (file.size > 50 * 1024 * 1024) {
        showNotification('File size must be less than 50MB.', 'error');
        return;
    }

    selectedAudioFile = file;
    displayAudioPreview(file);
}

// Display audio preview
function displayAudioPreview(file) {
    audioFileName.textContent = `Selected file: ${file.name}`;
    audioUploadBox.style.display = 'none';
    audioPreviewSection.style.display = 'block';
}

// Analyze audio
async function analyzeAudio() {
    if (!selectedAudioFile) return;

    // Show loading state
    analyzeAudioBtn.disabled = true;
    analyzeAudioBtn.innerHTML = '<div class="loading"></div> Analyzing...';

    try {
        const formData = new FormData();
        formData.append('file', selectedAudioFile);

        const response = await fetch('/predict_audio', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        displayAudioResults(result);

    } catch (error) {
        console.error('Error:', error);
        showNotification('Error analyzing audio. Please try again.', 'error');
    } finally {
        // Reset loading state
        analyzeAudioBtn.disabled = false;
        analyzeAudioBtn.innerHTML = 'Analyze Audio';
    }
}

// Display audio results
function displayAudioResults(result) {
    audioPreviewSection.style.display = 'none';
    resultsSection.style.display = 'block';

    const { prediction, confidence, status } = result;

    // Create result HTML
    if (status === 'error') {
        predictionResult.innerHTML = `
            <div class="result-text result-error">
                ${prediction}
            </div>
            <div class="result-details">
                🔧 Audio analysis model is currently unavailable. Please try again later or contact support.
            </div>
        `;
    } else {
        predictionResult.innerHTML = `
            <div class="result-text ${status === 'warning' ? 'result-fake' : 'result-real'}">
                ${prediction}
            </div>
            <div class="result-details">
                ${status === 'warning'
                    ? '⚠️ Deepfake detected! This audio appears to be artificially generated.'
                    : '✅ This audio appears to be authentic and not a deepfake.'
                }
            </div>
        `;
    }

    // Update confidence meter
    confidenceFill.style.width = `${confidence}%`;
    confidenceValue.textContent = `${confidence}%`;

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Reset audio functionality
function resetAudioApp() {
    selectedAudioFile = null;
    audioUploadBox.style.display = 'block';
    audioPreviewSection.style.display = 'none';
    audioFileInput.value = '';
}

// Handle video file selection
function handleVideoFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
        showNotification('Please select a valid video file.', 'error');
        return;
    }

    // Validate file size (max 100MB for video)
    if (file.size > 100 * 1024 * 1024) {
        showNotification('File size must be less than 100MB.', 'error');
        return;
    }

    selectedVideoFile = file;
    displayVideoPreview(file);
}

// Display video preview
function displayVideoPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewVideo.src = e.target.result;
        videoFileName.textContent = `Selected file: ${file.name}`;
        videoUploadBox.style.display = 'none';
        videoPreviewSection.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Analyze video
async function analyzeVideo() {
    if (!selectedVideoFile) return;

    // Show loading state
    analyzeVideoBtn.disabled = true;
    analyzeVideoBtn.innerHTML = '<div class="loading"></div> Analyzing...';

    try {
        const formData = new FormData();
        formData.append('file', selectedVideoFile);

        const response = await fetch('/predict_video', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        displayVideoResults(result);

    } catch (error) {
        console.error('Error:', error);
        showNotification('Error analyzing video. Please try again.', 'error');
    } finally {
        // Reset loading state
        analyzeVideoBtn.disabled = false;
        analyzeVideoBtn.innerHTML = 'Analyze Video';
    }
}

// Display video results
function displayVideoResults(result) {
    videoPreviewSection.style.display = 'none';
    resultsSection.style.display = 'block';

    const { prediction, confidence, status } = result;

    // Create result HTML
    predictionResult.innerHTML = `
        <div class="result-text ${status === 'warning' ? 'result-fake' : 'result-real'}">
            ${prediction}
        </div>
        <div class="result-details">
            ${status === 'warning'
                ? '⚠️ Deepfake detected! This video appears to be artificially generated.'
                : '✅ This video appears to be authentic and not a deepfake.'
            }
        </div>
    `;

    // Update confidence meter
    confidenceFill.style.width = `${confidence}%`;
    confidenceValue.textContent = `${confidence}%`;

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Reset video functionality
function resetVideoApp() {
    selectedVideoFile = null;
    videoUploadBox.style.display = 'block';
    videoPreviewSection.style.display = 'none';
    videoFileInput.value = '';
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }

    selectedFile = file;
    displayPreview(file);
}

// Display image preview
function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadBox.style.display = 'none';
        previewSection.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Analyze image
async function analyzeImage() {
    if (!selectedFile) return;

    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<div class="loading"></div> Analyzing...';

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        displayResults(result);

    } catch (error) {
        console.error('Error:', error);
        showNotification('Error analyzing image. Please try again.', 'error');
    } finally {
        // Reset loading state
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = 'Analyze Image';
    }
}

// Display results
function displayResults(result) {
    previewSection.style.display = 'none';
    resultsSection.style.display = 'block';

    const { prediction, confidence, status } = result;

    // Create result HTML
    predictionResult.innerHTML = `
        <div class="result-text ${status === 'warning' ? 'result-fake' : 'result-real'}">
            ${prediction}
        </div>
        <div class="result-details">
            ${status === 'warning'
                ? '⚠️ Deepfake detected! This image appears to be artificially generated.'
                : '✅ This image appears to be authentic and not a deepfake.'
            }
        </div>
    `;

    // Update confidence meter
    confidenceFill.style.width = `${confidence}%`;
    confidenceValue.textContent = `${confidence}%`;

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : '#4A90E2'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;

    const button = notification.querySelector('button');
    button.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Reset functionality
function resetApp() {
    selectedFile = null;
    uploadBox.style.display = 'block';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    fileInput.value = '';
}

function resetAll() {
    resetApp();
    resetAudioApp();
    resetVideoApp();
    resultsSection.style.display = 'none';
}

// Add reset button to results
document.addEventListener('DOMContentLoaded', () => {
    const resultsCard = document.querySelector('.results-card');
    if (resultsCard) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-primary';
        resetBtn.textContent = 'Analyze Another File';
        resetBtn.onclick = resetAll;
        resetBtn.style.marginTop = '20px';
        resultsCard.appendChild(resetBtn);
    }
});
