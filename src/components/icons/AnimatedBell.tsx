"use client";

import { motion, type Variants } from "motion/react";
import { Bell } from "@phosphor-icons/react";

const wiggle: Variants = {
  idle: { rotate: 0 },
  ring: {
    rotate: [0, -14, 12, -8, 4, 0],
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};

/** Sino do Phosphor com o balanço de "toque" do animate-ui — toca sozinho ao montar e de novo a cada `trigger`. */
export function AnimatedBell({ size = 24, color = "#9fe870", trigger }: { size?: number; color?: string; trigger?: unknown }) {
  return (
    <motion.span
      style={{ display: "inline-flex", transformOrigin: "50% 20%" }}
      variants={wiggle}
      initial="idle"
      animate="ring"
      key={String(trigger)}
    >
      <Bell size={size} color={color} weight="regular" />
    </motion.span>
  );
}
