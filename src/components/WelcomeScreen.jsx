import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChefHat, Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChefLoading from "./ChefLoading";
import { useTranslation, Trans } from 'react-i18next';
import i18n from '@/i18n';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── ECRÃ DE VERIFICAÇÃO DE EMAIL  ─────────────────────
const VerificationPendingScreen = ({ email, onResend, onBack }) => {
  const [oAuthMessage, setOAuthMessage] = useState("");
  const { t } = useTranslation();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend(email);
      setResent(true);
      setTimeout(() => setResent(false), 30000); // reset após 30s
    } catch { }
    setResending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="h-10 w-10 text-orange-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Verifique o seu email</h2>
      <p className="text-gray-500 mb-2 text-sm">Enviámos um link de confirmação para:</p>
      <p className="font-semibold text-gray-800 mb-6 text-sm">{email}</p>
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 text-left">
        <p className="text-sm text-gray-600 leading-relaxed">
          Clique no link no email para activar a sua conta.<br />
          <span className="text-xs text-gray-400 mt-1 block">Verifique também a pasta de spam.</span>
        </p>
      </div>
      <div className="space-y-3">
        {resent ? (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm py-2">
            <CheckCircle className="h-4 w-4" />
            <span>Email reenviado!</span>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending}
            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            {resending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reenviar email de verificação
          </Button>
        )}
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 text-gray-400 text-sm w-full hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao login
        </button>
      </div>
    </motion.div>
  );
};

// ── ECRÃ DE RECUPERAÇÃO DE PALAVRA-PASSE ─────────────────────────────────────
const ForgotPasswordScreen = ({ onBack }) => {
  const [oAuthMessage, setOAuthMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.isOAuth) {
        setOAuthMessage(data.provider); // guarda o provider (google, etc)
      }
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${oAuthMessage ? 'bg-blue-100' : 'bg-green-100'}`}>
          {oAuthMessage
            ? <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-10 h-10" />
            : <CheckCircle className="h-10 w-10 text-green-500" />
          }
        </div>

        {oAuthMessage ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Conta {oAuthMessage === 'google' ? 'Google' : oAuthMessage}
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              A conta <strong>{email}</strong> foi criada com{' '}
              <strong>{oAuthMessage === 'google' ? 'Google' : oAuthMessage}</strong>.<br /><br />
              Não precisa de palavra-passe — basta clicar em{' '}
              <strong>"Continuar com Google"</strong> no ecrã de login.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-3">Email enviado!</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Se o endereço <strong>{email}</strong> estiver registado, receberá as instruções para recuperar a sua conta em breve.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-gray-500 leading-relaxed">
                • Verifique também a pasta de spam<br />
                • O link expira em 1 hora<br />
                • Se não receber, tente novamente
              </p>
            </div>
          </>
        )}

        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 text-orange-500 text-sm w-full hover:text-orange-600 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao login
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 text-sm mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar
      </button>
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <Mail className="h-8 w-8 text-orange-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Esqueceu a palavra-passe?</h2>
      <p className="text-gray-500 text-sm mb-6 text-center">
        Introduza o seu email e enviaremos um link para criar uma nova palavra-passe.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="O seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm disabled:opacity-50"
        />
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Enviar link de recuperação
        </Button>
      </form>
    </motion.div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const WelcomeScreen = ({ onLogin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [view, setView] = useState("login"); // "login" | "register" | "verify-pending" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem('bomPiteuLanguage') || 'pt'
  );

  // Verificação automática via token na URL
  useEffect(() => {
    const verifyToken = searchParams.get("verify");
    if (verifyToken) {
      handleAutoVerify(verifyToken);
    }
    // OAuth callback
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        onLogin(user);
        localStorage.setItem("bomPiteuToken", token);
        window.history.replaceState({}, document.title, "/");
      } catch { }
    }
  }, []);

  const handleAutoVerify = async (token) => {
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
        toast({ title: " Email verificado!", description: "Bem-vindo ao Bom Piteu!" });
        onLogin(data.user);
      } else {
        toast({ title: "Link inválido", description: data.error, variant: "destructive" });
      }
    } catch { }
  };

  const handleLangChange = (code) => {
    setCurrentLang(code);
    localStorage.setItem('bomPiteuLanguage', code);
    i18n.changeLanguage(code);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Verifica se a conta está banida
        if (data.isBanned) {
          localStorage.setItem("bannedReason", data.error || data.message || "Conta banida");
          window.location.href = "/banned";
          return;
        }
        // Email não verificado — mostra ecrã de verificação pendente
        if (data.requiresVerification) {
          setPendingEmail(email);
          setView("verify-pending");
          setIsLoading(false);
          return;
        }
        toast({ title: t("welcomeScreen.error"), description: data.error || t("welcomeScreen.invalidCredentials"), variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (data.requires2FA) {
        sessionStorage.setItem('tempUserId', data.userId);
        navigate('/verify-2fa', { state: { userId: data.userId } });
        setIsLoading(false);
        return;
      }

      localStorage.setItem("bomPiteuToken", data.token);
      localStorage.setItem("bomPiteuUser", JSON.stringify(data.user));
      toast({ title: t("welcomeScreen.loginSuccess"), description: t("welcomeScreen.welcomeBack") });
      setTimeout(() => { setIsLoading(false); onLogin(data.user); }, 1200);
    } catch (err) {
      setIsLoading(false);
      toast({ title: t("welcomeScreen.networkError"), description: t("welcomeScreen.serverOffline"), variant: "destructive" });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: t("welcomeScreen.error"), description: data.error || t("welcomeScreen.registrationFailed"), variant: "destructive" });
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      // Se backend enviar requiresVerification, mostrar ecrã de espera
      if (data.requiresVerification) {
        setPendingEmail(email);
        setView("verify-pending");
        toast({ title: " Verifique o seu email", description: "Enviámos um link de confirmação." });
      } else {
        // Registo sem verificação (OAuth, etc.)
        localStorage.setItem("bomPiteuToken", data.token);
        localStorage.setItem("bomPiteuUser", JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch (err) {
      setIsLoading(false);
      toast({ title: t("welcomeScreen.error"), description: t("welcomeScreen.connectionFailed"), variant: "destructive" });
    }
  };

  const handleResendVerification = async (email) => {
    const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Falhou");
  };

  const isRegister = view === "register";

  return (
    <>
      {isLoading && <ChefLoading message={isRegister ? t("welcomeScreen.creatingAccount") : t("welcomeScreen.loggingIn")} />}

      <div className="fixed inset-0 flex flex-col items-center justify-center text-center px-4 overflow-auto bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: isLoading ? 0.3 : 1, scale: isLoading ? 0.97 : 1 }}
          transition={{ duration: 0.25 }}
          className={`bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-w-md w-full transition-all ${isLoading ? 'pointer-events-none' : ''}`}
        >
          <AnimatePresence mode="wait">
            {/* VERIFY PENDING */}
            {view === "verify-pending" && (
              <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <VerificationPendingScreen
                  email={pendingEmail}
                  onResend={handleResendVerification}
                  onBack={() => setView("login")}
                />
              </motion.div>
            )}

            {/* FORGOT PASSWORD */}
            {view === "forgot" && (
              <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ForgotPasswordScreen onBack={() => setView("login")} />
              </motion.div>
            )}

            {/* LOGIN / REGISTER */}
            {(view === "login" || view === "register") && (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Logo */}
                <div className="mx-auto bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-5 shadow-lg">
                  <ChefHat className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-5">
                  {isRegister ? t("welcomeScreen.createAccount") : t("welcomeScreen.welcome")}
                </h1>

                {/* Formulário */}
                <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3 text-left">
                  {isRegister && (
                    <input
                      type="text"
                      placeholder={t("welcomeScreen.fullNamePlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm disabled:opacity-50"
                    />
                  )}
                  <input
                    type="email"
                    placeholder={t("welcomeScreen.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm disabled:opacity-50"
                  />
                  <input
                    type="password"
                    placeholder={t("welcomeScreen.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm disabled:opacity-50"
                  />

                  {/* Esqueceu a palavra-passe */}
                  {!isRegister && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs text-orange-500 hover:text-orange-600 hover:underline transition-colors"
                      >
                        {t('welcomeScreen.forgotPassword')}
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 mt-1"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("welcomeScreen.processing")}
                      </span>
                    ) : (
                      isRegister ? t("welcomeScreen.createAccountButton") : t("welcomeScreen.loginButton")
                    )}
                  </Button>
                </form>

                {/* Google OAuth */}
                {!isRegister && (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span>{t("welcomeScreen.or")}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <Button
                      onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`)}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-xl shadow-sm text-sm disabled:opacity-50"
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                      {t("welcomeScreen.continueWithGoogle")}
                    </Button>
                  </div>
                )}

                {/* Trocar entre login/registo */}
                <p className="text-xs text-gray-600 mt-4">
                  {isRegister ? (
                    <Trans i18nKey="welcomeScreen.alreadyHaveAccount">
                      Já tens conta? <button onClick={() => setView("login")} disabled={isLoading} className="text-orange-600 hover:underline font-medium">Inicia Sessão</button>
                    </Trans>
                  ) : (
                    <Trans i18nKey="welcomeScreen.noAccount">
                      Não tens conta? <button onClick={() => setView("register")} disabled={isLoading} className="text-orange-600 hover:underline font-medium">Cria Conta</button>
                    </Trans>
                  )}
                </p>

                {/* Links legais */}
                <div className="mt-5 text-xs text-gray-400 text-center">
                  <div className="flex justify-center gap-3 flex-wrap">
                    <button onClick={() => navigate("/terms")} className="hover:text-orange-500 transition-colors">{t("welcomeScreen.terms")}</button>
                    <span>·</span>
                    <button onClick={() => navigate("/privacy")} className="hover:text-orange-500 transition-colors">{t("welcomeScreen.privacy")}</button>
                    <span>·</span>
                    <button onClick={() => navigate("/cookies")} className="hover:text-orange-500 transition-colors">{t("welcomeScreen.cookies")}</button>
                  </div>
                  <p className="mt-2 text-gray-300">{t("welcomeScreen.copyright", { year: new Date().getFullYear() })}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default WelcomeScreen;