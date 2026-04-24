// src/pages/VerifyEmail.jsx
// Rota: /verify-email?token=xxx
// Esta página é aberta quando o utilizador clica no link do email

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VerifyEmail = ({ onLogin }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("bomPiteuToken", data.token);
        localStorage.setItem("bomPiteuUser", JSON.stringify(data.user));
        setStatus("success");

        setTimeout(() => {
          if (onLogin) {
            onLogin(data.user);
          }
          navigate("/", { replace: true });
        }, 2500);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Erro ao verificar email:", err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-10 w-full max-w-md text-center"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-lg">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Bom Piteu
          </h1>
        </div>

        {/* A VERIFICAR */}
        {status === "verifying" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t('verifyEmail.verifying')}</h2>
            <p className="text-gray-500 text-sm">{t('verifyEmail.pleaseWait')}</p>
          </motion.div>
        )}

        {/* SUCESSO */}
        {status === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">{t('verifyEmail.successTitle')}</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {t('verifyEmail.successMessage')}<br />
              {t('verifyEmail.redirecting')}
            </p>
            <div className="flex justify-center">
              <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
        {/* ERRO */}
        {status === "error" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">{t('verifyEmail.errorTitle')}</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {t('verifyEmail.errorMessage')}<br />
              {t('verifyEmail.errorExpiry')}
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {t('verifyEmail.backToLogin')}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;