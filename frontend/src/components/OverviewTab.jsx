import React from 'react';
import { 
  Eye, 
  Mic2, 
  BrainCircuit, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart3,
  Sliders
} from 'lucide-react';

export function OverviewTab({ onStartAnalysis, onLoadDemo }) {
  return (
    <div className="tab-pane animate-fade-in">
      <div className="hero-section">
        <div className="hero-content">
          <div className="badge-pill">
            <span className="badge-dot"></span>
            Enterprise Multi-Modal Assessment
          </div>
          <h1 className="hero-title">
            Scientific Interview Performance Analytics
          </h1>
          <p className="hero-description">
            Evaluate candidate composure, vocal delivery, and semantic substance through coordinated 
            computer vision, signal processing, and natural language understanding.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onStartAnalysis}>
              <span>Upload Interview Video</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={onLoadDemo}>
              <Sparkles size={16} />
              <span>Explore Demo Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pillars-grid">
        <div className="pillar-card">
          <div className="pillar-header">
            <div className="pillar-icon-box">
              <Eye size={20} className="text-blue" />
            </div>
            <div>
              <h3 className="pillar-title">Visual & Non-Verbal Presence</h3>
              <span className="pillar-weight">25% Weighted Score</span>
            </div>
          </div>
          <p className="pillar-text">
            Tracks camera gaze consistency, head motion stability, and posture equilibrium using real-time 
            facial and ocular landmark detection.
          </p>
          <ul className="pillar-metrics-list">
            <li><CheckCircle2 size={14} /> Eye Contact & Focus Ratio</li>
            <li><CheckCircle2 size={14} /> Head Pose & Tilt Stability</li>
            <li><CheckCircle2 size={14} /> Posture & Presence Equilibrium</li>
            <li><CheckCircle2 size={14} /> Non-verbal Confidence Metric</li>
          </ul>
        </div>

        <div className="pillar-card">
          <div className="pillar-header">
            <div className="pillar-icon-box">
              <Mic2 size={20} className="text-blue" />
            </div>
            <div>
              <h3 className="pillar-title">Vocal & Acoustic Dynamics</h3>
              <span className="pillar-weight">25% Weighted Score</span>
            </div>
          </div>
          <p className="pillar-text">
            Performs signal-level Fourier filtering to measure articulation speed, speech rhythm continuity, 
            monotone risk, and pause cadence.
          </p>
          <ul className="pillar-metrics-list">
            <li><CheckCircle2 size={14} /> Cadence & Words Per Minute (WPM)</li>
            <li><CheckCircle2 size={14} /> Acoustic Energy & Clarity Index</li>
            <li><CheckCircle2 size={14} /> Pause & Silence Ratio</li>
            <li><CheckCircle2 size={14} /> Fundamental Pitch Modulation</li>
          </ul>
        </div>

        <div className="pillar-card">
          <div className="pillar-header">
            <div className="pillar-icon-box">
              <BrainCircuit size={20} className="text-blue" />
            </div>
            <div>
              <h3 className="pillar-title">Substance & Semantic Quality</h3>
              <span className="pillar-weight">50% Weighted Score</span>
            </div>
          </div>
          <p className="pillar-text">
            Transcribes speech to structured text and scores semantic relevance against the interview prompt, 
            keyword completeness, and sentence coherence.
          </p>
          <ul className="pillar-metrics-list">
            <li><CheckCircle2 size={14} /> TF-IDF Prompt Relevance Alignment</li>
            <li><CheckCircle2 size={14} /> Technical Domain Keyword Coverage</li>
            <li><CheckCircle2 size={14} /> Sentence-to-Sentence Coherence</li>
            <li><CheckCircle2 size={14} /> Lexical Richness & Language Quality</li>
          </ul>
        </div>
      </div>

      <div className="spec-table-card">
        <div className="card-header-clean">
          <div>
            <h3 className="card-title">Analysis Architecture & Standard Benchmarks</h3>
            <p className="card-subtitle">Validated criteria applied across multi-tier engineering assessments</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Measured Parameter</th>
                <th>Optimal Target Range</th>
                <th>Diagnostic Importance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Speech Rate</strong></td>
                <td>Words Per Minute (WPM)</td>
                <td><span className="badge-tag">130 – 160 WPM</span></td>
                <td>Balances clarity with communicative energy</td>
              </tr>
              <tr>
                <td><strong>Visual Gaze</strong></td>
                <td>Camera Alignment</td>
                <td><span className="badge-tag">&gt; 70% of duration</span></td>
                <td>Demonstrates engagement and active listening</td>
              </tr>
              <tr>
                <td><strong>Pause Ratio</strong></td>
                <td>Silence & Hesitation</td>
                <td><span className="badge-tag">10% – 25%</span></td>
                <td>Allows thought structuring without trailing off</td>
              </tr>
              <tr>
                <td><strong>Content Substance</strong></td>
                <td>Semantic Relevance</td>
                <td><span className="badge-tag">&gt; 75% match</span></td>
                <td>Validates direct answer addressing question context</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
