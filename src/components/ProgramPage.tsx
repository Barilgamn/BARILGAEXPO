import React from 'react';
import { ProgramSection } from './ProgramSection';

/** Хөтөлбөрийн бие даасан хуудас (/program).
 *  Нүүр хуудасны хөтөлбөрийн хэсэгтэй ижил агуулгыг ашиглана — админаас
 *  хөтөлбөрөө засахад хоёр газарт зэрэг шинэчлэгдэнэ. */
export const ProgramPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 pt-16">
    <ProgramSection />
  </div>
);
