import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const AuthSuccess = ({ onLogin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userString = urlParams.get("user");

    if (token && userString) {
      // guardar em duas chaves para compatibilidade com componentes existentes
      localStorage.setItem("bomPiteuUserToken", token);
      localStorage.setItem("token", token);

      try {
        const user = JSON.parse(decodeURIComponent(userString));
        localStorage.setItem("bomPiteuUser", JSON.stringify(user));
        if (onLogin) onLogin(user);
        navigate("/");
      } catch (err) {
        console.error("Erro a processar user:", err);
      }
    }
  }, [onLogin, navigate]);

  return <p>{t('authSuccess.authenticating')}</p>;
};

export default AuthSuccess;