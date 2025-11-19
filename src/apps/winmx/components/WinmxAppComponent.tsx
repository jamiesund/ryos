import { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import { cn } from "@/lib/utils";
import { AppProps } from "../../base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { WinmxMenuBar } from "./WinmxMenuBar";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { InputDialog } from "@/components/dialogs/InputDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { helpItems, appMetadata } from "..";
import { useIpodStore } from "@/stores/useIpodStore";
import { useShallow } from "zustand/react/shallow";
import { useIpodStoreShallow, useAppStoreShallow } from "@/stores/helpers";
import { toast } from "sonner";
import { useWinmxStore, WinmxTheme } from "@/stores/useWinmxStore";
import { WinmxPlayer } from "./WinmxPlayer";
import { WinmxPlaylist } from "./WinmxPlaylist";
import { WinmxEqualizer } from "./WinmxEqualizer";
import { WinmxVisualization } from "./WinmxVisualization";
import { useThemeStore } from "@/stores/useThemeStore";

export function WinmxAppComponent({
  isWindowOpen,
  onClose,
  isForeground,
  skipInitialSound,
  instanceId,
  onNavigateNext,
  onNavigatePrevious,
}: AppProps) {
  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";

  // WinMX store
  const {
    theme: winmxTheme,
    showEqualizer,
    showVisualization,
    volume: winmxVolume,
  } = useWinmxStore(
    useShallow((s) => ({
      theme: s.theme,
      showEqualizer: s.showEqualizer,
      showVisualization: s.showVisualization,
      volume: s.volume,
    }))
  );

  // iPod store (shared library)
  const {
    tracks,
    currentIndex,
    loopCurrent,
    isPlaying,
  } = useIpodStore(
    useShallow((s) => ({
      tracks: s.tracks,
      currentIndex: s.currentIndex,
      loopCurrent: s.loopCurrent,
      isPlaying: s.isPlaying,
    }))
  );

  const {
    setCurrentIndex,
    togglePlay,
    setIsPlaying,
    nextTrack,
    previousTrack,
    clearLibrary,
    addTrackFromVideoId,
  } = useIpodStoreShallow((s) => ({
    setCurrentIndex: s.setCurrentIndex,
    togglePlay: s.togglePlay,
    setIsPlaying: s.setIsPlaying,
    nextTrack: s.nextTrack,
    previousTrack: s.previousTrack,
    clearLibrary: s.clearLibrary,
    addTrackFromVideoId: s.addTrackFromVideoId,
  }));

  const { masterVolume } = useAppStoreShallow((s) => ({
    masterVolume: s.masterVolume,
  }));

  // UI state
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // Player refs
  const playerRef = useRef<ReactPlayer>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const equalizerFiltersRef = useRef<BiquadFilterNode[]>([]);

  // Initialize audio context for visualization and equalizer
  useEffect(() => {
    if (!isWindowOpen) return;

    let audioContext: AudioContext | null = null;
    
    const initAudioContext = async () => {
      try {
        // Check if AudioContext is available
        if (typeof window === "undefined" || (!window.AudioContext && !(window as any).webkitAudioContext)) {
          console.warn("AudioContext not available");
          return;
        }

        audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        
        // Resume audio context if suspended (required by some browsers)
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 2048;
        analyzer.smoothingTimeConstant = 0.8;

        const gainNode = audioContext.createGain();
        gainNode.connect(analyzer);
        analyzer.connect(audioContext.destination);

        // Create 10-band equalizer filters
        const filters: BiquadFilterNode[] = [];
        const frequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        
        frequencies.forEach((freq, index) => {
          const filter = audioContext!.createBiquadFilter();
          filter.type = index < 2 ? "lowshelf" : index > 7 ? "highshelf" : "peaking";
          filter.frequency.value = freq;
          filter.Q.value = 1;
          filter.gain.value = 0;
          filters.push(filter);
        });

        // Chain filters
        for (let i = 0; i < filters.length - 1; i++) {
          filters[i].connect(filters[i + 1]);
        }
        filters[filters.length - 1].connect(gainNode);

        audioContextRef.current = audioContext;
        analyzerRef.current = analyzer;
        gainNodeRef.current = gainNode;
        equalizerFiltersRef.current = filters;
      } catch (error) {
        console.error("Failed to initialize audio context:", error);
        // Don't throw - just log the error so the app can continue
      }
    };

    initAudioContext();

    return () => {
      try {
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(console.error);
        }
      } catch (error) {
        console.error("Error closing audio context:", error);
      }
    };
  }, [isWindowOpen]);

  // Update equalizer filters when bands change
  const { equalizerBands } = useWinmxStore(
    useShallow((s) => ({ equalizerBands: s.equalizerBands }))
  );

  useEffect(() => {
    if (equalizerFiltersRef.current.length === 0) return;

    equalizerFiltersRef.current.forEach((filter, index) => {
      if (equalizerBands[index] !== undefined) {
        filter.gain.value = equalizerBands[index];
      }
    });
  }, [equalizerBands]);

  const handleProgress = useCallback((state: { played: number; playedSeconds: number }) => {
    setElapsedTime(state.playedSeconds);
  }, []);

  const handleDuration = useCallback((duration: number) => {
    setTotalTime(duration);
  }, []);

  const handleEnded = useCallback(() => {
    if (!loopCurrent) {
      nextTrack();
    }
  }, [loopCurrent, nextTrack]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, [setIsPlaying]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const handleAddTrack = useCallback(async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setIsAddingTrack(true);
    try {
      const track = await addTrackFromVideoId(urlInput.trim());
      if (track) {
        toast.success(`Added: ${track.title}`);
        setUrlInput("");
        setIsAddDialogOpen(false);
      } else {
        toast.error("Failed to add track");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add track");
    } finally {
      setIsAddingTrack(false);
    }
  }, [urlInput, addTrackFromVideoId]);

  const handleClearLibrary = useCallback(() => {
    clearLibrary();
    setIsConfirmClearOpen(false);
    toast.success("Library cleared");
  }, [clearLibrary]);

  const currentTrack = tracks[currentIndex] || null;
  const effectiveVolume = winmxVolume * masterVolume;

  // Theme classes
  const themeClasses = {
    classic: {
      bg: "bg-[#1a2332]",
      text: "text-[#4a9eff]",
      border: "border-[#4a9eff]/30",
      button: "bg-[#2a3a52] hover:bg-[#3a4a62] text-[#4a9eff] border border-[#4a9eff]/50",
      panel: "bg-[#0f1620] border border-[#4a9eff]/20",
    },
    light: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
      button: "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300",
      panel: "bg-white border border-gray-300",
    },
    dark: {
      bg: "bg-[#111111]",
      text: "text-gray-200",
      border: "border-gray-700",
      button: "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-200 border border-gray-700",
      panel: "bg-[#0a0a0a] border border-gray-800",
    },
  };

  // Ensure theme is valid, fallback to classic if not
  const validTheme = winmxTheme in themeClasses ? winmxTheme : "classic";
  const theme = themeClasses[validTheme as keyof typeof themeClasses];

  if (!isWindowOpen) return null;

  const menuBar = (
    <WinmxMenuBar
      onShowHelp={() => setIsHelpDialogOpen(true)}
      onShowAbout={() => setIsAboutDialogOpen(true)}
      onAddTrack={() => setIsAddDialogOpen(true)}
      onClearLibrary={() => setIsConfirmClearOpen(true)}
    />
  );

  return (
    <>
      {!isXpTheme && isForeground && menuBar}
      <WindowFrame
        title="WinMX Player"
        onClose={onClose}
        isForeground={isForeground}
        appId="winmx"
        skipInitialSound={skipInitialSound}
        instanceId={instanceId}
        onNavigateNext={onNavigateNext}
        onNavigatePrevious={onNavigatePrevious}
        menuBar={isXpTheme ? menuBar : undefined}
      >
        <div 
          className="flex flex-col w-full h-full"
          style={{ 
            minHeight: 0, 
            backgroundColor: winmxTheme === "classic" ? "#1a2332" : winmxTheme === "light" ? "#f3f4f6" : "#111111",
            color: winmxTheme === "classic" ? "#4a9eff" : winmxTheme === "light" ? "#1f2937" : "#e5e7eb",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* Hidden ReactPlayer */}
          <div className="hidden">
            <ReactPlayer
              ref={playerRef}
              url={currentTrack?.url || ""}
              playing={isPlaying}
              volume={effectiveVolume}
              loop={loopCurrent}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onEnded={handleEnded}
              onPlay={handlePlay}
              onPause={handlePause}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    cc_load_policy: 0,
                  },
                },
              }}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* Debug: Ensure content is visible */}
            <div style={{ padding: "10px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>WinMX Player</div>
            </div>
            {/* Player Controls */}
            <WinmxPlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              elapsedTime={elapsedTime}
              totalTime={totalTime}
              onPlayPause={togglePlay}
              onPrevious={previousTrack}
              onNext={nextTrack}
              onSeek={(seconds) => {
                if (playerRef.current) {
                  playerRef.current.seekTo(seconds, "seconds");
                }
              }}
              theme={validTheme as WinmxTheme}
            />

            {/* Visualization */}
            {showVisualization && (
              <div className={cn("h-32 border-t", theme.border, theme.panel)}>
                <WinmxVisualization analyzer={analyzerRef.current} theme={validTheme as WinmxTheme} />
              </div>
            )}

            {/* Equalizer */}
            {showEqualizer && (
              <div className={cn("border-t", theme.border, theme.panel)}>
                <WinmxEqualizer theme={validTheme as WinmxTheme} />
              </div>
            )}

            {/* Playlist */}
            <div className={cn("flex-1 border-t overflow-hidden", theme.border, theme.panel)}>
              <WinmxPlaylist
                tracks={tracks}
                currentIndex={currentIndex}
                onSelectTrack={setCurrentIndex}
                theme={validTheme as WinmxTheme}
              />
            </div>
          </div>
        </div>
      </WindowFrame>

      {/* Dialogs */}
      <HelpDialog
        isOpen={isHelpDialogOpen}
        onOpenChange={setIsHelpDialogOpen}
        helpItems={helpItems}
        appName={appMetadata.name}
      />
      <AboutDialog
        isOpen={isAboutDialogOpen}
        onOpenChange={setIsAboutDialogOpen}
        metadata={appMetadata}
      />
      <InputDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTrack}
        title="Add Track"
        description="Enter a YouTube URL to add a track to your library"
        value={urlInput}
        onChange={setUrlInput}
        isLoading={isAddingTrack}
        submitLabel="Add"
      />
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        onOpenChange={setIsConfirmClearOpen}
        onConfirm={handleClearLibrary}
        title="Clear Library"
        description="Are you sure you want to clear all tracks? This cannot be undone."
      />
    </>
  );
}

