"use client";

import Image from "next/image";
import { motion, type MotionValue } from "motion/react";

export function HeroScene({
  rotateX,
  rotateY,
  x,
  y,
  reduced,
}: {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  reduced: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1600px]">
      <div className="hero-atmosphere absolute inset-[-12%] bg-[radial-gradient(ellipse_at_18%_16%,rgba(157,0,59,0.28)_0%,transparent_48%),radial-gradient(ellipse_at_86%_22%,rgba(215,255,47,0.22)_0%,transparent_44%),radial-gradient(ellipse_at_70%_78%,rgba(157,0,59,0.16)_0%,transparent_46%),radial-gradient(ellipse_at_28%_72%,rgba(215,255,47,0.1)_0%,transparent_40%),linear-gradient(180deg,#f3e8eb_0%,#faf8f6_48%,#f1efe4_100%)]" />

      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={
          reduced
            ? undefined
            : {
                rotateX,
                rotateY,
                x,
                y,
                transformPerspective: 1600,
              }
        }
      >
        <div className="hero-glass-field" aria-hidden>
          <div className="hero-glass-plate hero-glass-plate-a">
            <div className="hero-glass-media">
              <Image
                src="/hero/glass-blue.png"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 120vw, 80vw"
                className="object-cover object-[35%_40%] scale-[1.35]"
              />
            </div>
            <div className="hero-glass-tint hero-glass-tint-wine" />
          </div>

          <div className="hero-glass-plate hero-glass-plate-b">
            <div className="hero-glass-media">
              <Image
                src="/hero/glass-violet.png"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 70vw"
                className="object-cover object-[60%_45%] scale-[1.45] -scale-x-100"
              />
            </div>
            <div className="hero-glass-tint hero-glass-tint-rose" />
          </div>

          <div className="hero-glass-plate hero-glass-plate-c">
            <div className="hero-glass-media">
              <Image
                src="/hero/glass-blue.png"
                alt=""
                fill
                sizes="(max-width: 768px) 90vw, 60vw"
                className="object-cover object-[70%_60%] scale-[1.5] rotate-12"
              />
            </div>
            <div className="hero-glass-tint hero-glass-tint-lime" />
          </div>

          <div className="hero-slab hero-slab-a" />
          <div className="hero-slab hero-slab-b" />
          <div className="hero-slab hero-slab-c" />

          <div className="hero-ring hero-ring-a" />
          <div className="hero-ring hero-ring-b" />
          <div className="hero-ring hero-ring-c" />

          <span className="hero-chip hero-chip-a" />
          <span className="hero-chip hero-chip-b" />
          <span className="hero-chip hero-chip-c" />
          <span className="hero-chip hero-chip-d" />

          <div className="hero-veil hero-veil-a" />
          <div className="hero-veil hero-veil-b" />
          <div className="hero-veil hero-veil-c" />
        </div>
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(250,248,246,0.08)_0%,rgba(250,248,246,0.42)_55%,rgba(250,248,246,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#faf8f6] via-[#faf8f6]/80 to-transparent" />
    </div>
  );
}
