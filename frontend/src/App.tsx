import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Loader2, Copy, Check, Zap, Globe } from 'lucide-react';

interface TranscriptionResult {
  text: string;
  duration: number;
  title: string;
  detected_language: string;
}

interface LanguagesResponse {
  languages: { [key: string]: string };
}

function App() {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('auto');
  const [languages, setLanguages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get<LanguagesResponse>('/api/languages');
        setLanguages(response.data.languages);
      } catch (err) {
        console.error('Failed to fetch languages:', err);
      }
    };
    fetchLanguages();
  }, []);

  const handleTranscribe = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube or TikTok URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post<TranscriptionResult>('/api/transcribe', { 
        url, 
        language 
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to transcribe video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageName = (code: string) => {
    return languages[code] || code.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-gray-800" />
            <h1 className="text-2xl font-semibold text-gray-900">Wescriptor</h1>
          </div>
          <p className="text-gray-600 mt-1">Transform video content into text instantly</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                Video to Text Transcription
              </h2>
              <p className="text-gray-600">
                Paste a YouTube or TikTok URL and get accurate transcriptions in seconds
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
                    disabled={loading}
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleTranscribe}
                disabled={loading || !url.trim()}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Transcribe Video
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{result.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Duration: {formatDuration(result.duration)}</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {getLanguageName(result.detected_language)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                    {result.text}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                <FileText className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Accurate Transcription</h3>
              <p className="text-sm text-gray-600">Powered by state-of-the-art AI models</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                <Globe className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Multi-Language</h3>
              <p className="text-sm text-gray-600">Supports 20+ languages with auto-detection</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                <Copy className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Easy Export</h3>
              <p className="text-sm text-gray-600">Copy transcriptions with one click</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            Wescriptor - Transform video content into accessible text
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App; 