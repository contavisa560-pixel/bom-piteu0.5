import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const WelcomeScreen = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error || "Credenciais inválidas", variant: "destructive" });
        return;
      }
      toast({ title: "Login efetuado", description: "Bem-vindo" });
      onLogin(data.user);
    } catch (err) {
      toast({ title: "Erro de rede", description: "Servidor offline.", variant: "destructive" });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error || "Falha no registo", variant: "destructive" });
        return;
      }
      toast({ title: "Conta criada com sucesso", description: "Sessão iniciada automaticamente." });
      onLogin(data.user);
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível conectar.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full"
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
          <div className="mt-6 space-y-3">
            <p className="text-gray-700 text-center font-semibold">ou continua com</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Continuar com Google
              </Button>


              <Button
                onClick={() => window.location.href = "http://localhost:4000/auth/facebook"}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white"
              >
                Continuar com Facebook
              </Button>

              <Button
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/instagram`}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white"
              >
                Continuar com Instagram
              </Button>


              <Button
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/tiktok`}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                Continuar com TikTok
              </Button>

            </div>
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
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;