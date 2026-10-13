import React, { useState } from 'react';
import { 
  BarChart2, 
  Video, 
  FileText, 
  Code2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Settings,
  X,
  Server,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';

export function Header({ 
  activeTab, 
  setActiveTab, 
  apiStatus, 
  isCheckingApi, 
  onCheckApi, 
  onLoadDemo,
  apiUrl,
  onSaveApiUrl,
  theme,
  onToggleTheme
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const handleOpenSettings = () => {
    setTempUrl(apiUrl);
    setShowSettings(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (tempUrl && tempUrl.trim()) {
      onSaveApiUrl(tempUrl.trim());
      setShowSettings(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="brand-logo">
              <Activity className="brand-icon" size={19} />
            </div>
            <div>
              <div className="brand-title">Interview Analytics</div>
              <div className="brand-subtitle">Performance Intelligence Platform</div>
            </div>
          </div>

          <nav className="header-nav">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart2 size={15} />
              <span>Overview</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'analyze' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyze')}
            >
              <Video size={15} />
              <span>Analyze Video</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <FileText size={15} />
              <span>Scorecard</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveTab('docs')}
            >
              <Code2 size={15} />
              <span>API Docs</span>
            </button>
          </nav>

          <div className="header-actions">
            <button 
              className="btn-theme-toggle"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button 
              className="btn-demo"
              onClick={onLoadDemo}
              title="Load realistic candidate assessment data"
            >
              <Sparkles size={14} />
              <span>Load Demo Data</span>
            </button>

            <button 
              className={`api-status-badge ${apiStatus === 'connected' ? 'connected' : 'disconnected'}`}
              onClick={handleOpenSettings}
              title="Configure API URL or test connection"
            >
              <span className="status-dot"></span>
              <span className="status-text">
                {isCheckingApi ? 'Checking' : apiStatus === 'connected' ? 'API Online' : 'API Offline'}
              </span>
              <Settings size={12} style={{ marginLeft: 3, opacity: 0.7 }} />
            </button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Server size={18} className="text-accent" />
                <h3>Backend API Configuration</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowSettings(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-body">
              <p className="modal-desc">
                When hosting on Vercel or locally, point this client to your running Python Flask API.
              </p>

              <div className="form-group">
                <label className="form-label">
                  <span>Backend Endpoint URL</span>
                  <span className="label-hint">Default: http://localhost:5000</span>
                </label>
                <input 
                  type="url"
                  className="form-input"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://your-backend.onrender.com"
                  required
                />
              </div>

              <div className="modal-status-box">
                <div className="status-indicator-row">
                  <span className={`status-dot ${apiStatus === 'connected' ? 'text-emerald' : 'text-rose'}`}></span>
                  <span className="text-sm">
                    Status: <strong>{apiStatus === 'connected' ? 'Connected & Healthy' : 'Disconnected'}</strong>
                  </span>
                </div>
                <button 
                  type="button" 
                  className="btn-outline btn-sm"
                  onClick={() => onCheckApi(tempUrl)}
                  disabled={isCheckingApi}
                >
                  {isCheckingApi ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => {
                    setTempUrl('http://localhost:5000');
                    onSaveApiUrl('http://localhost:5000');
                    setShowSettings(false);
                  }}
                >
                  Reset to Localhost
                </button>
                <button type="submit" className="btn-primary">
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
