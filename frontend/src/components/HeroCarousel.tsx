"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const heroImages = [
  {
    src: "/bitcoin.jpg",
    alt: "Bitcoin",
    title: "Predict the Future",
    subtitle:
      "Trade on outcomes of real-world events with transparent, decentralized markets powered by blockchain technology.",
    badge: "Crypto Markets",
  },
  {
    src: "/elonmusk.jpg",
    alt: "Elon Musk",
    title: "Predict the Future",
    subtitle:
      "Trade on outcomes of real-world events with transparent, decentralized markets powered by blockchain technology.",
    badge: "Trends Markets",
  },
  {
    src: "/intermilan.jpg",
    alt: "Inter Milan",
    title: "Predict the Future",
    subtitle:
      "Trade on outcomes of real-world events with transparent, decentralized markets powered by blockchain technology.",
    badge: "Sports Markets",
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full overflow-hidden -mt-8">
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${image.src})`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: index === currentIndex ? 1 : 0,
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
            }}
          >
            {/* Dim overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20 backdrop-blur-sm">
                <Zap className="w-3 h-3 mr-1" />
                {heroImages[currentIndex].badge}
              </Badge>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {heroImages[currentIndex].title}
            </motion.h1>

            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {heroImages[currentIndex].subtitle}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="sm"
                className="bg-white text-black hover:bg-white/90 px-4 sm:px-6 md:px-8 text-sm sm:text-base w-full sm:w-auto"
                onClick={() => router.push("/markets")}
              >
                <Target className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Explore Markets
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white text-white hover:bg-white/10 backdrop-blur-sm px-4 sm:px-6 md:px-8 text-sm sm:text-base w-full sm:w-auto"
                onClick={() => router.push("/create")}
              >
                <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create Market
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2 sm:space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
