import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, X, ExternalLink, Zap, Star, Users, Trophy } from 'lucide-react';
import { Game } from '../types';
import MarsMissionPanel from './MarsMissionPanel';

const FLAGSHIP_GAMES: Game[] = [
  {
    id: 'mars',
    title: 'Mars Relativistic Navigator',
    description: 'Launch Module #48 from the authenticated VIA shell with 0.1c navigation sync, sovereign session minting, and seeded planetary mesh streaming.',
    icon: '🪐',
    url: './mars/index.html',
    category: 'Exploration',
    tags: ['Module #48', '0.1c', 'Mesh Streaming'],
    isFlagship: true,
    playerCount: 'Auth Only',
    difficulty: 'Hard',
    moduleTarget: 'mars',
    requiresSession: true,
  },
  {
    id: 'skillhex',
    title: 'SkillHex',
    description: 'Mission-based skill development platform. Complete challenges, climb leaderboards, and prove your expertise in a cyber-styled arena.',
    icon: '⬡',
    url: '/skillhex/index.html',
    category: 'Skill & Career',
    tags: ['Missions', 'Leaderboards', 'Squads'],
    isFlagship: true,
    playerCount: '10K+',
    difficulty: 'Medium',
  },
  {
    id: 'game',
    title: 'VIA Game',
    description: 'An AI-powered interactive experience built with Google Gemini. Make decisions, shape stories, and explore worlds driven by intelligence.',
    icon: '🎮',
    url: '/game/index.html',
    category: 'AI Adventure',
    tags: ['AI-Powered', 'Gemini', 'Interactive'],
    isFlagship: true,
    playerCount: '5K+',
    difficulty: 'Easy',
  },
];

const ALL_GAMES: Game[] = [
  ...FLAGSHIP_GAMES,
  {
    id: 'orchard',
    title: 'Orchard Engine',
    description: 'Merit-based farming and career simulation. Build trust, grow your reputation, and get discovered by recruiters.',
    icon: '🌱',
    url: '/tools/games/orchard/index.html',
    category: 'Simulation',
    tags: ['Farming', 'Career', 'Merit'],
    isFlagship: false,
    playerCount: '2K+',
    difficulty: 'Hard',
  },
];

const difficultyColor: Record<string, string> = {
  Easy: 'text-green-400 bg-green-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Hard: 'text-red-400 bg-red-400/10',
};

interface GameOverlayProps {
  game: Game;
  onClose: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ game, onClose }) => (
  game.requiresSession && game.moduleTarget === 'mars' ? (
    <MarsMissionPanel game={game} onClose={onClose} />
  ) : (
  <motion.div
    key="overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-via-dark flex flex-col"
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
      <div className="flex items-center gap-2">
        <span className="text-xl">{game.icon}</span>
        <span className="font-syne font-bold text-white">{game.title}</span>
      </div>
      <button
        onClick={onClose}
        className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>
    <iframe
      src={game.url}
      className="flex-1 w-full border-none"
      title={game.title}
      allow="fullscreen"
    />
  </motion.div>
  )
);

interface FlagshipCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
}

const FlagshipCard: React.FC<FlagshipCardProps> = ({ game, onPlay, gradientFrom, gradientTo, accentColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="relative rounded-3xl overflow-hidden cursor-pointer group"
    style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
    onClick={() => onPlay(game)}
  >
    {/* Noise texture overlay */}
    <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
    }} />

    <div className="relative p-6 space-y-4">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl border border-white/20">
            {game.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-yellow-300 fill-yellow-300" />
              <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">Flagship</span>
            </div>
            <h3 className="font-syne font-bold text-xl text-white leading-tight">{game.title}</h3>
          </div>
        </div>
        {game.difficulty && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${difficultyColor[game.difficulty]}`}>
            {game.difficulty}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-white/70 text-sm leading-relaxed">{game.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {game.tags.map(tag => (
          <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-white/50">
            <Users size={12} />
            <span className="text-xs font-bold">{game.playerCount}</span>
          </div>
          <span className="text-white/20 text-xs">•</span>
          <span className="text-xs text-white/50 font-medium">{game.category}</span>
        </div>
        <motion.div
          whileHover={{ x: 2 }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest group-hover:bg-white/90 transition-colors"
        >
          <Zap size={12} className="fill-current" />
          Play Now
        </motion.div>
      </div>
    </div>
  </motion.div>
);

interface SmallGameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

const SmallGameCard: React.FC<SmallGameCardProps> = ({ game, onPlay }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => onPlay(game)}
    className="glass-panel rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
  >
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 border border-white/10">
      {game.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-syne font-bold text-white text-sm truncate">{game.title}</h4>
        {game.difficulty && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${difficultyColor[game.difficulty]}`}>
            {game.difficulty}
          </span>
        )}
      </div>
      <p className="text-white/40 text-xs mt-0.5 truncate">{game.category}</p>
    </div>
    <ExternalLink size={14} className="text-white/20 flex-shrink-0" />
  </motion.div>
);

const GamesView: React.FC = () => {
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  const flagshipGames = ALL_GAMES.filter(g => g.isFlagship);
  const otherGames = ALL_GAMES.filter(g => !g.isFlagship);

  const flagshipGradients = [
    { from: '#0a1628', to: '#0d2a3a', accent: '#00e5ff' },
    { from: '#1a0a2e', to: '#2a0a3e', accent: '#8b5cf6' },
  ];

  return (
    <>
      <div className="h-full overflow-y-auto px-5 pt-24 pb-32 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gamepad2 size={20} className="text-via-accent" />
            <span className="text-via-accent text-xs font-bold uppercase tracking-widest">Games & Experiences</span>
          </div>
          <h2 className="font-syne font-bold text-4xl tracking-tight">Play</h2>
          <p className="text-white/40 text-sm">Flagship games powered by VIA</p>
        </div>

        {/* Flagship Games */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Flagship</span>
          </div>
          <div className="space-y-4">
            {flagshipGames.map((game, i) => (
              <FlagshipCard
                key={game.id}
                game={game}
                onPlay={setActiveGame}
                gradientFrom={flagshipGradients[i % flagshipGradients.length].from}
                gradientTo={flagshipGradients[i % flagshipGradients.length].to}
                accentColor={flagshipGradients[i % flagshipGradients.length].accent}
              />
            ))}
          </div>
        </div>

        {/* More Games */}
        {otherGames.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">More Games</span>
            <div className="space-y-2">
              {otherGames.map(game => (
                <SmallGameCard key={game.id} game={game} onPlay={setActiveGame} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Overlay */}
      <AnimatePresence>
        {activeGame && (
          <GameOverlay game={activeGame} onClose={() => setActiveGame(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default GamesView;
