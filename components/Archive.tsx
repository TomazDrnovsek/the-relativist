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
  onSessionClick?: (session: SessionData) => void;
}

const Archive: React.FC<ArchiveProps> = ({ currentSession, currentLevel, sessions, onClose, onSessionClick }) => {
  const activeSlot = (currentSession && currentSession.playOrder)
    ? (currentSession.playOrder[currentLevel - 1] ?? -1)
    : (currentLevel - 1);

  const renderInProgressCard = () => {
    if (!currentSession) return null;

    const completedAssignments = currentSession.progress.filter(p => p !== null);
    const sum = completedAssignments.reduce((a, b) => a + (b as number), 0);
    const avgResonance = completedAssignments.length > 0
      ? Math.round(sum / completedAssignments.length)
      : null;

    return (
      <div className="border border-neutral-200 bg-white p-4">

        <div className="flex items-baseline justify-between mb-3">
          <span className="text-base font-black text-[#121212]">
            UNIDENTIFIED
          </span>
        </div>

        <div className="flex gap-4 items-start">

          <div className="w-24 h-24 flex-none border border-[#121212]/10">
            <SessionGrid
              palette={currentSession.palette}
              progress={currentSession.progress}
              activeSlot={activeSlot}
              size="card"
            />
          </div>

          <div className="flex flex-col justify-start gap-2 min-w-0 flex-1">

            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
              IN PROGRESS · {currentSession.id.toString().padStart(2, '0')}
            </span>

            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                ASSIGNMENT
              </span>
              <span className="text-lg font-black tracking-tight text-[#121212]">
                {currentLevel.toString().padStart(2, '0')}
              </span>
              <span className="text-sm font-mono text-neutral-400">/ 16</span>
            </div>

            <div className="h-1 bg-neutral-100 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-[#121212] transition-all duration-300"
                style={{ width: `${(currentLevel / 16) * 100}%` }}
              />
            </div>

            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400">
              AVG RESONANCE {avgResonance !== null ? `${avgResonance}%` : '—'}
            </p>

          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F5F2EB] flex flex-col animate-in slide-in-from-bottom duration-300 font-sans text-[#121212]">

      <div className="shrink-0 pt-safe-top bg-[#F5F2EB] border-b border-[#eae7e0] z-20">
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="text-4xl font-bold lowercase tracking-[-0.04em] text-[#121212]">sessions.</h2>
          <MechanicalButton
            onTrigger={() => { audio.playClick(); onClose(); }}
            scaleActive={0.85}
            className="w-12 h-12 flex items-center justify-center border-2 border-[#121212] hover:bg-[#121212] hover:text-white transition-colors text-sm"
          >
            ✕
          </MechanicalButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-safe-bottom">
        <div className="flex flex-col gap-6 pb-12">

          {renderInProgressCard()}

          {sessions.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {sessions.map((session) => {
                const completed = session.progress.filter(p => p !== null) as number[];
                const avgResonance = completed.length > 0
                  ? Math.round(completed.reduce((a, b) => a + b, 0) / completed.length)
                  : 0;

                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      audio.playClick();
                      if (onSessionClick) onSessionClick(session);
                    }}
                    className="block w-full text-left active:opacity-70 transition-opacity"
                  >
                    <div className="border border-neutral-200 bg-white">

                      <div className="p-2">
                        <SessionGrid
                          palette={session.palette}
                          progress={session.progress}
                          activeSlot={-1}
                          size="card"
                        />
                      </div>

                      <div className="mx-2 border-t" style={{ borderColor: '#e8e5de' }} />

                      <div className="px-2.5 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-1">
                            SESSION
                          </p>
                          <p className="text-xl font-black tracking-tight text-[#121212]">
                            {session.id.toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-1">
                            RESONANCE
                          </p>
                          <p className="text-xl font-black tracking-tight text-[#121212]">
                            {avgResonance}<span className="text-xs font-bold ml-0.5">%</span>
                          </p>
                        </div>
                      </div>

                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 opacity-40">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em]">NO SESSIONS ON RECORD</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Archive;
