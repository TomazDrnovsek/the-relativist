import React from 'react';
import { SessionData } from '../types';
import SessionGrid from './SessionGrid';
import { audio } from '../utils/audio';
import MechanicalButton from './MechanicalButton';

interface ArchiveProps {
  currentSession: SessionData | null;
  currentLevel: number;
  sessions: SessionData[];
  onClose: () => void;
}

const Archive: React.FC<ArchiveProps> = ({ currentSession, currentLevel, sessions, onClose }) => {
  // Calculate active slot based on the shuffled playOrder
  // If playOrder is missing (legacy sessions), fallback to linear order (currentLevel - 1)
  const activeSlot = (currentSession && currentSession.playOrder) 
    ? (currentSession.playOrder[currentLevel - 1] ?? -1)
    : (currentLevel - 1);

  return (
    <div className="absolute inset-0 z-50 bg-[#F5F2EB] flex flex-col animate-in slide-in-from-bottom duration-300 font-sans text-[#121212]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header - Aligned with Main Screen: py-4, border-b border-black/5 */}
      <div className="px-6 py-4 mb-8 flex justify-between items-center bg-[#F5F2EB] border-b border-[#121212]/5 shrink-0">
        <h2 className="text-4xl font-bold lowercase tracking-[-0.04em] text-[#121212]">sessions.</h2>
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
      
      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-safe-bottom">
        <div className="grid grid-cols-2 gap-4 pb-6">
            
            {/* CURRENT ACTIVE SESSION */}
            {currentSession && (
                <div className="col-span-2 border border-neutral-200 p-4 bg-white relative">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-neutral-400">
                            Active Session
                        </span>
                        <span className="text-base font-black text-[#121212]">
                            {currentSession.id.toString().padStart(2, '0')}
                        </span>
                    </div>
                    
                    <div className="flex gap-6 items-center">
                         <div className="w-24 h-24 flex-none border border-[#121212]/10">
                            <SessionGrid 
                                palette={currentSession.palette} 
                                progress={currentSession.progress}
                                activeSlot={activeSlot} 
                                size="card" 
                            />
                         </div>
                         <div className="flex flex-col justify-center min-w-0">
                            <h3 className="text-2xl font-black text-[#121212] tracking-tighter opacity-20 truncate">
                                UNIDENTIFIED
                            </h3>
                            <div className="mt-2">
                                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">ASSIGNMENT </span>
                                <span className="text-lg font-black tracking-tight text-[#121212]">{currentLevel.toString().padStart(2, '0')}</span>
                                <span className="text-sm font-mono text-neutral-400"> / 16</span>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {/* COMPLETED SESSIONS */}
            {sessions.map((session) => (
                <div key={session.id} className="border border-[#121212]/10 p-4 bg-white flex flex-col gap-4">
                    <div className="w-full">
                        <SessionGrid 
                            palette={session.palette} 
                            progress={session.progress}
                            activeSlot={-1} 
                            size="card" 
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <h3 className="text-sm font-bold lowercase tracking-tight text-[#121212] truncate">
                            {session.name}
                        </h3>
                        <div className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">
                            ID.{session.id.toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {sessions.length === 0 && !currentSession && (
                 <div className="col-span-2 text-center py-20 opacity-40">
                    <p className="font-medium text-[10px] uppercase tracking-[0.2em]">No Data</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Archive;
