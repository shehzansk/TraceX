"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureBoxes from "@/components/FeatureBoxes";

export default function HomePage() {
  const images: string[] = ["/img1.png", "/img2.png", "/img3.png", "/img4.png"];
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextImage();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentImageIndex]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Enlarged Slideshow Section */}
      <div className="relative h-[520px] overflow-hidden mt-8 border-b border-gray-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
          />
        </AnimatePresence>
        {/* Left Arrow Button */}
        <button
          onClick={handlePreviousImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-600 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-300"
        >
          &#8678;
        </button>
        {/* Right Arrow Button */}
        <button
          onClick={handleNextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-600 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-300"
        >
          &#8680;
        </button>
      </div>

      <section className="flex flex-col items-center justify-center gap-8 py-4 md:py-10">
        <div className="inline-block max-w-lg text-center mt-12">
          <h1 className="text-5xl font-bold">Blockchain for&nbsp;</h1>
          <h1 className="text-5xl font-bold text-cyan-500">Justice.&nbsp;</h1>
          <br />
          <h2 className="text-xl mt-4">
            A blockchain-based evidence management system to prevent manipulation in courts.
          </h2>
        </div>
      </section>
      <FeatureBoxes />
    </div>
  );
}
