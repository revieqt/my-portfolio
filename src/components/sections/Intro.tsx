"use client";

import { useEffect, useState } from "react";

const stages = {
  loading: "loading",
  entering: "entering",
  glow: "glow",
  fadeout: "fadeout",
  done: "done",
} as const;

type Stage = (typeof stages)[keyof typeof stages];

export default function Intro() {
  const [stage, setStage] = useState<Stage>(stages.loading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onPageLoad = () => {
      window.setTimeout(() => setStage(stages.entering), 0);
    };
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad, { once: true });
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  useEffect(() => {
    if (stage === stages.entering) {
      const t = window.setTimeout(() => setStage(stages.glow), 0);
      return () => window.clearTimeout(t);
    }
    if (stage === stages.glow) {
      const t = window.setTimeout(() => setStage(stages.fadeout), 6000);
      return () => window.clearTimeout(t);
    }
    if (stage === stages.fadeout) {
      const t = window.setTimeout(() => setStage(stages.done), 1000);
      return () => window.clearTimeout(t);
    }
  }, [stage]);

  if (stage === stages.done) return null;

  const isLoading  = stage === stages.loading;
  const isEntering = stage === stages.entering;
  const isGlowing  = stage === stages.glow;
  const isFadingOut = stage === stages.fadeout;

  const handsVisible = !isLoading && mounted;
  const showGlow = isGlowing || isFadingOut;
  const adamOffset = handsVisible && isEntering ? "-100vw"  : "-27vw";
  const godOffset  = handsVisible && isEntering ? "+100vw"  : "+27vw";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#020617",
        color: "white",
        opacity: isFadingOut ? 0 : 1,
        transition: isFadingOut ? "opacity 1s ease-in-out" : "none",
      }}
    >
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(2,6,23,0.95)",
        backdropFilter: "blur(4px)",
      }} />

      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {isLoading ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            textAlign: "center",
          }}>
            <div style={{
              position: "relative",
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "4px solid transparent",
                borderTopColor: "white",
                animation: "spin 1s linear infinite",
              }} />
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "white" }} />
            </div>
          </div>
        ) : (
          <div style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            {/* Adam — LEFT hand, starts off LEFT edge, moves RIGHT toward center */}
            <img
              src="/hero-assets/adam.png"
              alt="Adam's hand"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "50vw",
                height: "auto",
                maxWidth: "none",
                transform: `translate(calc(-50% + ${adamOffset}), -50%)`,
                transition: "transform 3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)",
                willChange: "transform",
              }}
              loading="eager"
            />
            {/* God — RIGHT hand, starts off RIGHT edge, moves LEFT toward center */}
            <img
              src="/hero-assets/god.png"
              alt="God's hand"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "50vw",
                height: "auto",
                maxWidth: "none",
                transform: `translate(calc(-50% + ${godOffset}), -50%)`,
                transition: "transform 3.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)",
                willChange: "transform",
              }}
              loading="eager"
            />
          </div>
        )}
      </div>

      {showGlow && (
        <div style={{
          position: "absolute",
          inset: "-50%",
          pointerEvents: "none",
          zIndex: 50,
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.15) 65%, rgba(255,255,255,0) 80%)",
          animation: isGlowing ? "softGlow 6s ease-in-out forwards" : "none",
          opacity: isFadingOut ? 1 : undefined,
          transform: isFadingOut ? "scale(1)" : undefined,
        }} />
      )}

      {/* Vignette Overlay */}
        <div
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 40, // below glow (50), above everything else
            background: `
            radial-gradient(
                ellipse at center,
                rgba(0,0,0,0) 35%,
                rgba(0,0,0,0.40) 55%,
                rgba(0,0,0,0.70) 78%,
                rgba(0,0,0,1) 100%
            )
            `,
        }}
        />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes softGlow {
          0%   { opacity: 0; transform: scale(0); }
          40%  { opacity: 0; transform: scale(0.1); }
          60%  { opacity: 0.2; transform: scale(0.4); }
          80%  { opacity: 0.4; transform: scale(0.7); }
          90%  { opacity: 0.8; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}