import React from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, MoreVertical, Music2 } from 'lucide-react';
import { Post } from '../types';

interface FeedPostProps {
  post: Post;
  isActive: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, isActive, onLike, onComment, onShare }) => {
  const [isLiked, setIsLiked] = React.useState(false);
  const authorHandle = post.author?.username || `user_${post.userId.slice(0, 5)}`;
  const authorName = post.author?.displayName || post.authorName;
  const authorAvatar = post.author?.avatarEmoji || post.authorAvatar;

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      onLike(post.id);
    }
  };

  return (
    <div className="post-card">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/1200`} 
          alt="Post content" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-via-dark/90" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 space-y-4 max-w-md">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={isActive ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-2xl shadow-lg">
            {authorAvatar}
          </div>
          <div>
            <h3 className="font-syne font-bold text-lg tracking-tight">{authorName}</h3>
            <p className="text-xs text-white/60 font-medium">@{authorHandle}</p>
          </div>
          <button className="ml-2 px-4 py-1 rounded-full bg-white text-via-dark text-xs font-bold uppercase tracking-wider hover:bg-via-accent hover:text-white transition-colors">
            Follow
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.28 }}
          className="space-y-2"
        >
          <p className="text-[11px] text-white/50 font-bold uppercase tracking-[0.25em]">
            @{authorHandle}
            {post.author?.isGuest ? ' · guest' : ''}
          </p>
          <p className="text-sm leading-relaxed font-medium text-white/90 line-clamp-3">
            {post.content}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-xs font-bold text-via-gold"
        >
          <Music2 size={14} />
          <span className="uppercase tracking-widest">Original Sound - Bharat Beats</span>
        </motion.div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-6 items-center">
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={handleLike}
            className={`w-12 h-12 rounded-full glass-panel flex items-center justify-center transition-all ${isLiked ? 'text-via-accent scale-110' : 'hover:text-via-accent'}`}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <span className="text-[10px] font-bold tracking-widest">
            {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => onComment(post.id)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:text-via-accent transition-colors"
          >
            <MessageCircle size={24} />
          </button>
          <span className="text-[10px] font-bold tracking-widest">{post.comments}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => onShare(post.id)}
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:text-via-accent transition-colors"
          >
            <Share2 size={24} />
          </button>
          <span className="text-[10px] font-bold tracking-widest">{post.shares}</span>
        </div>

        <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/40">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default FeedPost;
