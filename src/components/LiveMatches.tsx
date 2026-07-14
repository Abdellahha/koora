import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tv, RefreshCw, Maximize2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Match } from "../types";

// TEAM SLUG MAP FOR MATCHING EMEDS
const SLUG_MAP: Record<string, string> = {
  "الجزائر": "algeria", "الأرجنتين": "argentina", "أستراليا": "australia",
  "النمسا": "austria", "بلجيكا": "belgium", "بوليفيا": "bolivia",
  "البوسنة والهرسك": "bosnia-herzegovina", "البرازيل": "brazil",
  "الكاميرون": "cameroon", "كندا": "canada", "الرأس الأخضر": "cape-verde",
  "تشيلي": "chile", "كولومبيا": "colombia", "كوستاريكا": "costa-rica",
  "كرواتيا": "croatia", "كوراكاو": "curacao", "التشيك": "czechia",
  "الدنمارك": "denmark", "الكونغو الديمقراطية": "dr-congo", "الإكوادور": "ecuador",
  "مصر": "egypt", "إنجلترا": "england", "فرنسا": "france", "ألمانيا": "germany",
  "غانا": "ghana", "هايتي": "haiti", "هندوراس": "honduras", "المجر": "hungary",
  "إيران": "iran", "العراق": "iraq", "ساحل العاج": "ivory-coast",
  "جامايكا": "jamaica", "اليابان": "japan", "الأردن": "jordan",
  "المكسيك": "mexico", "المغرب": "morocco", "هولندا": "netherlands",
  "نيوزيلندا": "new-zealand", "نيجيريا": "nigeria", "النرويج": "norway",
  "بنما": "panama", "باراغواي": "paraguay", "البرتغال": "portugal",
  "قطر": "qatar", "السعودية": "saudi-arabia", "المملكة العربية السعودية": "saudi-arabia",
  "اسكتلندا": "scotland", "السنغال": "senegal", "صربيا": "serbia",
  "سلوفاكيا": "slovakia", "جنوب أفريقيا": "south-africa", "كوريا الجنوبية": "south-korea",
  "إسبانيا": "spain", "السويد": "sweden", "سويسرا": "switzerland",
  "ترينيداد وتوباغو": "trinidad-and-tobago", "تونس": "tunisia",
  "تركيا": "turkey", "أوكرانيا": "ukraine", "الولايات المتحدة": "united-states",
  "أوروغواي": "uruguay", "أوزبكستان": "uzbekistan", "فنزويلا": "venezuela",
  "algeria": "algeria", "argentina": "argentina", "australia": "australia",
  "austria": "austria", "belgium": "belgium", "bolivia": "bolivia",
  "brazil": "brazil", "cameroon": "cameroon", "canada": "canada",
  "chile": "chile", "colombia": "colombia", "croatia": "croatia",
  "czechia": "czechia", "denmark": "denmark", "ecuador": "ecuador",
  "egypt": "egypt", "england": "england", "france": "france",
  "germany": "germany", "ghana": "ghana", "honduras": "honduras",
  "hungary": "hungary", "iran": "iran", "iraq": "iraq",
  "jamaica": "jamaica", "japan": "japan", "jordan": "jordan",
  "mexico": "mexico", "morocco": "morocco", "nigeria": "nigeria",
  "norway": "norway", "panama": "panama", "paraguay": "paraguay",
  "portugal": "portugal", "qatar": "qatar", "scotland": "scotland",
  "senegal": "senegal", "serbia": "serbia", "slovakia": "slovakia",
  "spain": "spain", "sweden": "sweden", "switzerland": "switzerland",
  "tunisia": "tunisia", "turkey": "turkey", "ukraine": "ukraine",
  "uruguay": "uruguay", "venezuela": "venezuela",
};

const FLAGS: Record<string, string> = {
  "algeria": "🇩🇿", "argentina": "🇦🇷", "australia": "🇦🇺", "austria": "🇦🇹",
  "belgium": "🇧🇪", "bolivia": "🇧🇴", "bosnia-herzegovina": "🇧🇦", "brazil": "🇧🇷",
  "cameroon": "🇨🇲", "canada": "🇨🇦", "cape-verde": "🇨🇻", "chile": "🇨🇱",
  "colombia": "🇨🇴", "costa-rica": "🇨🇷", "croatia": "🇭🇷", "curacao": "🇨🇼",
  "czechia": "🇨🇿", "denmark": "🇩🇰", "dr-congo": "🇨🇩", "ecuador": "🇪🇨",
  "egypt": "🇪🇬", "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "france": "🇫🇷", "germany": "🇩🇪",
  "ghana": "🇬🇭", "haiti": "🇭🇹", "honduras": "🇭🇳", "hungary": "🇭🇺",
  "iran": "🇮🇷", "iraq": "🇮🇶", "ivory-coast": "🇨🇮", "jamaica": "🇯🇲",
  "japan": "🇯🇵", "jordan": "🇯🇴", "mexico": "🇲🇽", "morocco": "🇲🇦",
  "netherlands": "🇳🇱", "new-zealand": "🇳🇿", "nigeria": "🇳🇬", "norway": "🇳🇴",
  "panama": "🇵🇦", "paraguay": "🇵🇾", "portugal": "🇵🇹", "qatar": "🇶🇦",
  "saudi-arabia": "🇸🇦", "scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "senegal": "🇸🇳", "serbia": "🇷🇸",
  "slovakia": "🇸🇰", "south-africa": "🇿🇦", "south-korea": "🇰🇷", "spain": "🇪🇸",
  "sweden": "🇸🇪", "switzerland": "🇨🇭", "trinidad-and-tobago": "🇹🇹", "tunisia": "🇹🇳",
  "turkey": "🇹🇷", "ukraine": "🇺🇦", "united-states": "🇺🇸", "uruguay": "🇺🇾",
  "uzbekistan": "🇺🇿", "venezuela": "🇻🇪",
};

interface LiveMatchesProps {
  onBack: () => void;
}

export default function LiveMatches({ onBack }: LiveMatchesProps) {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"live" | "upcoming">("live");
  const [matches, setMatches] = useState<{ live: Match[]; upcoming: Match[] }>({ live: [], upcoming: [] });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [playerLoading, setPlayerLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Helper helper to slugify names
  function toSlug(name: string): string | null {
    if (!name) return null;
    const clean = name.trim();
    if (SLUG_MAP[clean]) return SLUG_MAP[clean];
    const lo = clean.toLowerCase();
    if (SLUG_MAP[lo]) return SLUG_MAP[lo];
    
    // Check partial contains
    for (const [k, v] of Object.entries(SLUG_MAP)) {
      if (clean.includes(k) || k.includes(clean)) return v;
    }
    return null;
  }

  function parseMatchesHtml(html: string): Match[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const parsedMatches: Match[] = [];
    
    // Select match containers/links
    const blocks = doc.querySelectorAll('a[href*="watch"], a[href*="hes-goals"], a[href*="koraylive"]');
    
    blocks.forEach((link) => {
      const parent = link.closest("div, li, article, section") || link.parentElement;
      if (!parent) return;

      const imgs = parent.querySelectorAll("img");
      const texts = Array.from(parent.querySelectorAll("*"))
        .filter((el) => el.children.length === 0 && el.textContent?.trim())
        .map((el) => el.textContent!.trim())
        .filter(Boolean);

      const teamNames = Array.from(imgs)
        .map((img) => img.alt || img.getAttribute("title") || "")
        .filter((n) => n.length > 1);

      if (teamNames.length < 2) return;

      const home = teamNames[0];
      const away = teamNames[1];

      // Parse score like "2-1" or "0-0"
      const scoreText = texts.find((t) => /\d+[-–]\d+/.test(t)) || "";
      const timeText = texts.find((t) => /\d{1,2}:\d{2}/.test(t) || /انته|مباشر|بعد قليل|لم تبدأ/.test(t)) || "";
      const statusText = texts.find((t) => /انته|مباشر|بعد قليل|لم تبدأ/.test(t)) || "";

      let scoreA = "";
      let scoreB = "";
      const scoreMatch = scoreText.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (scoreMatch) {
        scoreA = scoreMatch[1];
        scoreB = scoreMatch[2];
      }

      // Detect status
      let status: "live" | "upcoming" | "ended" = "upcoming";
      const normText = (statusText || timeText || scoreText).toLowerCase();
      if (/\d+'\s*$|مباشر|live|\blive\b/i.test(normText)) {
        status = "live";
      } else if (/انته|ended|ft|نهاية|انتهت/i.test(normText)) {
        status = "ended";
      }

      // Normalize time text
      let time = timeText.replace(/لم تبدأ|بعد قليل/g, "").trim();
      const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM|ص|م)?/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1]);
        const min = timeMatch[2];
        const ap = (timeMatch[3] || "").toUpperCase();
        if ((ap === "PM" || ap === "م") && h < 12) h += 12;
        if ((ap === "AM" || ap === "ص") && h === 12) h = 0;
        const p = h >= 12 ? "PM" : "AM";
        const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        time = `${String(h12).padStart(2, "0")}:${min} ${p}`;
      }

      parsedMatches.push({
        home,
        away,
        slugA: toSlug(home),
        slugB: toSlug(away),
        scoreA,
        scoreB,
        time: time || "Scheduled",
        status,
      });
    });

    // Remove duplicates
    const seen = new Set<string>();
    return parsedMatches.filter((m) => {
      const key = `${m.home}|${m.away}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function loadSchedule() {
    setLoading(true);
    try {
      const res = await fetch("/api/matches-source");
      if (!res.ok) throw new Error("Status failed");
      const html = await res.text();
      const list = parseMatchesHtml(html);
      
      const live = list.filter((m) => m.status === "live");
      const upcoming = list.filter((m) => m.status === "upcoming");
      
      setMatches({ live, upcoming });
      setCountdown(60);
    } catch (e) {
      console.error("Failed to load match schedule:", e);
    } finally {
      setLoading(false);
    }
  }

  // Reload timer countdown
  useEffect(() => {
    loadSchedule();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadSchedule();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeMatches = matches[currentTab];

  function getMatchEmbedUrl(m: Match) {
    if (!m.slugA || !m.slugB) return "";
    return `https://embed.st/embed/admin/ppv-${m.slugA}-vs-${m.slugB}/7`;
  }

  function handleSelectMatch(m: Match) {
    if (!m.slugA || !m.slugB) return;
    setPlayerLoading(true);
    setSelectedMatch(m);
  }

  function handleIframeLoad() {
    setPlayerLoading(false);
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-black text-white">
      {/* SIDEBAR: Match Schedule List */}
      <aside className="w-full lg:w-[320px] xl:w-[360px] flex flex-col border-r border-zinc-800 bg-zinc-950 flex-shrink-0">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
          <div className="text-xs text-zinc-500 flex items-center gap-2 font-mono">
            <span>Refresh: {countdown}s</span>
            <button onClick={loadSchedule} className="hover:text-white transition">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setCurrentTab("live")}
            className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase border-b-2 transition ${
              currentTab === "live"
                ? "border-brand-red text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-brand-green mr-2 animate-pulse"></span>
            Live ({matches.live.length})
          </button>
          <button
            onClick={() => setCurrentTab("upcoming")}
            className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase border-b-2 transition ${
              currentTab === "upcoming"
                ? "border-brand-blue text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            ⏰ Upcoming ({matches.upcoming.length})
          </button>
        </div>

        {/* Matches Scroll Box */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {loading && activeMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
              <div className="w-8 h-8 border-2 border-zinc-800 border-t-brand-red rounded-full animate-spin"></div>
              <span className="text-xs">Parsing fixtures...</span>
            </div>
          ) : activeMatches.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-500">
              No {currentTab} fixtures right now. Check back later!
            </div>
          ) : (
            activeMatches.map((m, i) => {
              const hasStream = m.slugA && m.slugB;
              const flagA = (m.slugA && FLAGS[m.slugA]) || "⚽";
              const flagB = (m.slugB && FLAGS[m.slugB]) || "⚽";
              const isActive = selectedMatch && selectedMatch.home === m.home && selectedMatch.away === m.away;

              return (
                <div
                  key={i}
                  tabIndex={hasStream ? 0 : -1}
                  onClick={() => hasStream && handleSelectMatch(m)}
                  onKeyDown={(e) => e.key === "Enter" && hasStream && handleSelectMatch(m)}
                  className={`p-3 rounded-xl border transition-all duration-150 relative overflow-hidden flex items-center justify-between ${
                    !hasStream ? "opacity-50 cursor-not-allowed border-zinc-800 bg-zinc-900/20" : "cursor-pointer"
                  } ${
                    isActive
                      ? "border-brand-blue bg-brand-blue/10"
                      : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/50 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1.5 text-xs text-zinc-300 font-semibold truncate">
                      <span className="text-sm">{flagA}</span>
                      <span className="truncate">{m.home}</span>
                      {m.scoreA !== "" && <span className="font-extrabold text-white bg-zinc-800 px-1.5 py-0.5 rounded ml-auto text-[10px]">{m.scoreA}</span>}
                    </div>
                    <div className="text-[10px] text-zinc-500 pl-4 font-bold my-0.5">vs</div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold truncate">
                      <span className="text-sm">{flagB}</span>
                      <span className="truncate">{m.away}</span>
                      {m.scoreB !== "" && <span className="font-extrabold text-white bg-zinc-800 px-1.5 py-0.5 rounded ml-auto text-[10px]">{m.scoreB}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {m.status === "live" ? (
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-red text-white tracking-wider animate-pulse">
                        LIVE
                      </span>
                    ) : m.status === "ended" ? (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        Ended
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-brand-blue border border-brand-blue/20">
                        {m.time}
                      </span>
                    )}
                    {!hasStream && (
                      <span className="text-[8px] text-zinc-600 font-bold uppercase flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-zinc-700" />
                        No Stream
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* MAIN VIEW: Interactive Stream Player */}
      <main className="flex-1 flex flex-col bg-black relative justify-center items-center p-4 lg:p-6">
        {selectedMatch ? (
          <div className="w-full h-full max-w-5xl flex flex-col justify-between">
            {/* Player header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>{FLAGS[selectedMatch.slugA || ""] || "⚽"}</span>
                  <span>{selectedMatch.home}</span>
                  <span className="text-zinc-500 font-normal">vs</span>
                  <span>{selectedMatch.away}</span>
                  <span>{FLAGS[selectedMatch.slugB || ""] || "⚽"}</span>
                </h2>
                <p className="text-xs text-zinc-400">Live Matchup HD Stream</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold bg-brand-blue/10 border border-brand-blue/30 text-brand-blue px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  Connected
                </span>
                <button
                  onClick={() => selectedMatch && handleSelectMatch(selectedMatch)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs transition cursor-pointer"
                  title="Reload Player"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video container */}
            <div className="flex-1 relative aspect-video bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              {playerLoading && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-3 z-10">
                  <div className="w-10 h-10 border-4 border-zinc-800 border-t-brand-blue rounded-full animate-spin"></div>
                  <span className="text-xs text-zinc-400">Acquiring live stream protocol...</span>
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                src={getMatchEmbedUrl(selectedMatch)}
                onLoad={handleIframeLoad}
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0 rounded-2xl"
              ></iframe>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 max-w-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mb-4">
              <Tv className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Select a Live Match</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Choose an active match from the schedule sidebar to connect to the live streaming satellite server.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
