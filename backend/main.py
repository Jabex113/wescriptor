from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import yt_dlp
import whisper
import os
import tempfile
import asyncio
from pathlib import Path
import uuid
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

whisper_model = whisper.load_model("small")

class TranscriptionRequest(BaseModel):
    url: str
    language: str = "auto"

class TranscriptionResponse(BaseModel):
    text: str
    duration: float
    title: str
    detected_language: str

def download_video(url: str, output_path: str):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
        'extract_audio': True,
        'audio_format': 'wav',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return info.get('title', 'Untitled'), info.get('duration', 0)

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f]', '', text)
    text = re.sub(r'^\[.*?\]', '', text)
    text = re.sub(r'\[.*?\]$', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    text = text.replace('♪', '').replace('♫', '')
    return text.strip()

async def transcribe_audio(audio_path: str, language: str = "auto"):
    loop = asyncio.get_event_loop()
    
    def transcribe_sync():
        if language == "auto":
            result = whisper_model.transcribe(
                audio_path,
                fp16=False,
                verbose=False,
                word_timestamps=False,
                condition_on_previous_text=False,
                temperature=0.0,
                best_of=1,
                beam_size=1,
                patience=1.0,
                length_penalty=1.0,
                suppress_tokens="-1",
                initial_prompt=None,
                decode_options={"language": None}
            )
        else:
            result = whisper_model.transcribe(
                audio_path,
                language=language,
                fp16=False,
                verbose=False,
                word_timestamps=False,
                condition_on_previous_text=False,
                temperature=0.0,
                best_of=1,
                beam_size=1,
                patience=1.0,
                length_penalty=1.0,
                suppress_tokens="-1",
                initial_prompt=None
            )
        return result
    
    result = await loop.run_in_executor(None, transcribe_sync)
    
    cleaned_text = clean_text(result["text"])
    detected_language = result.get("language", "unknown")
    
    return cleaned_text, detected_language

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_video(request: TranscriptionRequest):
    temp_dir = tempfile.mkdtemp()
    try:
        video_id = str(uuid.uuid4())
        output_path = os.path.join(temp_dir, f"{video_id}.%(ext)s")
        
        title, duration = download_video(request.url, output_path)
        
        audio_path = os.path.join(temp_dir, f"{video_id}.wav")
        
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="Failed to download audio")
        
        transcription, detected_language = await transcribe_audio(audio_path, request.language)
        
        return TranscriptionResponse(
            text=transcription,
            duration=duration,
            title=title,
            detected_language=detected_language
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for file in Path(temp_dir).glob("*"):
            file.unlink()
        os.rmdir(temp_dir)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/languages")
async def get_supported_languages():
    return {
        "languages": {
            "auto": "Auto-detect",
            "en": "English",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "ru": "Russian",
            "ja": "Japanese",
            "ko": "Korean",
            "zh": "Chinese",
            "ar": "Arabic",
            "hi": "Hindi",
            "tr": "Turkish",
            "pl": "Polish",
            "nl": "Dutch",
            "sv": "Swedish",
            "da": "Danish",
            "no": "Norwegian",
            "fi": "Finnish",
            "tl": "Filipino/Tagalog",
            "th": "Thai",
            "vi": "Vietnamese",
            "id": "Indonesian",
            "ms": "Malay",
            "uk": "Ukrainian",
            "cs": "Czech",
            "hu": "Hungarian",
            "ro": "Romanian",
            "bg": "Bulgarian",
            "hr": "Croatian",
            "sk": "Slovak",
            "sl": "Slovenian",
            "et": "Estonian",
            "lv": "Latvian",
            "lt": "Lithuanian",
            "mt": "Maltese",
            "cy": "Welsh",
            "is": "Icelandic",
            "mk": "Macedonian",
            "sq": "Albanian",
            "eu": "Basque",
            "gl": "Galician",
            "ca": "Catalan",
            "he": "Hebrew",
            "fa": "Persian",
            "ur": "Urdu",
            "bn": "Bengali",
            "ta": "Tamil",
            "te": "Telugu",
            "ml": "Malayalam",
            "kn": "Kannada",
            "gu": "Gujarati",
            "pa": "Punjabi",
            "ne": "Nepali",
            "si": "Sinhala",
            "my": "Myanmar",
            "km": "Khmer",
            "lo": "Lao",
            "ka": "Georgian",
            "am": "Amharic",
            "az": "Azerbaijani",
            "be": "Belarusian",
            "bs": "Bosnian",
            "eu": "Basque",
            "gl": "Galician",
            "kk": "Kazakh",
            "ky": "Kyrgyz",
            "lb": "Luxembourgish",
            "mg": "Malagasy",
            "ml": "Malayalam",
            "mi": "Maori",
            "mr": "Marathi",
            "mn": "Mongolian",
            "ps": "Pashto",
            "sd": "Sindhi",
            "so": "Somali",
            "sw": "Swahili",
            "tg": "Tajik",
            "tt": "Tatar",
            "tk": "Turkmen",
            "uz": "Uzbek",
            "yi": "Yiddish",
            "yo": "Yoruba",
            "zu": "Zulu"
        }
    }

frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    @app.get("/")
    async def serve_frontend():
        return FileResponse(str(frontend_dist / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 