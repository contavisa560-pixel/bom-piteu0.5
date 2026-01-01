import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";

import Header from "@/components/Header";
import ChatBot from "@/components/ChatBot";
import RecipeDisplay from "@/components/RecipeDisplay";
import { Toaster } from "@/components/ui/toaster";
import WelcomeScreen from "@/components/WelcomeScreen";
import ProfileSetup from "@/components/ProfileSetup";
import Dashboard from "@/components/Dashboard";
import UserProfile from "@/components/UserProfile";
import Subscription from "@/components/Subscription";
import Marketplace from "@/components/Marketplace";
import ImageRecognition from "@/components/ImageRecognition";
import VoiceRecognition from "@/components/VoiceRecognition";
import InternationalRecipes from "@/components/InternationalRecipes";
import "./checkEnv.js";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import TermsOfUse from "@/pages/legal/TermsOfUse";
import CookiesPolicy from "@/pages/legal/CookiesPolicy";
import CommunityGuidelines from "@/pages/legal/CommunityGuidelines";
import PaymentsPolicy from "@/pages/legal/PaymentsPolicy";
import Support from "@/pages/legal/Support";
import DataDeletion from "@/pages/legal/DataDeletion";
import About from "./pages/legal/About";
import Partnerships from "./pages/legal/Partnerships";
import LegalCentral from "./pages/legal/LegalCentral";


function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("welcome");
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ✅ 1. Processar Login Google/OAuth vindo da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (token) {
      localStorage.setItem("bomPiteuToken", token);

      if (userParam) {
        try {
          const decodedUser = JSON.parse(decodeURIComponent(userParam));

          // Salva no storage e atualiza estado imediatamente
          localStorage.setItem("bomPiteuUser", JSON.stringify(decodedUser));
          setUser(decodedUser);
          setCurrentView("dashboard");

          // Limpa a URL para segurança
          navigate("/", { replace: true });
        } catch (err) {
          console.error("Erro ao processar dados do utilizador:", err);
        }
      }
    }
  }, [location, navigate]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");

    if (userId && window.location.pathname.includes("set-password")) {
      setUserIdForPassword(userId); // Você precisaria criar esse estado: const [userIdForPassword, setUserIdForPassword] = useState(null);
      setCurrentView("setPassword");
    }
  }, [location]);


  // ✅ 2. Carregar sessão existente do LocalStorage (Persistência)
  useEffect(() => {
    const storedUser = localStorage.getItem("bomPiteuUser");
    const storedToken = localStorage.getItem("bomPiteuToken");

    // Se temos usuário e token, e não estamos no meio de um processo de login da URL
    const params = new URLSearchParams(window.location.search);
    if (storedUser && storedToken && !params.get("token")) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setCurrentView("dashboard");
      } catch (err) {
        console.error("Erro ao recuperar sessão:", err);
      }
    }
  }, []);

  // ✅ 3. Sincronização de eventos customizados
  useEffect(() => {
    const syncUser = (e) => {
      setUser(e.detail);
    };
    window.addEventListener("user_updated", syncUser);
    return () => window.removeEventListener("user_updated", syncUser);
  }, []);

  // ✅ Funções utilitárias
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("bomPiteuUser", JSON.stringify(updatedUser));
  };

  const handleLogin = (profile) => {
    const newUser = {
      ...profile,
      level: 1,
      points: 0,
      favorites: [],
      isPremium: false,
      foodProfile: [],
      age: "",
      bloodType: "A+",
      country: "AO",
      language: "pt",
      interests: [],
    };
    localStorage.setItem("bomPiteuUser", JSON.stringify(newUser));
    setUser(newUser);
    setCurrentView("dashboard");
  };

  const handleProfileSave = (profileData) => {
    updateUser(profileData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("bomPiteuUser");
    localStorage.removeItem("bomPiteuToken");
    setUser(null);
    setCurrentView("welcome");
    navigate("/", { replace: true });
  };

  const handleNavigate = (view) => {
    setCurrentRecipe(null);
    setCurrentView(view);
  };

  const handleRecipeGenerated = (recipe) => {
    updateUser({ points: (user?.points || 0) + 25 });
    setCurrentRecipe(recipe);
    setCurrentView("recipe");
  };

  const handleToggleFavorite = (recipeTitle) => {
    if (!user) return false;
    const isFavorite = user.favorites?.includes(recipeTitle);
    const updatedFavorites = isFavorite
      ? user.favorites.filter((fav) => fav !== recipeTitle)
      : [...(user.favorites || []), recipeTitle];
    updateUser({ favorites: updatedFavorites });
    return !isFavorite;
  };

  const renderContent = () => {
    switch (currentView) {
      case "welcome": return <WelcomeScreen onLogin={handleLogin} onNavigate={handleNavigate} />;
      case "profileSetup": return <ProfileSetup onSave={handleProfileSave} user={user} onNavigate={handleNavigate} />;
      case "chat": return <ChatBot selectedCategory={selectedCategory} onRecipeGenerated={handleRecipeGenerated} onBack={() => handleNavigate("dashboard")} user={user} />;
      case "recipe": return <RecipeDisplay recipe={currentRecipe} onBack={() => handleNavigate("dashboard")} user={user} onToggleFavorite={handleToggleFavorite} />;
      case "profile": return <UserProfile user={user} onNavigate={handleNavigate} />;
      case "subscription": return <Subscription user={user} onSubscribe={(plan) => { updateUser({ isPremium: plan !== "free" }); handleNavigate("dashboard"); }} onNavigate={handleNavigate} />;
      case "marketplace": return <Marketplace onNavigate={handleNavigate} />;
      case "imageRecognition": return <ImageRecognition onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} user={user} />;
      case "voiceRecognition": return <VoiceRecognition onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} user={user} />;

      case "internationalRecipes": return <InternationalRecipes onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} />;
      case "dashboard":
      default: return <Dashboard onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Bom Piteu! - A tua Cozinha Inteligente</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        {user && currentView !== "welcome" && currentView !== "chat" && (
          <Header user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
        )}
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

              {/* ================= CENTRAL LEGAL ================= */}
              <Route path="/legal" element={<LegalCentral />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/cookies" element={<CookiesPolicy />} />
              <Route path="/community" element={<CommunityGuidelines />} />
              <Route path="/payments" element={<PaymentsPolicy />} />
              <Route path="/support" element={<Support />} />
              <Route path="/data-deletion" element={<DataDeletion />} />
              <Route path="/about" element={<About />} />
              <Route path="/partnerships" element={<Partnerships />} />
              


              {/* ================= APP NORMAL ================= */}
              <Route
                path="*"
                element={
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {renderContent()}
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>

        </main>
        <Toaster />
      </div>
    </>
  );
}

export default App;