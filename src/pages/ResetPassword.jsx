// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next"; // <-- adicionado

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ResetPassword = () => {
  const { t } = useTranslation(); // <-- adicionado
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("validating"); // validating | valid | invalid | success
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`);
      const data = await res.json();
      if (data.valid) {
        setUserEmail(data.email);
        setStatus("valid");
      } else {
        setStatus("invalid");
      }
    } catch {
      setStatus("invalid");
    }
  };

  const validate = () => {
    const errs = {};
    if (password.length < 6) errs.password = t("resetPassword.errorMinLength"); // <-- traduzido
    if (password !== confirm) errs.confirm = t("resetPassword.errorMismatch"); // <-- traduzido
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        if (data.expired) {
          setStatus("invalid");
        } else {
          toast({ title: t("resetPassword.errorTitle"), description: data.error, variant: "destructive" }); // <-- traduzido
        }
      }
    } catch {
      toast({ title: t("resetPassword.errorConnection"), description: t("resetPassword.errorConnectionDesc"), variant: "destructive" }); // <-- traduzido
    } finally {
      setLoading(false);
    }
  };

  if (status === "validating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("resetPassword.validating")}</p> {/* traduzido */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-lg">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Bom Piteu
          </h1>
        </div>

        {/* LINK INVÁLIDO */}
        {status === "invalid" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t("resetPassword.invalidTitle")}</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {t("resetPassword.invalidDesc")}
            </p>
            <Button onClick={() => navigate("/?forgot=true")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              {t("resetPassword.requestNew")}
            </Button>
          </div>
        )}

        {/* FORMULÁRIO */}
        {status === "valid" && (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">{t("resetPassword.newPassword")}</h2>
            {userEmail && (
              <p className="text-xs text-gray-400 text-center mb-6">
                {t("resetPassword.forAccount")} <strong>{userEmail}</strong>
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={t("resetPassword.newPasswordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required minLength={6}
                    className={`w-full border rounded-lg p-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={`w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${errors.confirm ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
              </div>

              {/* Indicador de força */}
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length >= i * 2
                        ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-400'
                        : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {password.length === 0 ? '' : password.length < 6 ? t("resetPassword.strengthWeak") : password.length < 8 ? t("resetPassword.strengthFair") : password.length < 12 ? t("resetPassword.strengthGood") : t("resetPassword.strengthStrong")}
                </p>
              </div>

              <Button type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 disabled:opacity-50">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("resetPassword.saving")}</> : t("resetPassword.saveButton")}
              </Button>
            </form>
          </>
        )}

        {/* SUCESSO */}
        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t("resetPassword.successTitle")}</h2>
            <p className="text-gray-500 text-sm mb-6">
              {t("resetPassword.successDesc")}
            </p>
            <Button onClick={() => navigate("/")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              {t("resetPassword.goToLogin")}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;