import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userString = urlParams.get("user");

    if (token && userString) {
      localStorage.setItem("bomPiteuUserToken", token);

      try {
        const user = JSON.parse(decodeURIComponent(userString));

        // Guardar utilizador completo
        localStorage.setItem("bomPiteuUser", JSON.stringify(user));

        // Notificar App.js ou Header
        if (onLogin) onLogin(user);

        // Voltar ao dashboard
        navigate("/");
      } catch (err) {
        console.error("Erro a processar user:", err);
      }
    }
  }, []);

  return <p>Autenticando...</p>;
};

export default AuthSuccess;
