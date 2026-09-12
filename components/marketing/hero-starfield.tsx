"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  colorType: "cyan" | "violet" | "white" | "sky";
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hasGlow: boolean;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export function HeroStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let shootingStar: ShootingStar | null = null;
    let nextShootingStarTime = performance.now() + 4000 + Math.random() * 5000;

    const createStars = (w: number, h: number) => {
      // Density: ~1 star per 7,500 square pixels
      const count = Math.min(220, Math.max(60, Math.floor((w * h) / 7500)));
      const newStars: Star[] = [];

      for (let i = 0; i < count; i++) {
        // Weighted distribution: 65% tiny distant stars, 25% medium stars, 10% luminous stellar beacons
        const rand = Math.random();
        let radius = 0.65;
        let hasGlow = false;

        if (rand > 0.88) {
          radius = 1.4 + Math.random() * 0.6;
          hasGlow = true;
        } else if (rand > 0.65) {
          radius = 1.0 + Math.random() * 0.35;
        } else {
          radius = 0.55 + Math.random() * 0.35;
        }

        // Color palette matching hero globe stardust
        const colorRand = Math.random();
        let colorType: Star["colorType"] = "white";
        if (colorRand < 0.45) {
          colorType = "cyan"; // Electric Cyan (matches Bangladesh/Asia tech routes)
        } else if (colorRand < 0.7) {
          colorType = "violet"; // Neon Purple (matches South Korea/destinations)
        } else if (colorRand < 0.85) {
          colorType = "sky"; // Sky Blue
        } else {
          colorType = "white"; // Pure Stellar Diamond White
        }

        newStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius,
          colorType,
          baseAlpha: 0.25 + Math.random() * 0.55,
          twinkleSpeed: 0.008 + Math.random() * 0.02,
          twinklePhase: Math.random() * Math.PI * 2,
          hasGlow,
          vx: (Math.random() - 0.5) * 0.03,
          vy: (Math.random() - 0.5) * 0.03,
        });
      }

      return newStars;
    };

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      stars = createStars(width, height);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const spawnShootingStar = () => {
      const angle = (25 + Math.random() * 15) * (Math.PI / 180);
      shootingStar = {
        x: Math.random() * (width * 0.75),
        y: Math.random() * (height * 0.45),
        length: 70 + Math.random() * 60,
        speed: 9 + Math.random() * 6,
        angle,
        opacity: 0.9,
        active: true,
      };
    };

    // Render loop
    let isVisible = true;
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      const now = performance.now();

      // Check shooting star trigger
      if (
        now > nextShootingStarTime &&
        (!shootingStar || !shootingStar.active)
      ) {
        spawnShootingStar();
        nextShootingStarTime = now + 8000 + Math.random() * 8000;
      }

      // Draw all cosmic stars
      for (const s of stars) {
        // Gentle drift
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Twinkle calculation
        s.twinklePhase += s.twinkleSpeed;
        const twinkle = (Math.sin(s.twinklePhase) + 1) * 0.5; // 0.0 to 1.0
        const currentAlpha = Math.max(
          0.12,
          Math.min(0.95, s.baseAlpha * (0.55 + twinkle * 0.65)),
        );

        let rgb = "255, 255, 255";
        if (s.colorType === "cyan") rgb = "0, 242, 254";
        else if (s.colorType === "violet") rgb = "168, 85, 247";
        else if (s.colorType === "sky") rgb = "56, 189, 248";

        // Subtle atmospheric glow for prominent stars
        if (s.hasGlow) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${currentAlpha * 0.22})`;
          ctx.fill();
        }

        // Star core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${currentAlpha})`;
        ctx.fill();
      }

      // Draw occasional shooting star comet
      if (shootingStar && shootingStar.active) {
        const ss = shootingStar;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.016;

        if (ss.opacity <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          ss.active = false;
        } else {
          const tailX = ss.x - Math.cos(ss.angle) * ss.length;
          const tailY = ss.y - Math.sin(ss.angle) * ss.length;

          const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
          grad.addColorStop(0, "rgba(0, 242, 254, 0)");
          grad.addColorStop(0.7, `rgba(56, 189, 248, ${ss.opacity * 0.5})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(ss.x, ss.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Bright photon head
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep Space Cosmic Ambient Nebulae (Soft, rich subtle glows across hero background) */}
      <div className="absolute -top-32 -left-32 h-[550px] w-[550px] rounded-full bg-cyan-500/[0.045] blur-[120px]" />
      <div className="absolute top-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-indigo-600/[0.035] blur-[140px]" />
      <div className="absolute top-1/2 -right-20 h-[600px] w-[600px] rounded-full bg-fuchsia-600/[0.04] blur-[150px]" />

      {/* HTML5 High-DPI Starfield Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
