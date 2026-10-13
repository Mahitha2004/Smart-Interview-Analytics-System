export const demoAnalysisData = {
  video_analysis: {
    eye_contact_score: 84.5,
    posture_score: 88.0,
    confidence_level: 85.5,
    head_movement: 11.2,
    frames_analyzed: 120,
    faces_detected: 120,
    eyes_detected: 108
  },
  audio_analysis: {
    speaking_speed: 2.37,
    words_per_minute: 142.0,
    pitch_variation: 22.4,
    silence_ratio: 16.5,
    clarity_score: 79.2,
    pace_consistency: 81.0,
    overall_audio_quality: 78.4,
    duration_seconds: 48.5,
    voiced_segment_count: 24
  },
  answer_analysis: {
    transcribed_text: "In my previous engineering role, our distributed microservices architecture experienced severe latency spikes during peak transaction windows. I led a cross-functional investigation analyzing database connection pools and identified unoptimized queries generating bottlenecks. We implemented asynchronous Redis caching and query batching, reducing p99 latency by 42% while preserving transactional consistency.",
    transcription_status: "success",
    content_score: 86.5,
    completeness_score: 82.0,
    coherence_score: 80.5,
    language_quality: 88.0,
    overall_answer_quality: 84.6,
    keywords_found: ["microservices", "latency", "architecture", "caching", "database", "redis"],
    word_count: 53
  },
  overall_score: 83.3,
  question: "Describe a complex technical challenge you diagnosed and resolved in production.",
  expected_keywords: ["microservices", "latency", "architecture", "caching", "database", "redis", "scalability"],
  timestamp: new Date().toISOString()
};
