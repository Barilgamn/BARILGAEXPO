import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
}

/** Мэдээний доор олон зургийг slider байдлаар харуулна. */
export const ImageSlider: React.FC<Props> = ({ images }) => {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) return null;

  const go = (dir: number) => {
    setIndex(prev => (prev + dir + images.length) % images.length);
  };

  return (
    <div className="w-full">
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
        <div className="aspect-[16/9] w-full">
          <img
            src={images[index]}
            alt={`Зураг ${index + 1}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain bg-black/5"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Өмнөх"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Дараах"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-md">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === index ? 'border-red-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
