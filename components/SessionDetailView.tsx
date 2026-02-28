import React, { useState } from 'react';
import { SessionData } from '../types';
import SessionGrid from './SessionGrid';
import MechanicalButton from './MechanicalButton';
import { audio } from '../utils/audio';
import { exportArtifact } from '../utils/exportArtifact';

interface SessionDetailViewProps {
  session: SessionData;
  onClose: () => void;
}

const SessionDetailView: React.FC<SessionDetailViewProps> = ({ session, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  const completedScores = session.progress.filter(p => p !== null) as number[];
  const avgResonance = completedScores.length > 0
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : 0;

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    audio.playShutter();

    try {
      await exportArtifact({
        session,
        resonance: avgResonance,
        pixelRatio: 3,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Export failed', error);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F5F2EB] z-[70] flex flex-col font-sans overflow-hidden animate-in fade-in duration-300">

      {/* Close */}
      <div className="shrink-0 pt-safe-top z-50">
        <div className="w-full px-6 py-4 flex justify-end">
          <MechanicalButton
            onTrigger={() => { audio.playClick(); onClose(); }}
            scaleActive={0.85}
            className="w-12 h-12 flex items-center justify-center border-2 border-[#121212] hover:bg-[#121212] hover:text-white transition-colors text-sm bg-[#F5F2EB]"
          >
            ✕
          </MechanicalButton>
        </div>
      </div>

      {/* Card — display only, export is canvas-drawn separately */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-10 relative z-10">
        <div className="w-full max-w-[280px] bg-white border border-neutral-200">

          <div className="p-2">
            <SessionGrid
              palette={session.palette}
              progress={session.progress}
              activeSlot={-1}
              size="card"
              animated={false}
            />
          </div>

          <div className="mx-2 border-t" style={{ borderColor: '#e8e5de' }} />

          <div className="px-4 py-3.5 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.24em] text-neutral-400 mb-0.5">
                RESONANCE
              </p>
              <p className="text-[26px] font-black tracking-[-0.03em] leading-none text-[#121212]">
                {avgResonance}<span className="text-base font-bold ml-0.5">%</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-mono uppercase tracking-[0.24em] text-neutral-400 mb-0.5">
                SESSION
              </p>
              <p className="text-[26px] font-black tracking-[-0.03em] leading-none text-[#121212]">
                {session.id.toString().padStart(2, '0')}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Export */}
      <div
        className="flex-none w-full px-6 relative z-10"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <MechanicalButton
          onTrigger={handleExport}
          disabled={isExporting}
          className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs border border-[#121212] flex items-center justify-center disabled:opacity-50"
        >
          {isExporting ? 'GENERATING…' : 'EXPORT ARTIFACT'}
        </MechanicalButton>
      </div>

    </div>
  );
};

export default SessionDetailView;
