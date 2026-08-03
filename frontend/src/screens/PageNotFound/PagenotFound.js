import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

// ─── Animated particle canvas background ─────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let animId;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

// ─── PageNotFound ─────────────────────────────────────────────────────────────

const PageNotFound = () => {
  const history = useHistory();

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4"
      style={{ background: "radial-gradient(circle at 60% 20%, rgba(56,189,248,0.08), transparent 50%), radial-gradient(circle at 20% 80%, rgba(14,165,233,0.06), transparent 40%), #020617" }}
    >
      {/* particles */}
      <ParticleCanvas />

      {/* ambient glow blobs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-[80px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-cyan-400/8 blur-[80px]" />

      {/* card */}
      <div
        className="relative z-10 w-full max-w-lg rounded-[32px] border border-slate-800/80 p-8 text-center shadow-[0_40px_100px_rgba(2,6,23,0.7)] md:p-12"
        style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(2,6,23,0.98))" }}
      >
        {/* top badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-sky-300">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          Error 404
        </div>

        {/* glitch 404 */}
        <div className="relative my-2 select-none">
          <span
            className="block text-[7rem] font-black leading-none tracking-tighter text-transparent md:text-[9rem]"
            style={{
              WebkitTextStroke: "2px rgba(56,189,248,0.25)",
              animation: "float 4s ease-in-out infinite",
            }}
          >
            404
          </span>
          {/* glitch layers */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 block text-[7rem] font-black leading-none tracking-tighter text-sky-400/30 md:text-[9rem]"
            style={{ animation: "glitch1 3s steps(1) infinite", clipPath: "inset(30% 0 50% 0)" }}
          >
            404
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 block text-[7rem] font-black leading-none tracking-tighter text-cyan-300/20 md:text-[9rem]"
            style={{ animation: "glitch2 3s steps(1) infinite", clipPath: "inset(60% 0 10% 0)" }}
          >
            404
          </span>
        </div>

        {/* divider line */}
        <div className="mx-auto mb-6 h-px w-16 bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

        {/* heading */}
        <h2 className="text-2xl font-bold text-white md:text-3xl">Page Not Found</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* floating orbit ring */}
        <div className="relative mx-auto my-8 flex h-24 w-24 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-sky-400/20"
            style={{ animation: "spin 8s linear infinite" }}
          >
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-sky-400" />
          </div>
          <div
            className="absolute inset-3 rounded-full border border-sky-400/10"
            style={{ animation: "spin 5s linear infinite reverse" }}
          >
            <div className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300 text-2xl">
            ⚠
          </div>
        </div>

        {/* buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => history.goBack()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:border-slate-500 hover:text-white"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => history.push("/")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(14,165,233,0.3)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>

      {/* keyframe styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glitch1 {
          0%, 90%, 100% { transform: translate(0); opacity: 0; }
          91% { transform: translate(-3px, 1px); opacity: 1; }
          93% { transform: translate(3px, -1px); opacity: 1; }
          95% { transform: translate(0); opacity: 0; }
        }
        @keyframes glitch2 {
          0%, 85%, 100% { transform: translate(0); opacity: 0; }
          86% { transform: translate(3px, 2px); opacity: 1; }
          88% { transform: translate(-3px, -2px); opacity: 1; }
          90% { transform: translate(0); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default PageNotFound;