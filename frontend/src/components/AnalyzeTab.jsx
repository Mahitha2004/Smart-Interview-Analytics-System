import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileVideo, 
  X, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';

export function AnalyzeTab({ onAnalyze, isAnalyzing, progressStep }) {
  const [file, setFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [question, setQuestion] = useState("Explain how you design resilient, fault-tolerant distributed systems.");
  const [keywordInput, setKeywordInput] = useState("distributed, microservices, redundancy, failover, latency, consensus");
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelection = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const validExtensions = ['.mp4', '.webm', '.mov', '.avi'];
    const extension = '.' + selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(selectedFile.type) && !validExtensions.includes(extension)) {
      setError("Please select a supported video format (MP4, WebM, MOV, or AVI).");
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File exceeds the maximum limit of 100MB. Please choose a smaller video.");
      return;
    }

    setFile(selectedFile);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClearFile = () => {
    setFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose or drop an interview video before starting analysis.");
      return;
    }
    setError(null);
    onAnalyze({ file, question, keywordInput });
  };

  const steps = [
    { id: 1, label: "Ingesting video payload" },
    { id: 2, label: "Acoustic extraction (FFmpeg)" },
    { id: 3, label: "Facial landmarks & posture tracking" },
    { id: 4, label: "Audio signal processing & speech recognition" },
    { id: 5, label: "Semantic scoring & synthesis" }
  ];

  return (
    <div className="tab-pane animate-fade-in">
      <div className="analyze-layout">
        <div className="analyze-main-card">
          <div className="card-header-clean">
            <div>
              <h2 className="card-title">Upload Candidate Video</h2>
              <p className="card-subtitle">
                Supported formats: MP4, WebM, MOV, AVI (Max 100MB). Audio and video tracks must be present.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="analyze-form">
            {!file ? (
              <div 
                className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => handleFileSelection(e.target.files[0])}
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  style={{ display: 'none' }}
                />
                <div className="dropzone-icon-box">
                  <UploadCloud size={32} className="dropzone-icon" />
                </div>
                <div className="dropzone-text">
                  <span className="dropzone-title">Click to upload or drag & drop</span>
                  <span className="dropzone-subtitle">MP4, WebM, MOV or AVI up to 100MB</span>
                </div>
              </div>
            ) : (
              <div className="file-preview-card">
                <div className="file-preview-header">
                  <div className="file-info-row">
                    <FileVideo size={20} className="text-blue" />
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Video file'}
                      </div>
                    </div>
                  </div>
                  {!isAnalyzing && (
                    <button 
                      type="button" 
                      className="btn-icon-danger"
                      onClick={handleClearFile}
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {videoPreviewUrl && (
                  <div className="video-player-wrapper">
                    <video 
                      src={videoPreviewUrl} 
                      controls 
                      className="preview-video"
                    />
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="questionInput" className="form-label">
                <span>Interview Question Context</span>
                <span className="label-hint">Used to evaluate answer relevance and topical alignment</span>
              </label>
              <textarea
                id="questionInput"
                className="form-textarea"
                rows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Describe a situation where you had to debug a distributed system failure..."
                disabled={isAnalyzing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="keywordsInput" className="form-label">
                <span>Expected Keywords / Key Concepts</span>
                <span className="label-hint">Comma-separated key competencies or technical terms</span>
              </label>
              <input
                id="keywordsInput"
                type="text"
                className="form-input"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="e.g. microservices, latency, caching, database, failover"
                disabled={isAnalyzing}
              />
              <div className="keyword-pills-preview">
                {keywordInput.split(',').map(k => k.trim()).filter(Boolean).map((kw, i) => (
                  <span key={i} className="keyword-tag">
                    <Tag size={11} />
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary btn-large"
                disabled={!file || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>Analyzing Interview Video...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>Run Complete Analysis</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="analyze-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Analysis Pipeline</h3>
            <p className="sidebar-card-desc">
              When triggered, the backend executes our multi-modal inspection pipeline:
            </p>
            <div className="stepper-list">
              {steps.map((s, idx) => {
                const isCurrent = isAnalyzing && progressStep === s.id;
                const isDone = isAnalyzing && progressStep > s.id;
                return (
                  <div 
                    key={s.id} 
                    className={`step-item ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                  >
                    <div className="step-bullet">
                      {isDone ? (
                        <CheckCircle2 size={14} className="text-emerald" />
                      ) : isCurrent ? (
                        <Loader2 size={14} className="spinner text-blue" />
                      ) : (
                        <span>{s.id}</span>
                      )}
                    </div>
                    <span className="step-label">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sidebar-card info-card">
            <h4 className="info-title">
              <HelpCircle size={15} />
              Best Analysis Practices
            </h4>
            <ul className="info-tips">
              <li>Ensure candidate face is well-illuminated and framed within the top third of the frame.</li>
              <li>Acoustic analysis performs best with minimum background hum or microphone clipping.</li>
              <li>Typical analysis runtime is 15 to 45 seconds depending on video length.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
