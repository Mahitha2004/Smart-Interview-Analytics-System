import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter
class AudioAnalyzer:
    def __init__(self, sr=22050):
        self.sr = sr                                         
    def analyze_audio(self, audio_path):
        try:
            if not os.path.exists(audio_path):
                raise FileNotFoundError(f"Audio file not found: {audio_path}")
            sr_native, y_raw = wavfile.read(audio_path)
            if y_raw.dtype == np.int16:
                y = y_raw.astype(np.float32) / 32768.0
            elif y_raw.dtype == np.int32:
                y = y_raw.astype(np.float32) / 2147483648.0
            elif y_raw.dtype == np.float64:
                y = y_raw.astype(np.float32)
            else:
                y = y_raw.astype(np.float32)
            if len(y.shape) > 1:
                y = np.mean(y, axis=1)
            y_filtered = self._bandpass_filter(y, sr_native, lowcut=80, highcut=min(4000, sr_native // 2 - 1))
        except Exception as e:
            raise ValueError(f"Cannot load audio: {str(e)}")
        duration = len(y) / sr_native
        if duration < 0.5:
            return self._empty_result()
        speech_energy = self._extract_speech_energy(y_filtered)
        voiced_segments = self._detect_voiced_segments(y_filtered, sr_native)
        silence_ratio = self._calculate_silence_ratio(speech_energy)
        pitch_variation = self._estimate_pitch_variation(y_filtered, sr_native, voiced_segments)
        clarity_score = self._estimate_clarity(y, y_filtered, sr_native)
        pace_consistency = self._estimate_pace_consistency(voiced_segments, sr_native)
        words_per_minute = self._estimate_wpm(voiced_segments, duration)
        pitch_penalty = max(0, abs(pitch_variation - 20) - 10)                             
        overall_quality = (
            clarity_score * 0.45
            + pace_consistency * 0.35
            + max(0, 100 - pitch_penalty * 2) * 0.20
        )
        overall_quality = max(0, min(100, overall_quality))
        return {
            'speaking_speed': float(words_per_minute / 60) if words_per_minute > 0 else 0.0,
            'words_per_minute': float(words_per_minute),
            'pitch_variation': float(pitch_variation),
            'silence_ratio': float(silence_ratio),
            'clarity_score': float(clarity_score),
            'pace_consistency': float(pace_consistency),
            'overall_audio_quality': float(overall_quality),
            'duration_seconds': float(duration),
            'voiced_segment_count': len(voiced_segments)
        }
    def _empty_result(self):
        return {
            'speaking_speed': 0.0,
            'words_per_minute': 0.0,
            'pitch_variation': 0.0,
            'silence_ratio': 100.0,
            'clarity_score': 0.0,
            'pace_consistency': 0.0,
            'overall_audio_quality': 0.0,
            'duration_seconds': 0.0,
            'voiced_segment_count': 0
        }
    def _bandpass_filter(self, y, sr, lowcut=80, highcut=4000, order=4):
        nyquist = sr / 2
        low = max(lowcut / nyquist, 0.001)
        high = min(highcut / nyquist, 0.999)
        if low >= high:
            return y
        b, a = butter(order, [low, high], btype='band')
        try:
            return lfilter(b, a, y).astype(np.float32)
        except Exception:
            return y
    def _extract_speech_energy(self, y):
        frame_length = 2048
        num_frames = len(y) // frame_length
        if num_frames == 0:
            return np.array([0.0], dtype=np.float32)
        y_trimmed = y[:num_frames * frame_length]
        frames = y_trimmed.reshape(-1, frame_length)
        energy = np.sqrt(np.mean(frames ** 2, axis=1))
        return energy
    def _detect_voiced_segments(self, y, sr):
        frame_length = int(0.025 * sr)               
        hop_length = int(0.010 * sr)               
        num_frames = max(1, (len(y) - frame_length) // hop_length + 1)
        energies = np.zeros(num_frames, dtype=np.float32)
        for i in range(num_frames):
            start = i * hop_length
            end = min(start + frame_length, len(y))
            frame = y[start:end]
            energies[i] = np.sqrt(np.mean(frame ** 2))
        if np.max(energies) < 1e-6:
            return []
        threshold = np.percentile(energies[energies > 0], 25) if np.any(energies > 0) else 0
        threshold = max(threshold, np.max(energies) * 0.05)
        is_voiced = energies > threshold
        segments = []
        in_segment = False
        seg_start = 0
        for i in range(len(is_voiced)):
            if is_voiced[i] and not in_segment:
                seg_start = i * hop_length
                in_segment = True
            elif not is_voiced[i] and in_segment:
                seg_end = i * hop_length
                if (seg_end - seg_start) / sr > 0.05:
                    segments.append((seg_start, seg_end))
                in_segment = False
        if in_segment:
            seg_end = len(y)
            if (seg_end - seg_start) / sr > 0.05:
                segments.append((seg_start, seg_end))
        return segments
    def _calculate_silence_ratio(self, energy):
        if len(energy) == 0:
            return 100.0
        threshold = np.mean(energy) * 0.3
        silent_frames = np.sum(energy < threshold)
        total_frames = len(energy)
        silence_ratio = (silent_frames / max(total_frames, 1)) * 100
        return float(min(100, silence_ratio))
    def _estimate_pitch_variation(self, y, sr, voiced_segments):
        if len(voiced_segments) == 0:
            return 0.0
        f0_values = []
        sample_segments = voiced_segments[:20]
        for (start, end) in sample_segments:
            segment = y[start:end]
            if len(segment) < sr * 0.03:                      
                continue
            margin = len(segment) // 10
            if margin > 0:
                segment = segment[margin:-margin]
            f0 = self._autocorrelation_f0(segment, sr)
            if f0 is not None and 60 < f0 < 500:                      
                f0_values.append(f0)
        if len(f0_values) < 2:
            return 10.0                                
        f0_array = np.array(f0_values)
        mean_f0 = np.mean(f0_array)
        if mean_f0 < 1:
            return 0.0
        variation = (np.std(f0_array) / mean_f0) * 100
        return float(min(100, variation))
    def _autocorrelation_f0(self, segment, sr):
        min_lag = sr // 500                  
        max_lag = sr // 60                   
        if len(segment) < max_lag:
            return None
        segment = segment - np.mean(segment)
        norm = np.sqrt(np.sum(segment ** 2))
        if norm < 1e-8:
            return None
        segment = segment / norm
        n = len(segment)
        autocorr = np.zeros(min(max_lag + 1, n))
        for lag in range(min_lag, min(max_lag + 1, n)):
            autocorr[lag] = np.sum(segment[:n - lag] * segment[lag:])
        valid_range = autocorr[min_lag:min(max_lag + 1, n)]
        if len(valid_range) == 0:
            return None
        peak_idx = np.argmax(valid_range) + min_lag
        if autocorr[peak_idx] < 0.15:                  
            return None
        return sr / peak_idx
    def _estimate_clarity(self, y_original, y_filtered, sr):
        if len(y_original) == 0:
            return 0.0
        signal_power = np.mean(y_filtered ** 2)
        noise = y_original - y_filtered
        noise_power = np.mean(noise ** 2)
        if noise_power < 1e-10:
            snr_db = 40.0                            
        elif signal_power < 1e-10:
            snr_db = 0.0
        else:
            snr_db = 10 * np.log10(signal_power / noise_power)
        snr_score = max(0, min(100, (snr_db / 30) * 100))
        frame_size = min(2048, len(y_filtered))
        num_frames = max(1, len(y_filtered) // frame_size)
        flatness_values = []
        for i in range(min(num_frames, 50)):                          
            start = i * frame_size
            end = start + frame_size
            frame = y_filtered[start:end]
            spectrum = np.abs(np.fft.rfft(frame * np.hanning(len(frame))))
            spectrum = spectrum[1:]           
            if len(spectrum) > 0 and np.mean(spectrum) > 1e-10:
                geo_mean = np.exp(np.mean(np.log(spectrum + 1e-10)))
                arith_mean = np.mean(spectrum)
                flatness = geo_mean / arith_mean if arith_mean > 1e-10 else 1.0
                flatness_values.append(flatness)
        if flatness_values:
            avg_flatness = np.mean(flatness_values)
            flatness_score = max(0, min(100, (1 - avg_flatness) * 100))
        else:
            flatness_score = 50.0
        clarity = snr_score * 0.6 + flatness_score * 0.4
        return float(max(0, min(100, clarity)))
    def _estimate_pace_consistency(self, voiced_segments, sr):
        if len(voiced_segments) < 2:
            return 50.0                                           
        durations = [(end - start) / sr for start, end in voiced_segments]
        mean_duration = np.mean(durations)
        if mean_duration < 0.01:
            return 50.0
        cv_duration = np.std(durations) / mean_duration
        gaps = []
        for i in range(1, len(voiced_segments)):
            gap = (voiced_segments[i][0] - voiced_segments[i - 1][1]) / sr
            if gap > 0:
                gaps.append(gap)
        if gaps:
            mean_gap = np.mean(gaps)
            cv_gap = np.std(gaps) / max(mean_gap, 0.01)
        else:
            cv_gap = 0.0
        combined_cv = cv_duration * 0.6 + cv_gap * 0.4
        consistency = max(0, min(100, 100 - combined_cv * 50))
        return float(consistency)
    def _estimate_wpm(self, voiced_segments, total_duration):
        if total_duration < 1 or len(voiced_segments) == 0:
            return 0.0
        total_voiced = sum((end - start) for start, end in voiced_segments)
        avg_word_duration = 0.4
        estimated_words = total_voiced / (avg_word_duration * 22050)                          
        if total_duration > 0 and len(voiced_segments) > 0:
            total_samples = int(total_duration * 22050)               
            first_seg_start = voiced_segments[0][0]
            last_seg_end = voiced_segments[-1][1]
            span = last_seg_end - first_seg_start
            if span > 0:
                voiced_total = sum(end - start for start, end in voiced_segments)
                voiced_fraction = voiced_total / span
                speaking_duration = total_duration * voiced_fraction
                estimated_words = speaking_duration * 2.5
                wpm = (estimated_words / total_duration) * 60
            else:
                wpm = 0
        else:
            wpm = 0
        return float(max(0, min(300, wpm)))
