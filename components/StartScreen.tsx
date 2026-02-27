import React, { useState, useEffect } from 'react';
import ShapePrimitive from './ShapePrimitive';
import { hslToString } from '../utils/color';

interface StartScreenProps {
  onStart: () => void;
}

const TUNING_STATES = [
  { hue: 0,   label: 'RED'    }, // Square
  { hue: 60,  label: 'YELLOW' }, // Triangle
  { hue: 240, label: 'BLUE'   }, // Circle
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
      className="fixed inset-0 z-[100] bg-[#F5F2EB] cursor-pointer select-none animate-in fade-in duration-700 font-sans"
    >
      {/* LOGO — ~36% from top, single line guaranteed */}
      <div className="absolute top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
        <h1 className="text-4xl font-black lowercase tracking-tighter leading-none text-[#121212]">
          the relativist.
        </h1>
      </div>

      {/* ANIMATION — true screen center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-20 h-20 transition-all duration-500 ease-out">
          <ShapePrimitive
            hue={currentTuning.hue}
            color={hslToString({ h: currentTuning.hue, s: 85, l: 50 })}
            isBauhausMode={true}
            hasBorder={false}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* TEXT GROUP — anchored to bottom */}
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
        <div className="animate-pulse text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#121212] whitespace-nowrap">
          TAP TO BEGIN CALIBRATION
        </div>
        <div className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase whitespace-nowrap">
          ALIGN YOUR PERCEPTION
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
