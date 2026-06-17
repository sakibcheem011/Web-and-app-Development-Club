import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

type Review = {
  id: string | number;
  name: string;
  affiliation: string;
  quote: string;
  imageSrc: string;
  thumbnailSrc: string;
};

interface TestimonialSliderProps {
  reviews: Review[];
  className?: string;
}

export const TestimonialSlider = ({
  reviews,
  className,
}: TestimonialSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const activeReview = reviews[currentIndex];

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleThumbnailClick = (index: number) => {
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
  };

  const thumbnailReviews = reviews
    .filter((_, i) => i !== currentIndex)
    .slice(0, 3);

  const imageVariants = {
    enter: (direction: "left" | "right") => ({
      y: direction === "right" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { y: 0, opacity: 1 },
    exit: (direction: "left" | "right") => ({
      y: direction === "right" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const textVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? 50 : -50,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? -50 : 50,
      opacity: 0,
    }),
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <div
      className={cn(
        "relative w-full min-h-[500px] overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 md:p-12 shadow-sm",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-center">
        {/* === Left Column: Meta and Thumbnails === */}
        <div className="md:col-span-3 flex flex-row md:flex-col justify-between h-full order-2 md:order-1 self-stretch">
          <div className="flex flex-row md:flex-col justify-between md:justify-start space-x-4 md:space-x-0 md:space-y-4">
            {/* Pagination */}
            <span className="text-sm text-slate-400 font-mono">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(reviews.length).padStart(2, "0")}
            </span>
            {/* Vertical "Leaders" Text */}
            <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-800 md:[writing-mode:vertical-rl] md:rotate-180 hidden md:block">
              Leaders Coordinator
            </h2>
          </div>

          {/* Thumbnail Navigation */}
          <div className="flex space-x-2 mt-8 md:mt-0 items-end">
            {thumbnailReviews.map((review) => {
              const originalIndex = reviews.findIndex(
                (r) => r.id === review.id
              );
              return (
                <button
                  key={review.id}
                  onClick={() => handleThumbnailClick(originalIndex)}
                  className="overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-lg w-12 h-16 md:w-16 md:h-20 opacity-65 hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 border border-slate-100"
                  aria-label={`View profile of ${review.name}`}
                >
                  {review.thumbnailSrc ? (
                    <img
                      src={review.thumbnailSrc}
                      alt={review.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-450 dark:text-slate-550 font-mono font-bold select-none">
                      👤
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* === Center Column: Main Image === */}
        <div className="md:col-span-4 relative h-64 sm:h-80 md:h-96 md:min-h-[380px] order-1 md:order-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900">
          <AnimatePresence initial={false} custom={direction}>
            {activeReview.imageSrc ? (
              <motion.img
                key={currentIndex}
                src={activeReview.imageSrc}
                alt={activeReview.name}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                referrerPolicy="no-referrer"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <motion.div
                key={`empty-${currentIndex}`}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-150/40 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-650 gap-1 select-none"
              >
                <span className="text-4xl text-slate-350 dark:text-slate-650">👤</span>
                <span className="text-[10px] font-bold tracking-wider font-mono uppercase text-slate-400 dark:text-slate-600">No Photo Uploaded</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* === Right Column: Text and Navigation === */}
        <div className="md:col-span-5 flex flex-col justify-between h-full md:pl-6 order-3 md:order-3 self-stretch min-h-[220px]">
          {/* Text Content */}
          <div className="relative overflow-hidden pt-4 md:pt-8 min-h-[160px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                <p className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider">
                  {activeReview.affiliation}
                </p>
                <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-1">
                  {activeReview.name}
                </h3>
                <blockquote className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed italic">
                  "{activeReview.quote}"
                </blockquote>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 cursor-pointer"
              onClick={handlePrev}
              aria-label="Previous dynamic card"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="rounded-full w-10 h-10 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              onClick={handleNext}
              aria-label="Next dynamic card"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
