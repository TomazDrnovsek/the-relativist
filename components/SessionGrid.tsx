import React from 'react';
import { HSL } from '../types';
import { hslToString } from '../utils/color';

interface SessionGridProps {
  palette: HSL[];
  progress: (number | null)[]; 
  activeSlot: number; 
  size: 'sm' | 'lg' | 'card';
  animated?: boolean; // NEW PROP: Control animation
}

const SessionGrid: React.FC<SessionGridProps> = ({ 
    palette, 
    progress, 
    activeSlot, 
    size,
    animated = true // Default to true (normal gameplay)
}) => {
  let containerClasses = '';
  
  switch (size) {
      case 'lg':
          containerClasses = 'w-64 h-64 gap-1';
          break;
      case 'card':
          containerClasses = 'w-full aspect-square gap-0.5';
          break;
      case 'sm':
      default:
          containerClasses = 'w-16 h-16 gap-[1px]';
          break;
  }
  
  // Only animate if size is Large AND animation is explicitly requested
  const shouldAnimate = size === 'lg' && animated;

  return (
    <div className={`grid grid-cols-4 ${containerClasses}`}>
      {palette.map((color, idx) => {
        const isCompleted = progress[idx] !== null;
        const isActive = idx === activeSlot;
        
        // If printing (animated=false), force opacity: 1 immediately.
        const style: React.CSSProperties = shouldAnimate ? {
            opacity: 0,
            animation: 'swatchReveal 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            animationDelay: `${250 + idx * 40}ms` 
        } : {};

        return (
          <div 
            key={idx}
            className="relative w-full h-full"
            style={style}
          >
            {isCompleted && (
               <div 
                 className="absolute inset-0 w-full h-full" 
                 style={{ backgroundColor: hslToString(color) }}
               />
            )}

            {isActive && (
               <div className="absolute inset-0 w-full h-full border border-[#121212] animate-pulse z-10">
                   <div 
                     className="absolute inset-1 opacity-20"
                     style={{ backgroundColor: hslToString(color) }}
                   />
               </div>
            )}

            {!isCompleted && !isActive && (
               <div className="absolute inset-0 w-full h-full border border-neutral-200 bg-neutral-50/50" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SessionGrid;