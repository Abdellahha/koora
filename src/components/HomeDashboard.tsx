import React from "react";
import { motion } from "motion/react";
import { Play, Trophy, Tv, Calendar, Film, Zap, Sparkles, Globe } from "lucide-react";

interface HomeDashboardProps {
  onSelectTab: (tab: string) => void;
}

export default function HomeDashboard({ onSelectTab }: HomeDashboardProps) {
  const embedCards = [
    {
      id: "bein-sport",
      title: "beIN SPORT 1-9 (NTV)",
      description: "Direct integrated stream player for beIN Channels 1 through 9.",
      icon: <Play className="w-8 h-8 text-white animate-pulse" />,
      badge: "NTV Embedded",
      badgeStyle: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      iconBg: "bg-indigo-600",
      statusText: "Integrated Stream Feed",
    },
    {
      id: "bein-max",
      title: "beIN SPORT MAX (NTV)",
      description: "Direct embedded feed for MAX 1 · MAX 2 · MAX 3 · MAX 4.",
      icon: <Tv className="w-8 h-8 text-white" />,
      badge: "NTV Embedded",
      badgeStyle: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      iconBg: "bg-zinc-700",
      statusText: "Integrated Stream Feed",
    },
  ];

  const m3uCards = [
    {
      id: "bein-m3u-hd",
      title: "beIN Sport HD (M3U)",
      description: "High-Definition satellite stream list featuring all beIN 1-9, MAX channels, and others.",
      icon: <Zap className="w-8 h-8 text-amber-400 animate-pulse" />,
      badge: "M3U HD Stream",
      badgeStyle: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      iconBg: "bg-amber-950/40 border border-amber-500/25",
      statusText: "Buffering-Resistant HD Satellite Link",
    },
    {
      id: "bein-m3u-4k",
      title: "beIN Sport 4K (M3U)",
      description: "Ultra-High Definition beIN Sport & MAX 4K satellite broadcast list.",
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      badge: "M3U 4K UHD",
      badgeStyle: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      iconBg: "bg-purple-950/40 border border-purple-500/25",
      statusText: "Ultra HD Satellite Feed",
    },
    {
      id: "bein-m3u-sd",
      title: "beIN Sport SD (M3U)",
      description: "Standard Definition low-bandwidth channels for stable live streaming on slow networks.",
      icon: <Globe className="w-8 h-8 text-blue-400" />,
      badge: "M3U SD Feed",
      badgeStyle: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      iconBg: "bg-blue-950/40 border border-blue-500/25",
      statusText: "Stable SD Broadcast Feeds",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8 max-w-5xl mx-auto w-full">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="w-20 h-20 bg-[#121215] border border-white/5 rounded-3xl flex items-center justify-center text-4xl shadow-2xl mx-auto mb-5">
          ⚽
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-3">
          Koora <span className="text-indigo-500">Live</span> Hub
        </h1>
        <p className="text-zinc-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Your premium destination for secure, live-broadcast satellite beIN sports streaming. Toggle sidebars or expand the stream for maximum immersion.
        </p>
      </motion.div>

      {/* Grid container with two sections */}
      <div className="w-full flex flex-col gap-10">
        {/* SECTION 1: Embedded Streams */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              NTV Integrated Broadcasts (Embedded)
            </h2>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full"
          >
            {embedCards.map((card) => (
              <motion.button
                key={card.id}
                variants={itemVariants}
                onClick={() => onSelectTab(card.id)}
                className="flex flex-col items-start text-left p-5 bg-[#121215]/80 hover:bg-white/[0.03] active:scale-[0.99] border border-white/5 hover:border-indigo-500/40 rounded-2xl cursor-pointer transition-all duration-200 group shadow-md"
              >
                <div className="flex items-center gap-4 w-full mb-3">
                  <div
                    className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{card.statusText}</p>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                  {card.description}
                </p>

                <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-white/[0.03]">
                  <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ACTIVE FEED
                  </span>
                  <span
                    className={`text-[8px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${card.badgeStyle}`}
                  >
                    {card.badge}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* SECTION 2: M3U Satellite Feeds */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              M3U Satellite Feeds (Premium Playlists)
            </h2>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full"
          >
            {m3uCards.map((card) => (
              <motion.button
                key={card.id}
                variants={itemVariants}
                onClick={() => onSelectTab(card.id)}
                className="flex flex-col items-start text-left p-5 bg-[#121215]/80 hover:bg-white/[0.03] active:scale-[0.99] border border-white/5 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all duration-200 group shadow-md"
              >
                <div className="flex items-center gap-4 w-full mb-3">
                  <div
                    className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{card.statusText}</p>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                  {card.description}
                </p>

                <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-white/[0.03]">
                  <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    SATELLITE
                  </span>
                  <span
                    className={`text-[8px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${card.badgeStyle}`}
                  >
                    {card.badge}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-xs text-zinc-600 tracking-wide text-center"
      >
        Select any mode above to instantly parse and load active channels inside the unified sports browser.
      </motion.p>
    </div>
  );
}
