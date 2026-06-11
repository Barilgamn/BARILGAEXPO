import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { optimizeImage } from '../utils/image';

export function GallerySection() {
  const { data } = useAdmin();
  const IMAGES = data.gallery;
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const openLightbox = (idx: number) => {
    setCurrentImageIdx(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % IMAGES.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev === 0 ? IMAGES.length - 1 : prev - 1));
  };
  
  // Close lightbox on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    
    if (lightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  return (
    <section id="gallery" className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-800 font-medium text-sm mb-6">
            <Camera className="w-4 h-4" />
            {t('gallery_title')}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
            {t('gallery_title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            {t('gallery_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {IMAGES.map((src, idx) => (
            <div 
              key={idx} 
              className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-[4/3] shadow-sm hover:shadow-xl transition-all"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={optimizeImage(src, 500)}
                srcSet={`${optimizeImage(src, 500)} 500w, ${optimizeImage(src, 800)} 800w`}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                alt={`${t('gallery_title')} ${idx + 1}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white transform scale-50 group-hover:scale-100 transition-transform duration-300">
                  <Camera className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center isolate" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute left-2 md:left-8 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={prevImage}
            >
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <button 
              className="absolute right-2 md:right-8 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={nextImage}
            >
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            
            <div className="relative flex items-center justify-center h-[70vh] md:h-[85vh] w-full px-16">
              <img
                src={optimizeImage(IMAGES[currentImageIdx], 1600)}
                alt={`${t('gallery_title')} ${currentImageIdx + 1}`}
                decoding="async"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 overflow-hidden px-4 md:px-6 py-2 md:py-3 bg-black/50 backdrop-blur-md rounded-full shadow-lg">
              {IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`h-2 md:h-2.5 rounded-full transition-all focus:outline-none ${idx === currentImageIdx ? 'bg-red-400 w-8 md:w-10' : 'bg-white/40 hover:bg-white/80 w-2 md:w-2.5'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
