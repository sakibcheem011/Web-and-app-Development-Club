"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Sparkles } from "lucide-react";

export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

export function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-emerald-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-emerald-500",
  titleClassName = "text-emerald-500 dark:text-emerald-400",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[16rem] sm:w-[22rem] max-w-[85vw] -skew-y-[3deg] sm:-skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-white/70 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-800 backdrop-blur-sm px-4 py-3 transition-all duration-700 after:hidden sm:after:absolute sm:after:-right-1 sm:after:top-[-5%] sm:after:h-[110%] sm:after:w-[20rem] sm:after:bg-gradient-to-l sm:after:from-transparent sm:after:to-transparent sm:after:content-[''] hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:bg-white dark:hover:bg-slate-800/90 hover:scale-[1.02] shadow-sm hover:shadow-md [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("relative inline-block rounded-full bg-emerald-100 dark:bg-emerald-950 p-1.5", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-base font-bold font-display tracking-tight", titleClassName)}>{title}</p>
      </div>
      <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 break-words">
        {description}
      </p>
      <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-slate-200 dark:before:outline-slate-800 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 dark:before:bg-slate-950/50 grayscale hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-12 translate-y-8 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-slate-200 dark:before:outline-slate-800 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 dark:before:bg-slate-950/50 grayscale hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-24 translate-y-16 hover:translate-y-6",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 py-6">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
