import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeScreen = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // ✅ CORRIGIDO: Porta 5000 + proxy
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (token && userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      onLogin(user);
      localStorage.setItem("bomPiteuToken", token); // nome correto
      window.history.replaceState({}, document.title, "/");
    }
  }, [onLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ✅ CORRIGIDO: URL SEM // dupla
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erro",
          description: data.error || "Credenciais inválidas",
          variant: "destructive",
        });
        return;
      }

      // ✅ SÓ AQUI (dentro do try, após sucesso)
      localStorage.setItem("bomPiteuToken", data.token);
      localStorage.setItem("bomPiteuUser", JSON.stringify(data.user));
      
      toast({ title: "Login efetuado", description: "Bem-vindo!" });
      onLogin(data.user);

    } catch (err) {
      toast({
        title: "Erro de rede",
        description: "Servidor offline.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // ✅ CORRIGIDO: URL SEM // dupla
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erro",
          description: data.error || "Falha no registo",
          variant: "destructive",
        });
        return;
      }

      // ✅ SÓ AQUI (dentro do try, após sucesso)
      localStorage.setItem("bomPiteuToken", data.token);
      localStorage.setItem("bomPiteuUser", JSON.stringify(data.user));

      toast({
        title: "Conta criada",
        description: "Sessão iniciada automaticamente!",
      });

      onLogin(data.user);

    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível conectar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-w-lg w-full"
      >
        <div className="mx-auto bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-lg">
          <ChefHat className="h-12 w-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
          {isRegister ? "Criar Conta" : "Bem-vindo ao Bom Piteu!"}
        </h1>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4 text-left">
          {isRegister && (
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
          />
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg">
            {isRegister ? "Criar Conta" : "Iniciar Sessão"}
          </Button>
        </form>
        {/* 🔸 Login Social */}
        {!isRegister && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="flex-1 h-px bg-gray-200" />
              <span>ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Button
              onClick={() =>
                (window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`)
              }
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium py-3 rounded-xl shadow-sm transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continuar com Google
            </Button>
          </div>
        )}

        <p className="text-sm text-gray-700 mt-4">
          {isRegister ? (
            <>
              Já tens conta?{" "}
              <button onClick={() => setIsRegister(false)} className="text-orange-600 hover:underline">
                Inicia Sessão
              </button>
            </>
          ) : (
            <>
              Não tens conta?{" "}
              <button onClick={() => setIsRegister(true)} className="text-orange-600 hover:underline">
                Cria Conta
              </button>
            </>
          )}
        </p>
        <div className="mt-8 text-xs text-gray-500 text-center">
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/terms")}
              className="hover:text-orange-600 transition"
            >
              Termos de Uso
            </button>

            <span>•</span>

            <button
              onClick={() => navigate("/privacy")}
              className="hover:text-orange-600 transition"
            >
              Política de Privacidade
            </button>

            <span>•</span>

            <button
              onClick={() => navigate("/cookies")}
              className="hover:text-orange-600 transition"
            >
              Cookies
            </button>

          </div>

          <p className="mt-3 text-gray-400">
            © {new Date().getFullYear()} Bom Piteu. Todos os direitos reservados.
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default WelcomeScreen;