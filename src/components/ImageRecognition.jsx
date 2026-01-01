import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Sparkles, Upload, RotateCcw, X, Check, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const ImageRecognition = ({ onNavigate, onStartChat, user }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    if (!user.isPremium) return showPremiumToast();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsCameraActive(true);
      setCapturedImage(null);
    } catch (err) {
      toast({ title: "Câmara indisponível", description: "Verifica as permissões do teu navegador.", variant: "destructive" });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
    setStream(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCapturedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const showPremiumToast = () => {
    toast({ title: "Funcionalidade Premium ✨", description: "Upgrade necessário para usar o Vision AI.", variant: "destructive" });
  };

  return (
    /* Ajuste para centralização total e evitar scroll */
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-50/50 overflow-hidden">
      <div className="w-full max-w-4xl px-6 flex flex-col max-h-[95vh]">
        <canvas ref={canvasRef} className="hidden" />
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

        {/* Header Minimalista */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => { stopCamera(); onNavigate('dashboard'); }} className="rounded-full hover:bg-orange-50 text-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Painel
          </Button>
          <div className="flex items-center gap-2 bg-orange-100/50 px-4 py-1.5 rounded-full text-orange-700">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Chef Vision AI</span>
          </div>
        </div>

        {/* Títulos Refinados - Margens reduzidas para caber em mobile */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">O que temos para hoje?</h1>
          <p className="text-gray-500 text-sm md:text-lg max-w-md mx-auto">
            Tira uma foto aos teus ingredientes.
          </p>
        </div>

        {/* Contentor Principal */}
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[32px] md:rounded-[40px] overflow-hidden bg-white relative">
          <CardContent className="p-2 md:p-3">
            <div className="relative aspect-[4/5] md:aspect-video bg-gray-50 rounded-[28px] md:rounded-[32px] overflow-hidden">
              
              <AnimatePresence mode="wait">
                {!isCameraActive && !capturedImage && (
                  <motion.div 
                    key="menu" 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-6"
                  >
                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl">
                      <button 
                        onClick={startCamera}
                        className="flex-1 group bg-gradient-to-b from-orange-500 to-orange-600 p-6 md:p-8 rounded-[24px] flex flex-col items-center justify-center shadow-lg shadow-orange-200 transition-transform active:scale-95"
                      >
                        <Camera className="h-8 w-8 text-white mb-3" />
                        <span className="text-white font-bold text-base md:text-lg">Câmara</span>
                      </button>

                      <button 
                        onClick={() => fileInputRef.current.click()}
                        className="flex-1 group bg-white border-2 border-gray-100 p-6 md:p-8 rounded-[24px] flex flex-col items-center justify-center transition-all active:scale-95 hover:bg-orange-50/30"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-3" />
                        <span className="text-gray-700 font-bold text-base md:text-lg">Galeria</span>
                      </button>
                    </div>
                    <p className="text-gray-400 text-[10px] md:text-sm flex items-center gap-2">
                      <Smartphone className="h-4 w-4" /> Qualidade HD suportada
                    </p>
                  </motion.div>
                )}

                {isCameraActive && (
                  <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-white/40 rounded-3xl backdrop-blur-[1px] relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 -mt-1 -ml-1 rounded-tl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 -mb-1 -mr-1 rounded-br-lg" />
                      </div>
                    </div>
                    <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center items-center gap-8">
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

                {capturedImage && (
                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-gray-900">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-10 bg-gradient-to-t from-black/80 via-transparent">
                      <div className="w-full max-w-sm bg-white/10 backdrop-blur-2xl p-1 border border-white/20 rounded-[32px] flex items-center justify-between shadow-2xl">
                        <button onClick={() => setCapturedImage(null)} className="px-6 py-4 text-white font-bold text-sm md:text-base flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" /> Repetir
                        </button>
                        <button 
                          onClick={() => onStartChat({ title: "Análise Real", query: "O que faço com estes ingredientes?" })}
                          className="bg-orange-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-[26px] font-bold text-sm md:text-base flex items-center gap-2"
                        >
                          Analisar <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Footer Minimalista */}
        <div className="mt-6">
          <p className="text-center text-gray-400 text-[10px] md:text-xs font-medium">
            A nossa IA processa a imagem localmente para garantir a sua privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageRecognition;