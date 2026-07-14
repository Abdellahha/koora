import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, Star, Film, Tv, TrendingUp, Info, Play, X, RefreshCw, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CineFastItem, CineFastSeason } from "../types";

const TMDB_KEY = "4ef0d7355d9ffb5151e987764708ce96";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_POSTER = "https://image.tmdb.org/t/p/w342";
const IMG_BACKDROP = "https://image.tmdb.org/t/p/w1280";

const EMBED_MOVIE = (id: number) => `https://vidfast.pro/movie/${id}?autoPlay=true`;
const EMBED_TV = (id: number, s: number, e: number) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true`;

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};

interface CineFastProps {
  onBack: () => void;
}

export default function CineFast({ onBack }: CineFastProps) {
  const [activeTab, setActiveTab] = useState<"home" | "movies" | "series" | "trending">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CineFastItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Home Page State
  const [heroItem, setHeroItem] = useState<CineFastItem | null>(null);
  const [rows, setRows] = useState<{ title: string; items: CineFastItem[]; wide?: boolean }[]>([]);

  // Detail Modal State
  const [selectedItem, setSelectedMatchItem] = useState<CineFastItem | null>(null);
  const [seasons, setSeasons] = useState<CineFastSeason[]>([]);
  const [activeSeasonNum, setActiveSeasonNum] = useState(1);
  const [activeEpisodeNum, setActiveEpisodeNum] = useState(1);
  const [seasonsLoading, setSeasonsLoading] = useState(false);

  // Full Screen Player State
  const [playingItem, setPlayingItem] = useState<CineFastItem | null>(null);
  const [playerSeasonNum, setPlayerSeasonNum] = useState(1);
  const [playerEpisodeNum, setPlayerEpisodeNum] = useState(1);
  const [playerLoading, setPlayerLoading] = useState(false);

  async function tmdbFetch(path: string, params: Record<string, string> = {}) {
    const url = new URL(TMDB_BASE + path);
    url.searchParams.set("api_key", TMDB_KEY);
    url.searchParams.set("language", "en-US");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    return res.json();
  }

  // Handle core initial loads
  useEffect(() => {
    async function loadHubContent() {
      setLoading(true);
      try {
        if (activeTab === "home") {
          const [trending, popularMovies, popularTv, nowPlaying, topRated] = await Promise.all([
            tmdbFetch("/trending/all/day"),
            tmdbFetch("/movie/popular"),
            tmdbFetch("/tv/popular"),
            tmdbFetch("/movie/now_playing"),
            tmdbFetch("/movie/top_rated"),
          ]);

          // Pick random hero
          const trendResults = trending.results || [];
          if (trendResults.length > 0) {
            setHeroItem(trendResults[Math.floor(Math.random() * Math.min(5, trendResults.length))]);
          }

          setRows([
            { title: "Trending Now", items: trendResults.slice(0, 15) },
            { title: "Popular Blockbuster Movies", items: (popularMovies.results || []).slice(0, 15), wide: true },
            { title: "Must-Watch Series", items: (popularTv.results || []).slice(0, 15) },
            { title: "New Releases", items: (nowPlaying.results || []).slice(0, 15) },
            { title: "Top-Rated Masterpieces", items: (topRated.results || []).slice(0, 15) },
          ]);
        } else {
          // Tab selections loading
          const configs: Record<string, { title: string; path: string }[]> = {
            movies: [
              { title: "Now Playing in Theaters", path: "/movie/now_playing" },
              { title: "Most Popular Movies", path: "/movie/popular" },
              { title: "Highly Rated Movies", path: "/movie/top_rated" },
              { title: "Upcoming Cinematic Releases", path: "/movie/upcoming" },
            ],
            series: [
              { title: "Airing Today on TV", path: "/tv/airing_today" },
              { title: "Popular Shows on Air", path: "/tv/popular" },
              { title: "Critically Acclaimed Series", path: "/tv/top_rated" },
              { title: "On The Air Weekly Shows", path: "/tv/on_the_air" },
            ],
            trending: [
              { title: "Trending Around the Globe Today", path: "/trending/all/day" },
              { title: "Trending This Week", path: "/trending/all/week" },
            ],
          };

          const list = configs[activeTab] || [];
          const fetchedRows = [];
          
          for (let i = 0; i < list.length; i++) {
            const data = await tmdbFetch(list[i].path);
            const results = data.results || [];
            fetchedRows.push({ title: list[i].title, items: results.slice(0, 15) });
            
            if (i === 0 && results.length > 0) {
              setHeroItem(results[Math.floor(Math.random() * Math.min(4, results.length))]);
            }
          }
          setRows(fetchedRows);
        }
      } catch (err) {
        console.error("Failed to load TMDB catalog:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHubContent();
  }, [activeTab]);

  // Real-time search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await tmdbFetch("/search/multi", { query: searchQuery });
        const filtered = (data.results || []).filter(
          (r: any) => r.media_type !== "person" && (r.poster_path || r.backdrop_path)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Detail Modal Season fetch
  async function fetchTvSeasons(item: CineFastItem) {
    setSeasonsLoading(true);
    setSeasons([]);
    try {
      const data = await tmdbFetch(`/tv/${item.id}`);
      const list = (data.seasons || []).filter((s: any) => s.season_number > 0);
      setSeasons(list);
      setActiveSeasonNum(1);
      setActiveEpisodeNum(1);
    } catch (e) {
      console.error("Failed to fetch show metadata:", e);
    } finally {
      setSeasonsLoading(false);
    }
  }

  function handleOpenDetail(item: CineFastItem) {
    setSelectedMatchItem(item);
    if ((item.media_type || (item.first_air_date ? "tv" : "movie")) === "tv") {
      fetchTvSeasons(item);
    }
  }

  function handleCloseDetail() {
    setSelectedMatchItem(null);
    setSeasons([]);
  }

  function handlePlayItem(item: CineFastItem, season = 1, ep = 1) {
    const isTv = (item.media_type || (item.first_air_date ? "tv" : "movie")) === "tv";
    setPlayerLoading(true);
    setPlayingItem(item);
    setPlayerSeasonNum(season);
    setPlayerEpisodeNum(ep);
    handleCloseDetail();
  }

  function getEmbedSrc(): string {
    if (!playingItem) return "about:blank";
    const isTv = (playingItem.media_type || (playingItem.first_air_date ? "tv" : "movie")) === "tv";
    if (isTv) {
      return EMBED_TV(playingItem.id, playerSeasonNum, playerEpisodeNum);
    }
    return EMBED_MOVIE(playingItem.id);
  }

  function handleEpisodeSelect(ep: number) {
    setPlayerLoading(true);
    setPlayerEpisodeNum(ep);
  }

  function handleSeasonSelect(seasonNum: number) {
    setPlayerSeasonNum(seasonNum);
    setPlayerEpisodeNum(1);
  }

  function handleReloadPlayer() {
    setPlayerLoading(true);
    const iframe = document.getElementById("cinefastIframe") as HTMLIFrameElement;
    if (iframe) {
      const src = iframe.src;
      iframe.src = "about:blank";
      setTimeout(() => (iframe.src = src), 100);
    }
  }

  function closePlayer() {
    setPlayingItem(null);
  }

  function goFullscreen() {
    const iframe = document.getElementById("cinefastIframe") as any;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
    }
  }

  const selectedType = selectedItem ? (selectedItem.media_type || (selectedItem.first_air_date ? "tv" : "movie")) : "movie";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f00] relative">
      {/* HEADER BAR */}
      <nav className="h-16 border-b border-zinc-850/80 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition cursor-pointer"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <h1 className="text-lg md:text-xl font-black font-display tracking-tight text-white cursor-pointer" onClick={() => setActiveTab("home")}>
              Cine<span className="text-brand-red">Fast</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-1.5">
            {(["home", "movies", "series", "trending"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize tracking-wide transition cursor-pointer ${
                  activeTab === tab && !searchQuery
                    ? "bg-zinc-800 text-white shadow-inner"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search box */}
        <div className="relative w-[180px] sm:w-[240px] md:w-[280px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search movies & shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 hover:bg-zinc-900 focus:bg-zinc-950 border border-zinc-800 focus:border-brand-red text-xs text-white placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2 focus:outline-none transition duration-150"
          />
        </div>
      </nav>

      {/* MOBILE LOWER NAV BAR */}
      <div className="sm:hidden flex border-b border-zinc-900 bg-zinc-950 px-2 py-1 gap-1 sticky top-16 z-30">
        {(["home", "movies", "series", "trending"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery("");
            }}
            className={`flex-1 py-2 text-center text-[10px] font-bold tracking-wider uppercase rounded-lg transition ${
              activeTab === tab && !searchQuery
                ? "bg-zinc-900 text-brand-red"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN LAYOUT SCROLL */}
      <div className="pb-16 text-white">
        {searchQuery.trim() ? (
          /* SEARCH PAGE VIEW */
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <h2 className="text-zinc-500 text-xs font-semibold tracking-wider uppercase mb-6">
              {isSearching ? `Searching catalogs...` : `Search results for "${searchQuery}"`}
            </h2>

            {searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-20 text-zinc-500 text-xs">
                No matching movies or series found in database.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="group flex flex-col bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-xl overflow-hidden cursor-pointer transition relative"
                  >
                    <div className="aspect-[2/3] bg-zinc-950 overflow-hidden relative">
                      {item.poster_path ? (
                        <img
                          src={IMG_POSTER + item.poster_path}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-103 transition duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-700">
                          No Poster
                        </div>
                      )}
                      {(item.media_type || (item.first_air_date ? "tv" : "movie")) === "tv" && (
                        <span className="absolute top-2 left-2 text-[8px] font-black uppercase px-2 py-0.5 rounded bg-brand-blue text-white tracking-widest">
                          Series
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="w-10 h-10 bg-brand-red hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold text-white truncate group-hover:text-brand-red transition-colors">
                        {item.title || item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-semibold">
                        <span className="text-amber-400 flex items-center gap-0.5">
                          ★ {(item.vote_average || 0).toFixed(1)}
                        </span>
                        <span>
                          {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* STANDARD HUB VIEWS */
          <>
            {/* HERO JUMBOTRON */}
            {heroItem && (
              <div className="relative h-[340px] sm:h-[420px] md:h-[480px] lg:h-[540px] flex items-end overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${IMG_BACKDROP + heroItem.backdrop_path})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-[#0a0a0f]/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent"></div>
                </div>

                <div className="relative max-w-4xl px-4 sm:px-8 md:px-12 pb-8 sm:pb-12 md:pb-16 z-10 flex flex-col gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-red">
                    {(heroItem.media_type || (heroItem.first_air_date ? "tv" : "movie")) === "tv"
                      ? "Trending TV Series"
                      : "Trending Featured Film"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-none mb-1">
                    {heroItem.title || heroItem.name}
                  </h1>

                  <div className="flex items-center gap-3 text-xs text-zinc-300 font-semibold mb-2">
                    <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {(heroItem.vote_average || 0).toFixed(1)}
                    </span>
                    <span>
                      {heroItem.release_date?.slice(0, 4) || heroItem.first_air_date?.slice(0, 4)}
                    </span>
                    {(heroItem.genre_ids || []).slice(0, 2).map((gid) => (
                      <span
                        key={gid}
                        className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/60 text-[10px] text-zinc-400"
                      >
                        {GENRE_MAP[gid]}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl mb-4">
                    {heroItem.overview}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayItem(heroItem)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-red-600 rounded-xl text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-brand-red/10 cursor-pointer"
                    >
                      <Play className="w-4.5 h-4.5 fill-white" />
                      <span>Watch Now</span>
                    </button>
                    <button
                      onClick={() => handleOpenDetail(heroItem)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                    >
                      <Info className="w-4.5 h-4.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* HORIZONTAL CAROUSEL ROWS */}
            <div className="px-4 sm:px-8 md:px-12 mt-8 space-y-8">
              {loading ? (
                // Skeletons
                Array.from({ length: 3 }).map((_, rIdx) => (
                  <div key={rIdx} className="space-y-4">
                    <div className="w-48 h-4 bg-zinc-900 rounded skeleton"></div>
                    <div className="flex gap-4 overflow-hidden">
                      {Array.from({ length: 6 }).map((_, cIdx) => (
                        <div
                          key={cIdx}
                          className="w-[140px] aspect-[2/3] bg-zinc-900 rounded-xl skeleton flex-shrink-0"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                rows.map((row, rIdx) => (
                  <div key={rIdx} className="space-y-3">
                    <h2 className="text-sm font-bold tracking-tight text-white">{row.title}</h2>
                    <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none custom-scrollbar">
                      {row.items.map((item) => {
                        const isTv = (item.media_type || (item.first_air_date ? "tv" : "movie")) === "tv";
                        const wide = row.wide;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenDetail(item)}
                            className={`group cursor-pointer rounded-xl overflow-hidden bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 transition flex-shrink-0 relative ${
                              wide ? "w-[200px] sm:w-[240px]" : "w-[120px] sm:w-[140px]"
                            }`}
                          >
                            <div className={`overflow-hidden bg-zinc-950 relative ${wide ? "aspect-video" : "aspect-[2/3]"}`}>
                              {item.poster_path || item.backdrop_path ? (
                                <img
                                  src={wide ? IMG_BACKDROP + item.backdrop_path : IMG_POSTER + item.poster_path}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-103 transition duration-200"
                                  loading="lazy"
                                />
                              ) : null}
                              {isTv && !wide && (
                                <span className="absolute top-2 left-2 text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-brand-blue text-white tracking-wider">
                                  Series
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-red hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition">
                                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white ml-0.5" />
                                </span>
                              </div>
                            </div>
                            <div className="p-2 sm:p-3">
                              <h3 className="text-[10px] sm:text-xs font-bold text-white truncate leading-snug group-hover:text-brand-red transition-colors">
                                {item.title || item.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5 text-[9px] sm:text-[10px] text-zinc-400 font-semibold">
                                <span className="text-amber-400">★ {(item.vote_average || 0).toFixed(1)}</span>
                                <span>
                                  {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDetail}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[85vh] flex flex-col"
            >
              {/* Image banner */}
              <div className="relative h-[180px] sm:h-[240px] flex-shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${IMG_BACKDROP + (selectedItem.backdrop_path || selectedItem.poster_path)})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black border border-zinc-700/60 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Details Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar text-white">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-red">
                    {selectedType === "tv" ? "TV Show" : "Cinematic Movie"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight mt-1">
                    {selectedItem.title || selectedItem.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400 font-semibold">
                    <span className="text-amber-400 flex items-center gap-0.5">
                      ★ {(selectedItem.vote_average || 0).toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>
                      {selectedItem.release_date?.slice(0, 4) || selectedItem.first_air_date?.slice(0, 4)}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {selectedItem.overview || "No description currently cataloged."}
                </p>

                {/* Season & Episode selectors for TV */}
                {selectedType === "tv" && (
                  <div className="border-t border-zinc-800/80 pt-4 flex flex-col gap-3">
                    <h4 className="text-[10px] font-extrabold uppercase text-brand-red tracking-wider">
                      Seasons Feed
                    </h4>
                    {seasonsLoading ? (
                      <div className="text-xs text-zinc-500">Querying episode protocols...</div>
                    ) : (
                      <>
                        {/* Seasons Slider */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none custom-scrollbar">
                          {seasons.map((s) => (
                            <button
                              key={s.season_number}
                              onClick={() => {
                                setActiveSeasonNum(s.season_number);
                                setActiveEpisodeNum(1);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                                activeSeasonNum === s.season_number
                                  ? "bg-brand-red text-white"
                                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800"
                              }`}
                            >
                              Season {s.season_number}
                            </button>
                          ))}
                        </div>

                        {/* Episodes Grid */}
                        <div className="flex flex-col gap-2">
                          <h5 className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
                            Episode Selector
                          </h5>
                          <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                            {Array.from({
                              length: seasons.find((s) => s.season_number === activeSeasonNum)?.episode_count || 1,
                            }).map((_, i) => {
                              const ep = i + 1;
                              return (
                                <button
                                  key={ep}
                                  onClick={() => setActiveEpisodeNum(ep)}
                                  className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition cursor-pointer ${
                                    activeEpisodeNum === ep
                                      ? "bg-zinc-700 text-white border border-brand-red"
                                      : "bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800"
                                  }`}
                                >
                                  E{ep}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Watch button */}
                <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-end gap-2.5">
                  <button
                    onClick={handleCloseDetail}
                    className="px-4 py-2 bg-zinc-800/60 hover:bg-zinc-800 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePlayItem(selectedItem, activeSeasonNum, activeEpisodeNum)}
                    className="flex items-center gap-2 px-5 py-2 bg-brand-red hover:bg-red-600 rounded-xl text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {selectedType === "tv"
                        ? `Watch S${activeSeasonNum} E${activeEpisodeNum}`
                        : "Watch Now"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN DIRECT STREAM PLAYER OVERLAY */}
      <AnimatePresence>
        {playingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden"
          >
            {/* Player Topbar */}
            <div className="h-14 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={closePlayer}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-bold cursor-pointer"
                >
                  ← Back to CineFast
                </button>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold truncate leading-tight">
                    {playingItem.title || playingItem.name}
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    {(playingItem.media_type || (playingItem.first_air_date ? "tv" : "movie")) === "tv"
                      ? `Season ${playerSeasonNum} · Episode ${playerEpisodeNum}`
                      : "Movie Direct Server Feed"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReloadPlayer}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Reload Player"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={goFullscreen}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Player Frame */}
            <div className="flex-1 bg-black relative">
              {playerLoading && (
                <div className="absolute inset-0 bg-[#060608] flex flex-col items-center justify-center gap-3 z-10">
                  <div className="w-10 h-10 border-4 border-zinc-800 border-t-brand-red rounded-full animate-spin"></div>
                  <span className="text-xs text-zinc-400">Piping secure stream media client...</span>
                </div>
              )}

              <iframe
                id="cinefastIframe"
                src={getEmbedSrc()}
                onLoad={() => setPlayerLoading(false)}
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer"
                className="w-full h-full border-0"
              ></iframe>
            </div>

            {/* Bottom Episode selector overlay bar (TV only) */}
            {(playingItem.media_type || (playingItem.first_air_date ? "tv" : "movie")) === "tv" && (
              <div className="bg-zinc-950 border-t border-zinc-900 flex flex-col gap-2 p-3 flex-shrink-0">
                {/* Seasons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-zinc-900 custom-scrollbar">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => handleSeasonSelect(s.season_number)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase whitespace-nowrap transition cursor-pointer ${
                        playerSeasonNum === s.season_number
                          ? "bg-brand-red text-white"
                          : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Season {s.season_number}
                    </button>
                  ))}
                </div>

                {/* Episodes */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {Array.from({
                    length: seasons.find((s) => s.season_number === playerSeasonNum)?.episode_count || 1,
                  }).map((_, i) => {
                    const ep = i + 1;
                    return (
                      <button
                        key={ep}
                        onClick={() => handleEpisodeSelect(ep)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                          playerEpisodeNum === ep
                            ? "bg-zinc-800 text-brand-red border border-brand-red/30"
                            : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Episode {ep}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
