import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import ShapePrimitive from './ShapePrimitive';
import { hslToString } from '../utils/color';

interface StartScreenProps {
  onStart: () => void;
}

const TUNING_STATES = [
    { hue: 0, label: 'RED' },       // Square
    { hue: 60, label: 'YELLOW' },   // Triangle
    { hue: 240, label: 'BLUE' }     // Circle
];

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setBeat((prev) => (prev + 1) % TUNING_STATES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const currentTuning = TUNING_STATES[beat];

  return (
    <div 
      onClick={onStart}
      className="fixed inset-0 z-[100] bg-[#F5F2EB] flex flex-col items-center justify-center cursor-pointer select-none animate-in fade-in duration-700 font-sans"
    >
      <div className="transform scale-150 origin-center mb-2">
        <Logo />
      </div>

      {/* Calibration Heartbeat */}
      <div className="my-12 flex flex-col items-center gap-6 h-24 justify-center">
        {/* The Shape */}
        <div className="w-16 h-16 transition-all duration-500 ease-out">
            <ShapePrimitive
                hue={currentTuning.hue}
                // Vivid Bauhaus Primaries
                color={hslToString({ h: currentTuning.hue, s: 85, l: 50 })}
                isBauhausMode={true} 
                hasBorder={false}
                className="w-full h-full drop-shadow-sm"
            />
        </div>
        
        {/* The Micro-Label (Technical Feedback) */}
        <div className="text-[9px] font-mono font-medium uppercase tracking-[0.25em] text-neutral-400 tabular-nums animate-pulse">
             SYSTEM_READY // {currentTuning.hue.toString().padStart(3, '0')}°
        </div>
      </div>
      
      <div className="text-[10px] font-bold tracking-[0.3em] text-[#121212] uppercase opacity-60">
        ALIGN YOUR PERCEPTION
      </div>
    </div>
  );
};

export default StartScreen;