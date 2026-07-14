import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Trophy, Search, Check, RefreshCw, HelpCircle, Film } from "lucide-react";

interface Team {
  name: string;
  slug: string;
  flag: string;
}

const WC_TEAMS: Team[] = [
  { name: "Algeria", slug: "algeria", flag: "🇩🇿" },
  { name: "Argentina", slug: "argentina", flag: "🇦🇷" },
  { name: "Australia", slug: "australia", flag: "🇦🇺" },
  { name: "Austria", slug: "austria", flag: "🇦🇹" },
  { name: "Belgium", slug: "belgium", flag: "🇧🇪" },
  { name: "Bolivia", slug: "bolivia", flag: "🇧🇴" },
  { name: "Bosnia Herzegovina", slug: "bosnia-herzegovina", flag: "🇧🇦" },
  { name: "Brazil", slug: "brazil", flag: "🇧🇷" },
  { name: "Cameroon", slug: "cameroon", flag: "🇨🇲" },
  { name: "Canada", slug: "canada", flag: "🇨🇦" },
  { name: "Cape Verde", slug: "cape-verde", flag: "🇨🇻" },
  { name: "Chile", slug: "chile", flag: "🇨🇱" },
  { name: "Colombia", slug: "colombia", flag: "🇨🇴" },
  { name: "Costa Rica", slug: "costa-rica", flag: "🇨🇷" },
  { name: "Croatia", slug: "croatia", flag: "🇭🇷" },
  { name: "Curacao", slug: "cura-ao", flag: "🇨🇼" },
  { name: "Czechia", slug: "czechia", flag: "🇨🇿" },
  { name: "Denmark", slug: "denmark", flag: "🇩🇰" },
  { name: "DR Congo", slug: "dr-congo", flag: "🇨🇩" },
  { name: "Ecuador", slug: "ecuador", flag: "🇪🇨" },
  { name: "Egypt", slug: "egypt", flag: "🇪🇬" },
  { name: "England", slug: "england", flag: "🏴" },
  { name: "France", slug: "france", flag: "🇫🇷" },
  { name: "Germany", slug: "germany", flag: "🇩🇪" },
  { name: "Ghana", slug: "ghana", flag: "🇬🇭" },
  { name: "Haiti", slug: "haiti", flag: "🇭🇹" },
  { name: "Honduras", slug: "honduras", flag: "🇭🇳" },
  { name: "Hungary", slug: "hungary", flag: "🇭🇺" },
  { name: "Iran", slug: "iran", flag: "🇮🇷" },
  { name: "Iraq", slug: "iraq", flag: "🇮🇶" },
  { name: "Ivory Coast", slug: "ivory-coast", flag: "🇨🇮" },
  { name: "Jamaica", slug: "jamaica", flag: "🇯🇲" },
  { name: "Japan", slug: "japan", flag: "🇯🇵" },
  { name: "Jordan", slug: "jordan", flag: "🇯🇴" },
  { name: "Mexico", slug: "mexico", flag: "🇲🇽" },
  { name: "Morocco", slug: "morocco", flag: "🇲🇦" },
  { name: "Netherlands", slug: "netherlands", flag: "🇳🇱" },
  { name: "New Zealand", slug: "new-zealand", flag: "🇳🇿" },
  { name: "Nigeria", slug: "nigeria", flag: "🇳🇬" },
  { name: "Norway", slug: "norway", flag: "🇳🇴" },
  { name: "Panama", slug: "panama", flag: "🇵🇦" },
  { name: "Paraguay", slug: "paraguay", flag: "🇵🇾" },
  { name: "Portugal", slug: "portugal", flag: "🇵🇹" },
  { name: "Qatar", slug: "qatar", flag: "🇶🇦" },
  { name: "Saudi Arabia", slug: "saudi-arabia", flag: "🇸🇦" },
  { name: "Scotland", slug: "scotland", flag: "🏴" },
  { name: "Senegal", slug: "senegal", flag: "🇸🇳" },
  { name: "Serbia", slug: "serbia", flag: "🇷🇸" },
  { name: "Slovakia", slug: "slovakia", flag: "🇸🇰" },
  { name: "South Africa", slug: "south-africa", flag: "🇿🇦" },
  { name: "South Korea", slug: "south-korea", flag: "🇰🇷" },
  { name: "Spain", slug: "spain", flag: "🇪🇸" },
  { name: "Sweden", slug: "sweden", flag: "🇸🇪" },
  { name: "Switzerland", slug: "switzerland", flag: "🇨🇭" },
  { name: "Trinidad and Tobago", slug: "trinidad-and-tobago", flag: "🇹🇹" },
  { name: "Tunisia", slug: "tunisia", flag: "🇹🇳" },
  { name: "Turkey", slug: "turkey", flag: "🇹🇷" },
  { name: "Ukraine", slug: "ukraine", flag: "🇺🇦" },
  { name: "United States", slug: "united-states", flag: "🇺🇸" },
  { name: "Uruguay", slug: "uruguay", flag: "🇺🇾" },
  { name: "Uzbekistan", slug: "uzbekistan", flag: "🇺🇿" },
  { name: "Venezuela", slug: "venezuela", flag: "🇻🇪" },
];

interface WorldCupProps {
  onBack: () => void;
}

export default function WorldCup({ onBack }: WorldCupProps) {
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [openSelector, setOpenSelector] = useState<"A" | "B" | null>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [playerLoading, setPlayerLoading] = useState(false);

  const filteredTeamsA = WC_TEAMS.filter((t) =>
    t.name.toLowerCase().includes(searchA.toLowerCase())
  );
  const filteredTeamsB = WC_TEAMS.filter((t) =>
    t.name.toLowerCase().includes(searchB.toLowerCase())
  );

  function handleSelectTeam(side: "A" | "B", team: Team) {
    if (side === "A") {
      setTeamA(team);
    } else {
      setTeamB(team);
    }
    setOpenSelector(null);
  }

  function handleStartStream() {
    if (!teamA || !teamB || teamA.slug === teamB.slug) return;
    setPlayerLoading(true);
    const url = `https://embed.st/embed/admin/ppv-${teamA.slug}-vs-${teamB.slug}/7`;
    setStreamUrl(url);
  }

  function handleReload() {
    if (streamUrl) {
      setPlayerLoading(true);
      const url = streamUrl;
      setStreamUrl("");
      setTimeout(() => setStreamUrl(url), 100);
    }
  }

  const isFormValid = teamA && teamB && teamA.slug !== teamB.slug;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-black text-white">
      {/* LEFT CONTROL PANEL */}
      <aside className="w-full lg:w-[320px] xl:w-[350px] border-r border-zinc-800 bg-zinc-950 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Match Generator
          </span>
        </div>

        <div className="p-4 border-b border-zinc-900 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-600/30 text-blue-500 flex items-center justify-center font-bold">
            🏆
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">World Cup 2026</h2>
            <span className="text-[10px] text-zinc-500">Pick any match setup to watch</span>
          </div>
        </div>

        {/* TEAM SELECTORS BOX */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* TEAM A */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
              Local Team (A)
            </label>
            <div className="relative">
              <button
                onClick={() => setOpenSelector(openSelector === "A" ? null : "A")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition ${
                  openSelector === "A"
                    ? "bg-zinc-900 border-brand-blue"
                    : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                <span className="text-xl">{teamA?.flag || "🌍"}</span>
                <span className={`text-xs font-semibold flex-1 truncate ${teamA ? "text-white" : "text-zinc-500"}`}>
                  {teamA?.name || "Choose Team A..."}
                </span>
                <span className="text-xs text-zinc-500">▾</span>
              </button>

              <AnimatePresence>
                {openSelector === "A" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[220px] flex flex-col"
                  >
                    <div className="p-2 border-b border-zinc-850 flex items-center gap-2 bg-zinc-950">
                      <Search className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search team..."
                        value={searchA}
                        onChange={(e) => setSearchA(e.target.value)}
                        className="bg-transparent border-0 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-0 w-full p-1"
                        autoFocus
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                      {filteredTeamsA.map((t) => (
                        <button
                          key={t.slug}
                          onClick={() => handleSelectTeam("A", t)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-medium cursor-pointer ${
                            teamA?.slug === t.slug
                              ? "bg-brand-blue/10 text-brand-blue"
                              : "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                          }`}
                        >
                          <span className="text-sm">{t.flag}</span>
                          <span className="flex-1 truncate">{t.name}</span>
                          {teamA?.slug === t.slug && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-center text-[10px] font-extrabold text-zinc-600 tracking-widest my-1">— VS —</div>

          {/* TEAM B */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
              Away Team (B)
            </label>
            <div className="relative">
              <button
                onClick={() => setOpenSelector(openSelector === "B" ? null : "B")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition ${
                  openSelector === "B"
                    ? "bg-zinc-900 border-brand-blue"
                    : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                <span className="text-xl">{teamB?.flag || "🌍"}</span>
                <span className={`text-xs font-semibold flex-1 truncate ${teamB ? "text-white" : "text-zinc-500"}`}>
                  {teamB?.name || "Choose Team B..."}
                </span>
                <span className="text-xs text-zinc-500">▾</span>
              </button>

              <AnimatePresence>
                {openSelector === "B" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[220px] flex flex-col"
                  >
                    <div className="p-2 border-b border-zinc-850 flex items-center gap-2 bg-zinc-950">
                      <Search className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search team..."
                        value={searchB}
                        onChange={(e) => setSearchB(e.target.value)}
                        className="bg-transparent border-0 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-0 w-full p-1"
                        autoFocus
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                      {filteredTeamsB.map((t) => (
                        <button
                          key={t.slug}
                          onClick={() => handleSelectTeam("B", t)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-medium cursor-pointer ${
                            teamB?.slug === t.slug
                              ? "bg-brand-blue/10 text-brand-blue"
                              : "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                          }`}
                        >
                          <span className="text-sm">{t.flag}</span>
                          <span className="flex-1 truncate">{t.name}</span>
                          {teamB?.slug === t.slug && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* STREAM BTN */}
          <button
            onClick={handleStartStream}
            disabled={!isFormValid}
            className="w-full mt-6 py-3 px-4 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-lg transition duration-200 cursor-pointer"
          >
            ▶ Connect Matchup Stream
          </button>
        </div>

        <div className="p-4 border-t border-zinc-850 text-[10px] text-zinc-600 text-center font-mono">
          WC 2026 satellite active
        </div>
      </aside>

      {/* RIGHT VIDEO PLAYER PANEL */}
      <main className="flex-1 flex flex-col bg-black justify-center items-center p-4 lg:p-6 relative">
        {streamUrl ? (
          <div className="w-full h-full max-w-5xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>{teamA?.flag}</span>
                  <span>{teamA?.name}</span>
                  <span className="text-zinc-500 font-normal">vs</span>
                  <span>{teamB?.name}</span>
                  <span>{teamB?.flag}</span>
                </h2>
                <p className="text-[10px] text-zinc-400">World Cup Qualifier Live Stream</p>
              </div>
              <button
                onClick={handleReload}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs transition cursor-pointer"
                title="Reset Connection"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 relative aspect-video bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              {playerLoading && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-3 z-1 z-10">
                  <div className="w-10 h-10 border-4 border-zinc-800 border-t-brand-blue rounded-full animate-spin"></div>
                  <span className="text-xs text-zinc-400">Connecting to direct satellite stream feed...</span>
                </div>
              )}
              <iframe
                src={streamUrl}
                onLoad={() => setPlayerLoading(false)}
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0 rounded-2xl"
              ></iframe>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 max-w-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mb-4 text-3xl">
              🏆
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Generate WC Matchup</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Pick any two national football federations from the sidebar and click the connection button to retrieve their active live streaming channels.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
