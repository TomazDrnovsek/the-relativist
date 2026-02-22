import React, { useState, useEffect } from 'react';
import { HSL, StripData, SessionData, GameState } from './types';
import { 
  hslToString, 
  generateRandomColor, 
  calculateMatchScore,
  getPerceivedBrightness
} from './utils/color';
import { getNextSession } from './utils/sessionGenerator';
import { audio } from './utils/audio';
import Slider from './components/Slider';
import Logo from './components/Logo';
import Menu from './components/Menu';
import WinEffect from './components/WinEffect';
import ContextStrip from './components/ContextStrip';
import MechanicalButton from './components/MechanicalButton';
import ShapePrimitive from './components/ShapePrimitive';
import StartScreen from './components/StartScreen';
import Onboarding from './components/Onboarding';
import Archive from './components/Archive';
import ArtifactView from './components/ArtifactView';

// --- Constants ---
const TARGET_BG: HSL = { h: 0, s: 0, l: 96 }; // #F5F5F5 (Near White)
const STRIP_1_BG: HSL = { h: 0, s: 0, l: 7 };   // Deep Black (#121212)
const STRIP_2_BG: HSL = { h: 0, s: 0, l: 98 };  // Pure White

const App: React.FC = () => {
  // --- State ---
  const [hasStarted, setHasStarted] = useState(false);
  const [isStateLoaded, setIsStateLoaded] = useState(false); // Prevents premature saves
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  const [level, setLevel] = useState<number>(1);
  const [sessionCount, setSessionCount] = useState<number>(1);
  
  // Session State
  const [session, setSession] = useState<SessionData | null>(null);
  const [showArtifact, setShowArtifact] = useState(false);
  const [collection, setCollection] = useState<SessionData[]>([]);
  
  // Target is now derived from session, but we keep local state for the active round
  const [targetColor, setTargetColor] = useState<HSL>(TARGET_BG);
  
  // The 3 Context Strips
  const [strips, setStrips] = useState<StripData[]>([]);
  const [selectedStripId, setSelectedStripId] = useState<number>(0);
  
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showResultValues, setShowResultValues] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const [isBauhausMode, setIsBauhausMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // --- Initialization ---
  useEffect(() => {
    const savedStateJSON = localStorage.getItem('relativist_game_state_v5');

    if (savedStateJSON) {
        try {
            const savedState: GameState = JSON.parse(savedStateJSON);
            setCollection(savedState.collection || []);
            setLevel(savedState.level || 1);
            setSessionCount(savedState.sessionCount || 1);
            setSession(savedState.currentSession || getNextSession(savedState.sessionCount || 1));
            setIsBauhausMode(savedState.settings?.isBauhausMode || false);
            
            const soundEnabled = savedState.settings?.isSoundEnabled !== false; // default to true
            setIsSoundEnabled(soundEnabled);
            audio.setMuted(!soundEnabled);

            setHasCompletedOnboarding(savedState.hasCompletedOnboarding || false);
        } catch (error) {
            console.error("Failed to parse saved state, starting fresh:", error);
            setSession(getNextSession(1));
        }
    } else {
        // No saved state, generate a fresh session
        setSession(getNextSession(1));
    }
    setIsStateLoaded(true);
  }, []);

  // --- State Persistence ---
  useEffect(() => {
    if (!isStateLoaded) return; // Wait for initial state to load

    const gameState: GameState = {
      collection,
      level,
      sessionCount,
      currentSession: session,
      settings: {
        isBauhausMode,
        isSoundEnabled,
      },
      hasCompletedOnboarding,
    };
    localStorage.setItem('relativist_game_state_v5', JSON.stringify(gameState));

  }, [
      collection, 
      level, 
      sessionCount, 
      session, 
      isBauhausMode, 
      isSoundEnabled, 
      hasCompletedOnboarding,
      isStateLoaded
  ]);

  // --- Reactive Game Loop ---
  useEffect(() => {
    if (!session || !hasCompletedOnboarding || showArtifact) return;

    const currentSlot = (session.playOrder && session.playOrder[level - 1] !== undefined)
        ? session.playOrder[level - 1]
        : (level - 1);
        
    const safeSlot = Math.min(Math.max(0, currentSlot), 15);
    const newTarget = session.palette[safeSlot];
    
    const strip3Bg = {
      h: Math.floor(Math.random() * 360),
      s: 70 + Math.floor(Math.random() * 30), 
      l: 40 + Math.floor(Math.random() * 20) 
    };

    const newStrips: StripData[] = [
      { id: 0, backgroundColor: STRIP_1_BG, chipColor: generateRandomColor() },
      { id: 1, backgroundColor: STRIP_2_BG, chipColor: generateRandomColor() },
      { id: 2, backgroundColor: strip3Bg, chipColor: generateRandomColor() }
    ];

    setTargetColor(newTarget);
    setStrips(newStrips);
    setIsDeveloped(false);
    setScore(null);
    setSelectedStripId(0);
    setShowResultValues(false);

  }, [session, level, hasCompletedOnboarding, showArtifact]);

  const handleStart = async () => {
      await audio.resume();
      audio.playClick();
      setHasStarted(true);
  };
  
  const handleOnboardingComplete = () => {
      setHasCompletedOnboarding(true);
  };

  const toggleBauhausMode = () => {
      audio.playClick();
      setIsBauhausMode(prev => !prev);
  };

  const toggleSound = () => {
      const newVal = !isSoundEnabled;
      setIsSoundEnabled(newVal);
      audio.setMuted(!newVal);
      if (newVal) audio.playClick();
  };

  // --- Core Actions ---

  const runAnalysis = () => {
    let totalScore = 0;
    strips.forEach(s => {
      totalScore += calculateMatchScore(targetColor, s.chipColor);
    });
    const finalScore = Math.round(totalScore / strips.length);
    setScore(finalScore);
    setIsDeveloped(true);

    if (finalScore >= 80) {
        audio.playSuccess();
        audio.triggerHaptic([10, 50, 10, 50]);
    } else {
        audio.playDissonance();
        audio.triggerHaptic([30, 30]);
    }
  };

  const handleDevWin = () => {
    audio.playSuccess();
    audio.triggerHaptic([10, 50, 10, 50]);
    setStrips(prev => prev.map(s => ({ ...s, chipColor: targetColor })));
    setScore(100);
    setIsDeveloped(true);
  };

  const handleNextLevel = () => {
    audio.playAdvance();
    
    if (!session) return;
    
    const currentSlot = (session.playOrder && session.playOrder[level - 1] !== undefined)
        ? session.playOrder[level - 1]
        : (level - 1);

    const newProgress = [...session.progress];
    newProgress[currentSlot] = score || 0;
    
    const updatedSession = { ...session, progress: newProgress };
    
    if (level >= 16) {
        const completeSession = { ...updatedSession, isComplete: true };
        setSession(completeSession);
        setShowArtifact(true);
        audio.playSuccess(); 
    } else {
        setSession(updatedSession);
        setLevel(prev => prev + 1);
    }
  };

  const handleArchiveSession = () => {
      if (!session) return;
      
      const newCollection = [session, ...collection];
      setCollection(newCollection);
      
      const nextId = session.id + 1;
      setSessionCount(nextId);
      
      const nextSession = getNextSession(nextId);
      setSession(nextSession);
      
      setShowArtifact(false);
      setLevel(1);
  };
  
  const handleResetSession = () => {
      audio.playClick();
      
      const nextId = sessionCount + 1;
      const newSession = getNextSession(nextId);

      setSessionCount(nextId);
      setSession(newSession);
      setCollection([]);
      setLevel(1);
      setHasCompletedOnboarding(false);
      
      setShowMenu(false);
  };

  const handleRestartOnboarding = () => {
      audio.playClick();
      setHasCompletedOnboarding(false);
      setShowMenu(false);
  };

  const handleRetry = () => {
    audio.playClick();
    setIsDeveloped(false);
    setScore(null);
    setShowResultValues(false);
  };

  const updateSelectedColor = (key: keyof HSL, val: number) => {
    if (isDeveloped) return;
    setStrips(prev => prev.map(strip => {
      if (strip.id === selectedStripId) {
        return { ...strip, chipColor: { ...strip.chipColor, [key]: val } };
      }
      return strip;
    }));
  };

  const onSelectStrip = (id: number) => {
      if (!isDeveloped && id !== selectedStripId) {
          audio.playTap();
          audio.triggerHaptic(8);
          setSelectedStripId(id);
      }
  };

  const getFeedbackText = (s: number) => {
    if (s >= 98) return "ABSOLUTE";
    if (s >= 90) return "COMMENDABLE";
    if (s >= 75) return "ACCEPTABLE";
    if (s >= 60) return "MARGINAL";
    return "DISSONANT";
  };

  // UI Helpers
  const currentStrip = strips.find(s => s.id === selectedStripId) || strips[0];
  
  const hueGradient = 'linear-gradient(to right, #F00 0%, #FF0 17%, #0F0 33%, #0FF 50%, #00F 67%, #F0F 83%, #F00 100%)';
  const satGradient = currentStrip ? `linear-gradient(to right, ${hslToString({h: currentStrip.chipColor.h, s: 0, l: currentStrip.chipColor.l})}, ${hslToString({h: currentStrip.chipColor.h, s: 100, l: currentStrip.chipColor.l})})` : '';
  const lightGradient = currentStrip ? `linear-gradient(to right, #121212, ${hslToString({h: currentStrip.chipColor.h, s: currentStrip.chipColor.s, l: 50})}, #FFF)` : '';

  const isWin = score !== null && score >= 80;
  const getValueColor = (l: number) => l > 60 ? '#121212' : '#ffffff';

  const getStripLabelConfig = (index: number, bg: HSL): { label: string, color: string } => {
    const label = `0${index + 1}`;
    if (index === 0) return { label, color: '#a3a3a3' };
    if (index === 1) return { label, color: '#737373' };
    const brightness = getPerceivedBrightness(bg);
    const color = brightness > 130 ? '#737373' : '#a3a3a3';
    return { label, color };
  };

  if (!hasStarted) {
      return <StartScreen onStart={handleStart} />;
  }
  
  if (!hasCompletedOnboarding) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (showArtifact && session) {
      return <ArtifactView session={session} onArchive={handleArchiveSession} />;
  }
  
  if (!currentStrip) return null;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5F2EB] font-sans overflow-hidden select-none text-[#121212]">
      <style>{`
        @keyframes slideInStack {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      <main 
         key={level}
         className="flex-1 flex flex-col w-full h-full animate-film-advance"
      >
          {/* --- 1. HEADER --- */}
          <div 
            className="shrink-0 relative flex flex-col pt-safe-top z-20 border-b border-[#121212]"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
             
             {/* HEADER BAR */}
             <header className="w-full px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center relative z-30 shrink-0 border-b border-[#121212]/5">
                <MechanicalButton 
                  onTrigger={() => {
                      audio.playClick();
                      setShowMenu(true); 
                  }}
                  scaleActive={0.8}
                  className="justify-self-start w-12 h-12 flex items-center justify-start text-[#121212] hover:opacity-60"
                >
                    <div className="flex flex-col gap-2 w-6">
                        <span className="w-full h-[2px] bg-[#121212]"></span>
                        <span className="w-full h-[2px] bg-[#121212]"></span>
                        <span className="w-full h-[2px] bg-[#121212]"></span>
                    </div>
                </MechanicalButton>

                <div className="justify-self-center">
                  <Logo />
                </div>

                <div 
                    className="justify-self-end flex flex-col items-end justify-center leading-tight cursor-pointer group select-none"
                    onClick={() => {
                        audio.playClick();
                        setShowArchive(true);
                    }}
                >
                   {/* Session Coordinate */}
                   <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-neutral-400 group-hover:text-[#121212] transition-colors">S.</span>
                       <span className="text-sm font-bold tabular-nums text-[#121212] tracking-tight">
                           {sessionCount.toString().padStart(2, '0')}
                       </span>
                   </div>

                   {/* Assignment Coordinate */}
                   <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-neutral-400 group-hover:text-[#121212] transition-colors">A.</span>
                       <span className="text-sm font-bold tabular-nums text-[#121212] tracking-tight">
                           {level.toString().padStart(2, '0')}
                       </span>
                   </div>
                </div>
             </header>

             {/* Target Swatch */}
             <div className="h-[10vh] w-full relative flex items-center justify-center">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-normal uppercase tracking-widest text-[#737373] pointer-events-none">
                    REF
                </span>

                <div 
                    className="relative cursor-pointer"
                    onDoubleClick={handleDevWin}
                >
                    <div className={`w-12 h-12 ${!isBauhausMode ? 'border border-[#121212]' : ''} active:scale-95 transition-transform flex items-center justify-center`}>
                       <ShapePrimitive
                           color={hslToString(targetColor)}
                           hue={targetColor.h}
                           isBauhausMode={isBauhausMode}
                           hasBorder={true}
                           className="w-full h-full"
                       />
                    </div>
                </div>
             </div>
          </div>

          {/* --- 2. THE STACK --- */}
          <div className="h-[30%] flex flex-col w-full relative z-10 border-b border-[#121212]">
            {strips.map((strip, index) => {
                const isSelected = !isDeveloped && selectedStripId === strip.id;
                const { label, color } = getStripLabelConfig(index, strip.backgroundColor);
                
                return (
                    <ContextStrip
                        key={strip.id}
                        strip={strip}
                        label={label}
                        labelColor={color}
                        isSelected={isSelected}
                        isDeveloped={isDeveloped}
                        isBauhausMode={isBauhausMode}
                        onClick={onSelectStrip}
                        isLast={index === strips.length - 1}
                    />
                );
            })}
          </div>

          {/* --- 3. CONTROLS --- */}
          <div className="flex-none bg-[#F5F2EB] flex flex-col px-6 pt-8 pb-safe-bottom relative z-30">
              <div className="flex flex-col">
                  <div className="flex flex-col gap-6">
                      <Slider 
                          label="H" 
                          value={currentStrip.chipColor.h} min={0} max={360} 
                          onChange={(v) => updateSelectedColor('h', v)} 
                          gradient={hueGradient} 
                          disabled={isDeveloped}
                      />
                      <Slider 
                          label="S" 
                          value={currentStrip.chipColor.s} min={0} max={100} 
                          onChange={(v) => updateSelectedColor('s', v)} 
                          gradient={satGradient} 
                          disabled={isDeveloped}
                      />
                      <Slider 
                          label="L" 
                          value={currentStrip.chipColor.l} min={0} max={100} 
                          onChange={(v) => updateSelectedColor('l', v)} 
                          gradient={lightGradient} 
                          disabled={isDeveloped}
                  />
                  </div>

                  <div className="mt-8 pb-8">
                      <MechanicalButton 
                          onTrigger={runAnalysis}
                          disabled={isDeveloped}
                          className="
                            w-full h-14 bg-[#121212] text-white 
                            font-normal uppercase tracking-widest text-xs
                            border border-[#121212]
                            flex items-center justify-center
                            disabled:opacity-0
                          "
                      >
                          analyze
                      </MechanicalButton>
                  </div>
              </div>
          </div>
      </main>

      {/* --- 4. RESULT OVERLAY --- */}
      {isDeveloped && (
          <div className="absolute inset-0 z-50 bg-[#F5F2EB] flex flex-col pt-safe-top pb-safe-bottom animate-in fade-in duration-500 overflow-hidden">
              
              {isWin && isBauhausMode && <WinEffect isBauhausMode={isBauhausMode} />}

              {/* Score */}
              <div className="flex-none pt-12 flex flex-col items-center justify-center z-20 pointer-events-none">
                  <div className="text-6xl font-medium tabular-nums tracking-tighter text-[#121212] leading-none mb-4">
                      {score}%
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
                      {getFeedbackText(score || 0)}
                  </div>
              </div>

              {/* Visual Proof */}
              <div className="flex-1 w-full relative flex items-center justify-center my-6">
                 <div 
                    className={`w-full h-full flex flex-col items-stretch max-h-[60vh] touch-none select-none ${isWin ? 'cursor-help' : ''}`}
                    onMouseDown={() => { if (isWin) { setShowResultValues(true); audio.triggerHaptic(5); } }}
                    onMouseUp={() => setShowResultValues(false)}
                    onMouseLeave={() => setShowResultValues(false)}
                    onTouchStart={() => { if (isWin) { setShowResultValues(true); audio.triggerHaptic(5); } }}
                    onTouchEnd={() => setShowResultValues(false)}
                 >
                     {/* Target */}
                     <div 
                        className="flex-1 w-full relative flex items-center justify-center"
                        style={{ 
                            backgroundColor: hslToString(targetColor),
                            animation: 'slideInStack 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                            animationDelay: '0ms',
                            opacity: 0
                        }}
                     >
                        <span className="text-[10px] font-medium tracking-[0.15em] tabular-nums transition-opacity duration-200 pointer-events-none" style={{ color: getValueColor(targetColor.l), opacity: showResultValues ? 0.7 : 0 }}>
                            HUE {Math.round(targetColor.h)}° &nbsp; SAT {Math.round(targetColor.s)}% &nbsp; LUM {Math.round(targetColor.l)}%
                        </span>
                     </div>

                     {/* Strips 1-3 */}
                     {strips.map((s, i) => (
                         <div 
                            key={s.id}
                            className="flex-1 w-full relative flex items-center justify-center"
                            style={{ 
                                backgroundColor: hslToString(s.chipColor),
                                animation: 'slideInStack 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                                animationDelay: `${(i+1)*100}ms`,
                                opacity: 0
                            }}
                         >
                            <span className="text-[10px] font-medium tracking-[0.15em] tabular-nums transition-opacity duration-200 pointer-events-none" style={{ color: getValueColor(s.chipColor.l), opacity: showResultValues ? 0.7 : 0 }}>
                                HUE {Math.round(s.chipColor.h)}° &nbsp; SAT {Math.round(s.chipColor.s)}% &nbsp; LUM {Math.round(s.chipColor.l)}%
                            </span>
                         </div>
                     ))}
                 </div>
              </div>

              {/* Action */}
              <div className="flex-none w-full px-6 pb-8 flex flex-col gap-3 z-20">
                   {isWin && (
                       <MechanicalButton 
                          onTrigger={handleRetry}
                          className="w-full h-12 flex items-center justify-center text-[#121212] font-normal uppercase tracking-widest text-xs hover:opacity-60 border border-transparent"
                      >
                          recalibrate
                      </MechanicalButton>
                   )}

                   {isWin ? (
                      <MechanicalButton 
                          onTrigger={handleNextLevel}
                          className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs border border-[#121212] flex items-center justify-center"
                      >
                          {level >= 16 ? "authenticate session" : "next assignment"}
                      </MechanicalButton>
                   ) : (
                      <MechanicalButton 
                          onTrigger={handleRetry}
                          className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs border border-[#121212] flex items-center justify-center"
                      >
                          recalibrate
                      </MechanicalButton>
                   )}
              </div>
          </div>
      )}

      {/* Menus */}
      {showMenu && (
        <Menu 
            onClose={() => {
                audio.playClick();
                setShowMenu(false);
            }} 
            onOpenArchive={() => {
                audio.playClick();
                setShowMenu(false);
                setShowArchive(true);
            }}
            isBauhausMode={isBauhausMode}
            toggleBauhausMode={toggleBauhausMode}
            isSoundEnabled={isSoundEnabled}
            toggleSound={toggleSound}
            onRestartOnboarding={handleRestartOnboarding}
        />
      )}
      
      {showArchive && (
          <Archive 
            currentSession={session}
            currentLevel={level}
            sessions={collection} 
            onClose={() => {
                audio.playClick();
                setShowArchive(false);
            }}
          />
      )}
      
    </div>
  );
};

export default App;
