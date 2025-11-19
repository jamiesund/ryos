import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Track } from "@/stores/useIpodStore";
import { WinmxTheme } from "@/stores/useWinmxStore";
import { Input } from "@/components/ui/input";

interface WinmxPlaylistProps {
  tracks: Track[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
  theme: WinmxTheme;
}

export function WinmxPlaylist({
  tracks,
  currentIndex,
  onSelectTrack,
  theme,
}: WinmxPlaylistProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const query = searchQuery.toLowerCase();
    return tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist?.toLowerCase().includes(query) ||
        track.album?.toLowerCase().includes(query)
    );
  }, [tracks, searchQuery]);

  const themeClasses = {
    classic: {
      bg: "bg-[#0f1620]",
      text: "text-[#4a9eff]",
      border: "border-[#4a9eff]/20",
      input: "bg-[#1a2332] border-[#4a9eff]/30 text-[#4a9eff] placeholder:text-[#4a9eff]/50",
      item: "hover:bg-[#1a2332] border-b border-[#4a9eff]/10",
      itemActive: "bg-[#2a3a52] text-[#4a9eff]",
    },
    light: {
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-300",
      input: "bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400",
      item: "hover:bg-gray-50 border-b border-gray-200",
      itemActive: "bg-gray-100 text-gray-900",
    },
    dark: {
      bg: "bg-[#111111]",
      text: "text-gray-200",
      border: "border-gray-700",
      input: "bg-[#1a1a1a] border-gray-700 text-gray-200 placeholder:text-gray-500",
      item: "hover:bg-[#1a1a1a] border-b border-gray-800",
      itemActive: "bg-[#2a2a2a] text-white",
    },
  };

  const t = themeClasses[theme];

  return (
    <div className={cn("flex flex-col h-full", t.bg)} style={{ backgroundColor: theme === "classic" ? "#0f1620" : theme === "light" ? "#ffffff" : "#111111", color: theme === "classic" ? "#4a9eff" : theme === "light" ? "#1f2937" : "#e5e7eb" }}>
      {/* Search */}
      <div className="p-2 border-b" style={{ borderColor: t.border }}>
        <Input
          type="text"
          placeholder="Search tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn("h-7 text-xs", t.input)}
        />
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTracks.length === 0 ? (
          <div className={cn("p-4 text-center text-sm", t.text, "opacity-50")}>
            {searchQuery ? "No tracks found" : "No tracks in library"}
          </div>
        ) : (
          <div>
            {filteredTracks.map((track) => {
              const originalIndex = tracks.indexOf(track);
              const isActive = originalIndex === currentIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(originalIndex)}
                  className={cn(
                    "px-3 py-2 cursor-pointer text-sm transition-colors",
                    t.item,
                    isActive && t.itemActive
                  )}
                >
                  <div className="font-medium truncate">{track.title}</div>
                  {(track.artist || track.album) && (
                    <div className={cn("text-xs truncate", t.text, "opacity-75")}>
                      {track.artist}
                      {track.artist && track.album && " • "}
                      {track.album}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn("px-3 py-1 text-xs border-t", t.border, t.text, "opacity-75")}>
        {tracks.length} track{tracks.length !== 1 ? "s" : ""}
        {searchQuery && filteredTracks.length !== tracks.length && (
          <span> • {filteredTracks.length} shown</span>
        )}
      </div>
    </div>
  );
}

