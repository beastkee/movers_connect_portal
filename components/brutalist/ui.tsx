import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Tone = "light" | "dark" | "accent" | "danger";

const toneClasses: Record<Tone, string> = {
  light: "bg-white/20 text-white backdrop-blur-xl hover:bg-white/30",
  dark: "bg-black/45 text-white backdrop-blur-xl hover:bg-black/60",
  accent: "bg-gradient-to-r from-[#2cf4ff] to-[#9b7bff] text-[#0d1025] hover:brightness-110",
  danger: "bg-gradient-to-r from-[#ff6fcf] to-[#ffa36f] text-[#2a1320] hover:brightness-110",
};

export const brutal = {
  page: "relative isolate min-h-screen overflow-x-clip bg-[radial-gradient(1000px_circle_at_15%_20%,rgba(44,244,255,0.25),transparent_55%),radial-gradient(900px_circle_at_85%_10%,rgba(255,111,207,0.22),transparent_50%),radial-gradient(1200px_circle_at_50%_90%,rgba(155,123,255,0.18),transparent_55%),linear-gradient(135deg,#090b1f_0%,#0f1634_40%,#101b3f_100%)] text-white",
  frame: "relative mx-auto w-full max-w-[1700px] px-4 pb-12 pt-6 md:px-10",
  header: "relative z-20 mr-0 rounded-[2rem] border border-white/30 bg-white/12 p-6 text-white backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_22px_55px_rgba(0,0,0,0.38)] md:mr-[8%]",
  eyebrow: "text-[11px] font-semibold tracking-[0.28em] text-white/80",
  title: "mt-2 text-4xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#2cf4ff] via-[#9b7bff] to-[#ff6fcf] md:text-5xl",
  section: "rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl",
  input: "mt-2 w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/60 focus:border-[#2cf4ff] focus:bg-white/15 focus:ring-2 focus:ring-[#2cf4ff]/40",
  label: "text-xs font-semibold tracking-[0.12em] text-white/85",
  alert: "rounded-2xl border border-[#ff6fcf]/60 bg-[#ff6fcf]/20 p-3 text-sm font-semibold text-white",
  success: "rounded-2xl border border-[#2cf4ff]/60 bg-[#2cf4ff]/20 p-3 text-sm font-semibold text-white",
};

interface ShellProps {
  headerClassName?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

type UniverseMode = "aurora" | "synth" | "void";

const modeVars: Record<UniverseMode, React.CSSProperties> = {
  aurora: {
    "--u1": "rgba(44, 244, 255, 0.25)",
    "--u2": "rgba(255, 111, 207, 0.22)",
    "--u3": "rgba(155, 123, 255, 0.2)",
    "--bg0": "#090b1f",
    "--bg1": "#0f1634",
    "--bg2": "#101b3f",
  } as React.CSSProperties,
  synth: {
    "--u1": "rgba(255, 82, 182, 0.25)",
    "--u2": "rgba(92, 255, 241, 0.22)",
    "--u3": "rgba(255, 210, 74, 0.18)",
    "--bg0": "#150a26",
    "--bg1": "#1d0f39",
    "--bg2": "#2a1348",
  } as React.CSSProperties,
  void: {
    "--u1": "rgba(117, 255, 197, 0.2)",
    "--u2": "rgba(132, 186, 255, 0.2)",
    "--u3": "rgba(230, 240, 255, 0.1)",
    "--bg0": "#04070f",
    "--bg1": "#081426",
    "--bg2": "#0a1833",
  } as React.CSSProperties,
};

const seedFromText = (text: string) => {
  let seed = 0;
  for (let i = 0; i < text.length; i += 1) {
    seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  }
  return seed || 1;
};

const seededRandomFactory = (seed: number) => {
  let s = seed;
  return () => {
    s = (1664525 * s + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

export const BrutalistShell = ({ headerClassName, eyebrow, title, children }: ShellProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [trail, setTrail] = useState(Array.from({ length: 8 }, () => ({ x: 50, y: 50 })));
  const [mode, setMode] = useState<UniverseMode>("aurora");
  const [showConsole, setShowConsole] = useState(false);
  const [sceneBurst, setSceneBurst] = useState(false);
  const pointerRef = useRef(pointer);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      pointerRef.current = { x, y };
      setPointer({ x, y });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      setTrail((prev) => {
        const next = [{ ...pointerRef.current }, ...prev.slice(0, 7)];
        for (let i = 1; i < next.length; i += 1) {
          next[i] = {
            x: next[i].x + (next[i - 1].x - next[i].x) * 0.35,
            y: next[i].y + (next[i - 1].y - next[i].y) * 0.35,
          };
        }
        return next;
      });
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setSceneBurst(true);
    const timeout = window.setTimeout(() => setSceneBurst(false), 700);
    return () => window.clearTimeout(timeout);
  }, [router.asPath]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "`") {
        setShowConsole((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const particles = useMemo(() => {
    if (!mounted) {
      return [] as Array<{ x: number; y: number; size: number; delay: number; hue: number }>;
    }
    const seeded = seededRandomFactory(seedFromText(`${title}-${router.asPath}`));
    return Array.from({ length: 22 }, () => ({
      x: seeded() * 100,
      y: seeded() * 100,
      size: 3 + seeded() * 9,
      delay: seeded() * 6,
      hue: 170 + Math.floor(seeded() * 170),
    }));
  }, [mounted, router.asPath, title]);

  const headerTilt = useMemo(() => {
    const amount = ((pointer.x - 50) / 50) * 1.6;
    return `rotate(${(-0.8 + amount).toFixed(2)}deg)`;
  }, [pointer.x]);

  const bodyTilt = useMemo(() => {
    const amount = ((pointer.y - 50) / 50) * 1.4;
    return `rotate(${(amount * 0.45).toFixed(2)}deg)`;
  }, [pointer.y]);

  return (
    <div
      className={`${brutal.page} ${sceneBurst ? "scene-burst" : ""} bg-[radial-gradient(1000px_circle_at_15%_20%,var(--u1),transparent_55%),radial-gradient(900px_circle_at_85%_10%,var(--u2),transparent_50%),radial-gradient(1200px_circle_at_50%_90%,var(--u3),transparent_55%),linear-gradient(135deg,var(--bg0)_0%,var(--bg1)_40%,var(--bg2)_100%)]`}
      style={modeVars[mode]}
    >
      {particles.map((particle, index) => (
        <div
          key={`${particle.x}-${particle.y}-${index}`}
          className="particle-dot pointer-events-none absolute z-0 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            background: `hsla(${particle.hue}, 90%, 70%, 0.8)`,
            boxShadow: `0 0 ${particle.size * 4}px hsla(${particle.hue}, 95%, 72%, 0.55)`,
          }}
        />
      ))}

      {trail.map((point, index) => (
        <div
          key={`trail-${index}`}
          className="pointer-events-none absolute z-10 rounded-full border border-white/40"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: `${32 - index * 3}px`,
            height: `${32 - index * 3}px`,
            transform: "translate(-50%, -50%)",
            opacity: `${Math.max(0.14, 0.5 - index * 0.05)}`,
            background: index % 2 === 0 ? "rgba(44,244,255,0.14)" : "rgba(255,111,207,0.14)",
            backdropFilter: "blur(3px)",
          }}
        />
      ))}

      <div
        className="pointer-events-none absolute z-0 h-80 w-80 rounded-full bg-[#2cf4ff]/40 blur-3xl transition-transform duration-200"
        style={{ left: `${pointer.x}%`, top: `${pointer.y}%`, transform: "translate(-50%, -50%)" }}
      />
      <div
        className="pointer-events-none absolute z-0 h-72 w-72 rounded-full bg-[#ff6fcf]/30 blur-3xl transition-transform duration-300"
        style={{ left: `${100 - pointer.x}%`, top: `${pointer.y * 0.8}%`, transform: "translate(-50%, -50%)" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-[18%] z-10 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-[58%] z-10 h-px bg-gradient-to-r from-transparent via-[#2cf4ff]/70 to-transparent" />
      <div className="chaos-tape-left pointer-events-none absolute left-0 top-[24%] z-10 hidden rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/90 backdrop-blur-md md:block">
        DREAM LAYER / MOTION FIELD / DREAM LAYER / MOTION FIELD /
      </div>
      <div className="chaos-tape-right pointer-events-none absolute right-0 top-[66%] z-10 hidden rounded-full border border-white/35 bg-black/20 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#c8fcff] backdrop-blur-md md:block">
        INTERACTIVE AURORA / SIGNAL NOISE / INTERACTIVE AURORA /
      </div>
      <div className="pointer-events-none absolute -left-16 top-24 z-0 h-48 w-48 rotate-12 rounded-[40%] border border-white/35 bg-[#2cf4ff]/35 backdrop-blur-sm" />
      <div className="pointer-events-none absolute right-[-4rem] top-44 z-0 h-56 w-56 -rotate-6 rounded-[32%] border border-white/35 bg-[#ff6fcf]/30 backdrop-blur-sm" />
      <div className="pointer-events-none absolute bottom-8 left-[12%] z-0 h-24 w-80 -rotate-3 rounded-full border border-white/35 bg-[#9b7bff]/35 backdrop-blur-sm" />
      <div className={brutal.frame}>
        <div className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white/80 backdrop-blur-md">
          PRESS ` TO OPEN EXPERIMENT CONSOLE
        </div>
        <div className="pointer-events-none absolute left-2 top-1 z-10 h-2 w-36 rounded-full bg-[#2cf4ff]/85 blur-[2px] md:w-60" />
        <div className="pointer-events-none absolute right-6 top-2 z-10 h-2 w-28 rounded-full bg-[#ff6fcf]/80 blur-[2px] md:w-48" />
        <header
          className={`${brutal.header} ${
            headerClassName || "bg-[linear-gradient(130deg,rgba(44,244,255,0.22)_0%,rgba(155,123,255,0.24)_42%,rgba(255,111,207,0.22)_100%)]"
          }`}
          style={{ transform: headerTilt }}
        >
          <p className={brutal.eyebrow}>{eyebrow}</p>
          <h1 className={`${brutal.title} chaos-title`} data-text={title}>
            {title}
          </h1>
        </header>
        <section
          className="relative z-20 mt-5 rounded-[2rem] border border-white/25 bg-white/8 p-1 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_28px_65px_rgba(6,9,26,0.55)] md:ml-8 md:mr-4"
          style={{ transform: bodyTilt }}
        >
          <div className="cosmic-surface rounded-[1.7rem] border border-white/20 bg-gradient-to-b from-white/16 to-white/8 p-1">
            <div className="rounded-[1.4rem] border border-white/15 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] text-white">
              {children}
            </div>
          </div>
        </section>

        <aside
          className={`fixed bottom-4 right-4 z-40 w-[300px] rounded-2xl border border-white/30 bg-black/35 p-4 backdrop-blur-xl transition-all duration-300 ${
            showConsole ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"
          }`}
        >
          <p className="text-[11px] font-semibold tracking-[0.2em] text-white/80">EXPERIMENT CONSOLE</p>
          <p className="mt-1 text-xs text-white/70">Live-switch visual universes for this scene.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition ${
                mode === "aurora" ? "border-[#2cf4ff] bg-[#2cf4ff]/25 text-white" : "border-white/30 bg-white/5 text-white/80"
              }`}
              onClick={() => setMode("aurora")}
            >
              Aurora
            </button>
            <button
              className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition ${
                mode === "synth" ? "border-[#ff6fcf] bg-[#ff6fcf]/25 text-white" : "border-white/30 bg-white/5 text-white/80"
              }`}
              onClick={() => setMode("synth")}
            >
              Synth
            </button>
            <button
              className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition ${
                mode === "void" ? "border-[#9bceff] bg-[#9bceff]/25 text-white" : "border-white/30 bg-white/5 text-white/80"
              }`}
              onClick={() => setMode("void")}
            >
              Void
            </button>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .chaos-title {
          position: relative;
          text-shadow: 0 0 24px rgba(44, 244, 255, 0.65), 0 0 22px rgba(255, 111, 207, 0.5);
          animation: chaos-glitch 1200ms steps(2) infinite;
        }

        .scene-burst {
          animation: scene-burst 700ms ease-out;
        }

        .particle-dot {
          animation: particle-float 8s ease-in-out infinite;
        }

        .chaos-title::before,
        .chaos-title::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          pointer-events: none;
        }

        .chaos-title::before {
          color: #2cf4ff;
          transform: translate(2px, 0);
          mix-blend-mode: screen;
          opacity: 0.7;
        }

        .chaos-title::after {
          color: #ff6fcf;
          transform: translate(-2px, 0);
          mix-blend-mode: screen;
          opacity: 0.7;
        }

        .cosmic-surface .border-4,
        .cosmic-surface .border-b-4,
        .cosmic-surface .border-t-4,
        .cosmic-surface .border-r-4,
        .cosmic-surface .border-l-4,
        .cosmic-surface .border-black {
          border-width: 1px !important;
          border-color: rgba(255, 255, 255, 0.22) !important;
          border-radius: 1rem !important;
        }

        .cosmic-surface .bg-white,
        .cosmic-surface .bg-\[\#fffdf5\],
        .cosmic-surface .bg-\[\#fff8e6\],
        .cosmic-surface .bg-\[\#f8f5eb\],
        .cosmic-surface .bg-\[\#fff3be\],
        .cosmic-surface .bg-\[\#dbf8ff\] {
          background: rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(12px);
        }

        .cosmic-surface .uppercase {
          text-transform: none !important;
          letter-spacing: 0.02em !important;
        }

        .cosmic-surface p,
        .cosmic-surface h2,
        .cosmic-surface h3,
        .cosmic-surface label,
        .cosmic-surface div,
        .cosmic-surface span {
          color: rgba(237, 247, 255, 0.96);
        }

        .chaos-tape-left {
          animation: tape-slide-left 14s linear infinite;
        }

        .chaos-tape-right {
          animation: tape-slide-right 16s linear infinite;
        }

        @keyframes tape-slide-left {
          0% {
            transform: translateX(-24px);
          }
          50% {
            transform: translateX(24px);
          }
          100% {
            transform: translateX(-24px);
          }
        }

        @keyframes tape-slide-right {
          0% {
            transform: translateX(24px);
          }
          50% {
            transform: translateX(-24px);
          }
          100% {
            transform: translateX(24px);
          }
        }

        @keyframes chaos-glitch {
          0% {
            transform: skewX(0deg);
          }
          20% {
            transform: skewX(-1.5deg);
          }
          40% {
            transform: skewX(1.2deg);
          }
          60% {
            transform: skewX(-0.8deg);
          }
          80% {
            transform: skewX(0.9deg);
          }
          100% {
            transform: skewX(0deg);
          }
        }

        @keyframes scene-burst {
          0% {
            filter: saturate(1.9) brightness(1.18);
          }
          100% {
            filter: saturate(1) brightness(1);
          }
        }

        @keyframes particle-float {
          0% {
            transform: translateY(0px);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-18px);
            opacity: 1;
          }
          100% {
            transform: translateY(0px);
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chaos-title,
          .chaos-tape-left,
          .chaos-tape-right,
          .particle-dot,
          .scene-burst {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}

export const BrutalistLinkButton = ({ href, children, tone = "light", className }: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={`inline-block rounded-full border border-white/40 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white transition shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:-translate-y-[1px] hover:scale-[1.02] ${toneClasses[tone]} ${className || ""}`}
    >
      {children}
    </Link>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  full?: boolean;
}

export const BrutalistButton = ({ tone = "dark", full = false, className, children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={`${full ? "w-full" : ""} rounded-full border border-white/45 px-5 py-3 text-sm font-semibold tracking-[0.1em] transition disabled:opacity-50 shadow-[0_16px_35px_rgba(0,0,0,0.36)] hover:-translate-y-[1px] hover:scale-[1.01] ${toneClasses[tone]} ${className || ""}`}
    >
      {children}
    </button>
  );
};
