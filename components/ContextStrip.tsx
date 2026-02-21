import React from 'react';
import { StripData } from '../types';
import { hslToString, getPerceivedBrightness } from '../utils/color';
import { useSpring } from '../hooks/useSpring';
import ShapePrimitive from './ShapePrimitive';

interface ContextStripProps {
  strip: StripData;
  label: string;
  labelColor: string;
  isSelected: boolean;
  isDeveloped: boolean;
  isBauhausMode: boolean;
  onClick: (id: number) => void;
  isLast: boolean;
}

const ContextStrip: React.FC<ContextStripProps> = ({
  strip,
  label,
  labelColor,
  isSelected,
  isDeveloped,
  isBauhausMode,
  onClick,
  isLast
}) => {
  // Spring target: 0 (collapsed/normal) to 1 (expanded/selected)
  const springVal = useSpring(isSelected ? 1 : 0, { stiffness: 180, damping: 18 });

  // Interpolate values based on spring state
  // GRID SYSTEM UPDATE: 
  // Multiplier set to 1.0 (Max Flex 2). 
  // This creates a clean 2:1:1 ratio (Quarters), adhering to the grid philosophy.
  const flex = 1 + springVal * 1.0;
  
  // Scale: 0.8 (Unselected) -> 1.2 (Selected)
  const scale = 0.8 + springVal * 0.4;

  // VISUAL UPDATE: Determine High Contrast Color for Active State
  // If background is bright, use Black. If dark, use White.
  const bgBrightness = getPerceivedBrightness(strip.backgroundColor);
  const activeTextColor = bgBrightness > 130 ? '#121212' : '#FFFFFF';

  return (
    <div 
        onClick={() => onClick(strip.id)}
        className={`
            w-full flex items-center justify-center relative
            cursor-pointer active:opacity-95 touch-manipulation
            ${!isLast ? 'border-b border-[#121212]' : ''}
        `}
        style={{ 
            backgroundColor: isDeveloped ? '#808080' : hslToString(strip.backgroundColor),
            flex: flex,
            minHeight: '48px',
            transition: 'background-color 0.7s ease', 
            willChange: 'flex'
        }}
    >
        {/* Label - Absolute Positioned */}
        {/* TYPOGRAPHY UPDATE: Bold + High Contrast when selected */}
        <span 
            className={`
                absolute left-6 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest pointer-events-none z-30 transition-all duration-300
                ${isSelected ? 'font-bold scale-110 origin-left' : 'font-normal scale-100'}
            `}
            style={{ 
                color: isSelected ? activeTextColor : labelColor,
                opacity: isDeveloped ? 0 : 1,
            }}
        >
            {label}
        </span>

        {/* Layered Transform Wrapper */}
        <div 
            className={`
              relative transition-opacity duration-300
              ${isSelected ? 'z-20' : 'z-10'}
            `}
            style={{
                transform: `scale(${scale})`,
                opacity: 1, 
                transition: 'opacity 0.4s ease',
                willChange: 'transform'
            }}
        >
            {/* The Chip (Shape & Color) */}
            <ShapePrimitive 
                color={hslToString(strip.chipColor)}
                hue={strip.chipColor.h}
                isBauhausMode={isBauhausMode}
                hasBorder={false} // Stroke None for Player Strips
                className="w-14 h-14 sm:w-[72px] sm:h-[72px]"
            />
        </div>
    </div>
  );
};

export default ContextStrip;