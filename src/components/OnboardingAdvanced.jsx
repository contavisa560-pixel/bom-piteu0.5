import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronRight, X } from "lucide-react";

const steps = [
  { id: 1, titleKey: "onboardingAdvanced.step1.title", descriptionKey: "onboardingAdvanced.step1.description", highlightSelector: ".bg-gradient-to-r" },
  { id: 2, titleKey: "onboardingAdvanced.step2.title", descriptionKey: "onboardingAdvanced.step2.description", highlightSelector: "#chatButton" },
  { id: 3, titleKey: "onboardingAdvanced.step3.title", descriptionKey: "onboardingAdvanced.step3.description", highlightSelector: "#cameraButton" },
  { id: 4, titleKey: "onboardingAdvanced.step4.title", descriptionKey: "onboardingAdvanced.step4.description", highlightSelector: "#voiceButton" },
  { id: 5, titleKey: "onboardingAdvanced.step5.title", descriptionKey: "onboardingAdvanced.step5.description", highlightSelector: "#daily-suggestions-section" },
];

const MARGIN = 12;
const CARD_HEIGHT = 210;

const OnboardingAdvanced = ({ onFinish, userId }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const [cardPos, setCardPos] = useState({ top: 0, left: 0, width: 360 });
  const retryRef = useRef(null);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const finish = () => {
    if (userId) localStorage.setItem(`onboardingCompleted_${userId}`, "true");
    onFinish();
  };

  const nextStep = () => (isLast ? finish() : setCurrentStep((p) => p + 1));

  const computePosition = () => {
    const el = document.querySelector(step.highlightSelector);
    if (!el) {
      retryRef.current = setTimeout(computePosition, 200);
      return;
    }

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;

    // ── Highlight (fixed coords) ──────────────────────────────────────────
    setHighlight({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });

    // ── Card sizing ───────────────────────────────────────────────────────
    // On mobile: full width minus margins. On desktop: cap at 400px.
    const cardWidth = Math.min(vw - MARGIN * 2, 400);

    // Center horizontally, clamped inside screen
    const idealLeft = (vw - cardWidth) / 2;
    const cardLeft = Math.max(MARGIN, Math.min(idealLeft, vw - cardWidth - MARGIN));

    // Vertical: prefer below the element, fall back to above
    const spaceBelow = vh - rect.bottom - pad - 12;
    const spaceAbove = rect.top - pad - 12;
    const fitsBelow = spaceBelow >= CARD_HEIGHT;
    const fitsAbove = spaceAbove >= CARD_HEIGHT;

    let cardTop;
    if (fitsBelow) {
      cardTop = rect.bottom + pad + 12;
    } else if (fitsAbove) {
      cardTop = rect.top - pad - 12 - CARD_HEIGHT;
    } else {
      // Neither fits well — anchor to bottom of viewport with margin
      cardTop = vh - CARD_HEIGHT - MARGIN;
    }

    // Clamp so card never goes off-screen vertically
    cardTop = Math.max(MARGIN, Math.min(cardTop, vh - CARD_HEIGHT - MARGIN));

    setCardPos({ top: cardTop, left: cardLeft, width: cardWidth });

    // Smooth scroll so the highlighted element is visible
    const scrollTarget = window.scrollY + rect.top - vh * 0.32;
    window.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
  };

  useEffect(() => {
    setHighlight(null);
    clearTimeout(retryRef.current);
    const timer = setTimeout(computePosition, 80);
    window.addEventListener("resize", computePosition);
    window.addEventListener("scroll", computePosition, { passive: true });
    return () => {
      clearTimeout(timer);
      clearTimeout(retryRef.current);
      window.removeEventListener("resize", computePosition);
      window.removeEventListener("scroll", computePosition);
    };
  }, [currentStep]);

  return (
    <div className="fixed inset-0" style={{ zIndex: 10000, pointerEvents: "none" }}>

      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
        style={{ background: "rgba(0,0,0,0.70)", pointerEvents: "auto" }}
        onClick={finish}
      />

      {/* ── Highlight cutout ── */}
      <AnimatePresence>
        {highlight && (
          <motion.div
            key={`hl-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: highlight.top,
              left: highlight.left,
              width: highlight.width,
              height: highlight.height,
              borderRadius: 14,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.70), 0 0 0 2.5px #f97316",
              pointerEvents: "none",
              zIndex: 10001,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Card ── */}
      <AnimatePresence mode="wait">
        {highlight && (
          <motion.div
            key={`card-${currentStep}`}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              top: cardPos.top,
              left: cardPos.left,
              width: cardPos.width,
              zIndex: 10002,
              pointerEvents: "auto",
              borderRadius: 16,
              background: "#ffffff",
              boxShadow: "0 16px 48px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Progress bar */}
            <div style={{ height: 3, background: "#f3f4f6" }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #f97316, #ef4444)",
                  borderRadius: 99,
                }}
              />
            </div>

            <div style={{ padding: "16px 18px 18px" }}>
              {/* Row: step label + close */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#f97316",
                  textTransform: "uppercase",
                }}>
                  {/* ALTERADO: remove a tradução e mostra apenas o número do passo */}
                  {`${currentStep + 1} / ${steps.length}`}
                </span>
                <button
                  onClick={finish}
                  style={{
                    width: 24, height: 24, borderRadius: 7,
                    border: "1px solid #e5e7eb",
                    background: "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#9ca3af",
                  }}
                >
                  <X size={12} />
                </button>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 7px", lineHeight: 1.35 }}>
                {t(step.titleKey)}
              </h3>

              {/* Description */}
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, margin: "0 0 16px" }}>
                {t(step.descriptionKey)}
              </p>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Step dots */}
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {steps.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === currentStep ? 16 : 5,
                        opacity: i <= currentStep ? 1 : 0.25,
                        backgroundColor: i === currentStep ? "#f97316" : "#d1d5db",
                      }}
                      transition={{ duration: 0.22 }}
                      style={{ height: 5, borderRadius: 99 }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {!isLast && (
                    <button
                      onClick={finish}
                      style={{
                        fontSize: 12.5, color: "#9ca3af",
                        background: "transparent", border: "none",
                        cursor: "pointer", padding: 0,
                      }}
                    >
                      {/* ALTERADO: usa a chave common.cancel já existente em todos os idiomas */}
                      {t("common.cancel")}
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: "linear-gradient(135deg, #f97316, #ef4444)",
                      color: "#fff", border: "none", borderRadius: 9,
                      padding: "8px 15px", fontSize: 13, fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isLast ? t("onboardingAdvanced.finish") : t("onboardingAdvanced.next")}
                    {!isLast && <ChevronRight size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingAdvanced;