import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Video sources                                                      */
/* ------------------------------------------------------------------ */

const VIDEOS = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4',
  cinematic: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4',
  metrics: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4',
  technology: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4',
  footer: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4',
};

/* ------------------------------------------------------------------ */
/*  Text animation: ScrambleIn (entrance reveal)                       */
/* ------------------------------------------------------------------ */

const SCRAMBLE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function ScrambleIn({
  text,
  delay = 0,
  triggered,
}: {
  text: string;
  delay?: number;
  triggered: boolean;
}) {
  const [display, setDisplay] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!triggered) return;
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [triggered, delay]);

  useEffect(() => {
    if (!started) return;
    let cursor = 0;
    const interval = setInterval(() => {
      cursor += 0.5;
      const revealed = Math.floor(cursor);
      const chars = text.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < revealed) return ch;
        if (i < revealed + 3) return randomChar();
        return '';
      });
      setDisplay(chars.join(''));
      if (revealed >= text.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [started, text]);

  if (!triggered) return <>&nbsp;</>;
  return <>{display || '\u00A0'}</>;
}

/* ------------------------------------------------------------------ */
/*  Text animation: ScrambleText (hover-driven)                        */
/* ------------------------------------------------------------------ */

function ScrambleText({
  text,
  isHovered,
  className,
}: {
  text: string;
  isHovered: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const framesPerChar = 4;
    const interval = setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / framesPerChar);
      const chars = text.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < revealed) return ch;
        return randomChar();
      });
      setDisplay(chars.join(''));
      if (revealed >= text.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span className={className}>{display}</span>;
}

/* ------------------------------------------------------------------ */
/*  Logo                                                                */
/* ------------------------------------------------------------------ */

const LOGO_PATH =
  'M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z';

function SynapseXLogo({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      className={className}
      fill="currentColor"
    >
      <path d={LOGO_PATH} />
      <path d={LOGO_PATH} transform="rotate(90)" />
      <path d={LOGO_PATH} transform="rotate(180)" />
      <path d={LOGO_PATH} transform="rotate(270)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Apple glyph (inline, avoids external icon-font dependency)         */
/* ------------------------------------------------------------------ */

function DownloadGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated hamburger                                                  */
/* ------------------------------------------------------------------ */

function SquashHamburger({ open, mobile = false }: { open: boolean; mobile?: boolean }) {
  const w = mobile ? 15 : 18;
  const h = mobile ? 10 : 12;
  const barH = mobile ? 1.2 : 1.5;
  const spring = { type: 'spring' as const, stiffness: 300, damping: 20 };

  return (
    <div style={{ width: w, height: h, position: 'relative' }}>
      <motion.span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: barH,
          background: '#fff',
          borderRadius: 2,
        }}
        animate={
          open
            ? { top: h / 2 - barH / 2, rotate: 45 }
            : { top: 0, rotate: 0 }
        }
        transition={spring}
      />
      <motion.span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: h / 2 - barH / 2,
          height: barH,
          background: '#fff',
          borderRadius: 2,
        }}
        animate={open ? { opacity: 0, scale: 0.4 } : { opacity: 1, scale: 1 }}
        transition={spring}
      />
      <motion.span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: barH,
          background: '#fff',
          borderRadius: 2,
        }}
        animate={
          open
            ? { bottom: h / 2 - barH / 2, rotate: -45 }
            : { bottom: 0, rotate: 0 }
        }
        transition={spring}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                              */
/* ------------------------------------------------------------------ */

function Navbar({ entranceComplete }: { entranceComplete: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverAbout, setHoverAbout] = useState(false);
  const [hoverMetrics, setHoverMetrics] = useState(false);
  const [hoverDownload, setHoverDownload] = useState(false);

  const scrollTo = (multiplier: number) => {
    document
      .getElementById('synapsex-root')
      ?.scrollIntoView({ block: 'start' });
    window.scrollTo({
      top:
        (document.getElementById('synapsex-root')?.offsetTop ?? 0) +
        window.innerHeight * multiplier,
      behavior: 'smooth',
    });
    setMenuOpen(false);
  };

  return (
    <motion.nav
      className="sx-font absolute top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-2">
        <motion.div
          className={`h-12 px-5 rounded-[14px] bg-white/15 backdrop-blur-md items-center gap-2 ${
            menuOpen ? 'hidden md:flex' : 'flex'
          }`}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.22)' }}
          whileTap={{ scale: 0.98 }}
        >
          <SynapseXLogo size={18} className="text-white" />
          <span className="text-white text-[16px] font-medium tracking-tight">BioPulse</span>
        </motion.div>

        <motion.div
          className="h-12 rounded-[14px] bg-white/15 backdrop-blur-md flex items-center overflow-hidden"
          animate={{ width: menuOpen ? 290 : 48 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex items-center justify-center flex-shrink-0 transition-colors ${
              menuOpen
                ? 'w-9 h-9 rounded-[11px] bg-white/10 hover:bg-white/20 ml-1.5'
                : 'w-12 h-12 rounded-[14px]'
            }`}
          >
            <SquashHamburger open={menuOpen} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="flex items-center gap-6 pl-4 pr-5 whitespace-nowrap"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onMouseEnter={() => setHoverAbout(true)}
                  onMouseLeave={() => setHoverAbout(false)}
                  onClick={() => scrollTo(1)}
                  className="text-white/85 hover:text-white text-[16px] font-normal"
                >
                  <ScrambleText text="About" isHovered={hoverAbout} />
                </button>
                <button
                  onMouseEnter={() => setHoverMetrics(true)}
                  onMouseLeave={() => setHoverMetrics(false)}
                  onClick={() => scrollTo(2)}
                  className="text-white/85 hover:text-white text-[16px] font-normal"
                >
                  <ScrambleText text="Metrics" isHovered={hoverMetrics} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="hidden sm:block" />

      <motion.button
        onMouseEnter={() => setHoverDownload(true)}
        onMouseLeave={() => setHoverDownload(false)}
        className="h-12 px-6 bg-white rounded-full text-black flex items-center gap-2"
        whileHover={{ scale: 1.03, backgroundColor: '#e2e2e6' }}
        whileTap={{ scale: 0.97 }}
      >
        <DownloadGlyph size={15} />
        <ScrambleText text="Resume" isHovered={hoverDownload} className="text-[14px] font-medium" />
      </motion.button>

      {/* Mobile */}
      <div className="sm:hidden flex items-center gap-2 w-full justify-between absolute inset-x-4">
        <motion.div
          className="h-9 rounded-[10px] bg-white/15 backdrop-blur-md flex items-center gap-1.5 px-3.5 overflow-hidden"
          animate={{ width: menuOpen ? 0 : 'auto', opacity: menuOpen ? 0 : 1, paddingLeft: menuOpen ? 0 : 14, paddingRight: menuOpen ? 0 : 14 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          <SynapseXLogo size={14} className="text-white flex-shrink-0" />
          <span className="text-white text-[13px] font-medium tracking-tight whitespace-nowrap">BioPulse</span>
        </motion.div>

        <motion.div
          className="h-9 rounded-[10px] bg-white/15 backdrop-blur-md flex items-center overflow-hidden"
          animate={{ width: menuOpen ? '100%' : 40 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          >
            <SquashHamburger open={menuOpen} mobile />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="flex items-center gap-4 pl-2 whitespace-nowrap"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <button onClick={() => scrollTo(1)} className="text-white/85 text-[13px]">About</button>
                <button onClick={() => scrollTo(2)} className="text-white/85 text-[13px]">Metrics</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 1: Hero                                                    */
/* ------------------------------------------------------------------ */

function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const lastX = useRef<number | null>(null);
  const seeking = useRef(false);
  const pendingTarget = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setEntranceComplete(true), 800);
    return () => clearTimeout(t);
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const clamped = Math.max(0, Math.min(video.duration, time));
    if (seeking.current) {
      pendingTarget.current = clamped;
      return;
    }
    seeking.current = true;
    video.currentTime = clamped;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onSeeked = () => {
      seeking.current = false;
      if (pendingTarget.current !== null) {
        const next = pendingTarget.current;
        pendingTarget.current = null;
        seekTo(next);
      }
    };
    video.addEventListener('seeked', onSeeked);
    return () => video.removeEventListener('seeked', onSeeked);
  }, [seekTo]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    if (lastX.current === null) {
      lastX.current = e.clientX;
      return;
    }
    const deltaX = e.clientX - lastX.current;
    lastX.current = e.clientX;
    const deltaTime = (deltaX / window.innerWidth) * video.duration * 0.8;
    seekTo(video.currentTime + deltaTime);
  };

  return (
    <section
      className="sx-font relative h-screen h-[100dvh] w-full overflow-hidden bg-black text-white flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => (lastX.current = null)}
    >
      <video
        ref={videoRef}
        src={VIDEOS.hero}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        preload="auto"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.05,
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ transform: 'translateY(50px)' }}
      >
        <span
          className="sx-anton uppercase"
          style={{
            fontSize: 'clamp(120px, 30vw, 521px)',
            letterSpacing: '-4px',
            opacity: 0.1,
            backgroundImage:
              'radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
COMPUTATION
        </span>
      </div>

      <Navbar entranceComplete={entranceComplete} />

      <div className="relative z-10 flex flex-col flex-1 px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="flex-1" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]">
              <ScrambleIn text="Code" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="And Cells" delay={500} triggered={entranceComplete} />
            </h1>
            <motion.p
              className="max-w-sm text-[13px] sm:text-[15px] text-white/60 leading-relaxed"
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: entranceComplete ? 0 : 25, opacity: entranceComplete ? 1 : 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.215, 0.61, 0.355, 1.0] }}
            >
              Built at the intersection of computational biology and machine learning. BioPulse
              turns raw genomic sequence data into distributed, GPU-accelerated models running
              on SLURM-managed HPC clusters.
            </motion.p>
          </div>

          <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)] text-left md:text-right">
            <ScrambleIn text="One" delay={700} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="Pipeline" delay={1000} triggered={entranceComplete} />
          </h1>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2: Cinematic text                                          */
/* ------------------------------------------------------------------ */

function CinematicSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 });
  const y = useTransform(smooth, [0, 1], [60, -120]);
  const opacity = useTransform(smooth, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`rotateX(24deg) translateY(${y}px) translateZ(15px)`;

  return (
    <section
      ref={ref}
      className="sx-font relative h-screen h-[100dvh] w-full overflow-hidden bg-black text-white flex items-center justify-center"
    >
      <video
        src={VIDEOS.cinematic}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          height: 180,
          backgroundImage: 'linear-gradient(to bottom, #010103, transparent)',
        }}
      />
      <div className="relative z-10 max-w-5xl" style={{ perspective: 400 }}>
        <motion.p
          className="font-sans font-normal text-[22px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-white leading-[1.35] tracking-[-0.02em] select-none px-6 sm:px-12 text-center"
          style={{ transform, opacity }}
        >
A machine learning infrastructure built on the architecture of high-performance computing.
          BioPulse translates raw genomic reads into structured, trainable data. Every sequence
          alignment becomes measurable, distributed, and visible. It continuously reconstructs
          model state across hundreds of cluster nodes. Biological noise is filtered into
          reproducible, publishable results.
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3: Metrics                                                 */
/* ------------------------------------------------------------------ */

const METRICS = [
  { value: '42', label: 'Active Cluster Nodes' },
  { value: '87%', label: 'GPU Utilization' },
  { value: '1,247+', label: 'Genomic Batches Processed' },
];

function MetricsSection() {
  return (
    <section id="synapsex-metrics" className="sx-font relative min-h-screen w-full overflow-hidden bg-black text-white">
      <video
        src={VIDEOS.metrics}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="relative z-10 flex flex-col items-center pt-32 pb-32 px-6 max-w-6xl mx-auto">
        <motion.p
          className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2 }}
        >
          Performance Metrics
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 w-full">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              className="text-center"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <div className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none">
                {m.value}
              </div>
              <div className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4: Technology                                              */
/* ------------------------------------------------------------------ */

const TECH_ITEMS = [
  { title: 'Sequence Alignment', desc: 'Live visualization of high-throughput genomic sequence alignment.' },
  { title: 'Distributed Training', desc: 'PyTorch and JAX models trained across SLURM-managed clusters.' },
  { title: 'Job Scheduling', desc: 'SLURM and Kubernetes coordinate compute across every node.' },
  { title: 'Reproducible Pipelines', desc: 'Nextflow and Snakemake keep every run versioned and repeatable.' },
];

function TechnologySection() {
  return (
    <section className="sx-font relative h-screen h-[100dvh] w-full overflow-hidden bg-black text-white flex flex-col px-8 sm:px-12 md:px-16 py-12 sm:py-16">
      <video
        src={VIDEOS.technology}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <motion.h2
            className="text-white font-light text-[clamp(36px,8vw,72px)] leading-[0.95] tracking-[-0.03em]"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0 }}
          >
            Distributed
            <br />
            Infrastructure
          </motion.h2>
          <motion.p
            className="text-white/50 text-[13px] sm:text-[15px] leading-relaxed max-w-xs md:text-right md:pt-2"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.2 }}
          >
            Every job is scheduled, tracked, and scaled across the cluster automatically. From
            raw reads to trained model, the pipeline stays reproducible end to end.
          </motion.p>
        </div>

        <div className="flex-1" />

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, delay: 0.3 }}
        >
          {TECH_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <div className="text-white text-[14px] sm:text-[16px] font-normal mb-2">
                {item.title}
              </div>
              <div className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">
                {item.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5: Architecture                                            */
/* ------------------------------------------------------------------ */

const LAYERS = [
  { layer: 'Layer 1', name: 'Ingest' },
  { layer: 'Layer 2', name: 'Train' },
  { layer: 'Layer 3', name: 'Monitor' },
];

function ArchitectureSection() {
  return (
    <section id="synapsex-about" className="sx-font relative min-h-screen w-full bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl px-6 py-32 mx-auto flex flex-col items-center">
        <motion.div
          className="text-center"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.0 }}
        >
          <p className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-8">
            Architecture
          </p>
          <h2 className="text-white font-light text-[clamp(28px,6vw,56px)] leading-[1.15] tracking-[-0.02em] mb-10">
            Three layers. Zero downtime.
          </h2>
          <p className="text-white/45 text-[15px] sm:text-[17px] leading-relaxed max-w-xl mx-auto">
            The ingest layer captures raw genomic reads. The training layer runs distributed
            model training across the cluster. The monitor layer surfaces live job status and
            sequence alignment through the BioPulse HUD.
          </p>
        </motion.div>

        <motion.div
          className="mt-20 flex flex-col items-center gap-4 w-full"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          {LAYERS.map((l) => (
            <div
              key={l.layer}
              className="w-full max-w-md h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6"
            >
              <span className="text-white/30 text-[12px] tracking-[0.15em] uppercase">
                {l.layer}
              </span>
              <span className="text-white text-[16px] sm:text-[18px] font-light">{l.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

function SynapseXFooter() {
  return (
    <footer className="sx-font relative w-full bg-black overflow-hidden flex flex-col md:flex-row min-h-[400px]">
      <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
        <video
          src={VIDEOS.footer}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-between p-10 sm:p-16 bg-black">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <SynapseXLogo size={18} className="text-white/70" />
            <span className="text-white/70 text-[15px] font-medium tracking-tight">BioPulse</span>
          </div>
          <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed max-w-sm">
            Scalable machine learning infrastructure for genomic data analysis, built at the
            intersection of computational biology and high-performance computing.
          </p>
        </div>
        <p className="text-white/25 text-[12px] mt-12">(c) 2026 Maneesh B. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Root export                                                        */
/* ------------------------------------------------------------------ */

export default function SynapseXSection() {
  return (
    <div id="synapsex-root" style={{ fontFamily: '"Space Mono", monospace' }} className="w-full bg-black">
      <style>{`
        .sx-font, .sx-font * { font-family: "Space Mono", monospace; }
        .sx-anton { font-family: "Anton SC", sans-serif; }
      `}</style>
      <Hero />
      <CinematicSection />
      <MetricsSection />
      <TechnologySection />
      <ArchitectureSection />
      <SynapseXFooter />
    </div>
  );
}
