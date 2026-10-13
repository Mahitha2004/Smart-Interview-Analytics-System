import React from 'react';

export function ScoreGauge({ score, size = 130, strokeWidth = 9, label = "Overall Score" }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#3b82f6'; // default blue
  let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  let badgeText = 'Average';

  if (normalizedScore >= 80) {
    strokeColor = '#10b981'; // emerald
    badgeText = 'Exceptional';
  } else if (normalizedScore >= 70) {
    strokeColor = '#3b82f6'; // blue
    badgeText = 'Proficient';
  } else if (normalizedScore >= 55) {
    strokeColor = '#f59e0b'; // amber
    badgeText = 'Developing';
  } else {
    strokeColor = '#ef4444'; // rose
    badgeText = 'Needs Work';
  }

  return (
    <div className="score-gauge-container">
      <div className="gauge-svg-wrapper" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="gauge-svg">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="gauge-track"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="gauge-indicator"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={strokeColor}
            strokeLinecap="round"
          />
        </svg>
        <div className="gauge-center-content">
          <span className="gauge-score-value">{normalizedScore.toFixed(0)}</span>
          <span className="gauge-score-denom">/ 100</span>
        </div>
      </div>
      <div className="gauge-meta">
        <span className="gauge-label">{label}</span>
        <span className="gauge-badge" style={{ color: strokeColor }}>
          {badgeText}
        </span>
      </div>
    </div>
  );
}
