import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const CameraModal = ({ open, onClose, onCapture }) => {
    const { t } = useTranslation();
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [isFrontCamera, setIsFrontCamera] = useState(false);

    useEffect(() => {
        if (open) startCamera();

        return () => {
            stopCamera();
        };
    }, [open, isFrontCamera]);

    const startCamera = async () => {
        try {
            stopCamera();

            const constraints = {
                video: {
                    facingMode: isFrontCamera ? "user" : "environment",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = mediaStream;

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (isFrontCamera) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0);
        onCapture(canvas.toDataURL("image/jpeg", 0.8));
        stopCamera();
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 border-[2px] border-white/20 pointer-events-none z-10 m-8 rounded-3xl" />

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={`h-full w-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
                    />

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-20 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
                    >
                        <X size={24} />
                    </button>

                    <div className="absolute bottom-10 left-0 w-full px-8 flex items-center justify-between z-20">
                        <button
                            onClick={() => setIsFrontCamera(!isFrontCamera)}
                            className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20"
                        >
                            <RefreshCw size={24} />
                        </button>

                        <button
                            onClick={handleCapture}
                            className="relative flex items-center justify-center group"
                        >
                            <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 transition-transform active:scale-90">
                                <div className="w-full h-full bg-white rounded-full transition-opacity group-hover:opacity-90" />
                            </div>
                        </button>

                        <button className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 opacity-50">
                            <Zap size={24} />
                        </button>
                    </div>

                    <p className="absolute bottom-32 text-white/70 text-sm font-medium tracking-wide bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
                        {t('cameraModal.helpText')}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CameraModal;