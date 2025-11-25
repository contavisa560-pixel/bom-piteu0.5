import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const AuthSuccess = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (!token || !userParam) {
      console.error("❌ Nenhum token encontrado!");
      toast({
        title: "Erro",
        description: "Falha na autenticação social",
        variant: "destructive",
      });
      navigate("/", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      console.log("✅ Login social bem-sucedido:", user);

      localStorage.setItem("bomPiteuUser", JSON.stringify(user));
      localStorage.setItem("bomPiteuToken", token);

      toast({
        title: `Bem-vindo(a), ${user.name || "Chef"}! 🍳`,
        description: `Autenticado via ${user.provider || "Conta"}.`,
      });

      if (onLogin) onLogin(user);
      navigate("/", { replace: true }); // volta ao app, que abrirá o dashboard
    } catch (err) {
      console.error("❌ Erro ao processar utilizador:", err);
      toast({
        title: "Erro",
        description: "Dados inválidos recebidos do servidor",
        variant: "destructive",
      });
      navigate("/", { replace: true });
    }
  }, [navigate, onLogin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <h2 className="text-3xl font-bold text-orange-600 mb-2">A autenticar...</h2>
      <p className="text-gray-600">Por favor aguarde 🍳</p>
    </div>
  );
};

export default AuthSuccess;
