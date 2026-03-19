import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, Compass, Plus, Search, User, Gamepad2 } from 'lucide-react';

interface NavigationProps {
  activeTab: 'feed' | 'dives' | 'games' | 'discover' | 'profile';
  onTabChange: (tab: 'feed' | 'dives' | 'games' | 'discover' | 'profile') => void;
  onCreatePost: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onCreatePost }) => {
  return (
    <div className="nav-blur fixed bottom-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between border-t border-white/5">
      <button
        onClick={() => onTabChange('feed')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'feed' ? 'text-via-accent scale-110' : 'text-white/40 hover:text-white/60'}`}
      >
        <LayoutGrid size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Feed</span>
      </button>

      <button
        onClick={() => onTabChange('dives')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dives' ? 'text-via-accent scale-110' : 'text-white/40 hover:text-white/60'}`}
      >
        <Compass size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Dives</span>
      </button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onCreatePost}
        className="w-12 h-12 rounded-full bg-via-accent flex items-center justify-center text-white shadow-lg shadow-via-accent/20 -translate-y-5 border-4 border-via-dark"
      >
        <Plus size={24} strokeWidth={3} />
      </motion.button>

      <button
        onClick={() => onTabChange('games')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'games' ? 'text-via-accent scale-110' : 'text-white/40 hover:text-white/60'}`}
      >
        <Gamepad2 size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Games</span>
      </button>

      <button
        onClick={() => onTabChange('discover')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'discover' ? 'text-via-accent scale-110' : 'text-white/40 hover:text-white/60'}`}
      >
        <Search size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Discover</span>
      </button>

      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-via-accent scale-110' : 'text-white/40 hover:text-white/60'}`}
      >
        <User size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
      </button>
    </div>
  );
};

export default Navigation;
