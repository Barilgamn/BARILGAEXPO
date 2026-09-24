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
    <section id="gallery" className="section-pad surface border-t hairline">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="mb-12 md:mb-16">
          <div className="eyebrow mb-4 flex items-center gap-2">
            <Camera className="w-3 h-3" />
            {t('gallery_title')}
          </div>
          <h2 className="display text-3xl sm:text-5xl md:text-6xl text-blue-950 mb-5">
            {t('gallery_title')}
          </h2>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
            {t('gallery_desc')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {IMAGES.map((src, idx) => (
            <div 
              key={idx} 
              className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-[4/3] border hairline transition-all"
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
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-blue-950 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                  <Camera className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Хаах товч — хамгийн дээд давхаргад, touch дэмжинэ */}
          <button
            type="button"
            className="absolute top-4 right-4 z-[110] text-blue-950 bg-white/20 active:bg-white/40 p-3 rounded-full"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          >
            <X className="w-7 h-7" />
          </button>

          {/* Зүүн/Баруун товч */}
          <button
            type="button"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-[110] text-blue-950 bg-black/50 active:bg-black/80 p-3 rounded-full"
            onClick={(e) => { e.stopPropagation(); prevImage(e); }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-[110] text-blue-950 bg-black/50 active:bg-black/80 p-3 rounded-full"
            onClick={(e) => { e.stopPropagation(); nextImage(e); }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Зураг */}
          <div
            className="flex items-center justify-center w-full h-full px-14"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={optimizeImage(IMAGES[currentImageIdx], 1600)}
              alt={`${t('gallery_title')} ${currentImageIdx + 1}`}
              decoding="async"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Dots indicator */}
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-black/50 rounded-full z-[110] overflow-x-auto max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {IMAGES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentImageIdx(idx)}
                className={`h-2 rounded-full transition-all flex-shrink-0 ${idx === currentImageIdx ? 'bg-red-400 w-6' : 'bg-white/40 w-2'}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
