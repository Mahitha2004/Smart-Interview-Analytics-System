# Quick Start Guide

## Installation in 3 Steps

### Step 1: Install Dependencies

**Windows:**
```batch
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -c "import nltk; nltk.download('averaged_perceptron_tagger'); nltk.download('punkt'); nltk.download('stopwords')"
```

**macOS/Linux:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -c "import nltk; nltk.download('averaged_perceptron_tagger'); nltk.download('punkt'); nltk.download('stopwords')"
```

### Step 2: Start Backend

**Windows:**
```batch
cd backend
venv\Scripts\activate
python run.py
```

**macOS/Linux:**
```bash
cd backend
source venv/bin/activate
python run.py
```

Backend runs at: `http://localhost:5000`

### Step 3: Start Frontend

**Open a new terminal:**

**Windows:**
```batch
cd frontend
python -m http.server 8000
```

**macOS/Linux:**
```bash
cd frontend
python -m http.server 8000
```

Frontend runs at: `http://localhost:8000`

---

## Using the Application

1. **Open Browser**: Navigate to `http://localhost:8000`

2. **Upload Video**: 
   - Click "Upload Interview Video" or select a video file
   - Choose an MP4, AVI, MOV, or WebM file

3. **Add Context** (Optional):
   - Enter the interview question
   - Enter expected keywords (comma-separated)

4. **Start Analysis**: Click "Analyze Interview"
   - Wait for processing (typically 1-5 minutes depending on video length)

5. **Review Results**: 
   - See detailed metrics for visual, audio, and content analysis
   - Review transcribed answer
   - Read personalized recommendations

6. **Download Reports**:
   - PDF: Professional formatted report
   - JSON: Raw data for integration

---

## Troubleshooting

### Issue: Backend won't start
```
ERROR: Could not find platform independent libraries
```
**Solution**: Ensure Python 3.8+ is installed and virtual environment is activated

### Issue: Frontend shows "Cannot connect to API"
**Solution**: 
- Check backend is running on port 5000
- Verify firewall allows localhost connection
- Check browser console for CORS errors

### Issue: Audio extraction fails
```
Error extracting audio
```
**Solution**: Ensure FFmpeg is installed and in system PATH
- Windows: Download from ffmpeg.org
- macOS: `brew install ffmpeg`
- Linux: `sudo apt-get install ffmpeg`

### Issue: Speech recognition returns empty
**Solution**:
- Check video has clear audio
- Try adjusting audio volume
- Ensure speech is in English

### Issue: Analysis times out
**Solution**:
- Use shorter videos for testing
- Ensure system has sufficient RAM
- Close other applications

---

## Example Workflow

### Test with Sample Video

1. Create a test interview video:
   - Record yourself answering an interview question
   - Ensure clear audio
   - 1-2 minutes duration

2. Upload and analyze:
   ```
   Question: "Tell me about a time you led a team"
   Keywords: leadership, team, success
   ```

3. Expected results:
   - Overall score: 60-80 (first attempt usually)
   - Eye contact: 50-70 (if looking at camera)
   - Speaking speed: 100-180 wpm
   - Answer quality: Depends on content

4. Review recommendations and iterate

---

## Common Customizations

### Change API Port
Edit `backend/config.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change 5000 to 5001
```

### Change Frontend Port
```bash
cd frontend
python -m http.server 8080  # Use 8080 instead of 8000
```

Update `frontend/public/script.js`:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';  # Match backend port
```

### Adjust File Size Limit
Edit `backend/config.py`:
```python
MAX_CONTENT_LENGTH = 1024 * 1024 * 1024  # 1GB instead of 500MB
```

### Enable Debug Logging
Edit `backend/run.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5000, log_level='DEBUG')
```

---

## Performance Tips

- **For large files**: Increase timeout in frontend `script.js`
- **For faster analysis**: Use shorter video clips during development
- **For better accuracy**: Ensure good lighting and clear audio
- **For batch processing**: Implement queue system (future enhancement)

---

## Next Steps

1. **Customize Scoring**: Edit analysis modules in `backend/app/analysis/`
2. **Add Database**: Implement persistence in `backend/`
3. **Deploy**: Use Docker for containerization
4. **Mobile**: Build React Native frontend
5. **Real-time**: Implement WebSocket for live analysis

---

## Support Resources

- **API Docs**: See `API_DOCUMENTATION.md`
- **Code Comments**: Well-commented source code
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check `README.md`

---

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `pip install -r requirements.txt` |
| Start backend | `python run.py` |
| Start frontend | `python -m http.server 8000` |
| Download NLTK data | `python -c "import nltk; nltk.download(...)"` |
| Test API | `curl http://localhost:5000/api/health` |
| Build frontend | Use as-is (no build step) |
| Reset data | Delete `uploads/` and `reports/` folders |

---

Enjoy analyzing interviews!
