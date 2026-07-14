import React, { useState } from "react";
import HomeDashboard from "./components/HomeDashboard";
import BeinMax from "./components/BeinMax";
import BeinSport from "./components/BeinSport";
import BeinM3uPlayer from "./components/BeinM3uPlayer";
import { useTvNav } from "./hooks/useTvNav";
import { LayoutGrid, Tv, ShieldCheck, Zap } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const userEmail = "abdollahhammou665@gmail.com"; // customized with user email format if needed

  // Activate TV Remote & Arrow Key keyboard navigation globally
  useTvNav();

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-400 font-sans selection:bg-brand-red selection:text-white antialiased overflow-hidden custom-scrollbar">
      {/* LEFT SIDEBAR: Premium Navigation Drawer */}
      <aside className="hidden md:flex w-64 bg-[#121215] border-r border-white/5 flex-col p-6 flex-shrink-0 z-20">
        {/* Decorative Brand Logo */}
        <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => setCurrentTab("home")}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="text-white font-black text-xl tracking-tight font-display uppercase">
            VELOSTRM
          </span>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="space-y-1 flex-1">
          
          <button
            onClick={() => setCurrentTab("home")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer group ${
              currentTab === "home" 
                ? "bg-white/5 text-white" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${currentTab === "home" ? "bg-indigo-500" : "bg-transparent group-hover:bg-zinc-500"}`}></div>
            <LayoutGrid className="w-4 h-4" />
            <span>Home Hub</span>
          </button>

          <button
            onClick={() => setCurrentTab("bein-sport")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer group ${
              currentTab === "bein-sport" 
                ? "bg-white/5 text-white" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${currentTab === "bein-sport" ? "bg-indigo-500" : "bg-transparent group-hover:bg-zinc-500"}`}></div>
            <Tv className="w-4 h-4" />
            <span>beIN Sport 1-9 (NTV)</span>
          </button>

          <button
            onClick={() => setCurrentTab("bein-max")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer group ${
              currentTab === "bein-max" 
                ? "bg-white/5 text-white" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${currentTab === "bein-max" ? "bg-indigo-500" : "bg-transparent group-hover:bg-zinc-500"}`}></div>
            <Tv className="w-4 h-4" />
            <span>beIN SPORT MAX</span>
          </button>

          <div className="text-[10px] font-bold text-zinc-650 uppercase tracking-widest pt-4 pb-2">M3U Satellite Feeds</div>

          <button
            onClick={() => setCurrentTab("bein-m3u-hd")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer group ${
              currentTab === "bein-m3u-hd" 
                ? "bg-white/5 text-white" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${currentTab === "bein-m3u-hd" ? "bg-indigo-500" : "bg-transparent group-hover:bg-zinc-500"}`}></div>
            <Zap className="w-4 h-4 text-amber-500" />
            <span>beIN Sport HD (M3U)</span>
          </button>

          <button
            onClick={() => setCurrentTab("bein-m3u-4k")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer group ${
              currentTab === "bein-m3u-4k" 
                ? "bg-white/5 text-white" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${currentTab === "bein-m3u-4k" ? "bg-indigo-500" : "bg-transparent group-hover:bg-zinc-500"}`}></div>
            <Zap className="w-4 h-4 text-purple-500" />
            <span>beIN Sport 4K (M3U)</span>
          </button>

          <button
            onClick={() => setCurrentTab("bein-m3u-sd")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer group ${
              currentTab === "bein-m3u-sd" 
                ? "bg-white/5 text-white" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${currentTab === "bein-m3u-sd" ? "bg-indigo-500" : "bg-transparent group-hover:bg-zinc-500"}`}></div>
            <Zap className="w-4 h-4 text-blue-500" />
            <span>beIN Sport SD (M3U)</span>
          </button>
        </nav>

        {/* Secure status card from design mockup */}
        <div className="mt-auto p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <div className="text-[11px] font-bold text-indigo-400 uppercase mb-2">Stream Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400">Secure Gateway Active</span>
          </div>
          <p className="text-[10px] mt-2 leading-relaxed opacity-70">
            M3U stream proxying enabled to bypass GitHub CORS restrictions.
          </p>
        </div>
      </aside>

      {/* RIGHT SIDE: Content viewport and status headers */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Global Nav Header with telemetry logs */}
        <header className="h-20 border-b border-white/5 flex items-center px-4 md:px-10 justify-between bg-[#09090b]/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => setCurrentTab("home")}>
              <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
            </div>
            <div>
              <span className="hidden sm:inline text-xs text-zinc-555 uppercase tracking-widest font-bold">
                {currentTab === "home" ? "Main Menu / Dashboard" : 
                 currentTab === "bein-sport" ? "Live Channels / sports 1-9 (NTV)" :
                 currentTab === "bein-max" ? "Live Channels / sports MAX" :
                 currentTab === "bein-m3u-hd" ? "Satellite Feed / sports HD (M3U)" :
                 currentTab === "bein-m3u-4k" ? "Satellite Feed / sports 4K (M3U)" :
                 "Satellite Feed / sports SD (M3U)"}
              </span>
              <span className="inline sm:hidden text-xs text-white font-black tracking-wider uppercase">
                {currentTab === "home" ? "VELOSTRM" : currentTab.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase text-zinc-500">Latency: 42ms</span>
            </div>
            
            <div className="flex items-center gap-2 text-zinc-400 text-xs hidden sm:flex">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>TLS Protected</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-[11px] text-white uppercase shadow-inner" title={userEmail}>
              {userEmail ? userEmail.substring(0, 2) : "US"}
            </div>
          </div>
        </header>

        {/* MOBILE RESPONSIVE NAV MENU */}
        <div className="md:hidden flex border-b border-white/5 bg-[#121215] overflow-x-auto py-2 px-3 gap-1.5 flex-shrink-0 custom-scrollbar scrollbar-none">
          {[
            { id: "home", label: "Home" },
            { id: "bein-sport", label: "beIN 1-9 (NTV)" },
            { id: "bein-max", label: "beIN MAX" },
            { id: "bein-m3u-hd", label: "beIN HD (M3U)" },
            { id: "bein-m3u-4k", label: "beIN 4K (M3U)" },
            { id: "bein-m3u-sd", label: "beIN SD (M3U)" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                currentTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic View Panel Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {currentTab === "home" && (
            <HomeDashboard onSelectTab={setCurrentTab} />
          )}
          
          {currentTab === "bein-max" && (
            <BeinMax onBack={() => setCurrentTab("home")} />
          )}
          
          {currentTab === "bein-sport" && (
            <BeinSport onBack={() => setCurrentTab("home")} />
          )}

          {currentTab === "bein-m3u-hd" && (
            <BeinM3uPlayer
              title="beIN SPORT HD (M3U)"
              groupTitle="|AR| ✪ BEIN SPORT HD"
              onBack={() => setCurrentTab("home")}
            />
          )}

          {currentTab === "bein-m3u-4k" && (
            <BeinM3uPlayer
              title="beIN SPORT 4K (M3U)"
              groupTitle="|AR| ✪ BEIN SPORT 4K"
              onBack={() => setCurrentTab("home")}
            />
          )}

          {currentTab === "bein-m3u-sd" && (
            <BeinM3uPlayer
              title="beIN SPORT SD (M3U)"
              groupTitle="|AR| ✪ BEIN SPORT SD"
              onBack={() => setCurrentTab("home")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
