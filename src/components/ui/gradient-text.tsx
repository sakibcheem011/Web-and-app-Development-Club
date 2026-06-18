"use client";
import React from "react";
import { motion, MotionProps } from "framer-motion";

import { cn } from "../../lib/utils";

interface GradientTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

function GradientText({
  className,
  children,
  as: Component = "span",
  ...props
}: GradientTextProps) {
  const MotionComponent = (motion as any)[Component as string] || motion.span;

  return (
    <MotionComponent
      className={cn(
        "relative inline-flex bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--color-1))] via-[hsl(var(--color-2))] to-[hsl(var(--color-3))] animate-pulse",
        className,
      )}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

export { GradientText };
