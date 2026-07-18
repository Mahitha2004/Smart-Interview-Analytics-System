import speech_recognition as sr
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
class AnswerEvaluator:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        try:
            self.stop_words = set(stopwords.words('english'))
        except LookupError:
            self.stop_words = set()
    def evaluate_answer(self, audio_path, question=None, expected_keywords=None):
        text, transcription_status = self._transcribe_audio(audio_path)
        if transcription_status == 'failed' or not text or text.strip() == '':
            return {
                'transcribed_text': '',
                'transcription_status': 'failed',
                'content_score': 0.0,
                'completeness_score': 0.0,
                'coherence_score': 0.0,
                'language_quality': 0.0,
                'overall_answer_quality': 0.0,
                'keywords_found': [],
                'word_count': 0,
                'note': 'Transcription failed — could not recognize speech. '
                        'Ensure the video has clear audio and try again.'
            }
        content_score = self._analyze_content_relevance(text, question, expected_keywords)
        completeness_score = self._analyze_completeness(text)
        coherence_score = self._analyze_coherence(text)
        language_quality = self._analyze_language_quality(text)
        return {
            'transcribed_text': text,
            'transcription_status': transcription_status,
            'content_score': float(content_score),
            'completeness_score': float(completeness_score),
            'coherence_score': float(coherence_score),
            'language_quality': float(language_quality),
            'overall_answer_quality': float(self._calculate_overall_quality(
                content_score, completeness_score, coherence_score, language_quality
            )),
            'keywords_found': self._extract_keywords(text, expected_keywords),
            'word_count': int(len(text.split()))
        }
    def _transcribe_audio(self, audio_path):
        try:
            with sr.AudioFile(audio_path) as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = self.recognizer.record(source)
            text = self.recognizer.recognize_google(audio)
            if text and len(text.strip()) > 0:
                word_count = len(text.split())
                status = 'success' if word_count >= 5 else 'partial'
                return text, status
            else:
                return '', 'failed'
        except sr.UnknownValueError:
            return '', 'failed'
        except sr.RequestError as e:
            return '', 'failed'
        except Exception:
            return '', 'failed'
    def _analyze_content_relevance(self, text, question=None, expected_keywords=None):
        score = 50.0                                        
        if question and question.strip():
            try:
                vectorizer = TfidfVectorizer(stop_words='english', min_df=1)
                tfidf_matrix = vectorizer.fit_transform([question, text])
                similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0, 0]
                score = similarity * 100
            except Exception:
                question_words = set(question.lower().split()) - self.stop_words
                text_words = set(text.lower().split()) - self.stop_words
                if len(question_words) > 0:
                    overlap = len(question_words & text_words)
                    score = (overlap / len(question_words)) * 100
                else:
                    score = 50.0
        if expected_keywords:
            text_lower = text.lower()
            keyword_matches = sum(1 for kw in expected_keywords if kw.lower() in text_lower)
            keyword_ratio = keyword_matches / max(len(expected_keywords), 1)
            keyword_boost = keyword_ratio * 30
            score = min(100, score + keyword_boost)
        return max(0, min(100, score))
    def _analyze_completeness(self, text):
        words = text.split()
        word_count = len(words)
        try:
            sentences = sent_tokenize(text)
        except Exception:
            sentences = text.split('.')
            sentences = [s.strip() for s in sentences if s.strip()]
        sentence_count = len(sentences)
        if word_count < 10:
            word_score = word_count * 3              
        elif word_count < 50:
            word_score = 30 + (word_count / 50) * 40               
        elif word_count <= 200:
            word_score = 70 + ((word_count - 50) / 150) * 30              
        else:
            word_score = 100                 
        sentence_score = min(100, (sentence_count / 3) * 100)
        unique_words = len(set(w.lower() for w in words))
        ttr = unique_words / max(word_count, 1)
        vocab_score = min(100, ttr * 150)
        completeness = (word_score * 0.40 + sentence_score * 0.30 + vocab_score * 0.30)
        return max(0, min(100, completeness))
    def _analyze_coherence(self, text):
        try:
            sentences = sent_tokenize(text)
        except Exception:
            sentences = [s.strip() for s in text.split('.') if s.strip()]
        if len(sentences) < 2:
            return 55.0
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(sentences)
            similarities = []
            for i in range(len(sentences) - 1):
                sim = cosine_similarity(
                    tfidf_matrix[i:i + 1], tfidf_matrix[i + 1:i + 2]
                )[0, 0]
                similarities.append(sim)
            avg_similarity = np.mean(similarities) if similarities else 0
            mean_vector = tfidf_matrix.mean(axis=0)
            topic_sims = []
            for i in range(tfidf_matrix.shape[0]):
                sim = cosine_similarity(tfidf_matrix[i:i + 1], mean_vector)[0, 0]
                topic_sims.append(sim)
            topic_consistency = np.mean(topic_sims) if topic_sims else 0
            coherence_score = (
                40 +                                
                avg_similarity * 30 +                           
                topic_consistency * 30                             
            )
            return max(0, min(100, coherence_score))
        except Exception:
            return 55.0
    def _analyze_language_quality(self, text):
        words = text.split()
        total_words = len(words)
        if total_words == 0:
            return 0.0
        has_period = '.' in text
        has_comma = ',' in text
        punct_count = sum(1 for c in text if c in '.!?,;:')
        punct_score = min(25, punct_count * 5)                                   
        word_set = set(w.lower().strip('.,!?;:') for w in words)
        variety = len(word_set) / max(total_words, 1)
        variety_score = min(25, variety * 35)                   
        clean_words = [w.strip('.,!?;:') for w in words if len(w.strip('.,!?;:')) > 0]
        avg_word_len = np.mean([len(w) for w in clean_words]) if clean_words else 0
        if 4 <= avg_word_len <= 7:
            word_len_score = 25
        elif avg_word_len < 4:
            word_len_score = avg_word_len * 6
        else:
            word_len_score = max(15, 25 - (avg_word_len - 7) * 2)
        try:
            sentences = sent_tokenize(text)
            if len(sentences) >= 2:
                sent_lengths = [len(s.split()) for s in sentences]
                sent_variety = np.std(sent_lengths) / max(np.mean(sent_lengths), 1)
                if 0.15 <= sent_variety <= 0.7:
                    sent_score = 25
                else:
                    sent_score = 15
            else:
                sent_score = 15
        except Exception:
            sent_score = 15
        quality = punct_score + variety_score + word_len_score + sent_score
        return max(0, min(100, quality))
    def _calculate_overall_quality(self, content, completeness, coherence, language):
        overall = (content * 0.35 + completeness * 0.25 + coherence * 0.25 + language * 0.15)
        return overall
    def _extract_keywords(self, text, expected_keywords=None):
        if not expected_keywords:
            words = text.lower().split()
            words = [w.strip(".,!?;:\"'()") for w in words
                     if w.strip(".,!?;:\"'()") not in self.stop_words
                     and len(w.strip(".,!?;:\"'()")) > 3]
            return list(set(words))[:10]
        text_lower = text.lower()
        found = [kw for kw in expected_keywords if kw.lower() in text_lower]
        return found
