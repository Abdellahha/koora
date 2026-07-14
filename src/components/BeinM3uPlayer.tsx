import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, Tv, AlertCircle } from "lucide-react";
import { Channel } from "../types";
import { M3U_RAW } from "../data/m3uRaw";

interface BeinM3uPlayerProps {
  title: string;
  groupTitle: string;
  onBack: () => void;
}

export default function BeinM3uPlayer({ title, groupTitle, onBack }: BeinM3uPlayerProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<"all" | "bein" | "max" | "morocco" | "forja">("all");

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerFrameRef = useRef<HTMLDivElement>(null);

  // Parse embedded M3U file for this specific targetQuality
  useEffect(() => {
    const lines = M3U_RAW.split("\n");
    const parsed: Channel[] = [];
    let current: Partial<Channel> | null = null;

    // Detect target quality category from current player's group title
    const isHdTarget = groupTitle.includes("HD");
    const is4kTarget = groupTitle.includes("4K");
    const isSdTarget = groupTitle.includes("SD");
    let targetQuality: "HD" | "4K" | "SD" = "HD";
    if (is4kTarget) targetQuality = "4K";
    else if (isSdTarget) targetQuality = "SD";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith("#EXTINF:")) {
        current = {};
        
        // Logo
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        current.logo = logoMatch && logoMatch[1] ? logoMatch[1] : "";

        // Group title
        const groupMatch = line.match(/group-title="([^"]*)"/);
        current.sub = groupMatch && groupMatch[1] ? groupMatch[1] : "";

        // Channel clean name (after comma)
        const commaIdx = line.lastIndexOf(",");
        current.name = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : "beIN Channel";

        // Quality detection
        const checkText = current.name.toLowerCase();
        let quality: "4K" | "HD" | "SD" = "HD";
        if (checkText.includes("4k") || checkText.includes("uhd") || checkText.includes("ultra") || checkText.includes("⁴k") || checkText.includes("hevc")) {
          quality = "4K";
        } else if (checkText.includes("sd") || checkText.includes("ˢᵈ") || checkText.includes("nexus sd")) {
          quality = "SD";
        } else {
          // If name doesn't specify quality, check group title
          if (current.sub && current.sub.includes("4K")) {
            quality = "4K";
          } else if (current.sub && current.sub.includes("SD")) {
            quality = "SD";
          } else {
            quality = "HD";
          }
        }
        current.quality = quality;
      } else if (line.startsWith("http://") || line.startsWith("https://")) {
        if (current) {
          current.url = line;
          
          // Match the exact quality requested (HD vs 4K vs SD) across all channels
          if (current.quality === targetQuality) {
            parsed.push(current as Channel);
          }
          current = null;
        }
      }
    }

    setChannels(parsed);
    if (parsed.length > 0) {
      setActiveChannel(parsed[0]);
    }
  }, [groupTitle]);

  // Filter channels based on search and active sub-group pills
  const filteredChannels = channels.filter(ch => {
    const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeGroup === "all") return true;

    const lowerName = ch.name.toLowerCase();
    const isBeinMain = (ch.sub.includes("BEIN SPORT") || lowerName.includes("bein sport") || lowerName.includes("bein. ultra")) && !lowerName.includes("max");
    const isBeinMax = lowerName.includes("max") || ch.sub.includes("WORLD CUP");
    const isMorocco = ch.sub.includes("MOROCCO") || lowerName.includes("ma ") || lowerName.includes("|ma|");
    const isForja = lowerName.includes("forja") || lowerName.includes("protime") || lowerName.includes("netflix") || lowerName.includes("shahid");

    if (activeGroup === "bein") return isBeinMain;
    if (activeGroup === "max") return isBeinMax;
    if (activeGroup === "morocco") return isMorocco;
    if (activeGroup === "forja") return isForja || (!isBeinMain && !isBeinMax && !isMorocco);

    return true;
  });

  // Load and mount secure proxy streams to the video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeChannel) return;

    setLoading(true);
    setPlayerError(false);

    let hlsInstance: any = null;
    let tsInstance: any = null;

    // Secure streaming over backend proxy to bypass HTTPS Mixed Content
    const secureUrl = `/api/stream?url=${encodeURIComponent(activeChannel.url)}`;

    // Raw .ts stream check
    const isMpegTs = !activeChannel.url.includes(".m3u8") &&
                     (activeChannel.url.endsWith(".ts") ||
                      /:\d+\/[^/]+\/[^/]+\/\d+/.test(activeChannel.url) ||
                      /^\d+$/.test(activeChannel.url.split("/").pop() || ""));

    if (isMpegTs) {
      const mpegts = (window as any).mpegts;
      if (mpegts && mpegts.getFeatureList().mseLivePlayback) {
        try {
          tsInstance = mpegts.createPlayer({
            type: "mpegts",
            isLive: true,
            url: secureUrl,
            cors: true
          }, {
            enableStashBuffer: false,
            liveBufferLatencyChaser: true
          });
          tsInstance.attachMediaElement(video);
          tsInstance.load();
          
          video.play().catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(e => console.warn("[Video] Auto play failed:", e.message));
          });
        } catch (e) {
          console.error("[Video] mpegts.js setup error:", e);
          setPlayerError(true);
        }
      } else {
        video.src = secureUrl;
        video.play().catch(e => console.warn("[Video] Direct TS play failed:", e.message));
      }
    } else {
      // HLS .m3u8 check
      const Hls = (window as any).Hls;
      if (Hls && Hls.isSupported()) {
        try {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(secureUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {
              video.muted = true;
              setIsMuted(true);
              video.play().catch(e => console.warn("[Video] Auto play failed:", e.message));
            });
          });
          hlsInstance.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hlsInstance.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hlsInstance.recoverMediaError();
                  break;
                default:
                  setPlayerError(true);
                  break;
              }
            }
          });
        } catch (e) {
          console.error("[Video] HLS.js setup error:", e);
          setPlayerError(true);
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = secureUrl;
        video.play().catch(e => console.warn("[Video] Native HLS failed:", e.message));
      } else {
        video.src = secureUrl;
        video.play().catch(e => console.warn("[Video] Generic player play failed:", e.message));
      }
    }

    const onPlaying = () => { setLoading(false); setIsPlaying(true); };
    const onWaiting = () => setLoading(true);
    const onError = () => { setLoading(false); setPlayerError(true); };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("error", onError);

      if (hlsInstance) hlsInstance.destroy();
      if (tsInstance) {
        tsInstance.unload();
        tsInstance.detachMediaElement();
        tsInstance.destroy();
      }
      video.src = "";
    };
  }, [activeChannel]);

  function handleSelectChannel(ch: Channel) {
    setActiveChannel(ch);
    setSidebarOpen(false);
  }

  function handlePlayPause() {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  function handleMuteToggle() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    if (video.muted) {
      setVolume(0);
    } else {
      setVolume(video.volume || 1);
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }
  }

  function handleFullscreen() {
    const frame = playerFrameRef.current;
    if (!frame) return;
    if (!document.fullscreenElement) {
      frame.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  function handleReload() {
    if (activeChannel) {
      const current = activeChannel;
      setActiveChannel(null);
      setTimeout(() => setActiveChannel(current), 100);
    }
  }

  function getInitials(name: string): string {
    const clean = name.replace(/beIN Sports/gi, "").trim();
    if (!clean) return "📺";
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] w-full overflow-hidden bg-[#09090b] text-zinc-400 relative">
      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
        ></div>
      )}

      {/* SIDEBAR: CHANNEL PLAYLIST */}
      <aside
        className={`fixed lg:relative top-0 bottom-0 left-0 bg-[#121215] border-r border-white/5 flex flex-col z-40 transition-all duration-300 h-full ${
          sidebarOpen 
            ? "translate-x-0 w-[280px] sm:w-[320px]" 
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 overflow-hidden border-none"
        }`}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home Hub</span>
          </button>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            {title}
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-white/5 bg-[#121215] flex-shrink-0">
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Group Filter Pills */}
        <div className="px-3 py-2 border-b border-white/5 bg-[#121215] flex gap-1.5 overflow-x-auto custom-scrollbar scrollbar-none flex-shrink-0">
          {[
            { id: "all", label: "All" },
            { id: "bein", label: "beIN" },
            { id: "max", label: "MAX" },
            { id: "morocco", label: "Morocco" },
            { id: "forja", label: "Others" }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveGroup(pill.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeGroup === pill.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No channels found for: "{searchQuery}"
            </div>
          ) : (
            filteredChannels.map((ch, i) => {
              const isActive = activeChannel && activeChannel.url === ch.url;
              const initials = getInitials(ch.name);

              return (
                <div
                  key={i}
                  tabIndex={0}
                  onClick={() => handleSelectChannel(ch)}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectChannel(ch)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 relative ${
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/30"
                      : "bg-[#18181b]/40 hover:bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-xs font-bold font-display overflow-hidden ${
                    isActive ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" : "text-zinc-400"
                  }`}>
                    {ch.logo ? (
                      <img
                        src={ch.logo}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : null}
                    <span>{initials}</span>
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-xs font-bold text-white truncate leading-snug">
                      {ch.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 truncate leading-snug mt-0.5">
                      {ch.sub || "beIN Sport"}
                    </p>
                  </div>

                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  ) : (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-zinc-500">
                      {ch.quality}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-white/5 text-[10px] text-zinc-600 font-mono text-center flex-shrink-0">
          {filteredChannels.length} of {channels.length} Channels
        </div>
      </aside>

      {/* MAIN VIEW: VIDEO STREAM PLAYER */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden bg-[#09090b] p-4 lg:p-6">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#121215] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition cursor-pointer shadow-sm"
              title="Go to Home Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-[#121215] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={sidebarOpen ? "Hide Playlist" : "Show Playlist"}
            >
              <Tv className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline text-xs font-bold">
                {sidebarOpen ? "Hide Playlist" : "Show Playlist"}
              </span>
            </button>

            <div className="ml-2">
              <h2 className="text-base font-extrabold tracking-tight text-white line-clamp-1">
                {activeChannel ? activeChannel.name : "Loading live channel..."}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  M3U Satellite Gateway Connected
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              className="p-2 rounded-xl bg-[#121215] hover:bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Reset Live Stream"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stream Player Box */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden w-full h-full">
          {activeChannel ? (
            <div
              ref={playerFrameRef}
              className="relative w-full h-full max-h-[82vh] md:max-h-[86vh] aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl group flex items-center justify-center"
            >
              {loading && (
                <div className="absolute inset-0 bg-[#09090b]/95 flex flex-col items-center justify-center gap-3 z-20">
                  <div className="w-10 h-10 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-xs text-zinc-500 tracking-wider">Loading M3U live feed stream...</span>
                </div>
              )}

              {playerError && (
                <div className="absolute inset-0 bg-[#09090b]/95 flex flex-col items-center justify-center p-6 text-center gap-3 z-20">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-lg mb-2">
                    ⚽
                  </div>
                  <span className="text-sm font-bold text-white">Stream is buffering or offline</span>
                  <span className="text-xs text-zinc-500 max-w-sm">
                    The requested M3U satellite connection failed or is temporarily resolving. Click reload to refresh.
                  </span>
                  <button
                    onClick={handleReload}
                    className="mt-2 px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white transition hover:bg-indigo-500 cursor-pointer"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* VIDEO TAG */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                className="w-full h-full object-contain bg-black cursor-pointer"
                onClick={handlePlayPause}
              ></video>

              {/* CONTROLS OVERLAY */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10">
                {/* Simulated Red Timeline */}
                <div className="w-full h-0.5 bg-zinc-700/60 rounded-full overflow-hidden">
                  <div className="w-[100%] h-full bg-indigo-500"></div>
                </div>

                <div className="flex items-center justify-between">
                  {/* Left controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayPause}
                      className="text-white hover:text-indigo-400 transition cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white" />
                      )}
                    </button>

                    {/* Mute and volume slider */}
                    <div className="flex items-center gap-2 group/volume">
                      <button
                        onClick={handleMuteToggle}
                        className="text-white hover:text-indigo-400 transition cursor-pointer"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-0 group-hover/volume:w-16 focus:w-16 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all duration-200 opacity-0 group-hover/volume:opacity-100 focus:opacity-100"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                      <span>LIVE FEED</span>
                    </div>
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleReload}
                      className="text-white hover:text-indigo-400 transition cursor-pointer"
                      title="Reload Stream"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleFullscreen}
                      className="text-white hover:text-indigo-400 transition cursor-pointer"
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-xs">Loading satellite playlists...</div>
          )}
        </div>
      </main>
    </div>
  );
}
