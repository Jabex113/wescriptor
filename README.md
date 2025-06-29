# Wescriptor

Video to text transcription for YouTube and TikTok URLs.

## Quick Start

```bash
./start.sh
```

Open http://localhost:3000

## Requirements

- Python 3.8+
- Node.js 16+
- FFmpeg

### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

## Features

- YouTube and TikTok video transcription
- 70+ language support including Filipino/Tagalog
- Local processing with OpenAI Whisper
- No external API calls required
- Clean, minimal interface

## Manual Setup

If `./start.sh` doesn't work:

```bash
# Backend
cd backend
pip3 install -r requirements.txt
python3 main.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Production Deployment

```bash
./deploy.sh
```

Then run:
```bash
cd backend && python3 main.py
```

Application will be available at http://localhost:8000

## Docker

```bash
docker-compose up
```

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Python + FastAPI + Whisper + yt-dlp
- No external transcription APIs 