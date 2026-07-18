# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required. In production, implement JWT or API key authentication.

## Response Format
All responses are in JSON format.

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Description of the error"
}
```

## Endpoints

### 1. Health Check
**GET** `/health`

Checks if the API is running and healthy.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Full Interview Analysis
**POST** `/analyze`

Analyzes a complete interview video including visual, audio, and answer evaluation.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `video` (file, required): Interview video file
  - `question` (string, optional): Interview question
  - `keywords` (array, optional): Expected keywords in the answer

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "video=@interview.mp4" \
  -F "question=Tell us about your leadership experience" \
  -F "keywords=team" \
  -F "keywords=project" \
  -F "keywords=success"
```

**Response:**
```json
{
  "video_analysis": {
    "eye_contact_score": 75.5,
    "posture_score": 82.3,
    "head_movement": 88.1,
    "confidence_level": 79.2,
    "frames_analyzed": 1250
  },
  "audio_analysis": {
    "speaking_speed": 145.3,
    "words_per_minute": 145,
    "pitch_variation": 12.5,
    "silence_ratio": 18.3,
    "clarity_score": 78.9,
    "pace_consistency": 81.2,
    "overall_audio_quality": 80.1
  },
  "answer_analysis": {
    "transcribed_text": "I have led multiple teams...",
    "content_score": 85.2,
    "completeness_score": 78.5,
    "coherence_score": 81.3,
    "language_quality": 79.8,
    "overall_answer_quality": 81.2,
    "keywords_found": ["team", "project"],
    "word_count": 156
  },
  "overall_score": 80.5,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. Video Analysis Only
**POST** `/analyze/video`

Analyzes only the visual aspects of a video.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `video` (file, required): Video file

**Response:**
```json
{
  "eye_contact_score": 75.5,
  "posture_score": 82.3,
  "head_movement": 88.1,
  "confidence_level": 79.2,
  "frames_analyzed": 1250
}
```

---

### 4. Audio Analysis Only
**POST** `/analyze/audio`

Analyzes audio metrics from an audio file or extracted from video.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `audio` (file, required): Audio file (MP3, WAV, OGG, M4A, AAC)

**Response:**
```json
{
  "speaking_speed": 145.3,
  "words_per_minute": 145,
  "pitch_variation": 12.5,
  "silence_ratio": 18.3,
  "clarity_score": 78.9,
  "pace_consistency": 81.2,
  "overall_audio_quality": 80.1
}
```

---

### 5. Generate Report
**POST** `/generate-report?format=pdf|json`

Generates a report from analysis data.

**Request:**
- Method: POST
- Content-Type: application/json
- Query Parameters:
  - `format` (optional): "pdf" or "json" (default: "pdf")
- Body: Complete analysis data from `/analyze` endpoint

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/generate-report?format=pdf" \
  -H "Content-Type: application/json" \
  -d @analysis_data.json \
  -o interview_report.pdf
```

**Response:**
Binary file (PDF or JSON) as attachment

---

### 6. Get Metrics Information
**GET** `/metrics`

Returns information about available metrics.

**Response:**
```json
{
  "video_metrics": [
    "eye_contact_score",
    "posture_score",
    "head_movement",
    "confidence_level"
  ],
  "audio_metrics": [
    "speaking_speed",
    "words_per_minute",
    "pitch_variation",
    "silence_ratio",
    "clarity_score",
    "pace_consistency"
  ],
  "answer_metrics": [
    "content_score",
    "completeness_score",
    "coherence_score",
    "language_quality",
    "overall_answer_quality"
  ]
}
```

---

## Metric Explanations

### Video Metrics

**Eye Contact Score (0-100)**
- Measures how directly the person looks at the camera
- 80+: Excellent engagement
- 60-79: Good eye contact
- Below 60: Poor eye contact

**Posture Score (0-100)**
- Evaluates body alignment and positioning
- Considers shoulder and hip alignment, head position
- 80+: Excellent posture
- 60-79: Good posture
- Below 60: Poor posture

**Head Movement (0-100)**
- Measures stability (lower movement is better)
- 80+: Very stable
- 60-79: Moderate stability
- Below 60: Excessive movement

**Confidence Level (0-100)**
- Composite score of eye contact (60%) and posture (40%)
- Overall visual confidence indicator

### Audio Metrics

**Speaking Speed (words per minute)**
- Optimal: 130-160 wpm
- Below 100: Too slow
- 100-130: Slightly slow
- 160-200: Slightly fast
- Above 200: Too fast

**Pitch Variation (%)**
- Measures vocal expression
- 5-20%: Good variation
- Below 5%: Monotone
- Above 20%: Excessive variation

**Clarity Score (0-100)**
- Evaluates speech distinctness and audio quality
- 80+: Very clear speech
- 60-79: Good clarity
- Below 60: Unclear speech

**Pace Consistency (0-100)**
- Measures consistency of speaking rhythm
- 80+: Very consistent
- 60-79: Fairly consistent
- Below 60: Inconsistent pace

**Silence Ratio (%)**
- Percentage of time with pauses/silence
- Below 15%: Good (natural flow)
- 15-30%: Acceptable
- Above 30%: Too many pauses

### Answer Metrics

**Content Score (0-100)**
- Relevance of answer to the question
- Matching expected keywords
- 80+: Highly relevant
- 60-79: Relevant
- Below 60: Off-topic or vague

**Completeness Score (0-100)**
- Thoroughness and depth of answer
- Based on length, sentence count, vocabulary richness
- 80+: Comprehensive
- 60-79: Adequate
- Below 60: Lacking detail

**Coherence Score (0-100)**
- Logical flow and connection of ideas
- Semantic similarity between sentences
- 80+: Well-organized
- 60-79: Fairly coherent
- Below 60: Disorganized

**Language Quality (0-100)**
- Grammar, punctuation, and vocabulary
- 80+: Excellent language
- 60-79: Good language
- Below 60: Poor grammar/vocabulary

**Overall Answer Quality (0-100)**
- Weighted average: Content (35%) + Completeness (25%) + Coherence (25%) + Language (15%)

---

## Error Handling

### Common Error Codes

**400 Bad Request**
- No file provided
- Invalid file format
- Missing required parameters

**415 Unsupported Media Type**
- File format not supported

**413 Payload Too Large**
- File exceeds size limit (500MB)

**500 Internal Server Error**
- Analysis failed
- Audio extraction failed
- Speech recognition error

### Error Response Example
```json
{
  "error": "Invalid video format. Allowed: mp4, avi, mov, mkv, webm"
}
```

---

## Rate Limiting

Currently not implemented. For production, implement:
- X requests per minute per IP
- Queue management for large files
- Timeout handling for long analyses

---

## File Size Limits

- Maximum file size: 500MB
- Video formats: MP4, AVI, MOV, MKV, WebM
- Audio formats: MP3, WAV, OGG, M4A, AAC

---

## Performance Considerations

- Video analysis duration depends on video length
- Longer videos may take several minutes
- Large files (>100MB) may experience timeout
- Consider implementing async processing for production

---

## Version History

### v1.0.0
- Initial release
- Complete video, audio, and content analysis
- PDF and JSON report generation
- Web-based interface
