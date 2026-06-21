"use client";
import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-slate-950 transition-colors duration-300 overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          //   I'm sorry but this is what peak developer performance looks like // trigger warning
          className={cn(
            `
          [--aurora:linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_40%,var(--blue-300)_60%,var(--violet-200)_80%)]
          [background-image:var(--aurora)]
          [background-size:200%,_100%]
          [background-position:50%_50%,50%_50%]
          after:content-[""] after:absolute after:inset-0 after:[background-image:var(--aurora)] 
          after:[background-size:150%,_100%] 
          after:animate-aurora
          after:origin-center
          after:scale-150
          pointer-events-none
          absolute inset-0 opacity-20 dark:opacity-15 will-change-transform transform-gpu`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        ></div>
      </div>
      {children}
    </div>
  );
};
