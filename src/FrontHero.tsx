import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  DNA helix particle background (canvas)                             */
/* ------------------------------------------------------------------ */

function DNAHelixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const POINTS = 90;
    const AMPLITUDE = () => width * 0.16;
    const RUNG_EVERY = 4;

    const draw = () => {
      t += 0.006;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.42;
      const topY = height * 0.06;
      const botY = height * 0.98;

      const strandA: { x: number; y: number; z: number }[] = [];
      const strandB: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i < POINTS; i++) {
        const progress = i / (POINTS - 1);
        const y = topY + progress * (botY - topY);
        const angle = progress * Math.PI * 5 + t;
        const amp = AMPLITUDE();
        const xA = cx + Math.sin(angle) * amp;
        const zA = Math.cos(angle);
        const xB = cx + Math.sin(angle + Math.PI) * amp;
        const zB = Math.cos(angle + Math.PI);
        strandA.push({ x: xA, y, z: zA });
        strandB.push({ x: xB, y, z: zB });
      }

      const drawStrand = (
        strand: { x: number; y: number; z: number }[],
        color: string
      ) => {
        ctx.beginPath();
        strand.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      drawStrand(strandA, 'rgba(255,180,80,0.55)');
      drawStrand(strandB, 'rgba(255,140,60,0.35)');

      // rungs
      for (let i = 0; i < POINTS; i += RUNG_EVERY) {
        const a = strandA[i];
        const b = strandB[i];
        const alpha = 0.15 + 0.15 * ((a.z + 1) / 2);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,190,120,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // glowing particle nodes
      const drawNodes = (strand: { x: number; y: number; z: number }[]) => {
        strand.forEach((p, i) => {
          if (i % 2 !== 0) return;
          const depth = (p.z + 1) / 2;
          const r = 1.2 + depth * 2.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,200,140,${0.35 + depth * 0.5})`;
          ctx.shadowColor = 'rgba(255,180,90,0.8)';
          ctx.shadowBlur = 6 + depth * 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      };
      drawNodes(strandA);
      drawNodes(strandB);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Glass card                                                          */
/* ------------------------------------------------------------------ */

function GlassCard({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 backdrop-blur-xl bg-white/[0.06] ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root export                                                        */
/* ------------------------------------------------------------------ */

export default function FrontHero() {
  return (
    <section className="relative w-full h-screen h-[100dvh] bg-[#0a0806] text-white overflow-hidden">
      <DNAHelixCanvas />

      {/* radial vignette to match the reference's warm-dark tone */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 90% at 30% 30%, rgba(120,60,20,0.25), transparent 60%), radial-gradient(100% 100% at 100% 0%, rgba(0,0,0,0.6), transparent 50%)',
        }}
      />

      {/* top nav */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8">
        <div className="flex items-center gap-4">
          <button
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-[15px] font-medium tracking-wide">BIOPULSE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight hidden sm:block">
            <div className="text-[14px] font-semibold">Maneesh B</div>
            <div className="text-[12px] text-white/50">Computational Biologist</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-[13px] font-semibold text-black">
            MB
          </div>
        </div>
      </div>

      {/* center-left big stat */}
      <motion.div
        className="relative z-10 flex flex-col justify-center h-full max-w-md pl-6 sm:pl-10 -mt-16 sm:-mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1.0] }}
      >
        <p className="text-white/70 text-[14px] sm:text-[16px] leading-snug mb-3">
          Estimated
          <br />
          Model Confidence
        </p>
        <div className="text-[80px] sm:text-[110px] font-light leading-none tracking-[-0.03em]">
          98<span className="text-[0.45em] align-top">%</span>
        </div>
        <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-1.5 text-[12px] text-white/70">
          +4% over last training run
        </div>
      </motion.div>

      {/* right-side glass card grid */}
      <div className="absolute z-10 right-6 sm:right-10 bottom-24 sm:bottom-10 w-[260px] sm:w-[320px] grid grid-cols-2 gap-3 sm:gap-4">
        <GlassCard className="col-span-2 p-4">
          <div className="text-[13px] sm:text-[14px] font-medium mb-1">Recent Runs</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/50 text-[12px]">6 jobs today</span>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowRight size={13} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-gradient-to-br from-orange-500/30 to-white/[0.04]">
          <div className="text-[13px] sm:text-[14px] font-medium mb-2">Your Insights</div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white text-black text-[11px] px-2.5 py-1 font-medium">
            8 Flags
            <ArrowRight size={11} />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-[13px] sm:text-[14px] font-medium mb-2">Pipeline Snapshot</div>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowUp size={13} />
          </div>
        </GlassCard>

        <GlassCard className="col-span-2 p-4 bg-gradient-to-br from-teal-400/20 to-orange-400/10">
          <div className="text-[13px] sm:text-[14px] font-medium mb-2">Next Steps</div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white text-black text-[11px] px-2.5 py-1 font-medium">
            Details
            <ArrowRight size={11} />
          </div>
        </GlassCard>
      </div>

      {/* bottom waveform accent */}
      <div className="absolute z-10 left-6 sm:left-10 right-6 sm:right-10 bottom-6 sm:bottom-8 flex items-end gap-[3px] h-6 opacity-40">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-white/60 rounded-full"
            style={{ height: `${20 + Math.sin(i * 0.6) * 40 + 40}%` }}
          />
        ))}
      </div>
    </section>
  );
}
