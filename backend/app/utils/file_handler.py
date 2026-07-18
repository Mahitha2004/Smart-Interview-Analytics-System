import os
import shutil
from pathlib import Path
from werkzeug.utils import secure_filename
class FileHandler:
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}
    ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'ogg', 'm4a', 'aac'}
    MAX_FILE_SIZE = 500 * 1024 * 1024         
    def __init__(self, upload_folder='uploads'):
        self.upload_folder = upload_folder
        self._ensure_upload_folder()
    def _ensure_upload_folder(self):
        Path(self.upload_folder).mkdir(parents=True, exist_ok=True)
    def save_video(self, file):
        if not file or file.filename == '':
            raise ValueError("No file selected")
        if not self._allowed_file(file.filename, self.ALLOWED_VIDEO_EXTENSIONS):
            raise ValueError(f"Invalid video format. Allowed: {', '.join(self.ALLOWED_VIDEO_EXTENSIONS)}")
        filename = secure_filename(file.filename)
        filepath = os.path.join(self.upload_folder, filename)
        file.save(filepath)
        return filepath
    def save_audio(self, file):
        if not file or file.filename == '':
            raise ValueError("No file selected")
        if not self._allowed_file(file.filename, self.ALLOWED_AUDIO_EXTENSIONS):
            raise ValueError(f"Invalid audio format. Allowed: {', '.join(self.ALLOWED_AUDIO_EXTENSIONS)}")
        filename = secure_filename(file.filename)
        filepath = os.path.join(self.upload_folder, filename)
        file.save(filepath)
        return filepath
    def _allowed_file(self, filename, allowed_extensions):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions
    def cleanup_file(self, filepath):
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as e:
            print(f"Error removing file {filepath}: {str(e)}")
    def extract_audio_from_video(self, video_path, output_path=None):
        try:
            from moviepy.video.io.VideoFileClip import VideoFileClip
            if output_path is None:
                base, _ = os.path.splitext(video_path)
                output_path = f"{base}_audio.wav"
            video = VideoFileClip(video_path)
            video.audio.write_audiofile(output_path)
            video.close()
            return output_path
        except Exception as e:
            raise ValueError(f"Failed to extract audio: {str(e)}")
