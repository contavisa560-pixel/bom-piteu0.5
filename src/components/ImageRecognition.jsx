import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Sparkles, Upload, RotateCcw, X, Check, Smartphone, Loader2, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ImageRecognition = ({ onNavigate, onStartChat, user }) => {
  const { t } = useTranslation();
  const [isCameraActive, setIsCameraActive]   = useState(false);
  const [capturedImage,  setCapturedImage]    = useState(null);
  const [isAnalyzing,    setIsAnalyzing]      = useState(false);
  const [analysisStep,   setAnalysisStep]     = useState('');
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);

  // ── Câmara ─────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      setCapturedImage(null);
      setIsCameraActive(true);
      setTimeout(async () => {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      toast({
        title: t('imageRecognition.cameraUnavailable'),
        description: t('imageRecognition.cameraUnavailableDesc'),
        variant: 'destructive',
      });
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
    setStream(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCapturedImage(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Análise: identifica prato + cria sessão ────────────────────────────────
  const analyzeImage = async () => {
    if (!capturedImage || isAnalyzing) return;

    setIsAnalyzing(true);

    const steps = [
      t('imageRecognition.analyzing'),
      t('imageRecognition.identifying'),
      t('imageRecognition.preparingRecipe'),
      t('imageRecognition.generatingImage'),
      t('imageRecognition.almostReady'),
    ];
    let idx = 0;
    setAnalysisStep(steps[0]);
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, steps.length - 1);
      setAnalysisStep(steps[idx]);
    }, 2200);

    try {
      const token = localStorage.getItem('bomPiteuToken') || localStorage.getItem('token');

      // dataURL → Blob → FormData
      const blob = await (await fetch(capturedImage)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'dish.jpg');

      const res = await fetch(`${API_URL}/api/auto-recipe/identify-dish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${res.status}`);
      }

      const data = await res.json();

      // Passa para o ChatBot com source especial
      onStartChat({
        source:         'dish_recognition',
        sessionId:      data.sessionId,
        recipe:         data.recipe,
        finalImage:     data.finalImage,
        capturedImage:  capturedImage,        // foto do utilizador → 1.ª msg no chat
        title:          data.dishName,
        totalPassos:    data.recipe?.steps?.length || 0,
        mensagemInicio: t('imageRecognition.recipeReadyMessage', { dishName: data.dishName }),
        podeIniciarPassoAPasso: true,
      });

      setCapturedImage(null);

    } catch (err) {
      console.error('❌ identify-dish:', err);
      toast({
        title: t('imageRecognition.identificationFailed'),
        description: err.message || t('imageRecognition.tryAnotherPhoto'),
        variant: 'destructive',
      });
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/90 overflow-y-auto md:overflow-hidden">
      <div className="w-full max-w-4xl px-6 flex flex-col max-h-[95vh]">
        <canvas ref={canvasRef} className="hidden" />
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => { stopCamera(); onNavigate('dashboard'); }}
            className="rounded-full hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            disabled={isAnalyzing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.dashboard')}
          </Button>
          <div className="flex items-center gap-2 bg-orange-100/50 dark:bg-orange-900/30 px-4 py-1.5 rounded-full text-orange-700 dark:text-orange-300">
            <Sparkles className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{t('imageRecognition.chefVision')}</span>
          </div>
        </div>

        {/* Títulos */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            {isAnalyzing ? t('imageRecognition.identifyingDish') : t('imageRecognition.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg max-w-md mx-auto min-h-[28px] transition-all duration-500">
            {isAnalyzing
              ? analysisStep
              : t('imageRecognition.subtitle')}
          </p>
        </div>

        {/* Card principal */}
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[32px] md:rounded-[40px] overflow-hidden bg-white dark:bg-gray-800 relative">
          <CardContent className="p-2 md:p-3">
            <div className="relative aspect-[4/5] md:aspect-video bg-gray-50 dark:bg-gray-900 rounded-[28px] md:rounded-[32px] overflow-hidden">
              <AnimatePresence mode="wait">

                {/* ── Menu inicial ── */}
                {!isCameraActive && !capturedImage && !isAnalyzing && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-6"
                  >
                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl">
                      <button
                        onClick={startCamera}
                        className="flex-1 bg-gradient-to-b from-orange-500 to-orange-600 p-6 md:p-8 rounded-[24px] flex flex-col items-center justify-center shadow-lg shadow-orange-200 dark:shadow-orange-900/30 transition-transform active:scale-95"
                      >
                        <Camera className="h-8 w-8 text-white mb-3" />
                        <span className="text-white font-bold text-base md:text-lg">{t('imageRecognition.cameraButton')}</span>
                        <span className="text-white/70 text-xs mt-1">{t('imageRecognition.cameraDesc')}</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="flex-1 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 p-6 md:p-8 rounded-[24px] flex flex-col items-center justify-center transition-all active:scale-95 hover:bg-orange-50/30 dark:hover:bg-gray-600"
                      >
                        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
                        <span className="text-gray-700 dark:text-gray-200 font-bold text-base md:text-lg">{t('imageRecognition.galleryButton')}</span>
                        <span className="text-gray-400 text-xs mt-1">{t('imageRecognition.galleryDesc')}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 px-5 py-3 rounded-2xl max-w-xl w-full">
                      <ChefHat className="h-5 w-5 text-orange-500 shrink-0" />
                      <p className="text-orange-700 dark:text-orange-300 text-xs md:text-sm font-medium">
                        {t('imageRecognition.worksWithAnyDish')}
                      </p>
                    </div>

                    <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm flex items-center gap-2">
                      <Smartphone className="h-4 w-4" /> {t('imageRecognition.hdSupported')}
                    </p>
                  </motion.div>
                )}

                {/* ── Câmara activa ── */}
                {isCameraActive && (
                  <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center translate-y-[-40px] md:translate-y-0">
                      <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-white/40 rounded-3xl backdrop-blur-[1px] relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 -mt-1 -ml-1 rounded-tl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 -mb-1 -mr-1 rounded-br-lg" />
                      </div>
                    </div>
                    <div className="absolute bottom-40 md:bottom-10 left-0 right-0 flex justify-center items-center gap-6">
                      <button onClick={stopCamera} className="p-3 md:p-4 rounded-full bg-black/30 backdrop-blur-xl text-white">
                        <X className="h-5 w-5" />
                      </button>
                      <button onClick={takePhoto} className="h-16 w-16 md:h-20 md:w-20 bg-white rounded-full p-1 shadow-2xl active:scale-90">
                        <div className="w-full h-full rounded-full border-4 border-gray-900/5 flex items-center justify-center">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-500 rounded-full" />
                        </div>
                      </button>
                      <div className="w-12 md:w-14" />
                    </div>
                  </motion.div>
                )}

                {/* ── Loading / análise ── */}
                {isAnalyzing && (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95"
                  >
                    {capturedImage && (
                      <img
                        src={capturedImage}
                        alt={t('imageRecognition.analyzingAlt')}
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                      />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ChefHat className="h-8 w-8 text-orange-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-xl mb-2">{t('imageRecognition.chefVision')}</p>
                        <p className="text-orange-300 text-sm font-medium animate-pulse">{analysisStep}</p>
                      </div>
                      <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '95%' }}
                          transition={{ duration: 11, ease: 'linear' }}
                        />
                      </div>
                      <p className="text-white/40 text-xs">{t('imageRecognition.mayTakeFewSeconds')}</p>
                    </div>
                  </motion.div>
                )}

                {/* ── Preview da foto ── */}
                {capturedImage && !isAnalyzing && (
                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-gray-900">
                    <img src={capturedImage} alt={t('imageRecognition.capturedImageAlt')} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-10 bg-gradient-to-t from-black/80 via-black/10 to-transparent">
                      <div className="w-full mb-4 text-center">
                        <p className="text-white/80 text-sm font-medium">
                          {t('imageRecognition.aiWillIdentify')}
                        </p>
                      </div>
                      <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-2xl p-1 border border-white/20 rounded-[32px] flex items-center justify-between shadow-2xl">
                        <button
                          onClick={() => setCapturedImage(null)}
                          className="px-6 py-4 text-white font-bold text-sm flex items-center gap-2 hover:bg-white/10 rounded-[26px] transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" /> {t('imageRecognition.retake')}
                        </button>
                        <button
                          onClick={analyzeImage}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-4 rounded-[26px] font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
                        >
                          <Sparkles className="h-4 w-4" />
                          {t('imageRecognition.identifyDish')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6">
          <p className="text-center text-gray-400 dark:text-gray-500 text-[10px] md:text-xs font-medium">
            {t('imageRecognition.footerText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageRecognition;