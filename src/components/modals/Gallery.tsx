import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { galleryItems } from "../../constants/gallery";
import { useIsMobile } from "@/hooks/useIsMobile";

interface GalleryProps {
  onClose: () => void;
}

export default function Gallery({ onClose }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayTitle, setDisplayTitle] = useState("");
  const [displayDescription, setDisplayDescription] = useState("");
  const currentItem = galleryItems[currentIndex];
  const typingTimers = useRef<number[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    typingTimers.current.forEach(clearTimeout);
    typingTimers.current = [];
    setDisplayTitle("");
    setDisplayDescription("");

    const titleDelay = 20;
    const descDelay = 10;
    const titleChars = currentItem.title.split("");
    titleChars.forEach((char, index) => {
      typingTimers.current.push(
        window.setTimeout(() => setDisplayTitle((prev) => prev + char), index * titleDelay)
      );
    });

    const descriptionStart = titleChars.length * titleDelay + 150;
    currentItem.description.split("").forEach((char, index) => {
      typingTimers.current.push(
        window.setTimeout(
          () => setDisplayDescription((prev) => prev + char),
          descriptionStart + index * descDelay
        )
      );
    });

    return () => {
      typingTimers.current.forEach(clearTimeout);
    };
  }, [currentIndex, currentItem.description, currentItem.title]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? galleryItems.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === galleryItems.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center m-6">
        <div className="relative w-full h-full max-w-6xl overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-3xl shadow-2xl shadow-black/40">
          <div className="absolute inset-x-0 z-50 flex items-center bg-gray-900/95 backdrop-blur-sm rounded-t-3xl px-3 py-3">
            <div className="flex items-center gap-2 p-1 mr-3">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <div className="text-sm text-white/90 tracking-wide font-mono">
              Joshua&apos;s Gallery
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-pink-500 transition-colors absolute right-4 p-1 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              aria-label="Close gallery"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        <img
          src={currentItem.img}
          alt={currentItem.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            {displayTitle}
          </h3>
          <p className="text-white/80 mb-4 font-mono">
            {displayDescription}
          </p>

          <div className="flex gap-2 overflow-x-auto max-w-full scrollbar-hide">
            {galleryItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? "border-2 border-green-500 ring-2 ring-green-500/50"
                    : "border border-gray-400/20 dark:border-gray-200/20 hover:border-gray-400/40 dark:hover:border-gray-200/40 opacity-30 hover:opacity-100"
                }`}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {!isMobile && <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-green-500 transition-colors z-20 p-2 bg-black/40 rounded-full hover:bg-black/60"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-green-500 transition-colors z-20 p-2 bg-black/40 rounded-full hover:bg-black/60"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </>}
        
      </div>

      
      </div>
    </>
  );
}