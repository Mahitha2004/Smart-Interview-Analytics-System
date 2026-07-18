let currentView = 'dashboard';
let lastAnalysisData = null;  
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    initUploadForm();
    initFileDrop();
    checkApiHealth();
});
function initNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.view);
        });
    });
}
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view' + capitalize(viewId));
    if (target) {
        target.classList.add('active');
        target.style.animation = 'none';
        void target.offsetWidth;
        target.style.animation = '';
    }
    document.querySelectorAll('.nav-item[data-view]').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (activeNav) activeNav.classList.add('active');
    const titles = { dashboard: 'Dashboard', upload: 'New Analysis', results: 'Analysis Results' };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[viewId] || 'Dashboard';
    currentView = viewId;
    closeSidebar();
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function initSidebar() {
    const toggle = document.getElementById('menuToggle');
    const overlay = document.getElementById('sidebarOverlay');
    if (toggle) {
        toggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            overlay.classList.toggle('active');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
}
function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
}
async function checkApiHealth() {
    const dot = document.getElementById('apiDot');
    const btn = document.getElementById('headerApiBtn');
    const navBtn = document.getElementById('navApiStatus');
    try {
        const res = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            if (dot) dot.style.background = '#34d399';
            if (btn) btn.title = 'API Connected';
            if (navBtn) {
                navBtn.innerHTML = '<span class="nav-icon">🟢</span> API Connected';
            }
        } else {
            throw new Error('Not OK');
        }
    } catch {
        if (dot) dot.style.background = '#fb7185';
        if (btn) btn.title = 'API Offline';
        if (navBtn) {
            navBtn.innerHTML = '<span class="nav-icon">🔴</span> API Offline';
        }
    }
}
function initFileDrop() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('videoInput');
    if (!dropArea || !fileInput) return;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        dropArea.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(evt => {
        dropArea.addEventListener(evt, () => dropArea.classList.add('dragover'), false);
    });
    ['dragleave', 'drop'].forEach(evt => {
        dropArea.addEventListener(evt, () => dropArea.classList.remove('dragover'), false);
    });
    dropArea.addEventListener('drop', e => {
        fileInput.files = e.dataTransfer.files;
        showFileName(fileInput.files);
    });
    fileInput.addEventListener('change', function () {
        showFileName(this.files);
    });
}
function showFileName(files) {
    const dropArea = document.getElementById('dropArea');
    const nameDisplay = document.getElementById('fileNameDisplay');
    const dropTitle = dropArea?.querySelector('.drop-title');
    if (files && files.length > 0) {
        dropArea.classList.add('has-file');
        if (nameDisplay) nameDisplay.textContent = '✓ ' + files[0].name;
        if (dropTitle) dropTitle.textContent = 'File Selected';
    } else {
        dropArea.classList.remove('has-file');
        if (dropTitle) dropTitle.textContent = 'Drop video file here';
    }
}
function initUploadForm() {
    const form = document.getElementById('uploadForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('videoInput');
        if (!fileInput.files.length) {
            showToast('Please select a video file first', 'error');
            return;
        }
        showLoading(true);
        const data = await analyzeVideo(fileInput.files[0]);
        showLoading(false);
        if (data) {
            populateResults(data);
            navigateTo('results');
            showToast('Analysis complete!', 'success');
        }
    });
}
async function analyzeVideo(videoFile) {
    const question = document.getElementById('questionInput')?.value || '';
    const keywordsRaw = document.getElementById('keywordsInput')?.value || '';
    const formData = new FormData();
    formData.append('video', videoFile);
    if (question) formData.append('question', question);
    if (keywordsRaw) {
        keywordsRaw.split(',').map(k => k.trim()).filter(Boolean).forEach(kw => {
            formData.append('keywords', kw);
        });
    }
    const inputs = {
        question: question,
        expected_keywords: keywordsRaw.split(',').map(k => k.trim()).filter(Boolean)
    };
    const statuses = [
        { text: 'Analyzing Visual Cadence', sub: 'Processing video frames with MediaPipe...' },
        { text: 'Extracting Vocal Features', sub: 'Running audio analysis with Librosa...' },
        { text: 'Evaluating Semantic Quality', sub: 'Transcribing and analyzing content...' },
        { text: 'Synthesizing Intelligence', sub: 'Computing composite scores...' }
    ];
    const statusEl = document.getElementById('loadingStatus');
    const subEl = document.getElementById('loadingSubstatus');
    const progressBar = document.getElementById('loadingProgress');
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += 1.5;
            if (progressBar) progressBar.style.width = progress + '%';
            const idx = Math.floor((progress / 90) * statuses.length);
            if (statuses[idx]) {
                if (statusEl) statusEl.textContent = statuses[idx].text;
                if (subEl) subEl.textContent = statuses[idx].sub;
            }
        }
    }, 800);
    try {
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            body: formData
        });
        clearInterval(progressInterval);
        if (progressBar) progressBar.style.width = '100%';
        if (statusEl) statusEl.textContent = 'Analysis Complete';
        if (subEl) subEl.textContent = 'Rendering dashboard...';
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Server error');
        }
        const rawData = await response.json();
        if (!rawData.question && inputs.question) {
            rawData.question = inputs.question;
        }
        if (!rawData.expected_keywords && inputs.expected_keywords.length > 0) {
            rawData.expected_keywords = inputs.expected_keywords;
        }
        lastAnalysisData = rawData;
        return processRawData(rawData);
    } catch (error) {
        clearInterval(progressInterval);
        showToast('Analysis failed: ' + error.message, 'error');
        return null;
    }
}
function processRawData(raw) {
    const overall = Math.round(raw.overall_score || 0);
    let label = 'developing';
    let labelText = 'Needs Development';
    if (overall >= 85) { label = 'outstanding'; labelText = 'Outstanding Performance'; }
    else if (overall >= 75) { label = 'strong'; labelText = 'Strong Delivery'; }
    else if (overall >= 65) { label = 'competent'; labelText = 'Competent Execution'; }
    let transcript = raw.answer_analysis?.transcribed_text || 'No transcription available.';
    if (raw.answer_analysis?.transcription_status === 'failed') {
        transcript = '⚠ Transcription failed — content scores could not be computed. Ensure the recording has clear, audible speech.';
    }
    const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
    const visualScore = Math.round(raw.video_analysis?.confidence_level || 0);
    const vocalScore = Math.round(raw.audio_analysis?.overall_audio_quality || 0);
    const contentScore = Math.round(raw.answer_analysis?.overall_answer_quality || 0);
    const recs = [];
    if ((raw.video_analysis?.eye_contact_score || 0) < 70) {
        recs.push({ icon: '👁️', text: 'Increase direct camera engagement to project more authority and trust.' });
    }
    if ((raw.video_analysis?.posture_score || 0) < 70) {
        recs.push({ icon: '🧍', text: 'Improve your posture alignment — sit upright with shoulders back for a confident presence.' });
    }
    if ((raw.audio_analysis?.clarity_score || 0) < 70) {
        recs.push({ icon: '🎙️', text: 'Enhance vocal clarity by enunciating more deliberately and controlling your breathing.' });
    }
    const wpm = raw.audio_analysis?.words_per_minute || 0;
    if (wpm > 160) {
        recs.push({ icon: '⏱️', text: 'Your pace is elevated. Introduce strategic pauses to add gravity and emphasis.' });
    } else if (wpm < 100 && wpm > 0) {
        recs.push({ icon: '⏱️', text: 'Your pace is subdued. Elevate tempo slightly to maintain listener engagement.' });
    }
    if ((raw.answer_analysis?.content_score || 0) < 70) {
        recs.push({ icon: '📝', text: 'Align your answer content more directly with the core question being asked.' });
    }
    if ((raw.answer_analysis?.coherence_score || 0) < 70) {
        recs.push({ icon: '🔗', text: 'Improve logical flow by using transition phrases between your key points.' });
    }
    if (recs.length === 0) {
        recs.push({ icon: '🏆', text: 'Exceptional execution across all dimensions. Maintain this performance baseline.' });
        recs.push({ icon: '✨', text: 'Your visual, vocal, and semantic metrics are all in the optimal range.' });
    }
    return {
        overall, label, labelText,
        visualScore, vocalScore, contentScore,
        eyeContact: Math.round(raw.video_analysis?.eye_contact_score || 0),
        posture: Math.round(raw.video_analysis?.posture_score || 0),
        confidence: Math.round(raw.video_analysis?.confidence_level || 0),
        clarity: Math.round(raw.audio_analysis?.clarity_score || 0),
        speed: Math.round(wpm),
        silence: Math.round(raw.audio_analysis?.silence_ratio || 0),
        content: Math.round(raw.answer_analysis?.content_score || 0),
        coherence: Math.round(raw.answer_analysis?.coherence_score || 0),
        wordCount,
        transcript,
        recommendations: recs
    };
}
function populateResults(data) {
    animateScoreRing('scoreRing', data.overall, 90, 565.48);
    animateNumber('overallScore', 0, data.overall, 2000);
    const badge = document.getElementById('scoreBadge');
    if (badge) {
        badge.textContent = data.labelText;
        badge.className = 'score-label-badge ' + data.label;
    }
    animateScoreRing('ringVisual', data.visualScore, 30, 188.5);
    animateScoreRing('ringVocal', data.vocalScore, 30, 188.5);
    animateScoreRing('ringContent', data.contentScore, 30, 188.5);
    animateNumber('visualRingVal', 0, data.visualScore, 1500);
    animateNumber('vocalRingVal', 0, data.vocalScore, 1500);
    animateNumber('contentRingVal', 0, data.contentScore, 1500);
    setMetric('metricEyeContact', 'barEyeContact', data.eyeContact, 100);
    setMetric('metricPosture', 'barPosture', data.posture, 100);
    setMetric('metricConfidence', 'barConfidence', data.confidence, 100);
    setMetric('metricClarity', 'barClarity', data.clarity, 100);
    setMetric('metricSpeed', 'barSpeed', data.speed, 200); 
    setMetric('metricSilence', 'barSilence', data.silence, 100);
    setMetric('metricContent', 'barContent', data.content, 100);
    setMetric('metricCoherence', 'barCoherence', data.coherence, 100);
    setMetric('metricWordCount', 'barWordCount', data.wordCount, 500); 
    const transcriptEl = document.getElementById('transcriptText');
    if (transcriptEl) transcriptEl.textContent = data.transcript;
    const recList = document.getElementById('recommendationsList');
    if (recList) {
        recList.innerHTML = '';
        data.recommendations.forEach((rec, i) => {
            const li = document.createElement('li');
            li.className = 'recommendation-item';
            li.style.animationDelay = `${i * 0.1}s`;
            li.innerHTML = `<span class="rec-icon">${rec.icon}</span> ${rec.text}`;
            recList.appendChild(li);
        });
    }
}
function animateScoreRing(ringId, value, radius, circumference) {
    const ring = document.getElementById(ringId);
    if (!ring) return;
    const pct = Math.min(value, 100) / 100;
    const offset = circumference * (1 - pct);
    ring.style.transition = 'none';
    ring.style.strokeDashoffset = circumference;
    void ring.offsetWidth; 
    ring.style.transition = `stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)`;
    ring.style.strokeDashoffset = offset;
}
function setMetric(numberId, barId, value, maxScale) {
    animateNumber(numberId, 0, value, 1500);
    const bar = document.getElementById(barId);
    if (bar) {
        const pct = Math.min((value / maxScale) * 100, 100);
        bar.style.transition = 'none';
        bar.style.width = '0%';
        void bar.offsetWidth;
        bar.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
        requestAnimationFrame(() => {
            bar.style.width = pct + '%';
        });
    }
}
function animateNumber(elementId, start, end, duration) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); 
        el.textContent = Math.floor(eased * (end - start) + start);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    const progressBar = document.getElementById('loadingProgress');
    if (show) {
        if (progressBar) progressBar.style.width = '0%';
        overlay?.classList.add('active');
    } else {
        setTimeout(() => {
            overlay?.classList.remove('active');
        }, 600);
    }
}
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('exiting');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
function copyTranscript() {
    const text = document.getElementById('transcriptText')?.textContent || '';
    if (!text || text.includes('No transcript available')) {
        showToast('No transcript to copy', 'info');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        showToast('Transcript copied to clipboard', 'success');
    }).catch(() => {
        showToast('Failed to copy transcript', 'error');
    });
}
function exportJSON() {
    if (!lastAnalysisData) {
        showToast('No analysis data to export. Run an analysis first.', 'info');
        return;
    }
    const blob = new Blob([JSON.stringify(lastAnalysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_analysis_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSON report downloaded', 'success');
}
async function exportPDF() {
    if (!lastAnalysisData) {
        showToast('No analysis data to export. Run an analysis first.', 'info');
        return;
    }
    showToast('Generating PDF report...', 'info');
    try {
        const response = await fetch('http://localhost:5000/api/generate-report?format=pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lastAnalysisData)
        });
        if (!response.ok) throw new Error('PDF generation failed');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview_report_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('PDF report downloaded', 'success');
    } catch (error) {
        showToast('PDF export failed: ' + error.message, 'error');
    }
}
function loadDemoData() {
    const demoRaw = {
        video_analysis: {
            eye_contact_score: 78,
            posture_score: 85,
            confidence_level: 81,
            head_movement: 12
        },
        audio_analysis: {
            clarity_score: 74,
            words_per_minute: 142,
            silence_ratio: 18,
            pitch_variation: 22,
            pace_consistency: 76,
            overall_audio_quality: 72
        },
        answer_analysis: {
            content_score: 82,
            completeness_score: 79,
            coherence_score: 77,
            language_quality: 85,
            overall_answer_quality: 80,
            transcription_status: 'success',
            transcribed_text: 'Thank you for that question. In my previous role as a project manager, I led a cross-functional team of twelve people to deliver a critical product launch three weeks ahead of schedule. I focused on clear communication, establishing daily standups, and empowering team members to take ownership of their deliverables. The result was a 23% increase in customer satisfaction scores and recognition from senior leadership for our collaborative approach.'
        },
        overall_score: 78.25,
        timestamp: new Date().toISOString()
    };
    lastAnalysisData = demoRaw;
    const processed = processRawData(demoRaw);
    populateResults(processed);
    navigateTo('results');
    showToast('Demo data loaded — explore the dashboard!', 'success');
}
