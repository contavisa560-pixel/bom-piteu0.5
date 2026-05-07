import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import PaymentPage from '@/components/PaymentPage';
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
import * as settingsApi from '@/services/settingsApi';
import { useSettings } from '@/hooks/useSettings';
import MeuCantoDeSaude from '@/components/MeuCantoDeSaude';
import ObservacoesPessoais from '@/components/ObservacoesPessoais';
import AlimentacaoInfantil from '@/components/AlimentacaoInfantil';
import AlimentacaoSenior from '@/components/AlimentacaoSenior';
import Verify2FA from './components/Verify2FA';
import PetiscosPage from '@/components/Petiscospage';
import CocktailsPage from './components/CocktailsPage';
import NotificationsPage from './components/Notifications/NotificationsPage';
import DocesPage from './components/DocesPage';
import ResetPassword from '@/pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import { ChatProvider } from '@/context/ChatContext';
import { Toaster as HotToaster } from 'react-hot-toast';
import CookieBanner from '@/components/CookieBanner';
import AdminPanel from "./components/AdminPanel";
import AdminRoute from "./components/AdminRoute";
import BannedScreen from "./components/BannedScreen";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
window.getSettings = settingsApi.getSettings;
window.saveSettings = settingsApi.saveSettings;
window.updateSettingField = settingsApi.updateSettingField;
window.syncSettings = settingsApi.syncSettings;

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("welcome");
  const [navParams, setNavParams] = useState({});
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- Sincronização com Backend ---
  const syncWithBackend = async (userId, updatedData) => {
    const token = localStorage.getItem("bomPiteuToken");
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Erro ao salvar no servidor");
      const data = await response.json();
      console.log(" Sincronizado com Atlas:", data);
    } catch (err) {
      console.error(" Erro ao sincronizar com backend:", err);
    }
  };

  const updateUser = async (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("bomPiteuUser", JSON.stringify(updatedUser));
    const userId = user?.id || user?._id;
    if (userId) await syncWithBackend(userId, updatedData);
  };

  // Processar login OAuth da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userParam = params.get("user");
    if (token) {
      localStorage.setItem("bomPiteuToken", token);
      if (userParam) {
        try {
          const decodedUser = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem("bomPiteuUser", JSON.stringify(decodedUser));
          setUser(decodedUser);
          setCurrentView("dashboard");
          navigate("/", { replace: true });
        } catch (err) {
          console.error("Erro ao processar dados do utilizador:", err);
        }
      }
    }
  }, [location, navigate]);

  // Persistência da sessão
  useEffect(() => {
    const storedUser = localStorage.getItem("bomPiteuUser");
    const storedToken = localStorage.getItem("bomPiteuToken");
    const params = new URLSearchParams(window.location.search);
    if (storedUser && storedToken && !params.get("token")) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setCurrentView("dashboard");
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
          .then(r => r.json())
          .then(data => {
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem("bomPiteuUser", JSON.stringify(data.user));
            }
          })
          .catch(() => {});
      } catch (err) {
        console.error("Erro ao recuperar sessão:", err);
      }
    }
  }, []);

  const handleLogin = (profile) => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('smartchef_theme');
    const newUser = {
      level: 1,
      points: 0,
      favorites: [],
      foodProfile: [],
      age: "",
      bloodType: "A+",
      country: "AO",
      language: "pt",
      ...profile,
    };
    localStorage.setItem("bomPiteuUser", JSON.stringify(newUser));
    setUser(newUser);
    setCurrentView("dashboard");
  };

  const handleProfileSave = async (profileData) => {
    await updateUser(profileData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem("bomPiteuUser");
    localStorage.removeItem("bomPiteuToken");
    setUser(null);
    setCurrentView("welcome");
    navigate("/", { replace: true });
  };

  const handleNavigate = (view, params = {}) => {
    setCurrentRecipe(null);
    setCurrentView(view);
    setNavParams(params);
  };

  const handleRecipeGenerated = (recipe) => {
    if (recipe?.source === 'meu-canto-saude' || recipe?.preventRecipeDisplay) {
      updateUser({ points: (user?.points || 0) + 25 });
      return;
    }
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

  useEffect(() => {
    const handleNavigateEvent = (event) => handleNavigate(event.detail);
    window.addEventListener('navigate-to', handleNavigateEvent);
    return () => window.removeEventListener('navigate-to', handleNavigateEvent);
  }, []);

  useEffect(() => {
    const checkBanStatus = async () => {
      const token = localStorage.getItem("bomPiteuToken");
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 403) {
          const data = await response.json();
          if (data.isBanned) {
            localStorage.setItem("bannedReason", data.error || data.message || "Conta banida");
            localStorage.removeItem("bomPiteuToken");
            localStorage.removeItem("bomPiteuUser");
            window.location.href = "/banned";
          }
        }
      } catch (error) {
        console.error("Erro ao verificar banimento:", error);
      }
    };
    checkBanStatus();
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case "welcome": return <WelcomeScreen onLogin={handleLogin} onNavigate={handleNavigate} />;
      case "profileSetup": return <ProfileSetup onSave={handleProfileSave} user={user} onNavigate={handleNavigate} />;
      case "chat": return <ChatBot selectedCategory={selectedCategory} onRecipeGenerated={handleRecipeGenerated} onBack={() => handleNavigate("dashboard")} onNavigate={handleNavigate} user={user} />;
      case "recipe": return <RecipeDisplay recipe={currentRecipe} onBack={() => handleNavigate("dashboard")} user={user} onToggleFavorite={handleToggleFavorite} />;
      case "profile":
      case "userProfile": return <UserProfile user={user} onNavigate={handleNavigate} initialTab={navParams.initialTab} />;
// App.jsx — actualizar o handler
case "subscription": return <Subscription 
  user={user} 
  onSubscribe={(plan, updatedUser) => {
    // Se vier utilizador actualizado do backend, usa esse
    if (updatedUser) {
      updateUser(updatedUser);
    } else {
      updateUser({ isPremium: plan !== "free" });
    }
    handleNavigate("dashboard");
  }} 
  onNavigate={handleNavigate} 
/>;
      case "marketplace": return <Marketplace onNavigate={handleNavigate} />;
      case "imageRecognition": return <ImageRecognition onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} user={user} />;
      case "voiceRecognition": return <VoiceRecognition onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} user={user} />;
      case "internationalRecipes": return <InternationalRecipes onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} />;
      case "petiscos": return <PetiscosPage onStartChat={(cat) => { setSelectedCategory(cat); handleNavigate("chat"); }} onNavigate={handleNavigate} />;
      case 'cocktails': return <CocktailsPage onStartChat={(cat) => { setSelectedCategory(cat); handleNavigate("chat"); }} onNavigate={handleNavigate} />;
      case 'doces': return <DocesPage onStartChat={(cat) => { setSelectedCategory(cat); handleNavigate("chat"); }} onNavigate={handleNavigate} />;
      case "meuCantoDeSaude": return <MeuCantoDeSaude onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} user={user} />;
      case "observacoesPessoais": return <ObservacoesPessoais onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory({ ...category, source: category.mode }); handleNavigate("chat"); }} user={user} />;
      case "alimentacaoInfantil": return <AlimentacaoInfantil onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} />;
      case "alimentacaoSenior": return <AlimentacaoSenior onNavigate={handleNavigate} onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} />;
      case "payment": return <PaymentPage user={user} plan={navParams} onNavigate={handleNavigate} onSubscribe={(plan) => { updateUser({ isPremium: plan !== "free" }); }} />;
      case "notifications": return <NotificationsPage onNavigate={handleNavigate} />;
      case "dashboard":
      default: return <Dashboard onStartChat={(category) => { setSelectedCategory(category); handleNavigate("chat"); }} onNavigate={handleNavigate} user={user} />;
    }
  };

  const legalPaths = [
    '/privacy', '/terms', '/cookies', '/support', '/about',
    '/community', '/payments', '/data-deletion', '/partnerships',
    '/legal', '/verify-2fa', '/reset-password', '/verify-email', '/banned'
  ];
  const isLegalPage = legalPaths.includes(location.pathname);
  const showHeader = user && 
    currentView !== "welcome" && 
    currentView !== "chat" && 
    currentView !== "profile" && 
    !isLegalPage;
const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <Helmet>
          <title>Bom Piteu! - A tua Cozinha Inteligente</title>
        </Helmet>

        <Routes>
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*" element={
            <div className={`min-h-screen ${
              currentView === 'welcome'
                ? 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'
                : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:bg-gray-900'
            }`}>
              {/* HEADER CONDICIONAL - não aparece nas páginas legais */}
              {showHeader && (
                <Header user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
              )}
              <main className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
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
                    <Route path="/verify-2fa" element={<Verify2FA onLogin={handleLogin} />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail onLogin={handleLogin} />} />
                    <Route path="/banned" element={<BannedScreen onLogout={() => { window.location.href = "/"; }} />} />
                    <Route path="*" element={
                      <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                      >
                        {renderContent()}
                      </motion.div>
                    } />
                  </Routes>
                </AnimatePresence>
              </main>
              <Toaster />
              <HotToaster position="top-right" />
              <CookieBanner onNavigate={handleNavigate} />
            </div>
          } />
        </Routes>
      </ChatProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;