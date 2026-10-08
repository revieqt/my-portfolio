/**
 * Hero.tsx
 *
 * Portfolio hero with a 3D bust (public/assets/glb/josh_bust.glb) that turns to
 * face the mouse cursor on desktop, or follows device tilt on mobile.
 *
 * Install:
 *   npm i three @react-three/fiber @react-three/drei
 *   npm i -D @types/three
 *   (React 18 -> @react-three/fiber@8 + @react-three/drei@9)
 *   (React 19 -> @react-three/fiber@9 + @react-three/drei@10)
 *
 * Usage (Home.tsx):
 *   import Hero from "../components/Hero";
 *   <Hero />
 *
 * Fonts: the design looks best with "Space Grotesk". Add it to your index.html
 * (Google Fonts) or leave it out; the stack falls back to Inter / system-ui.
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const DEFAULT_MODEL_URL = "/assets/glb/josh_bust.glb";

/** Max rotation of the bust in radians (yaw = left/right, pitch = up/down). */
const MAX_YAW = 0.38; // ~22°
const MAX_PITCH = 0.12; // ~7°

/**
 * Resting pose (no mouse / no tilt): positive = leans forward / looks down.
 * The scan tends to look slightly upward, so this corrects it.
 * Tweak: 0.06 = subtle, 0.1 = default, 0.16 = strong lean.
 */
const BASE_PITCH = 0.1; // ~6°

/** How many degrees of phone tilt equal "full" tilt on mobile. */
const TILT_RANGE_DEG = 28;

/** Higher = snappier follow, lower = floatier. */
const FOLLOW_SPEED = 4;

/** Intro: the bust slides up from below the screen (seconds). */
const INTRO_DURATION = 2.4;
const INTRO_DELAY = 0.15;

/**
 * Stacked (single column) layout for phones and portrait tablets.
 * Used by both CSS and JS so the 3D framing always matches the layout.
 */
const STACKED_QUERY = "(max-width: 767px), (max-width: 1023px) and (orientation: portrait)";

/* -------------------------------------------------------------------------- */
/*  Types & defaults                                                          */
/* -------------------------------------------------------------------------- */

type SocialKey = "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "github";

interface Social {
  name: SocialKey;
  href: string;
}

export interface HeroProps {
  /** First name shown in the headline: "I'm {name}, a" */
  name?: string;
  /** Role shown on the second headline line. */
  role?: string;
  /** Short paragraph under the headline. */
  intro?: string;
  about?: { text: string; href: string };
  work?: { text: string; href: string };
  socials?: Social[];
  /** Subtract a header height from the hero, e.g. 64 or "4rem". Defaults to Layout's measured header height. */
  headerOffset?: number | string;
  /** Override the GLB path if you move the file. */
  modelUrl?: string;
}

const DEFAULT_SOCIALS: Social[] = [
  { name: "facebook", href: "#" },
  { name: "twitter", href: "#" },
  { name: "instagram", href: "#" },
  { name: "linkedin", href: "#" },
  { name: "youtube", href: "#" },
  { name: "github", href: "#" },
];

type Tilt = { x: number; y: number }; // both in [-1, 1]

/* -------------------------------------------------------------------------- */
/*  Small hooks                                                               */
/* -------------------------------------------------------------------------- */

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Lets us pause the WebGL loop while the hero is scrolled out of view. */
function useInView(ref: { current: Element | null }) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Normalised tilt target shared with the 3D scene through a ref
 * (no React re-renders while the pointer moves).
 *
 *  - Desktop: mouse position across the window.
 *  - Mobile:  device orientation (gamma = left/right, beta = front/back),
 *             measured relative to how the phone is being held.
 *  - iOS needs a user tap to grant motion access, so we expose
 *    `needsPermission` + `requestPermission` for a small button.
 */
function useTilt() {
  const tilt = useRef<Tilt>({ x: 0, y: 0 });
  const usingOrientation = useRef(false);
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  const onOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;
    usingOrientation.current = true;

    // The first reading is "neutral"; it then drifts slowly toward the current
    // pose so the bust re-centres if you change how you hold the phone.
    if (!baseline.current) baseline.current = { beta: e.beta, gamma: e.gamma };
    const b = baseline.current;
    b.beta += (e.beta - b.beta) * 0.015;
    b.gamma += (e.gamma - b.gamma) * 0.015;

    tilt.current.x = clamp((e.gamma - b.gamma) / TILT_RANGE_DEG, -1, 1);
    tilt.current.y = clamp((e.beta - b.beta) / TILT_RANGE_DEG, -1, 1);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || usingOrientation.current) return;
      tilt.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      tilt.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      if (usingOrientation.current) return;
      tilt.current.x = 0;
      tilt.current.y = 0;
    };
    const resetBaseline = () => {
      baseline.current = null;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("orientationchange", resetBaseline);

    // Only touch devices should use motion sensors (laptops report them too).
    const DOE = (window as any).DeviceOrientationEvent;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && DOE) {
      if (typeof DOE.requestPermission === "function") {
        setNeedsPermission(true); // iOS 13+: must be requested from a tap
      } else {
        window.addEventListener("deviceorientation", onOrientation);
      }
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("orientationchange", resetBaseline);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [onOrientation]);

  const requestPermission = useCallback(async () => {
    const DOE = (window as any).DeviceOrientationEvent;
    try {
      const result = await DOE.requestPermission();
      if (result === "granted") {
        window.addEventListener("deviceorientation", onOrientation);
      }
    } catch {
      /* user dismissed or browser blocked it */
    }
    setNeedsPermission(false);
  }, [onOrientation]);

  return { tilt, needsPermission, requestPermission };
}

/* -------------------------------------------------------------------------- */
/*  3D scene                                                                  */
/* -------------------------------------------------------------------------- */

interface BustProps {
  url: string;
  tilt: { current: Tilt };
  stacked: boolean;
  onReady: () => void;
}

function Bust({ url, tilt, stacked, onReady }: BustProps) {
  const { scene } = useGLTF(url);
  const viewport = useThree((s) => s.viewport);
  const pivot = useRef<THREE.Group>(null);

  // Measure the model once so we can fit it to any screen.
  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    return { size: box.getSize(new THREE.Vector3()), min: box.min.clone(), center: box.getCenter(new THREE.Vector3()) };
  }, [scene]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  // Fit: limited by height AND width, so it works on any aspect ratio.
  // (a bit lower than before: leaning toward the camera makes the head look larger)
  const heightFill = stacked ? 0.67 : 0.95;
  const widthFill = stacked ? 1.08 : 0.68;
  const scale = Math.min(
    (viewport.height * heightFill) / bounds.size.y,
    (viewport.width * widthFill) / bounds.size.x
  );

  // The bust is cut off at the chest, so it is anchored to the bottom edge
  // (with a little bleed) and rotates around that point. The cut edge never
  // swings into view.
  const bleed = viewport.height * 0.03;
  const baseY = -viewport.height / 2 - bleed;

  // Intro slide-in: starts fully below the screen, eases up into place.
  const reduceMotion = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const elapsed = useRef(reduceMotion ? INTRO_DELAY + INTRO_DURATION : 0);
  const slideDistance = bounds.size.y * scale + bleed * 2;

  useFrame((_, delta) => {
    const g = pivot.current;
    if (!g) return;

    // Position: slide in from the bottom (delta is capped so a slow first
    // frame after loading doesn't skip the animation).
    elapsed.current += Math.min(delta, 0.05);
    const p = clamp((elapsed.current - INTRO_DELAY) / INTRO_DURATION, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    g.position.set(0, baseY - (1 - eased) * slideDistance, 0);

    // Rotation: follow the cursor / device tilt
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, tilt.current.x * MAX_YAW, FOLLOW_SPEED, delta);
    g.rotation.x = THREE.MathUtils.damp(
      g.rotation.x,
      BASE_PITCH + tilt.current.y * MAX_PITCH,
      FOLLOW_SPEED,
      delta
    );
  });

  return (
    // Initial position is off-screen; useFrame drives it from there.
    <group ref={pivot} position={[0, -viewport.height * 2, 0]}>
      <group scale={scale}>
        {/* Centre horizontally/depth, and put the bottom of the bust at the pivot */}
        <primitive object={scene} position={[-bounds.center.x, -bounds.min.y, -bounds.center.z]} />
      </group>
    </group>
  );
}

useGLTF.preload(DEFAULT_MODEL_URL);

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/* -------------------------------------------------------------------------- */

const ICONS: Record<SocialKey, ReactNode> = {
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  twitter: (
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  ),
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  youtube: (
    <>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </>
  ),
  github: (
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  ),
};

function SocialIcon({ name }: { name: SocialKey }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function Hero({
  name = "Joshua",
  role = "Web Developer",
  intro = "I design and build fast, friendly web experiences. Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
  about = {
    text: "A short line about who you are, what you care about and the kind of work you enjoy doing.",
    href: "#about",
  },
  work = {
    text: "A short line about your recent projects, the stack you used and the problems you solved.",
    href: "#work",
  },
  socials = DEFAULT_SOCIALS,
  headerOffset = "var(--layout-header-height, 0px)",
  modelUrl = DEFAULT_MODEL_URL,
}: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stacked = useMediaQuery(STACKED_QUERY);
  const inView = useInView(rootRef);
  const { tilt, needsPermission, requestPermission } = useTilt();
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  const scrollNext = () => {
    const next = rootRef.current?.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: rootRef.current?.offsetHeight ?? window.innerHeight, behavior: "smooth" });
  };

  const offset = typeof headerOffset === "number" ? `${headerOffset}px` : headerOffset;

  return (
    <section
      ref={rootRef}
      className="hx-hero"
      style={{ "--hx-offset": offset } as CSSProperties}
      aria-label="Introduction"
    >
      <style>{CSS}</style>

      {/* 3D layer (sits behind the text, like the reference) */}
      <div className={`hx-stage${ready ? " is-ready" : ""}`} aria-hidden="true">
        <Canvas
          flat
          dpr={[1, 2]}
          frameloop={inView ? "always" : "never"}
          camera={{ position: [0, 0, 5], fov: 30 }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={1.6} />
          <directionalLight position={[2, 3, 4]} intensity={2.2} />
          <directionalLight position={[-3, 1, -2]} intensity={1} color="#9bb0ff" />
          <Suspense fallback={null}>
            <Bust url={modelUrl} tilt={tilt} stacked={stacked} onReady={handleReady} />
          </Suspense>
        </Canvas>
      </div>

      {/* iOS only: motion sensors need a tap to be enabled */}
      {needsPermission && (
        <button type="button" className="hx-motion" onClick={requestPermission}>
          Tap to enable tilt
        </button>
      )}

      {/* Foreground content */}
      <div className="hx-content">
        <div className="hx-left">
          <span className="hx-rule" aria-hidden="true" />
          <h1 className="hx-title">
            I’m {name}, a<br />
            {role}
          </h1>
          <p className="hx-intro">{intro}</p>
          <button type="button" className="hx-scroll" onClick={scrollNext} aria-label="Scroll to next section">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        <aside className="hx-right">
          <div className="hx-block">
            <h2>About me</h2>
            <p className="hx-blurb">{about.text}</p>
            <a className="hx-link" href={about.href}>
              Learn more →
            </a>
          </div>

          <div className="hx-block">
            <h2>My work</h2>
            <p className="hx-blurb">{work.text}</p>
            <a className="hx-link" href={work.href}>
              Browse portfolio →
            </a>
          </div>

          <div className="hx-block hx-block--social">
            <h2>Follow me</h2>
            <ul className="hx-socials">
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} aria-label={s.name} target="_blank" rel="noreferrer">
                    <SocialIcon name={s.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Styles (scoped with the hx- prefix, no Tailwind / CSS files required)     */
/* -------------------------------------------------------------------------- */

const CSS = `
.hx-hero {
  --hx-bg: #13151b;
  --hx-fg: #ffffff;
  --hx-muted: rgba(255, 255, 255, 0.62);
  --hx-line: rgba(255, 255, 255, 0.14);
  --hx-accent: #1a5fff;

  position: relative;
  isolation: isolate;
  width: 100%;
  height: calc(100vh - var(--hx-offset, 0px));
  height: calc(100dvh - var(--hx-offset, 0px));
  min-height: 340px;
  overflow: hidden;
  color: var(--hx-fg);
  background:
    radial-gradient(55% 70% at 50% 68%, rgba(74, 98, 178, 0.30), transparent 72%),
    var(--hx-bg);
  font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}
.hx-hero *, .hx-hero *::before, .hx-hero *::after { box-sizing: border-box; }

/* 3D layer */
.hx-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.hx-stage.is-ready { opacity: 1; }

/* Content layer */
.hx-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(24px, 5vw, 72px);
  pointer-events: none;
}
.hx-content a,
.hx-content button { pointer-events: auto; }

/* Left column */
.hx-left { max-width: min(46%, 640px); }
.hx-rule {
  display: block;
  width: 64px;
  height: 3px;
  margin-bottom: clamp(14px, 3vh, 28px);
  background: var(--hx-fg);
}
.hx-title {
  margin: 0;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-size: clamp(2rem, min(5.2vw, 9vh), 4.5rem);
}
.hx-intro {
  margin: clamp(12px, 2vh, 20px) 0 0;
  max-width: 36ch;
  font-size: clamp(0.8rem, 1.1vw, 0.95rem);
  line-height: 1.65;
  color: var(--hx-muted);
}
.hx-scroll {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-top: clamp(20px, 6vh, 56px);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--hx-accent);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(26, 95, 255, 0.35);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.hx-scroll:hover { transform: translateY(3px); box-shadow: 0 14px 34px rgba(26, 95, 255, 0.45); }
.hx-scroll svg { animation: hx-bob 2.4s ease-in-out infinite; }
@keyframes hx-bob {
  0%, 100% { transform: translateY(-1px); }
  50% { transform: translateY(3px); }
}

/* Right column */
.hx-right {
  display: flex;
  flex-direction: column;
  width: clamp(220px, 22vw, 300px);
}
.hx-block {
  padding: clamp(12px, 2.6vh, 28px) 0;
  border-top: 1px solid var(--hx-line);
}
.hx-block:first-child { border-top: 0; padding-top: 0; }
.hx-block:last-child { padding-bottom: 0; }
.hx-block h2 {
  margin: 0 0 0.7rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.hx-blurb {
  margin: 0 0 0.9rem;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--hx-muted);
}
.hx-link {
  display: inline-block;
  padding-bottom: 2px;
  border-bottom: 1px solid currentColor;
  color: var(--hx-fg);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color 0.2s ease;
}
.hx-link:hover { color: var(--hx-accent); }

.hx-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.hx-socials a {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  color: var(--hx-fg);
  transition: color 0.2s ease, transform 0.2s ease;
}
.hx-socials a:hover { color: var(--hx-accent); transform: translateY(-2px); }

/* iOS motion permission pill */
.hx-motion {
  position: absolute;
  z-index: 2;
  top: 14px;
  right: 14px;
  padding: 8px 14px;
  border: 1px solid var(--hx-line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--hx-fg);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.hx-hero a:focus-visible,
.hx-hero button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

/* Short screens (phones in landscape, small laptop windows) */
@media (max-height: 520px) {
  .hx-intro, .hx-blurb { display: none; }
  .hx-scroll { width: 44px; height: 44px; margin-top: 16px; }
  .hx-block { padding: 10px 0; }
}

/* Stacked layout: text on top, bust in the middle/bottom, links at the bottom */
@media ${STACKED_QUERY} {
  .hx-content {
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch;
    padding: 28px 22px calc(22px + env(safe-area-inset-bottom, 0px));
  }
  .hx-left { max-width: 100%; }
  .hx-title { font-size: clamp(2rem, 9.5vw, 3.75rem); }
  .hx-intro { max-width: 38ch; font-size: 0.85rem; }

  .hx-right {
    position: relative;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 24px;
    padding-right: 64px; /* room for the scroll button */
  }
  .hx-right::before {
    content: '';
    position: absolute;
    z-index: -1;
    left: -22px;
    right: -22px;
    top: -80px;
    bottom: -40px;
    background: linear-gradient(to top, var(--hx-bg) 20%, transparent);
    pointer-events: none;
  }
  .hx-block,
  .hx-block:first-child,
  .hx-block:last-child { padding: 0; border: 0; }
  .hx-block h2,
  .hx-blurb { display: none; }
  .hx-block--social { width: 100%; }

  .hx-scroll {
    position: absolute;
    right: 22px;
    bottom: calc(22px + env(safe-area-inset-bottom, 0px));
    width: 48px;
    height: 48px;
    margin: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hx-stage { transition: none; }
  .hx-scroll svg { animation: none; }
  .hx-scroll, .hx-socials a { transition: none; }
}
`;