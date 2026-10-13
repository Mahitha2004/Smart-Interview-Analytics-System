import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  RotateCcw, 
  Eye, 
  Mic, 
  BrainCircuit, 
  Check, 
  Copy, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';

export function ResultsTab({ data, onReset, onExportPDF, onExportJSON, isExportingPDF, isExportingJSON }) {
  const [copied, setCopied] = useState(false);

  if (!data) {
    return (
      <div className="tab-pane empty-state animate-fade-in">
        <div className="empty-state-card">
          <FileText size={42} className="empty-state-icon" />
          <h3 className="empty-state-title">No Evaluation Results Available</h3>
          <p className="empty-state-desc">
            Upload an interview video in the "Analyze Video" tab or click "Load Demo Data" to review a sample scorecard.
          </p>
          <button className="btn-primary" onClick={onReset}>
            Upload Video
          </button>
        </div>
      </div>
    );
  }

  const { video_analysis = {}, audio_analysis = {}, answer_analysis = {}, overall_score = 0, question, expected_keywords = [], timestamp } = data;

  const handleCopyTranscript = () => {
    if (answer_analysis.transcribed_text) {
      navigator.clipboard.writeText(answer_analysis.transcribed_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRecommendations = () => {
    const list = [];
    const eyeContact = Number(video_analysis.eye_contact_score) || 0;
    const posture = Number(video_analysis.posture_score) || 0;
    const wpm = Number(audio_analysis.words_per_minute) || 0;
    const silence = Number(audio_analysis.silence_ratio) || 0;
    const content = Number(answer_analysis.content_score) || 0;
    const completeness = Number(answer_analysis.completeness_score) || 0;
    const coherence = Number(answer_analysis.coherence_score) || 0;

    if (eyeContact >= 80) {
      list.push({ type: 'strength', category: 'Visual', text: `Strong eye contact focus (${eyeContact.toFixed(1)}%). Maintained confident alignment with the interviewer.` });
    } else if (eyeContact < 65) {
      list.push({ type: 'warning', category: 'Visual', text: `Camera gaze dropped to ${eyeContact.toFixed(1)}%. Maintain direct alignment with the lens to convey engagement.` });
    }

    if (posture >= 80) {
      list.push({ type: 'strength', category: 'Visual', text: `Stable posture equilibrium (${posture.toFixed(1)}%). Minimal fidgeting or distracting shifts.` });
    }

    if (wpm >= 130 && wpm <= 165) {
      list.push({ type: 'strength', category: 'Vocal', text: `Cadence is optimal at ${wpm.toFixed(0)} WPM. Speech rhythm conveys authority without feeling rushed.` });
    } else if (wpm > 165) {
      list.push({ type: 'warning', category: 'Vocal', text: `Speech velocity was fast (${wpm.toFixed(0)} WPM). In high-stakes interviews, deliberate pacing enhances retention.` });
    } else if (wpm > 0 && wpm < 115) {
      list.push({ type: 'warning', category: 'Vocal', text: `Speech velocity was slow (${wpm.toFixed(0)} WPM). Increase communicative energy to project enthusiasm.` });
    }

    if (silence > 25) {
      list.push({ type: 'tip', category: 'Vocal', text: `Extended pause ratio detected (${silence.toFixed(1)}%). Practice bridging phrases to minimize dead air.` });
    }

    if (content >= 80) {
      list.push({ type: 'strength', category: 'Content', text: `High topical relevance (${content.toFixed(1)}%). Directly answered technical objectives with domain rigor.` });
    } else if (content < 65) {
      list.push({ type: 'warning', category: 'Content', text: `Prompt relevance was moderate (${content.toFixed(1)}%). Anchor examples directly to the posed question scenario.` });
    }

    if (completeness < 70) {
      list.push({ type: 'tip', category: 'Content', text: `Completeness score was ${completeness.toFixed(1)}%. Structure explanations with the STAR method (Situation, Task, Action, Result).` });
    }

    if (coherence >= 80) {
      list.push({ type: 'strength', category: 'Content', text: `Strong logical progression and thematic continuity across sentences (${coherence.toFixed(1)}%).` });
    }

    if (list.length === 0) {
      list.push({ type: 'strength', category: 'General', text: 'Consistent, balanced performance demonstrated across visual, vocal, and content dimensions.' });
    }

    return list;
  };

  const recommendations = getRecommendations();
  const keywordsFound = answer_analysis.keywords_found || [];

  return (
    <div className="tab-pane animate-fade-in">
      {/* Executive Overview Header */}
      <div className="results-header-card">
        <div className="results-header-left">
          <ScoreGauge score={overall_score} size={135} label="Overall Score" />
          <div className="results-meta">
            <div className="badge-pill">
              <span className="badge-dot"></span>
              Interview Assessment Completed
            </div>
            <h2 className="results-title">Candidate Evaluation Scorecard</h2>
            {question && (
              <p className="results-question">
                <strong>Question:</strong> "{question}"
              </p>
            )}
            <div className="results-timestamp">
              <Clock size={13} />
              <span>Assessed: {timestamp ? new Date(timestamp).toLocaleString() : 'Recent'}</span>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button 
            className="btn-primary" 
            onClick={onExportPDF}
            disabled={isExportingPDF}
          >
            <Download size={16} />
            <span>{isExportingPDF ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
          <button 
            className="btn-secondary" 
            onClick={onExportJSON}
            disabled={isExportingJSON}
          >
            <FileText size={16} />
            <span>{isExportingJSON ? 'Exporting...' : 'Export JSON'}</span>
          </button>
          <button className="btn-outline" onClick={onReset}>
            <RotateCcw size={16} />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* 3 Pillars Grid */}
      <div className="pillars-breakdown-grid">
        {/* Pillar 1: Visual */}
        <div className="breakdown-card">
          <div className="breakdown-card-header">
            <div className="pillar-icon-box">
              <Eye size={18} className="text-blue" />
            </div>
            <div>
              <h3 className="breakdown-card-title">Visual & Presence</h3>
              <span className="breakdown-weight">25% of Total Score</span>
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Eye Contact Focus</span>
              <span className="metric-val">{(video_analysis.eye_contact_score || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-blue" 
                style={{ width: `${Math.min(100, video_analysis.eye_contact_score || 0)}%` }}
              />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Posture Stability</span>
              <span className="metric-val">{(video_analysis.posture_score || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-blue" 
                style={{ width: `${Math.min(100, video_analysis.posture_score || 0)}%` }}
              />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Non-Verbal Confidence</span>
              <span className="metric-val">{(video_analysis.confidence_level || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-emerald" 
                style={{ width: `${Math.min(100, video_analysis.confidence_level || 0)}%` }}
              />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Head Motion Index</span>
              <span className="metric-val">{(video_analysis.head_movement || 0).toFixed(1)} px/f</span>
            </div>
            <span className="metric-subtext">Low movement indicates focused stillness</span>
          </div>
        </div>

        {/* Pillar 2: Audio */}
        <div className="breakdown-card">
          <div className="breakdown-card-header">
            <div className="pillar-icon-box">
              <Mic size={18} className="text-blue" />
            </div>
            <div>
              <h3 className="breakdown-card-title">Vocal & Delivery</h3>
              <span className="breakdown-weight">25% of Total Score</span>
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Speaking Speed</span>
              <span className="metric-val">{(audio_analysis.words_per_minute || 0).toFixed(0)} WPM</span>
            </div>
            <div className="metric-subtext">Target: 130 – 160 WPM (Professional Cadence)</div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Articulation & Clarity</span>
              <span className="metric-val">{(audio_analysis.clarity_score || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-blue" 
                style={{ width: `${Math.min(100, audio_analysis.clarity_score || 0)}%` }}
              />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Pace Consistency</span>
              <span className="metric-val">{(audio_analysis.pace_consistency || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-blue" 
                style={{ width: `${Math.min(100, audio_analysis.pace_consistency || 0)}%` }}
              />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Silence & Pause Ratio</span>
              <span className="metric-val">{(audio_analysis.silence_ratio || 0).toFixed(1)}%</span>
            </div>
            <span className="metric-subtext">10–25% reflects natural breathing cadence</span>
          </div>
        </div>

        {/* Pillar 3: Content */}
        <div className="breakdown-card">
          <div className="breakdown-card-header">
            <div className="pillar-icon-box">
              <BrainCircuit size={18} className="text-blue" />
            </div>
            <div>
              <h3 className="breakdown-card-title">Substance & Answer</h3>
              <span className="breakdown-weight">50% of Total Score</span>
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Prompt Relevance</span>
              <span className="metric-val">{(answer_analysis.content_score || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-emerald" 
                style={{ width: `${Math.min(100, answer_analysis.content_score || 0)}%` }}
              />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Completeness & Depth</span>
              <span className="metric-val">{(answer_analysis.completeness_score || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-blue" 
                style={{ width: `${Math.min(100, answer_analysis.completeness_score || 0)}%` }}
              />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Logical Coherence</span>
              <span className="metric-val">{(answer_analysis.coherence_score || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-blue" 
                style={{ width: `${Math.min(100, answer_analysis.coherence_score || 0)}%` }}
              />
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-info">
              <span className="metric-label">Language & Syntax Quality</span>
              <span className="metric-val">{(answer_analysis.language_quality || 0).toFixed(1)}%</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill fill-blue" 
                style={{ width: `${Math.min(100, answer_analysis.language_quality || 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transcript & Keywords Section */}
      <div className="results-two-col">
        <div className="card-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Transcribed Response</h3>
              <p className="panel-subtitle">
                Automated Speech-to-Text • Word Count: {answer_analysis.word_count || 0}
              </p>
            </div>
            <button 
              className="btn-icon" 
              onClick={handleCopyTranscript}
              title="Copy transcript text"
            >
              {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
            </button>
          </div>
          <div className="transcript-box">
            {answer_analysis.transcribed_text ? (
              <p className="transcript-text">"{answer_analysis.transcribed_text}"</p>
            ) : (
              <div className="text-muted">
                {answer_analysis.note || "No intelligible speech detected during automated transcription."}
              </div>
            )}
          </div>

          {/* Keyword Matching */}
          <div className="keywords-section">
            <h4 className="keywords-title">Keyword Coverage</h4>
            <div className="keywords-list">
              {expected_keywords && expected_keywords.length > 0 ? (
                expected_keywords.map((kw, i) => {
                  const isFound = keywordsFound.some(
                    kf => kf.toLowerCase() === kw.toLowerCase()
                  );
                  return (
                    <span 
                      key={i} 
                      className={`keyword-chip ${isFound ? 'found' : 'missing'}`}
                    >
                      {isFound ? <CheckCircle2 size={12} /> : <Info size={12} />}
                      {kw}
                      <span className="chip-badge">{isFound ? 'Detected' : 'Missed'}</span>
                    </span>
                  );
                })
              ) : (
                <div className="text-muted">No target keywords configured for this session.</div>
              )}
            </div>
          </div>
        </div>

        {/* Actionable Feedback */}
        <div className="card-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Actionable Coaching Recommendations</h3>
              <p className="panel-subtitle">Prioritized diagnostic observations based on metric thresholds</p>
            </div>
          </div>
          <div className="recommendations-list">
            {recommendations.map((rec, i) => (
              <div key={i} className={`recommendation-item rec-${rec.type}`}>
                <div className="rec-header">
                  <span className={`rec-badge ${rec.type}`}>
                    {rec.type.toUpperCase()}
                  </span>
                  <span className="rec-category">{rec.category} Pillar</span>
                </div>
                <p className="rec-text">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
