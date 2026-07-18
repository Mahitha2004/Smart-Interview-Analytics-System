# Smart Interview Analytics System

A comprehensive web-based system for analyzing interview performance through video, audio, and content analysis. The system evaluates multiple dimensions of interview quality including eye contact, posture, voice characteristics, and answer quality.

## Features

### Video Analysis
- **Eye Contact Detection**: Analyzes direct gaze toward camera using facial detection
- **Posture Assessment**: Evaluates body alignment and positioning
- **Head Stability**: Monitors head movement and steadiness
- **Confidence Level**: Composite score based on visual cues

### Audio Analysis
- **Speaking Speed**: Calculates words per minute
- **Voice Clarity**: Measures speech distinctness
- **Pitch Variation**: Analyzes vocal expression
- **Pace Consistency**: Evaluates rhythm consistency
- **Silence Detection**: Identifies pauses and hesitations

### Content Analysis
- **Content Relevance**: Matches answer to question keywords
- **Completeness**: Evaluates answer thoroughness
- **Coherence**: Analyzes logical flow
- **Language Quality**: Assesses grammar and vocabulary
- **Transcription**: Converts speech to text

### Report Generation
- **PDF Reports**: Professional formatted reports with visualizations
- **JSON Reports**: Structured data for integration
- **Performance Metrics**: Comprehensive scoring across all dimensions
- **Recommendations**: Personalized improvement suggestions

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+ (for frontend)
- FFmpeg

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

4. Download NLTK data (required for answer evaluation):
```bash
python -c "import nltk; nltk.download('averaged_perceptron_tagger'); nltk.download('punkt'); nltk.download('stopwords')"
```

### Frontend Setup

The frontend is a standalone HTML/CSS/JavaScript application:

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Serve the files using a local server:
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js http-server
npx http-server public
```

The frontend will be available at `http://localhost:8000` (or `http://localhost:8080` with http-server).(or 'http://localhost:8000/public/index.html')

## Running the Application

### Start the Backend
```bash
cd backend
python run.py
```

The backend API will start at `http://localhost:5000`

### Start the Frontend
In a new terminal:
```bash
cd frontend
python -m http.server 8000
```

Or:
```bash
cd frontend
npx http-server public
```

Visit `http://localhost:8000` in your browser.

## API Endpoints

### Analyze Interview
**POST** `/api/analyze`
- Analyzes complete interview (video, audio, and answer)
- Input: video file, optional question, optional keywords
- Returns: Full analysis with all metrics

### Analyze Video Only
**POST** `/api/analyze/video`
- Analyzes only visual metrics
- Input: video file
- Returns: Video analysis metrics

### Analyze Audio Only
**POST** `/api/analyze/audio`
- Analyzes only audio metrics
- Input: audio file
- Returns: Audio analysis metrics

### Generate Report
**POST** `/api/generate-report?format=pdf|json`
- Generates report from analysis data
- Query parameter: `format` (pdf or json)
- Input: Analysis data JSON
- Returns: Report file

### Get Metrics Info
**GET** `/api/metrics`
- Returns available metrics and descriptions
- Returns: Metrics list

## Scoring Methodology

### Overall Score (0-100)
```
Overall Score = (Visual Confidence × 0.25) + (Audio Quality × 0.25) + (Answer Quality × 0.50)
```

### Visual Confidence (0-100)
```
Confidence = (Eye Contact Score × 0.6) + (Posture Score × 0.4)
```

### Audio Quality (0-100)
```
Audio Quality = (Clarity × 0.6) + (100 - Pitch Variation) × 0.4
```

### Answer Quality (0-100)
```
Answer Quality = (Content × 0.35) + (Completeness × 0.25) + (Coherence × 0.25) + (Language × 0.15)
```

## Performance Levels

| Score Range | Level |
|------------|-------|
| 85-100 | Outstanding |
| 75-84 | Strong |
| 65-74 | Competent |
| 50-64 | Developing |
| Below 50 | Needs Development |

## Technology Stack

### Backend
- **Flask**: Web framework
- **OpenCV & MediaPipe**: Video analysis
- **Librosa**: Audio processing
- **SpeechRecognition**: Speech-to-text
- **NLTK & Scikit-learn**: NLP and text analysis
- **ReportLab**: PDF generation

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling and animations
- **Vanilla JavaScript**: Interactivity

## Project Structure

```
interview-analytics/
├── backend/
│   ├── app/
│   │   ├── analysis/
│   │   │   ├── video_analyzer.py
│   │   │   ├── audio_analyzer.py
│   │   │   └── answer_evaluator.py
│   │   ├── reports/
│   │   │   └── report_generator.py
│   │   ├── utils/
│   │   │   └── file_handler.py
│   │   ├── routes.py
│   │   └── __init__.py
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
├── frontend/
│   └── public/
│       ├── index.html
│       ├── style.css
│       └── script.js
└── README.md
```

## Usage Example

1. **Upload Interview Video**: Select a video file containing the interview
2. **Provide Context** (Optional):
   - Interview question
   - Expected keywords to look for in the answer
3. **Run Analysis**: System analyzes video, extracts audio, transcribes speech, and evaluates content
4. **Review Results**: View comprehensive metrics dashboard
5. **Download Report**: Generate and download PDF or JSON report

## Troubleshooting

### Audio Issues
- Ensure FFmpeg is installed and in PATH
- Video must contain audio track
- Try MP3 or WAV format for standalone audio analysis

### Video Processing
- Supported formats: MP4, AVI, MOV, MKV, WebM
- Recommended resolution: 720p or higher
- File size limit: 500MB

### API Connection Issues
- Verify backend is running on port 5000
- Check frontend is using correct API URL
- Enable CORS (already configured)

## Future Enhancements

- [ ] Real-time webcam analysis
- [ ] Multiple language support
- [ ] Interviewer comparison benchmarks
- [ ] Mobile app
- [ ] Advanced emotion detection
- [ ] Behavioral pattern analysis
- [ ] Database for interview tracking
- [ ] Team interview analytics

## License

This project is provided as-is for educational and professional use.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
