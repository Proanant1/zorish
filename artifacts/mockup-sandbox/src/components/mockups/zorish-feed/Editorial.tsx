import React, { useState } from 'react';
import { 
  Heart, 
  ThumbsDown, 
  MessageCircle, 
  Repeat2, 
  Star, 
  Share2, 
  BadgeCheck, 
  MoreHorizontal,
  Plus
} from 'lucide-react';

// --- Types ---
type PostType = {
  id: string;
  avatar: string;
  displayName: string;
  username: string;
  verified: boolean;
  timestamp: string;
  content: string;
  headline?: string;
  image?: string;
  stats: {
    impressive: number;
    notImpressive: number;
    comments: number;
    reups: number;
  };
  hasLiked?: boolean;
  hasReupped?: boolean;
  hasSaved?: boolean;
};

// --- Mock Data ---
const STORIES = [
  { id: 1, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', name: 'Your Story', isUser: true },
  { id: 2, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', name: 'Rahul' },
  { id: 3, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop', name: 'Priya' },
  { id: 4, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop', name: 'Vikram' },
  { id: 5, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop', name: 'Neha' },
  { id: 6, avatar: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150&h=150&fit=crop', name: 'Arjun' },
  { id: 7, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', name: 'Aditya' },
];

const POSTS: PostType[] = [
  {
    id: 'post-1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    displayName: 'Ananya Sharma',
    username: '@ananya_creates',
    verified: true,
    timestamp: '2h ago',
    headline: 'The Future of Indian Tech is Here',
    content: 'Just attended the AI summit in Bangalore. The innovations happening right now in our backyard are absolutely mind-blowing. We are no longer just consuming technology; we are building the future. What an incredible time to be an engineer in India! 🇮🇳🚀',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800&fit=crop',
    stats: { impressive: 12400, notImpressive: 12, comments: 843, reups: 2100 },
    hasLiked: true,
  },
  {
    id: 'post-2',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    displayName: 'Karan Desai',
    username: '@karan_designs',
    verified: false,
    timestamp: '4h ago',
    content: 'Sunset at Marine Drive hits different during the monsoons. The perfect balance of chaos and peace. #MumbaiMeriJaan',
    image: 'https://images.unsplash.com/photo-1565017426177-3e66a3d9061d?w=800&h=600&fit=crop',
    stats: { impressive: 3420, notImpressive: 5, comments: 128, reups: 450 },
  },
  {
    id: 'post-3',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop',
    displayName: 'Meera Rajput',
    username: '@meera_writes',
    verified: true,
    timestamp: '5h ago',
    content: 'Dilli ki sardi and a hot cup of adrak wali chai. Is there anything better in the world? Life is made of these small, beautiful moments.',
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&h=600&fit=crop',
    stats: { impressive: 8900, notImpressive: 45, comments: 632, reups: 1200 },
    hasSaved: true,
  },
  {
    id: 'post-4',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop',
    displayName: 'Rohan Mehta',
    username: '@rohan_m',
    verified: false,
    timestamp: '7h ago',
    content: 'Finished reading "The Argumentative Indian" again. Amartya Sen\'s insights remain as relevant today as they were years ago. Highly recommend to everyone.',
    stats: { impressive: 1200, notImpressive: 3, comments: 45, reups: 89 },
  },
  {
    id: 'post-5',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    displayName: 'Aisha Khan',
    username: '@aisha_k',
    verified: true,
    timestamp: '9h ago',
    content: 'Just wrapped up the shoot for our new campaign. The energy on set was incredible! Can\'t wait to share the final results with you all next week.',
    stats: { impressive: 5600, notImpressive: 21, comments: 340, reups: 410 },
    hasReupped: true,
  },
  {
    id: 'post-6',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    displayName: 'Siddharth Iyer',
    username: '@sidd_iyer',
    verified: false,
    timestamp: '12h ago',
    content: 'The indie music scene in Pune is reviving! Went to a gig last night and the talent is just raw and beautiful. Support local artists!',
    stats: { impressive: 890, notImpressive: 1, comments: 23, reups: 45 },
  }
];

// --- Subcomponents ---

const ActionBar = ({ post, minimal = false }: { post: PostType, minimal?: boolean }) => {
  const [liked, setLiked] = useState(post.hasLiked);
  const [reupped, setReupped] = useState(post.hasReupped);
  const [saved, setSaved] = useState(post.hasSaved);

  const iconClass = minimal ? "w-4 h-4" : "w-5 h-5";
  const btnClass = "flex items-center gap-1.5 transition-colors duration-200 hover:text-[#F5F5F5] group";
  const textClass = minimal ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center justify-between text-[#A1A1A1] w-full ${minimal ? 'mt-3' : 'mt-4 pt-3 border-t border-white/[0.06]'}`}>
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={() => setLiked(!liked)} 
          className={`${btnClass} ${liked ? 'text-green-500 hover:text-green-400' : ''}`}
        >
          <Heart className={`${iconClass} ${liked ? 'fill-current' : 'group-hover:fill-current group-hover:text-white/20'}`} />
          <span className={textClass}>{post.stats.impressive + (liked ? 1 : 0)}</span>
        </button>
        
        <button className={`${btnClass} hover:text-red-500`}>
          <ThumbsDown className={iconClass} />
          {!minimal && <span className={textClass}>{post.stats.notImpressive}</span>}
        </button>

        <button className={btnClass}>
          <MessageCircle className={`${iconClass} group-hover:fill-current group-hover:text-white/20`} />
          <span className={textClass}>{post.stats.comments}</span>
        </button>

        <button 
          onClick={() => setReupped(!reupped)}
          className={`${btnClass} ${reupped ? 'text-[#F5B041] hover:text-[#F5B041]/80' : ''}`}
        >
          <Repeat2 className={iconClass} />
          {!minimal && <span className={textClass}>{post.stats.reups + (reupped ? 1 : 0)}</span>}
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={() => setSaved(!saved)}
          className={`${btnClass} ${saved ? 'text-[#F5B041] hover:text-[#F5B041]/80' : ''}`}
        >
          <Star className={`${iconClass} ${saved ? 'fill-current' : ''}`} />
        </button>
        {!minimal && (
          <button className={btnClass}>
            <Share2 className={iconClass} />
          </button>
        )}
      </div>
    </div>
  );
};

export function Editorial() {
  const [activeTab, setActiveTab] = useState('For You');
  
  const heroPost = POSTS[0];
  const gridPosts = POSTS.slice(1, 3);
  const digestPosts = POSTS.slice(3);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#F5B041]/30 selection:text-white">
      {/* Import Playfair Display */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .font-editorial { font-family: 'Playfair Display', serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/[0.06] flex flex-col pt-4">
        <div className="px-4 md:px-6 flex items-center justify-between mb-4">
          <h1 className="text-2xl font-editorial font-bold text-[#F5B041] tracking-wide italic">Zorish</h1>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full bg-[#161616] border border-white/[0.06] flex items-center justify-center hover:bg-[#1E1E1E] transition-colors">
              <Plus className="w-4 h-4 text-[#F5F5F5]" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/[0.06]">
              <img src={STORIES[0].avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="px-4 md:px-6 flex items-center gap-6 text-sm font-medium">
          {['For You', 'Matched', 'Groups'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 relative transition-colors duration-300 ${activeTab === tab ? 'text-[#F5F5F5]' : 'text-[#A1A1A1] hover:text-[#F5F5F5]/80'}`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5B041] rounded-t-full shadow-[0_-2px_8px_rgba(245,176,65,0.4)]" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto pb-24">
        
        {/* Story Bar */}
        <div className="py-6 px-4 md:px-6 overflow-x-auto hide-scrollbar flex items-center gap-4 border-b border-white/[0.06]">
          {STORIES.map((story, i) => (
            <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer">
              <div className={`relative p-0.5 rounded-full ${story.isUser ? 'border-2 border-dashed border-[#A1A1A1]/40' : 'bg-gradient-to-tr from-[#F5B041] to-red-500'}`}>
                <div className="bg-[#0A0A0A] p-0.5 rounded-full">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative">
                    <img 
                      src={story.avatar} 
                      alt={story.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    {story.isUser && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#A1A1A1] group-hover:text-[#F5F5F5] transition-colors">
                {story.name}
              </span>
            </div>
          ))}
        </div>

        {/* Feed Content */}
        <div className="p-4 md:p-6 space-y-8">
          
          {/* 1. HERO CARD (Trending/First Post) */}
          <article className="bg-[#111111] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.1] transition-colors duration-300 shadow-2xl">
            {heroPost.image && (
              <div className="relative h-[400px] w-full group">
                <img 
                  src={heroPost.image} 
                  alt="Post cover" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent" />
                
                {/* Hero Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={heroPost.avatar} alt={heroPost.displayName} className="w-10 h-10 rounded-full border border-white/20" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">{heroPost.displayName}</span>
                        {heroPost.verified && <BadgeCheck className="w-4 h-4 text-[#F5B041]" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <span>{heroPost.username}</span>
                        <span>•</span>
                        <span>{heroPost.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {heroPost.headline && (
                    <h2 className="text-3xl md:text-4xl font-editorial font-bold leading-tight text-white mb-2 shadow-sm">
                      {heroPost.headline}
                    </h2>
                  )}
                </div>
              </div>
            )}
            <div className="p-6 pt-2">
              <p className="text-[#A1A1A1] text-base md:text-lg leading-relaxed mb-4">
                {heroPost.content}
              </p>
              <ActionBar post={heroPost} />
            </div>
          </article>

          {/* 2. TWO-COLUMN GRID (Next two posts) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {gridPosts.map(post => (
              <article key={post.id} className="bg-[#161616] rounded-xl overflow-hidden border border-white/[0.06] hover:bg-[#1E1E1E] transition-colors duration-300 flex flex-col group">
                {post.image && (
                  <div className="h-48 w-full overflow-hidden">
                    <img 
                      src={post.image} 
                      alt="Post" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img src={post.avatar} alt={post.displayName} className="w-8 h-8 rounded-full" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-[#F5F5F5] truncate max-w-[120px]">{post.displayName}</span>
                          {post.verified && <BadgeCheck className="w-3.5 h-3.5 text-[#F5B041]" />}
                        </div>
                        <span className="text-[10px] text-[#A1A1A1]">{post.timestamp}</span>
                      </div>
                    </div>
                    <button className="text-[#A1A1A1] hover:text-[#F5F5F5]">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[#A1A1A1] line-clamp-4 leading-relaxed flex-1">
                    {post.content}
                  </p>
                  <ActionBar post={post} minimal />
                </div>
              </article>
            ))}
          </div>

          {/* 3. CONDENSED DIGEST (Remaining posts) */}
          <div className="bg-[#111111] rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] bg-[#161616]">
              <h3 className="font-editorial text-lg text-[#F5B041] font-semibold italic">The Daily Digest</h3>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {digestPosts.map(post => (
                <article key={post.id} className="p-5 hover:bg-[#161616] transition-colors duration-200 cursor-pointer group">
                  <div className="flex gap-4">
                    <img src={post.avatar} alt={post.displayName} className="w-10 h-10 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-medium text-[#F5F5F5]">{post.displayName}</span>
                          {post.verified && <BadgeCheck className="w-3.5 h-3.5 text-[#F5B041]" />}
                          <span className="text-xs text-[#A1A1A1] ml-1">{post.username}</span>
                        </div>
                        <span className="text-xs text-[#A1A1A1] flex-shrink-0">{post.timestamp}</span>
                      </div>
                      <p className="text-sm text-[#A1A1A1] group-hover:text-white/90 transition-colors leading-snug mb-3 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[#A1A1A1]">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> {post.stats.impressive}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> {post.stats.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Repeat2 className="w-3.5 h-3.5" /> {post.stats.reups}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
