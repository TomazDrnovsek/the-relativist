import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore - html2canvas loaded via importmap
import html2canvas from 'html2canvas';
import { SessionData } from '../types';
import SessionGrid from './SessionGrid';
import MechanicalButton from './MechanicalButton';
import WinEffect from './WinEffect';
import { audio } from '../utils/audio';

interface ArtifactViewProps {
  session: SessionData;
  onArchive: () => void;
}

const ArtifactView: React.FC<ArtifactViewProps> = ({ session, onArchive }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref for the area we want to capture as an image
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      setTimeout(() => {
          audio.playSuccess();
      }, 300);
  }, []);

  const handleArchive = () => {
      audio.playTap(); 
      setIsExiting(true);
      setTimeout(() => {
          onArchive();
      }, 500); 
  };

  const handleShare = async () => {
      if (!printRef.current || isProcessing) return;
      
      setIsProcessing(true);
      audio.playClick(); // Shutter sound

      try {
          // 1. Capture the "Print Ref" area
          const canvas = await html2canvas(printRef.current, {
              scale: 2, // High resolution
              backgroundColor: '#F5F2EB', 
              logging: false,
              useCORS: true,
              // Force synchronous cleanup
              onclone: (clonedDoc) => {
                  const elements = clonedDoc.getElementsByClassName('animate-in');
                  Array.from(elements).forEach((el: any) => {
                      el.style.animation = 'none';
                      el.style.opacity = '1';
                  });
              }
          });

          // 2. Convert Canvas to Blob (Required for Sharing)
          canvas.toBlob(async (blob: Blob | null) => {
              if (!blob) throw new Error('Canvas conversion failed');

              const filename = `RELATIVIST-ID-${session.id.toString().padStart(2, '0')}.png`;
              const file = new File([blob], filename, { type: 'image/png' });

              // 3. Try Native Share (Mobile)
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  try {
                      await navigator.share({
                          files: [file],
                          title: 'The Relativist',
                          text: `Identity Authenticated: ${session.name}`,
                      });
                      audio.playSuccess();
                  } catch (shareError) {
                      console.log('Share cancelled');
                  }
              } 
              // 4. Fallback to Download (Desktop/Unsupported)
              else {
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  audio.playSuccess();
              }
              
              setIsProcessing(false);
          }, 'image/png');

      } catch (err) {
          console.error("Processing failed", err);
          audio.playDissonance();
          setIsProcessing(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-[#F5F2EB] z-[60] flex flex-col items-center justify-center font-sans overflow-hidden">
       
       <div className={`absolute inset-0 z-0 opacity-40 scale-[1.75] transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}>
           <WinEffect isBauhausMode={true} />
       </div>

       <div className={`
            flex-1 flex flex-col items-center justify-center w-full px-8 relative z-10
            transition-all duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]
            ${isExiting ? 'translate-y-[100vh] opacity-0' : 'translate-y-0 opacity-100'}
       `}>
            {/* Header */}
            <h3 className="text-[10px] font-mono font-medium uppercase tracking-[0.25em] text-neutral-400 mb-8 animate-in slide-in-from-top-4 fade-in duration-700 delay-100">
                Identity Authenticated
            </h3>

            {/* --- PRINTABLE AREA START --- */}
            <div 
                ref={printRef}
                className="flex flex-col items-center p-8 bg-[#F5F2EB]" 
            >
                {/* Visual Object */}
                <div className="mb-8 border border-[#121212] p-4 bg-white animate-in zoom-in-90 fade-in duration-700 delay-200">
                    <SessionGrid 
                        palette={session.palette} 
                        progress={session.progress} 
                        activeSlot={-1} 
                        size="lg"
                        animated={false} 
                    />
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-black lowercase tracking-tighter text-[#121212] mb-2 text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
                    {session.name}
                </h1>

                {/* Metadata */}
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-500">
                    Session {session.id.toString().padStart(2, '0')} // {new Date().toLocaleDateString()}
                </div>
            </div>
            {/* --- PRINTABLE AREA END --- */}

       </div>

       {/* Footer Actions */}
       <div className={`
            flex-none w-full px-6 pb-8 flex flex-col gap-3
            transition-all duration-500 delay-100
            ${isExiting ? 'translate-y-20 opacity-0' : 'animate-in slide-in-from-bottom-full fade-in duration-700 delay-700'}
       `}>
            {/* Secondary: Share */}
            <MechanicalButton 
                onTrigger={handleShare}
                disabled={isProcessing}
                className="w-full h-12 flex items-center justify-center text-[#121212] font-normal uppercase tracking-widest text-xs hover:opacity-60 border border-transparent"
            >
                {isProcessing ? 'Processing...' : 'Share Identity'}
            </MechanicalButton>

            {/* Primary: Archive */}
            <MechanicalButton 
                onTrigger={handleArchive}
                className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs border border-[#121212] flex items-center justify-center"
            >
                Archive to Collection
            </MechanicalButton>
       </div>
    </div>
  );
};

export default ArtifactView;