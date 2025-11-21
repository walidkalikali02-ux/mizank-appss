import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader2, Send, Image as ImageIcon } from 'lucide-react';

interface FoodInputProps {
  onAnalyze: (description: string, imageBase64?: string) => Promise<void>;
  isLoading: boolean;
  t: any;
}

export const FoodInput: React.FC<FoodInputProps> = ({ onAnalyze, isLoading, t }) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      // Small delay to ensure video element is mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      alert(t.cameraError);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    await onAnalyze(text, imagePreview || undefined);
    setText('');
    clearImage();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{t.logMeal}</h3>

      {/* Camera Modal Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Top controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-end bg-gradient-to-b from-black/50 to-transparent">
              <button
                onClick={stopCamera}
                className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="h-32 bg-black flex items-center justify-center pb-6 pt-2">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group transition-transform active:scale-95"
            >
              <div className="w-16 h-16 bg-white rounded-full group-hover:bg-gray-200 transition-colors"></div>
            </button>
          </div>

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Image Preview Area */}
        {imagePreview ? (
          <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden group">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={clearImage}
                className="bg-red-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-red-600 transition-colors"
              >
                <X size={18} /> {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/30">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-white border border-gray-200 rounded-xl hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all shadow-sm group"
              >
                <div className="p-3 bg-brand-50 rounded-full text-brand-600 group-hover:scale-110 transition-transform">
                  <Camera size={24} />
                </div>
                <span className="text-sm font-bold text-gray-600 group-hover:text-brand-600">{t.useCamera}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm group"
              >
                <div className="p-3 bg-blue-50 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                  <ImageIcon size={24} />
                </div>
                <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600">{t.uploadGallery}</span>
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">{t.snapPhoto}</p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.describeMeal}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none h-14 text-sm"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || (!text && !imagePreview)}
            className={`px-4 rounded-xl flex items-center justify-center transition-all ${isLoading || (!text && !imagePreview)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg'
              }`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} className="rtl:rotate-180" />}
          </button>
        </div>
      </form>
    </div>
  );
};