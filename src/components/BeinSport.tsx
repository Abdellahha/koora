import React, { useState } from "react";
import { ArrowLeft, Tv, RefreshCw, AlertCircle } from "lucide-react";
import { Channel } from "../types";

const STATIONS: Channel[] = [
  { name: "beIN Sport 1", sub: "Live Channel", code: "BS1", url: "https://ntv.cx/embed?t=OThTUzhFbk9WeExodUtsTmV0cFgxMVdndW5LbW9PbUtMa2NlM2UxS3VHTy9CWWFxS0dLUEdMRmhrMnpXWHdxTA~~", quality: "HD" },
  { name: "beIN Sport 2", sub: "Live Channel", code: "BS2", url: "https://ntv.cx/embed?t=OThTUzhFbk9WeExodUtsTmV0cFgxLzltRnN6S3ludFB4alU4MGNEc1FURFkrYzhZaFhxazRKcm81WGswV0FsSg~~", quality: "HD" },
  { name: "beIN Sport 3", sub: "Live Channel", code: "BS3", url: "https://ntv.cx/embed?t=OThTUzhFbk9WeExodUtsTmV0cFgxK3kxYWttMlBhbkJGYm1ZQ2lDRm5lL1Zkc1NxRXpEWGtwUUdkR3VCLzV4WA~~", quality: "HD" },
  { name: "beIN Sport 4", sub: "Live Channel", code: "BS4", url: "https://ntv.cx/embed?t=OThTUzhFbk9WeExodUtsTmV0cFgxLzZHTTYwVVdHQjl1Um8xWVBUS3Y1cllVT0xtbnd1VjJDWUkxQU5LN2QwRQ~~", quality: "HD" },
  { name: "beIN Sport 5", sub: "Live Channel", code: "BS5", url: "https://ntv.cx/embed?t=OThTUzhFbk9WeExodUtsTmV0cFgxMVY3U0lRaWlUUlJ6QmpPTDl4UnFuUlQ5RDM1OTRxc0EyWWxabUk2NTNEMw~~", quality: "HD" },
  { name: "beIN Sport 6", sub: "Live Channel", code: "BS6", url: "https://ntv.cx/embed?t=TVhpbmcyU0I1MVc3V3RtQm9STU1JRnllbnVSbkttVUtvZFcyNlNNSDJ3VnVMWjU4V3hHeDc3Mk5Nc2J5bjhLb3dzVCtPS1JBM2oxSW05UnkrdWM1dmpoZ09Wb1ZLRFhZbWc1SkxGclBydjREMFNKY2Y3anNuQXJHdlFqUitKM0xtb3o1a3ZLSTRiMndxVmJwMGNEYUNBPT0~", quality: "HD" },
  { name: "beIN Sport 7", sub: "Live Channel", code: "BS7", url: "https://ntv.cx/embed?t=OThTUzhFbk9WeExodUtsTmV0cFgxK09YVVczMlBobEE4b0UrSUd4ZzNSS1YyZnVRWkphUWJMNkVsMGkvVFdpbw~~", quality: "HD" },
  { name: "beIN Sport 8", sub: "Live Channel", code: "BS8", url: "https://ntv.cx/embed?t=TVhpbmcyU0I1MVc3V3RtQm9STU1JRnllbnVSbkttVUtvZFcyNlNNSDJ3VnVMWjU4V3hHeDc3Mk5Nc2J5bjhLb3dzVCtPS1JBM2oxSW05UnkrdWM1dmc4M0JpWlRiR2xNNURMQlRzTFMxL0ZlR05YR2VmUk1IQkNkMzF4dnp2TVErSWRoWXMzY1pwck9FN0RVNlpycEh3PT0~", quality: "HD" },
  { name: "beIN Sport 9", sub: "Live Channel", code: "BS9", url: "https://ntv.cx/embed?t=OThTUzhFbk9WeExodUtsTmV0cFgxKzhnMTl0anluZGZpWjhiTmhTN0xpOFpHVnI4UTBxOXFmaXBIaHBRblpvYw~~", quality: "HD" },
];

interface BeinSportProps {
  onBack: () => void;
}

export default function BeinSport({ onBack }: BeinSportProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const activeChannel = STATIONS[activeIdx];

  function handleSelectChannel(i: number) {
    setPlayerLoading(true);
    setActiveIdx(i);
  }

  function handleReload() {
    setPlayerLoading(true);
    const i = activeIdx;
    setActiveIdx(-1);
    setTimeout(() => setActiveIdx(i), 100);
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] w-full overflow-hidden bg-black text-white relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
        ></div>
      )}

      {/* SIDEBAR LIST */}
      <aside
        className={`fixed lg:relative top-0 bottom-0 left-0 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40 transition-all duration-300 h-full ${
          sidebarOpen 
            ? "translate-x-0 w-[280px] sm:w-[320px]" 
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 overflow-hidden border-none"
        }`}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home Hub</span>
          </button>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Channels 1-9
          </span>
        </div>

        <div className="p-4 border-b border-zinc-905 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-center justify-center font-bold">
            ⚽
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">beIN Sport</h2>
            <span className="text-[10px] text-zinc-500">Live Satellite Feeds</span>
          </div>
        </div>

        {/* Playlist Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {STATIONS.map((ch, i) => {
            const isActive = i === activeIdx;
            return (
              <div
                key={i}
                tabIndex={0}
                onClick={() => handleSelectChannel(i)}
                onKeyDown={(e) => e.key === "Enter" && handleSelectChannel(i)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-brand-red/10 border-brand-red/40"
                    : "bg-zinc-900/40 hover:bg-zinc-800/40 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black tracking-tighter ${
                    isActive ? "text-brand-red border-brand-red/20" : "text-zinc-500"
                  }`}
                >
                  {ch.code}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">{ch.name}</h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{ch.sub}</p>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-brand-green mr-1 animate-pulse"></span>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-zinc-900 text-[10px] text-zinc-600 text-center font-mono flex-shrink-0">
          beIN Sport Global UHD Active
        </div>
      </aside>

      {/* VIDEO PLAYER PANELS */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden bg-black p-4 lg:p-6">
        {/* Stream title and control header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer shadow-sm"
              title="Go to Home Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={sidebarOpen ? "Hide Playlist" : "Show Playlist"}
            >
              <Tv className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline text-xs font-bold">
                {sidebarOpen ? "Hide Playlist" : "Show Playlist"}
              </span>
            </button>

            <div className="ml-2">
              <h2 className="text-base font-extrabold tracking-tight text-white line-clamp-1">
                {activeChannel ? activeChannel.name : "Loading feed..."}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Live Embed Secure Gateway
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Reload Frame"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Streaming area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden w-full h-full bg-black">
          {activeChannel ? (
            <div className="relative w-full h-full max-h-[82vh] md:max-h-[86vh] aspect-video bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
              {playerLoading && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-3 z-10">
                  <div className="w-10 h-10 border-4 border-zinc-800 border-t-brand-red rounded-full animate-spin"></div>
                  <span className="text-xs text-zinc-400">Piping direct secure embed stream...</span>
                </div>
              )}
              <iframe
                src={activeChannel.url}
                onLoad={() => setPlayerLoading(false)}
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0 rounded-2xl"
              ></iframe>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 text-xs gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Connecting to beIN feed network...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
