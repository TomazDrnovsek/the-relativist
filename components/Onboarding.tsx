import React, { useState, useEffect } from 'react';
import { HSL } from '../types';
import { hslToString, calculateMatchScore } from '../utils/color';
import Slider from './Slider';
import ShapePrimitive from './ShapePrimitive';
import WinEffect from './WinEffect';
import { audio } from '../utils/audio';

interface OnboardingProps {
  onComplete: () => void;
}

const TARGET_COLOR: HSL = { h: 355, s: 82, l: 50 }; // Bauhaus Red
const INITIAL_GUESS: HSL = { h: 210, s: 50, l: 50 }; // Neutral Blue

// Bauhaus Palette for background cycle
const BG_CYCLE = [
    { h: 0, s: 0, l: 7 },     // Black (#121212 equivalent)
    { h: 0, s: 0, l: 96 },    // White
    { h: 46, s: 98, l: 46 },  // Yellow
    { h: 213, s: 65, l: 33 }, // Blue
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [userColor, setUserColor] = useState<HSL>(INITIAL_GUESS);
  const [bgIndex, setBgIndex] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Cycle background every 5 seconds to demonstrate relativity (Slower)
  useEffect(() => {
    const interval = setInterval(() => {
        setBgIndex(prev => (prev + 1) % BG_CYCLE.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check match condition automatically when userColor changes
  useEffect(() => {
    if (isSuccess) return;

    const score = calculateMatchScore(TARGET_COLOR, userColor);
    
    // Threshold set to 80% as requested
    if (score >= 80) {
        setIsSuccess(true);
        audio.playSuccess();
        audio.triggerHaptic([10, 50, 10, 50]);
        // Proceed after animation
        setTimeout(() => {
            onComplete();
        }, 2500); 
    }
  }, [userColor, isSuccess, onComplete]);

  const handleUpdate = (key: keyof HSL, val: number) => {
    if (isSuccess) return;
    setUserColor(prev => ({ ...prev, [key]: val }));
  };

  // Gradients for sliders
  const hueGradient = 'linear-gradient(to right, #F00 0%, #FF0 17%, #0F0 33%, #0FF 50%, #00F 67%, #F0F 83%, #F00 100%)';
  const satGradient = `linear-gradient(to right, ${hslToString({h: userColor.h, s: 0, l: userColor.l})}, ${hslToString({h: userColor.h, s: 100, l: userColor.l})})`;
  const lightGradient = `linear-gradient(to right, #121212, ${hslToString({h: userColor.h, s: userColor.s, l: 50})}, #FFF)`;

  const currentBg = BG_CYCLE[bgIndex];
  const isDarkBg = currentBg.l < 50;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5F2EB] font-sans overflow-hidden select-none text-[#121212]">
      
      {/* 1. THE STAGE (Comparisons) - Expanded height now that header is gone */}
      <div className="h-[55%] flex flex-col w-full relative z-10 border-b border-[#121212]">
          
          {/* Reference (Top Half) */}
          <div className="flex-1 w-full bg-[#F5F2EB] flex items-center justify-center relative border-b border-[#121212]/10">
               <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-normal uppercase tracking-widest text-[#737373] pointer-events-none">
                  REF
               </span>
               <div className="w-16 h-16 sm:w-24 sm:h-24 drop-shadow-sm">
                   <ShapePrimitive 
                       hue={TARGET_COLOR.h} 
                       color={hslToString(TARGET_COLOR)} 
                       isBauhausMode={true} 
                   />
               </div>
          </div>

          {/* User (Bottom Half - Cycling BG) */}
          <div 
            className="flex-1 w-full flex items-center justify-center relative transition-colors duration-[3000ms] ease-in-out"
            style={{ backgroundColor: hslToString(currentBg) }}
          >
               <span 
                className={`absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-normal uppercase tracking-widest pointer-events-none transition-colors duration-500 ${isDarkBg ? 'text-white/60' : 'text-black/60'}`}
               >
                  ADJUST
               </span>
               
               <div className="w-16 h-16 sm:w-24 sm:h-24 drop-shadow-sm transition-transform duration-300" style={{ transform: isSuccess ? 'scale(1.1)' : 'scale(1)' }}>
                   <ShapePrimitive 
                       hue={userColor.h} 
                       color={hslToString(userColor)} 
                       isBauhausMode={true} 
                       // Add subtle border if background and foreground are both dark to maintain visibility (Accessibility)
                       hasBorder={isDarkBg && userColor.l < 25} 
                   />
               </div>
          </div>
      </div>

      {/* 2. CONTROLS */}
      <div className="h-[45%] bg-[#F5F2EB] flex flex-col px-6 justify-center pb-safe-bottom relative z-30">
          <div className="w-full max-w-md mx-auto flex flex-col gap-10">
              <Slider 
                  label="H" 
                  value={userColor.h} min={0} max={360} 
                  onChange={(v) => handleUpdate('h', v)} 
                  gradient={hueGradient} 
                  disabled={isSuccess}
              />
              <Slider 
                  label="S" 
                  value={userColor.s} min={0} max={100} 
                  onChange={(v) => handleUpdate('s', v)} 
                  gradient={satGradient} 
                  disabled={isSuccess}
              />
              <Slider 
                  label="L" 
                  value={userColor.l} min={0} max={100} 
                  onChange={(v) => handleUpdate('l', v)} 
                  gradient={lightGradient} 
                  disabled={isSuccess}
              />
          </div>
      </div>

      {/* Success Overlay */}
      {isSuccess && (
          <div className="absolute inset-0 z-50 bg-[#F5F2EB] flex flex-col items-center justify-center animate-in fade-in duration-500">
             <WinEffect isBauhausMode={true} />
             <h1 className="text-5xl font-black text-[#121212] tracking-tighter mb-4">
                MATCH
             </h1>
             <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 animate-pulse">
                SENSOR CALIBRATED
             </p>
          </div>
      )}
    </div>
  );
};

export default Onboarding;