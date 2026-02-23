import React from 'react';
import { audio } from '../utils/audio';
import MechanicalButton from './MechanicalButton';

interface MenuProps {
  onClose: () => void;
  onOpenArchive: () => void;
  isBauhausMode: boolean;
  toggleBauhausMode: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  onRestartOnboarding: () => void;
}

const Menu: React.FC<MenuProps> = ({ 
    onClose, 
    onOpenArchive,
    isBauhausMode, 
    toggleBauhausMode,
    isSoundEnabled,
    toggleSound,
    onRestartOnboarding
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-[#F5F2EB] flex flex-col px-6 pt-safe-top animate-in slide-in-from-left duration-300 font-sans text-[#121212]">
      {/* Header aligned with Main Screen: 1px light border, safe area padding */}
      <div className="-mx-6 px-6 flex justify-between items-center py-4 mb-6 border-b border-[#121212]/5">
        <h2 className="text-4xl font-bold lowercase tracking-[-0.04em]">menu.</h2>
        <MechanicalButton 
            onTrigger={() => {
                audio.playClick();
                onClose();
            }} 
            scaleActive={0.85}
            className="w-12 h-12 flex items-center justify-center border-2 border-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
        >
            ✕
        </MechanicalButton>
      </div>

      <nav className="flex flex-col gap-8 overflow-y-auto overflow-x-hidden w-full flex-1">
        {/* 01 RESUME */}
        <MechanicalButton 
            onTrigger={() => {
                audio.playClick();
                onClose();
            }} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">01</span>
            <span className="flex-1 min-w-0 text-2xl font-light uppercase tracking-widest group-hover:translate-x-2 group-hover:font-bold transition-all text-[#121212] truncate">
                resume
            </span>
        </MechanicalButton>
        
        {/* 02 BAUHAUS */}
        <MechanicalButton 
            onTrigger={toggleBauhausMode} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">02</span>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                <span className="text-2xl font-light uppercase tracking-widest text-[#121212] truncate group-hover:translate-x-2 group-hover:font-bold transition-all">
                    bauhaus
                </span>
                
                <div className="flex items-center ml-4 shrink-0">
                    <div className={`
                        w-12 h-6 border-2 border-[#121212] p-1 relative transition-colors duration-200
                        ${isBauhausMode ? 'bg-[#121212]' : 'bg-transparent'}
                    `}>
                        <div className={`
                            h-full w-1/2 bg-[#121212] transition-all duration-300 ease-out
                            ${isBauhausMode ? 'translate-x-full bg-white' : 'translate-x-0'}
                        `} />
                    </div>
                </div>
            </div>
        </MechanicalButton>

        {/* 03 SOUND */}
        <MechanicalButton 
            onTrigger={toggleSound} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">03</span>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                <span className="text-2xl font-light uppercase tracking-widest text-[#121212] truncate group-hover:translate-x-2 group-hover:font-bold transition-all">
                    sound
                </span>
                
                <div className="flex items-center ml-4 shrink-0">
                    <div className={`
                        w-12 h-6 border-2 border-[#121212] p-1 relative transition-colors duration-200
                        ${isSoundEnabled ? 'bg-[#121212]' : 'bg-transparent'}
                    `}>
                        <div className={`
                            h-full w-1/2 bg-[#121212] transition-all duration-300 ease-out
                            ${isSoundEnabled ? 'translate-x-full bg-white' : 'translate-x-0'}
                        `} />
                    </div>
                </div>
            </div>
        </MechanicalButton>

        {/* 04 TUTORIAL */}
        <MechanicalButton 
            onTrigger={() => {
                audio.playClick();
                onRestartOnboarding();
            }} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">04</span>
            <span className="flex-1 min-w-0 text-2xl font-light uppercase tracking-widest group-hover:translate-x-2 group-hover:font-bold transition-all text-[#121212] truncate">
                tutorial
            </span>
        </MechanicalButton>

        {/* 05 SESSIONS */}
        <MechanicalButton 
            onTrigger={() => {
                audio.playClick();
                onOpenArchive();
            }} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">05</span>
            <span className="flex-1 min-w-0 text-2xl font-light uppercase tracking-widest group-hover:translate-x-2 group-hover:font-bold transition-all text-[#121212] truncate">
                sessions
            </span>
        </MechanicalButton>
      </nav>

      <div className="flex-none pb-safe-bottom pb-12">
        <div className="pt-12 flex justify-center opacity-30">
            <span className="text-[9px] font-mono tracking-widest text-[#121212] uppercase">
                V0.1
            </span>
        </div>
      </div>
    </div>
  );
};

export default Menu;