import React from 'react';
import { HSL } from '../types';
import { hslToString, FIXED_CENTER_COLOR } from '../utils/color';

interface ReferenceCardProps {
  targetBg: HSL;
}

const ReferenceCard: React.FC<ReferenceCardProps> = ({ targetBg }) => {
  return (
    // Truth to Materials: Flat, bordered, no fake depth or rotation.
    <div className="bg-[#F9F7F1] p-2 pb-2 border border-[#121212] w-24 sm:w-28">
      <div 
        className="w-full aspect-square border border-neutral-200 relative overflow-hidden"
        style={{ backgroundColor: hslToString(targetBg) }}
      >
        <div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full shadow-sm"
           style={{ backgroundColor: hslToString(FIXED_CENTER_COLOR) }}
        />
      </div>
    </div>
  );
};

export default ReferenceCard;