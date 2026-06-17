"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Twitter,
  Youtube,
  Linkedin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface Testimonial {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Dr. Md. MRINAL KANTI BAOWALY",
    title: "Chief Faculty Advisor & Head of Dept. (GSTU)",
    description:
      "The Web and App Development Club serves as the vital link between classroom learning and the ever-evolving tech industry. We are committed to providing our students with the resources and platforms they need to lead the next generation of digital transformation.",
    imageUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Dr. Md. Akram Hossain",
    title: "Chief Faculty Advisor & Head of Dept. (BSMRSTU)",
    description:
      "The CSE Club serves as the vital link between classroom learning and the ever-evolving tech industry. We are committed to providing our students with the resources and platforms they need to lead the next generation of digital transformation.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
];

export interface TestimonialCarouselProps {
  className?: string;
  testimonials?: Testimonial[];
}

export function TestimonialCarousel({ className, testimonials = defaultTestimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () =>
    setCurrentIndex((index) => (index + 1) % testimonials.length);
  const handlePrevious = () =>
    setCurrentIndex(
      (index) => (index - 1 + testimonials.length) % testimonials.length
    );

  const currentTestimonial = testimonials[currentIndex];

  const socialIcons = [
    { icon: Github, url: currentTestimonial.githubUrl, label: "GitHub" },
    { icon: Twitter, url: currentTestimonial.twitterUrl, label: "Twitter" },
    { icon: Youtube, url: currentTestimonial.youtubeUrl, label: "YouTube" },
    { icon: Linkedin, url: currentTestimonial.linkedinUrl, label: "LinkedIn" },
  ].filter(item => item.url);

  return (
    <div className={cn("w-full max-w-5xl mx-auto px-4", className)}>
      {/* Desktop layout */}
      <div className="hidden md:flex relative items-center">
        {/* Avatar */}
        <div className="w-[470px] h-[470px] rounded-3xl overflow-hidden bg-gray-200 dark:bg-neutral-800 flex-shrink-0 border border-slate-250/20 shadow-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.imageUrl || "empty"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900"
            >
              {currentTestimonial.imageUrl ? (
                <img
                  src={currentTestimonial.imageUrl}
                  alt={currentTestimonial.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 gap-2 select-none">
                  <span className="text-6xl text-slate-350 dark:text-slate-650">👤</span>
                  <span className="text-xs font-bold tracking-wider font-mono uppercase text-slate-400 dark:text-slate-600">No Photo Provided</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl shadow-2xl p-8 ml-[-80px] z-10 max-w-xl flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.name || "empty-name"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {currentTestimonial.name || (
                    <span className="text-slate-400 dark:text-slate-500 font-medium italic">Unassigned (Vacant)</span>
                  )}
                </h2>

                <p className="text-sm font-semibold tracking-wider font-mono uppercase text-emerald-700 dark:text-emerald-400">
                  {currentTestimonial.title}
                </p>
              </div>

              <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed mb-8 italic">
                "{currentTestimonial.description}"
              </p>

              <div className="flex space-x-4">
                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                  <a
                    key={label}
                    href={url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-900 hover:bg-emerald-600 dark:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer"
                    aria-label={label}
                  >
                    <IconComponent className="w-4 h-4 text-white dark:text-gray-900" />
                  </a>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden max-w-sm mx-auto text-center bg-transparent">
        {/* Avatar */}
        <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-3xl overflow-hidden mb-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.imageUrl || "empty"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              {currentTestimonial.imageUrl ? (
                <img
                  src={currentTestimonial.imageUrl}
                  alt={currentTestimonial.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 gap-2 select-none">
                  <span className="text-6xl text-slate-350 dark:text-slate-650">👤</span>
                  <span className="text-xs font-bold tracking-wider font-mono uppercase text-slate-400 dark:text-slate-600">No Photo Provided</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card content */}
        <div className="px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.name || "empty-name"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {currentTestimonial.name || (
                  <span className="text-slate-400 dark:text-slate-500 font-medium italic">Unassigned (Vacant)</span>
                )}
              </h2>
              
              <p className="text-sm font-bold font-mono tracking-wider uppercase text-emerald-700 dark:text-emerald-400 mb-4">
                {currentTestimonial.title}
              </p>
              
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-6 italic">
                "{currentTestimonial.description}"
              </p>
              
              <div className="flex justify-center space-x-4">
                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                  <a
                    key={label}
                    href={url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-900 hover:bg-emerald-600 dark:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
                    aria-label={label}
                  >
                    <IconComponent className="w-4 h-4 text-white dark:text-gray-900" />
                  </a>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation */}
      {testimonials.length > 1 && (
        <div className="flex justify-center items-center gap-6 mt-8">
          {/* Previous */}
          <button
            onClick={handlePrevious}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-650" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, testimonialIndex) => (
              <button
                key={testimonialIndex}
                onClick={() => setCurrentIndex(testimonialIndex)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors cursor-pointer",
                  testimonialIndex === currentIndex
                    ? "bg-emerald-600"
                    : "bg-slate-300"
                )}
                aria-label={`Go to testimonial ${testimonialIndex + 1}`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-gray-650" />
          </button>
        </div>
      )}
    </div>
  );
}
