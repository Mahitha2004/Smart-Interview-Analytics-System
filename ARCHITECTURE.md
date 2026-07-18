# Architecture & Development Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Smart Interview Analytics System          │
└─────────────────────────────────────────────────────────────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
        ┌────▼─────┐         ┌────▼─────┐         ┌────▼─────┐
        │ Frontend  │         │ Backend   │         │ Database  │
        │ (HTML/JS) │         │ (Flask)   │         │ (Future)  │
        └────┬─────┘         └────┬─────┘         └──────────┘
             │                    │
             └────────────────────┼────────────────────┐
                                  │                    │
                           ┌──────▼───────┐     ┌─────▼─────┐
                           │ File Handler  │     │ Analysis  │
                           │ (Upload/Serve)│     │ Modules   │
                           └──────┬───────┘     └─────┬─────┘
                                  │                   │
                          └────────┼───────────┬──────┴───────┬──────────┐
                                  │           │              │          │
                            Video Extract  Video Analysis  Audio      Answer
                            Audio (FFmpeg)  (OpenCV,MP)   Analysis   Evaluator
                                           (MediaPipe)    (Librosa)  (NLP)
```

## Component Details

### Frontend (HTML/CSS/JavaScript)
- **Location**: `frontend/public/`
- **Files**:
  - `index.html`: Main interface
  - `style.css`: Styling and animations
  - `script.js`: Client logic and API integration
- **Responsibilities**:
  - Video file upload
  - Form input handling
  - API communication
  - Results visualization
  - Report generation

### Backend (Flask)
- **Location**: `backend/`
- **Entry Point**: `run.py`
- **Main App**: `app/__init__.py`

#### API Routes (`app/routes.py`)
```
POST /analyze              → Full analysis
POST /analyze/video        → Video analysis only
POST /analyze/audio        → Audio analysis only
POST /generate-report      → Report generation
GET  /metrics              → Metrics info
GET  /health               → Health check
```

#### Analysis Modules (`app/analysis/`)

1. **video_analyzer.py**
   - Class: `VideoAnalyzer`
   - Uses: OpenCV, MediaPipe
   - Analyses: Eye contact, posture, head movement, confidence
   - Process:
     1. Load video with OpenCV
     2. Process each frame
     3. Detect faces and pose landmarks
     4. Extract eye contact and posture metrics
     5. Calculate head movement
     6. Return composite scores

2. **audio_analyzer.py**
   - Class: `AudioAnalyzer`
   - Uses: Librosa, SciPy
   - Analyses: Speaking speed, pitch, clarity, pace
   - Process:
     1. Load audio with librosa
     2. Extract speech energy envelope
     3. Detect onsets (speech starts)
     4. Calculate pitch variation
     5. Measure silence ratio
     6. Analyze clarity from zero-crossing rate
     7. Return metrics

3. **answer_evaluator.py**
   - Class: `AnswerEvaluator`
   - Uses: SpeechRecognition, NLTK, scikit-learn
   - Analyses: Content, completeness, coherence, language
   - Process:
     1. Transcribe audio to text
     2. Analyze content relevance to question
     3. Check completeness (word count, variety)
     4. Measure coherence between sentences
     5. Evaluate language quality
     6. Return scores

#### Report Generation (`app/reports/report_generator.py`)
- Class: `ReportGenerator`
- Uses: ReportLab
- Formats:
  - PDF: Professional formatted report
  - JSON: Structured data export
- Features:
  - Executive summary
  - Metrics table
  - Detailed analysis
  - Recommendations

#### Utilities (`app/utils/`)

1. **file_handler.py**
   - Class: `FileHandler`
   - Handles: File upload, validation, storage, cleanup
   - Methods:
     - `save_video()`: Save and validate video
     - `save_audio()`: Save and validate audio
     - `extract_audio_from_video()`: Convert video to audio
     - `cleanup_file()`: Remove temporary files

### Configuration (`config.py`)
- Flask settings
- File upload limits
- Folder paths for uploads and reports

## Data Flow

### Complete Analysis Flow

```
1. User uploads video
   ↓
2. FileHandler saves video file
   ↓
3. Backend extracts audio from video
   ├→ VideoAnalyzer processes video
   │  ├→ Detect faces (mediapipe)
   │  ├→ Detect pose (mediapipe)
   │  ├→ Calculate metrics
   │  └→ Return video_analysis JSON
   │
   ├→ AudioAnalyzer processes audio
   │  ├→ Load audio (librosa)
   │  ├→ Extract features
   │  ├→ Calculate speech metrics
   │  └→ Return audio_analysis JSON
   │
   └→ AnswerEvaluator processes audio
      ├→ Transcribe (SpeechRecognition)
      ├→ Analyze content (NLTK)
      ├→ Calculate scores
      └→ Return answer_analysis JSON
   ↓
4. Combine all analyses
   ↓
5. Calculate overall score
   ↓
6. Return results to frontend
   ↓
7. Frontend displays metrics
   ↓
8. User downloads report (PDF/JSON)
```

## Scoring Algorithm

### Overall Score Calculation
```python
overall_score = (
    video_confidence * 0.25 +      # Visual presence (25%)
    audio_quality * 0.25 +         # Voice quality (25%)
    answer_quality * 0.50          # Content quality (50%)
)
```

### Video Confidence
```python
confidence = eye_contact * 0.6 + posture * 0.4
```

### Audio Quality
```python
audio_quality = clarity * 0.6 + (100 - pitch_variation) * 0.4
```

### Answer Quality
```python
answer_quality = (
    content * 0.35 +
    completeness * 0.25 +
    coherence * 0.25 +
    language * 0.15
)
```

## Technology Choices and Rationale

### Python Flask
- Lightweight and flexible
- Excellent ML library ecosystem
- Easy to extend and modify
- Good performance for MVP

### OpenCV & MediaPipe
- OpenCV: Industry standard for video processing
- MediaPipe: State-of-the-art pose and face detection
- Better than manual feature extraction

### Librosa
- Specialized for audio analysis
- Good pitch and onset detection
- Efficient processing

### NLTK & scikit-learn
- NLTK: Comprehensive NLP toolkit
- scikit-learn: ML algorithms
- Good for text analysis

### ReportLab
- Pure Python PDF generation
- No external dependencies
- Full control over layout

### HTML/CSS/JavaScript Frontend
- Simple and effective for MVP
- No complex build process
- Can easily upgrade to React later

## Extending the System

### Adding New Metrics

1. **Create new analyzer class**:
```python
# app/analysis/new_analyzer.py
class NewAnalyzer:
    def analyze(self, file_path):
        # Implementation
        return {'metric_name': value}
```

2. **Integrate into routes**:
```python
# app/routes.py
from app.analysis.new_analyzer import NewAnalyzer
new_analyzer = NewAnalyzer()

@api_bp.route('/analyze/new', methods=['POST'])
def analyze_new():
    # Implementation using new_analyzer
```

3. **Update frontend** to display new metrics

### Adding Database Support

```python
# Install Flask-SQLAlchemy
pip install flask-sqlalchemy

# In app/__init__.py
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

# Create models
class Interview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime)
    overall_score = db.Column(db.Float)
    # ... other fields
```

### Integration Points

- **Webhooks**: Add callbacks for completed analyses
- **Queue System**: Implement Celery for async processing
- **Caching**: Add Redis for result caching
- **Streaming**: WebSocket for real-time progress

## Performance Optimization

### Current Bottlenecks
1. Video processing (frame-by-frame analysis)
2. Speech recognition API calls
3. Large file transfers

### Optimization Strategies
```python
# 1. Frame sampling
def analyze_video_optimized(self, video_path, sample_rate=5):
    # Process every Nth frame instead of all frames
    
# 2. Async processing
@app.route('/analyze/async', methods=['POST'])
def analyze_async():
    # Queue job with Celery
    # Return job_id for polling
    
# 3. Caching
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@cache.cached(timeout=3600)
def get_metrics_info():
    # Cache frequently accessed data
```

## Testing Strategy

### Unit Tests
```bash
# Test analyzers
python -m pytest backend/tests/test_video_analyzer.py
python -m pytest backend/tests/test_audio_analyzer.py
```

### Integration Tests
```bash
# Test full API flow
python -m pytest backend/tests/test_api.py
```

### Load Testing
```bash
# Test under stress
locust -f locustfile.py
```

## Deployment

### Docker
```dockerfile
FROM python:3.9
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend .
CMD ["python", "run.py"]
```

### Environment Variables
```bash
FLASK_ENV=production
SECRET_KEY=your-secret-key
MAX_FILE_SIZE=500000000
```

## Monitoring and Logging

### Setup Logging
```python
import logging
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Key Metrics to Monitor
- API response time
- Analysis success rate
- Average analysis duration
- File upload errors
- Storage usage

## Future Architecture

### Proposed Improvements
1. **Microservices**: Separate analyzers into independent services
2. **Message Queue**: Use RabbitMQ/Redis for job management
3. **Machine Learning**: Train custom models for interview prediction
4. **Real-time Processing**: WebSocket streaming analysis
5. **Mobile App**: React Native client
6. **Analytics Dashboard**: Historical performance tracking

## Development Workflow

1. **Setup environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run backend**
   ```bash
   python backend/run.py
   ```

3. **Run frontend**
   ```bash
   cd frontend
   python -m http.server 8000
   ```

4. **Make changes** and test

5. **Version control**
   ```bash
   git add .
   git commit -m "description"
   git push
   ```

## Common Issues and Solutions

### MediaPipe Model Loading
**Problem**: First run slow while downloading models
**Solution**: Models cached after first download

### Audio Extraction Fails
**Problem**: FFmpeg not found
**Solution**: Install FFmpeg, add to PATH

### High CPU Usage
**Problem**: Frame processing slow
**Solution**: Reduce analysis resolution or sample rate

### Memory Issues
**Problem**: Large video processing
**Solution**: Implement streaming processing

## Contributing Guidelines

1. Follow PEP 8 style guide
2. Add docstrings to functions
3. Include type hints
4. Write tests for new features
5. Update documentation
6. Create pull requests with clear descriptions

Last Updated: January 2024
