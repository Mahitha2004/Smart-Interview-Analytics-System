import cv2
import numpy as np
from pathlib import Path
class VideoAnalyzer:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
    def analyze_video(self, video_path):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f'Cannot open video: {video_path}')
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        if fps <= 0:
            fps = 30                    
        if frame_width <= 0:
            frame_width = 640
        if frame_height <= 0:
            frame_height = 480
        sample_interval = max(1, int(fps))
        max_samples = 120                           
        frames_analyzed = 0
        frames_with_face = 0
        frames_with_eyes = 0
        head_positions = []
        frame_idx = 0
        while frames_analyzed < max_samples:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if not ret:
                break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.equalizeHist(gray)
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.3, minNeighbors=5,
                minSize=(int(frame_width * 0.05), int(frame_height * 0.05))
            )
            if len(faces) > 0:
                frames_with_face += 1
                largest_face = max(faces, key=lambda f: f[2] * f[3])
                x, y, w, h = largest_face
                face_roi = gray[y:y + h, x:x + w]
                eyes = self.eye_cascade.detectMultiScale(
                    face_roi,
                    scaleFactor=1.1,
                    minNeighbors=3,
                    minSize=(int(w * 0.1), int(h * 0.05))
                )
                if len(eyes) >= 1:
                    frames_with_eyes += 1
                center_x = (x + w / 2) / frame_width
                center_y = (y + h / 2) / frame_height
                head_positions.append({
                    'x': center_x,
                    'y': center_y,
                    'face_size': (w * h) / (frame_width * frame_height)
                })
            frames_analyzed += 1
            frame_idx += sample_interval
        cap.release()
        if frames_analyzed == 0:
            return {
                'eye_contact_score': 0.0,
                'posture_score': 0.0,
                'head_movement': 0.0,
                'frames_analyzed': 0,
                'face_detection_ratio': 0.0,
                'confidence_level': 0.0
            }
        if frames_with_face > 0:
            eye_contact_score = (frames_with_eyes / frames_with_face) * 100
        else:
            eye_contact_score = 0.0
        face_detection_ratio = (frames_with_face / frames_analyzed) * 100
        posture_score = self._analyze_posture(head_positions) if head_positions else 0.0
        head_movement = self._calculate_head_movement(head_positions) if head_positions else 0.0
        confidence = (
            min(100, face_detection_ratio) * 0.30 +
            min(100, eye_contact_score) * 0.45 +
            head_movement * 0.25                                              
        )
        return {
            'eye_contact_score': float(min(100, eye_contact_score)),
            'posture_score': float(min(100, posture_score)),
            'head_movement': float(min(100, head_movement)),
            'frames_analyzed': frames_analyzed,
            'face_detection_ratio': float(min(100, face_detection_ratio)),
            'confidence_level': float(min(100, confidence))
        }
    def _analyze_posture(self, head_positions):
        if len(head_positions) < 2:
            return 50.0
        x_positions = np.array([pos['x'] for pos in head_positions])
        y_positions = np.array([pos['y'] for pos in head_positions])
        face_sizes = np.array([pos['face_size'] for pos in head_positions])
        x_center_deviation = np.mean(np.abs(x_positions - 0.5))
        x_center_score = max(0, 100 - x_center_deviation * 333)
        x_std = np.std(x_positions)
        x_stability = max(0, 100 - x_std * 500)
        y_std = np.std(y_positions)
        y_stability = max(0, 100 - y_std * 500)
        if np.mean(face_sizes) > 0:
            size_cv = np.std(face_sizes) / np.mean(face_sizes)
            size_consistency = max(0, 100 - size_cv * 200)
        else:
            size_consistency = 50
        posture_score = (
            x_center_score * 0.25 +
            x_stability * 0.25 +
            y_stability * 0.25 +
            size_consistency * 0.25
        )
        return max(0, min(100, posture_score))
    def _calculate_head_movement(self, head_positions):
        if len(head_positions) < 2:
            return 50.0
        movements = []
        for i in range(1, len(head_positions)):
            prev = head_positions[i - 1]
            curr = head_positions[i]
            dx = curr['x'] - prev['x']
            dy = curr['y'] - prev['y']
            movement = np.sqrt(dx ** 2 + dy ** 2)
            movements.append(movement)
        avg_movement = np.mean(movements)
        max_movement = np.max(movements)
        stability = max(0, 100 - avg_movement * 1000)
        jerk_penalty = min(30, max_movement * 200)
        stability = max(0, stability - jerk_penalty)
        return max(0, min(100, stability))
