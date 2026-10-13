import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { AnalyzeTab } from './components/AnalyzeTab';
import { ResultsTab } from './components/ResultsTab';
import { DocsTab } from './components/DocsTab';
import { demoAnalysisData } from './demoData';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const API_BASE_URL = 'http://localhost:5000';

const getInitialApiUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('interview_analytics_api_url');
    if (saved) return saved.trim();
    if (window.__BACKEND_URL__) return window.__BACKEND_URL__;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return API_BASE_URL;
};

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interview_theme');
      if (saved) return saved;
      return 'light';
    }
    return 'light';
  });
  const [apiUrl, setApiUrl] = useState(getInitialApiUrl);
  const [apiStatus, setApiStatus] = useState('connected');
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  const [toast, setToast] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('interview_theme', next);
      }
      return next;
    });
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const checkApiHealth = async (targetUrl = apiUrl) => {
    setIsCheckingApi(true);
    try {
      const cleanUrl = (targetUrl || '').replace(/\/+$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${cleanUrl}/api/health`, { 
        method: 'GET',
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch (e) {
      setApiStatus('disconnected');
    } finally {
      setIsCheckingApi(false);
    }
  };

  const handleSaveApiUrl = (newUrl) => {
    const clean = newUrl.replace(/\/+$/, '');
    setApiUrl(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('interview_analytics_api_url', clean);
    }
    checkApiHealth(clean);
    showToast(`Backend API configured: ${clean}`, 'success');
  };

  useEffect(() => {
    checkApiHealth(apiUrl);
    const interval = setInterval(() => checkApiHealth(apiUrl), 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleStartAnalysis = () => {
    setActiveTab('analyze');
  };

  const handleLoadDemo = () => {
    setAnalysisData(demoAnalysisData);
    setActiveTab('results');
    showToast('Loaded realistic candidate demonstration report', 'success');
  };

  const handleAnalyze = async ({ file, question, keywordInput }) => {
    setIsAnalyzing(true);
    setProgressStep(1);

    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 4000);

    const formData = new FormData();
    formData.append('video', file);
    if (question && question.trim()) {
      formData.append('question', question.trim());
    }
    if (keywordInput && keywordInput.trim()) {
      const keywords = keywordInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      keywords.forEach((kw) => formData.append('keywords', kw));
    }

    const cleanBase = apiUrl.replace(/\/+$/, '');
    try {
      const response = await fetch(`${cleanBase}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(stepInterval);
      setProgressStep(5);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      setAnalysisData(data);
      setActiveTab('results');
      showToast('Interview video analyzed successfully!', 'success');
    } catch (err) {
      clearInterval(stepInterval);
      showToast(
        apiStatus === 'disconnected'
          ? `Analysis failed: Cannot connect to ${cleanBase}. Ensure your backend is running or update the API URL in the header.`
          : `Analysis failed: ${err.message}`,
        'error'
      );
    } finally {
      setIsAnalyzing(false);
      setProgressStep(1);
    }
  };

  const handleExportPDF = async () => {
    if (!analysisData) {
      showToast('No analysis data to export. Please run or load an analysis first.', 'info');
      return;
    }
    setIsExportingPDF(true);
    showToast('Generating official PDF assessment report...', 'info');

    const cleanBase = apiUrl.replace(/\/+$/, '');
    try {
      const response = await fetch(`${cleanBase}/api/generate-report?format=pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) throw new Error('PDF generation failed on server');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('PDF report downloaded successfully.', 'success');
    } catch (err) {
      showToast(`PDF export failed: ${err.message}`, 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportJSON = async () => {
    if (!analysisData) {
      showToast('No analysis data to export.', 'info');
      return;
    }
    setIsExportingJSON(true);

    const cleanBase = apiUrl.replace(/\/+$/, '');
    try {
      const response = await fetch(`${cleanBase}/api/generate-report?format=json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) throw new Error('JSON generation failed on server');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview_report_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('JSON report downloaded successfully.', 'success');
    } catch (err) {
      showToast(`JSON export failed: ${err.message}`, 'error');
    } finally {
      setIsExportingJSON(false);
    }
  };

  return (
    <div className="app-container" data-theme={theme}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={apiStatus}
        isCheckingApi={isCheckingApi}
        onCheckApi={checkApiHealth}
        onLoadDemo={handleLoadDemo}
        apiUrl={apiUrl}
        onSaveApiUrl={handleSaveApiUrl}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main-content">
        {activeTab === 'overview' && (
          <OverviewTab
            onStartAnalysis={handleStartAnalysis}
            onLoadDemo={handleLoadDemo}
          />
        )}
        {activeTab === 'analyze' && (
          <AnalyzeTab
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            progressStep={progressStep}
          />
        )}
        {activeTab === 'results' && (
          <ResultsTab
            data={analysisData}
            onReset={() => setActiveTab('analyze')}
            onExportPDF={handleExportPDF}
            onExportJSON={handleExportJSON}
            isExportingPDF={isExportingPDF}
            isExportingJSON={isExportingJSON}
          />
        )}
        {activeTab === 'docs' && <DocsTab apiUrl={apiUrl} />}
      </main>

      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-rose" />}
            {toast.type === 'info' && <Info size={16} className="text-blue" />}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
