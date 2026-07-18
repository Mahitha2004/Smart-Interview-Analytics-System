from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from app.analysis.video_analyzer import VideoAnalyzer
from app.analysis.audio_analyzer import AudioAnalyzer
from app.analysis.answer_evaluator import AnswerEvaluator
from app.reports.report_generator import ReportGenerator
from app.utils.file_handler import FileHandler
api_bp = Blueprint('api', __name__, url_prefix='/api')
file_handler = FileHandler()
video_analyzer = VideoAnalyzer()
audio_analyzer = AudioAnalyzer()
answer_evaluator = AnswerEvaluator()
report_generator = ReportGenerator()
@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()}), 200
@api_bp.route('/analyze', methods=['POST'])
def analyze_interview():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        video_file = request.files['video']
        question = request.form.get('question', '')
        expected_keywords = request.form.getlist('keywords')
        video_path = file_handler.save_video(video_file)
        audio_path = file_handler.extract_audio_from_video(video_path)
        video_analysis = video_analyzer.analyze_video(video_path)
        audio_analysis = audio_analyzer.analyze_audio(audio_path)
        answer_analysis = answer_evaluator.evaluate_answer(audio_path, question, expected_keywords)
        overall_score = (
            video_analysis['confidence_level'] * 0.25 +
            audio_analysis['overall_audio_quality'] * 0.25 +
            answer_analysis['overall_answer_quality'] * 0.50
        )
        analysis_data = {
            'video_analysis': video_analysis,
            'audio_analysis': audio_analysis,
            'answer_analysis': answer_analysis,
            'overall_score': overall_score,
            'question': question,
            'expected_keywords': expected_keywords,
            'timestamp': datetime.now().isoformat()
        }
        file_handler.cleanup_file(video_path)
        file_handler.cleanup_file(audio_path)
        return jsonify(analysis_data), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500
@api_bp.route('/analyze/video', methods=['POST'])
def analyze_video_only():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        video_file = request.files['video']
        video_path = file_handler.save_video(video_file)
        analysis = video_analyzer.analyze_video(video_path)
        file_handler.cleanup_file(video_path)
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@api_bp.route('/analyze/audio', methods=['POST'])
def analyze_audio_only():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        audio_file = request.files['audio']
        audio_path = file_handler.save_audio(audio_file)
        analysis = audio_analyzer.analyze_audio(audio_path)
        file_handler.cleanup_file(audio_path)
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@api_bp.route('/generate-report', methods=['POST'])
def generate_report():
    try:
        data = request.get_json()
        report_format = request.args.get('format', 'pdf')               
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        reports_dir = os.path.abspath(current_app.config.get('REPORTS_FOLDER', 'reports'))
        os.makedirs(reports_dir, exist_ok=True)
        if report_format == 'json':
            output_path = os.path.join(reports_dir, f"interview_report_{timestamp}.json")
            report_generator.generate_json_report(data, output_path)
            return send_file(output_path, as_attachment=True, mimetype='application/json')
        else:
            output_path = os.path.join(reports_dir, f"interview_report_{timestamp}.pdf")
            report_generator.generate_pdf_report(data, output_path)
            return send_file(output_path, as_attachment=True, mimetype='application/pdf')
    except Exception as e:
        return jsonify({'error': f'Report generation failed: {str(e)}'}), 500
@api_bp.route('/metrics', methods=['GET'])
def get_metrics_info():
    return jsonify({
        'video_metrics': [
            'eye_contact_score',
            'posture_score',
            'head_movement',
            'confidence_level'
        ],
        'audio_metrics': [
            'speaking_speed',
            'words_per_minute',
            'pitch_variation',
            'silence_ratio',
            'clarity_score',
            'pace_consistency'
        ],
        'answer_metrics': [
            'content_score',
            'completeness_score',
            'coherence_score',
            'language_quality',
            'overall_answer_quality'
        ]
    }), 200
