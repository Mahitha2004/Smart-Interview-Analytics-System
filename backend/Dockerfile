FROM python:3.10-slim

# Install system dependencies required for OpenCV and MoviePy (ffmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download necessary NLTK datasets
RUN python -c "import nltk; nltk.download('averaged_perceptron_tagger'); nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords')"

# Copy the rest of the application code
COPY . .

# Create uploads and reports directories just in case (optional, file_handler should create them)
RUN mkdir -p uploads reports && chmod 777 uploads reports

# Expose the port (Render sets this automatically, but good practice)
EXPOSE 5000

# Run the application with gunicorn
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 2 --timeout 120 run:app"]
