import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export function DocsTab({ apiUrl }) {
  const [copiedCurl, setCopiedCurl] = useState(false);

  const sampleCurl = `curl -X POST "${apiUrl}/api/analyze" \\
  -F "video=@candidate_interview.mp4" \\
  -F "question=Explain how you design resilient distributed systems." \\
  -F "keywords=microservices" \\
  -F "keywords=latency" \\
  -F "keywords=caching"`;

  const copyCurl = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/health",
      desc: "Liveness and readiness health check probe."
    },
    {
      method: "POST",
      path: "/api/analyze",
      desc: "Full multi-modal analysis (multipart/form-data with video, question, keywords)."
    },
    {
      method: "POST",
      path: "/api/analyze/video",
      desc: "Isolated visual & facial presence analysis (OpenCV)."
    },
    {
      method: "POST",
      path: "/api/analyze/audio",
      desc: "Isolated acoustic dynamics & speech metrics (SciPy)."
    },
    {
      method: "POST",
      path: "/api/generate-report",
      desc: "Generates formatted PDF or JSON evaluation report (?format=pdf|json)."
    },
    {
      method: "GET",
      path: "/api/metrics",
      desc: "Returns metric schema catalog and available indices."
    }
  ];

  return (
    <div className="tab-pane animate-fade-in">
      <div className="docs-header">
        <h2 className="docs-title">API Reference & Integration Guide</h2>
        <p className="docs-desc">
          The Smart Interview Analytics backend exposes RESTful endpoints supporting both monolithic 
          multi-modal evaluation and modular micro-analysis pipelines.
        </p>
      </div>

      <div className="docs-grid">
        <div className="card-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">REST Endpoints</h3>
              <p className="panel-subtitle">Base URL: {apiUrl}</p>
            </div>
          </div>

          <div className="endpoints-list">
            {endpoints.map((ep, i) => (
              <div key={i} className="endpoint-item">
                <div className="endpoint-header">
                  <span className={`method-badge method-${ep.method.toLowerCase()}`}>
                    {ep.method}
                  </span>
                  <code className="endpoint-path">{ep.path}</code>
                </div>
                <p className="endpoint-desc">{ep.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">cURL Request Example</h3>
              <p className="panel-subtitle">Analyze interview video payload via terminal</p>
            </div>
            <button className="btn-icon" onClick={copyCurl} title="Copy command">
              {copiedCurl ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
            </button>
          </div>

          <pre className="code-block">
            <code>{sampleCurl}</code>
          </pre>

          <div className="payload-spec">
            <h4 className="spec-title">Key Request Parameters</h4>
            <ul className="spec-list">
              <li><code>video</code> (File, Required): Binary video file (.mp4, .webm, .mov, .avi)</li>
              <li><code>question</code> (String, Optional): Target interview question for contextual relevance</li>
              <li><code>keywords</code> (Array/String, Optional): Repeatable expected competency keywords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
