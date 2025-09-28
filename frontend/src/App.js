import React, { useState } from 'react';
import './App.css';
import DecryptedText from './DecryptedText';
import PixelBlast from './PixelBlast';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('image');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    setSelectedAudioFile(null);
    setSelectedVideoFile(null);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file.');
      return;
    }

    // Validate file size (max 50MB for audio)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB.');
      return;
    }

    setSelectedAudioFile(file);
    setSelectedFile(null);
    setSelectedVideoFile(null);
    setPreview(null);
    setError(null);
  };

  const handleVideoFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }

    // Validate file size (max 100MB for video)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB.');
      return;
    }

    setSelectedVideoFile(file);
    setSelectedFile(null);
    setSelectedAudioFile(null);
    setPreview(null);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (activeTab === 'image') {
        handleFileSelect({ target: { files } });
      } else if (activeTab === 'audio') {
        handleAudioFileSelect({ target: { files } });
      } else if (activeTab === 'video') {
        handleVideoFileSelect({ target: { files } });
      }
    }
  };

  const handleAudioDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleAudioFileSelect({ target: { files } });
    }
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleVideoFileSelect({ target: { files } });
    }
  };

  const analyzeFile = async () => {
    let file = null;
    if (activeTab === 'image') {
      file = selectedFile;
    } else if (activeTab === 'audio') {
      file = selectedAudioFile;
    } else if (activeTab === 'video') {
      file = selectedVideoFile;
    }
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE = 'https://your-username-your-space-name.hf.space';
      let endpoint = `${API_BASE}/predict`;
      if (activeTab === 'audio') {
        endpoint = `${API_BASE}/predict_audio`;
      } else if (activeTab === 'video') {
        endpoint = `${API_BASE}/predict_video`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError(`Error analyzing ${activeTab}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const resetAudioApp = () => {
    setSelectedAudioFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const resetVideoApp = () => {
    setSelectedVideoFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedFile(null);
    setSelectedAudioFile(null);
    setSelectedVideoFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="App">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
      <div className="container">
        <header>
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2L36 10V30L20 38L4 30V10L20 2Z" stroke="#4A90E2" strokeWidth="2" fill="none"/>
              <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" fill="#4A90E2" opacity="0.3"/>
              <circle cx="20" cy="20" r="4" fill="#4A90E2"/>
            </svg>
            <DecryptedText text="DeepDefend" className="title" />
          </div>
          <p className="subtitle">Advanced AI-powered security for digital media verification</p>
        </header>

        <main>
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
              onClick={() => handleTabChange('image')}
            >
              Image Detection
            </button>
            <button
              className={`tab-button ${activeTab === 'audio' ? 'active' : ''}`}
              onClick={() => handleTabChange('audio')}
            >
              Audio Detection
            </button>
            <button
              className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => handleTabChange('video')}
            >
              Video Detection
            </button>
          </div>

          {activeTab === 'image' && (
            <div className={`tab-content ${activeTab === 'image' ? 'active' : ''}`}>
              {!preview && !result && (
                <div className="upload-section">
                  <div
                    className={`upload-box ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <div className="upload-icon">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 8V44M32 8L20 20M32 8L44 20" stroke="#4A90E2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 44V52C8 53.1046 8.89543 54 10 54H54C55.1046 54 56 53.1046 56 52V44" stroke="#4A90E2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>Upload Image for Analysis</h3>
                    <p>Drag and drop an image here or click to browse</p>
                    <input
                      type="file"
                      id="fileInput"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <button className="btn-primary">Choose File</button>
                  </div>
                </div>
              )}

              {preview && !result && (
                <div className="preview-section">
                  <div className="image-preview">
                    <img src={preview} alt="Preview" />
                  </div>
                  <button
                    className="btn-primary"
                    onClick={analyzeFile}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading"></div>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Image'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audio' && (
            <div className={`tab-content ${activeTab === 'audio' ? 'active' : ''}`}>
              {!selectedAudioFile && !result && (
                <div className="upload-section">
                  <div
                    className={`upload-box ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleAudioDrop}
                    onClick={() => document.getElementById('audioFileInput').click()}
                  >
                    <div className="upload-icon">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 8C24.268 8 18 14.268 18 22V32C18 39.732 24.268 46 32 46C39.732 46 46 39.732 46 32V22C46 14.268 39.732 8 32 8Z" stroke="#4A90E2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M50 32C50 42.493 41.493 51 31 51C20.507 51 12 42.493 12 32" stroke="#4A90E2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M32 51V58" stroke="#4A90E2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M26 58H38" stroke="#4A90E2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>Upload Audio for Analysis</h3>
                    <p>Drag and drop an audio file here or click to browse</p>
                    <input
                      type="file"
                      id="audioFileInput"
                      accept="audio/*"
                      onChange={handleAudioFileSelect}
                      style={{ display: 'none' }}
                    />
                    <button className="btn-primary">Choose File</button>
                  </div>
                </div>
              )}

              {selectedAudioFile && !result && (
                <div className="preview-section">
                  <div className="audio-preview">
                    <p>Selected file: {selectedAudioFile.name}</p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={analyzeFile}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading"></div>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Audio'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div className={`tab-content ${activeTab === 'video' ? 'active' : ''}`}>
              {!selectedVideoFile && !result && (
                <div className="upload-section">
                  <div
                    className={`upload-box ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleVideoDrop}
                    onClick={() => document.getElementById('videoFileInput').click()}
                  >
                    <div className="upload-icon">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="48" height="48" rx="4" stroke="#4A90E2" strokeWidth="3" fill="none"/>
                        <circle cx="32" cy="32" r="16" fill="#4A90E2" opacity="0.3"/>
                        <polygon points="28,24 28,40 40,32" fill="#4A90E2"/>
                      </svg>
                    </div>
                    <h3>Upload Video for Analysis</h3>
                    <p>Drag and drop a video file here or click to browse</p>
                    <input
                      type="file"
                      id="videoFileInput"
                      accept="video/*"
                      onChange={handleVideoFileSelect}
                      style={{ display: 'none' }}
                    />
                    <button className="btn-primary">Choose File</button>
                  </div>
                </div>
              )}

              {selectedVideoFile && !result && (
                <div className="preview-section">
                  <div className="video-preview">
                    {preview && <video src={preview} controls style={{ maxWidth: '100%', height: 'auto' }} />}
                    <p>Selected file: {selectedVideoFile.name}</p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={analyzeFile}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading"></div>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Video'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="results-section">
              <div className="results-card">
                <div className="result-header">
                  <h3>Analysis Results</h3>
                  <div className="security-badge">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 2L18 4V8C18 13 14 17 10 18C6 17 2 13 2 8V4L10 2Z" stroke="#4A90E2" strokeWidth="2" fill="none"/>
                      <path d="M10 14L14 10L10 6L6 10L10 14Z" fill="#4A90E2"/>
                    </svg>
                    AI-Powered Security
                  </div>
                </div>

                <div className="result-content">
                  <div className="prediction-result">
                    <div className={`result-text ${result.status === 'warning' ? 'result-fake' : result.status === 'error' ? 'result-error' : 'result-real'}`}>
                      {result.prediction}
                    </div>
                    <div className="result-details">
                      {result.status === 'warning'
                        ? `⚠️ Deepfake detected! This ${activeTab} appears to be artificially generated.`
                        : result.status === 'error'
                        ? '❌ Analysis unavailable. Please try again later.'
                        : `✅ This ${activeTab} appears to be authentic and not a deepfake.`
                      }
                    </div>
                  </div>

                  {result.status !== 'error' && (
                    <div className="confidence-meter">
                      <div className="confidence-label">Confidence Level</div>
                      <div className="confidence-gauge">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke="#e0e0e0"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke={result.status === 'warning' ? '#f44336' : '#4CAF50'}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(result.confidence / 100) * 314} 314`}
                            strokeDashoffset="0"
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dasharray 1s ease' }}
                          />
                          <text x="60" y="65" textAnchor="middle" fontSize="18" fill="#ffffff">
                            {result.confidence}%
                          </text>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <button className="btn-primary" onClick={
                  activeTab === 'image' ? resetApp :
                  activeTab === 'audio' ? resetAudioApp :
                  resetVideoApp
                }>
                  Analyze Another {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}
        </main>

        <footer>
          <p>&copy; 2024 DeepDefend. Protecting digital authenticity with AI.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
