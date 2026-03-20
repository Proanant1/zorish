import React, { useState } from 'react';
import { 
  Heart, 
  ThumbsDown, 
  MessageCircle, 
  Repeat2, 
  Star, 
  Share, 
  CheckCircle2, 
  MoreHorizontal,
  Flame,
  Sparkles,
  Users
} from 'lucide-react';

// Common post actions component
const PostActions = ({ 
  likes, 
  comments, 
  reups, 
  compact = false 
}: { 
  likes: string, 
  comments: string, 
  reups: string,
  compact?: boolean
}) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reuped, setReuped] = useState(false);

  return (
    <div className={`flex items-center justify-between text-[#A1A1A1] ${compact ? 'text-xs mt-3' : 'text-sm mt-4'}`}>
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => { setLiked(!liked); setDisliked(false); }}
          className={`flex items-center space-x-1.5 transition-colors ${liked ? 'text-green-500' : 'hover:text-green-400'}`}
        >
          <Heart className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${liked ? 'fill-current' : ''}`} />
          <span>{liked ? parseInt(likes.replace(/,/g, '')) + 1 : likes}</span>
        </button>
        
        <button 
          onClick={() => { setDisliked(!disliked); setLiked(false); }}
          className={`flex items-center space-x-1.5 transition-colors ${disliked ? 'text-red-500' : 'hover:text-red-400'}`}
        >
          <ThumbsDown className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${disliked ? 'fill-current' : ''}`} />
        </button>

        <button className="flex items-center space-x-1.5 hover:text-[#F5F5F5] transition-colors">
          <MessageCircle className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <span>{comments}</span>
        </button>

        <button 
          onClick={() => setReuped(!reuped)}
          className={`flex items-center space-x-1.5 transition-colors ${reuped ? 'text-[#F5B041]' : 'hover:text-[#F5B041]'}`}
        >
          <Repeat2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <span>{reuped ? parseInt(reups.replace(/,/g, '')) + 1 : reups}</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSaved(!saved)}
          className={`transition-colors ${saved ? 'text-[#F5B041]' : 'hover:text-[#F5B041]'}`}
        >
          <Star className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${saved ? 'fill-current' : ''}`} />
        </button>
        <button className="hover:text-[#F5F5F5] transition-colors">
          <Share className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </button>
      </div>
    </div>
  );
};


export function ProximityZones() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans overflow-y-auto pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5B041] flex items-center justify-center font-bold text-black">Z</div>
            <h1 className="text-xl font-bold tracking-tight">Feed</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#161616] overflow-hidden border border-white/10">
            <img src="https://i.pravatar.cc/150?u=current_user" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full">
        
        {/* ================= ZONE 1: YOUR CIRCLE ================= */}
        <section className="mb-8 pt-6">
          <div className="px-4 mb-4 flex items-center gap-2 text-[#F5B041]">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-semibold tracking-wide">Your Circle</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#F5B041]/30 to-transparent ml-2"></div>
          </div>
          
          <div className="space-y-4 px-2 sm:px-4">
            {/* Circle Post 1 */}
            <article className="relative bg-[#161616] rounded-2xl p-5 border border-[#F5B041]/20 shadow-[0_0_15px_rgba(245,176,65,0.05)] transition-all hover:bg-[#1E1E1E]">
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#F5B041] rounded-r-md"></div>
              
              <div className="flex items-start gap-4 pl-2">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#F5B041]">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Aarav Sharma" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#F5B041] rounded-full border-2 border-[#161616] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#0A0A0A] rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-base">Aarav Sharma</span>
                        <CheckCircle2 className="w-4 h-4 text-[#F5B041]" />
                      </div>
                      <div className="text-xs text-[#A1A1A1]">@aarav_creates • 2h ago</div>
                    </div>
                    <button className="text-[#A1A1A1] hover:text-[#F5F5F5]"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="mt-3 text-[15px] leading-relaxed">
                    Finally completed the setup for my new design studio in Bangalore! 🎨✨ The natural light in this space is just incredible. Kya bolte ho dosto? Should I do a desk tour video next?
                  </div>
                  
                  <PostActions likes="245" comments="42" reups="12" />
                </div>
              </div>
            </article>

            {/* Circle Post 2 */}
            <article className="relative bg-[#161616] rounded-2xl p-5 border border-[#F5B041]/20 shadow-[0_0_15px_rgba(245,176,65,0.05)] transition-all hover:bg-[#1E1E1E]">
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#F5B041] rounded-r-md"></div>
              
              <div className="flex items-start gap-4 pl-2">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#F5B041]">
                    <img src="https://i.pravatar.cc/150?u=a04258a2462d826712d" alt="Priya Desai" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#F5B041] rounded-full border-2 border-[#161616] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#0A0A0A] rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-base">Priya Desai</span>
                      </div>
                      <div className="text-xs text-[#A1A1A1]">@priyadesai • 4h ago</div>
                    </div>
                    <button className="text-[#A1A1A1] hover:text-[#F5F5F5]"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="mt-3 text-[15px] leading-relaxed">
                    Just had the best filter coffee in Mylapore. Some things never change, and that's exactly why they are perfect. ☕️
                  </div>
                  
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/5 max-h-60">
                    <img src="https://images.unsplash.com/photo-1544424458-944f77c8e9b6?q=80&w=800&auto=format&fit=crop" alt="Coffee" className="w-full h-full object-cover" />
                  </div>
                  
                  <PostActions likes="189" comments="24" reups="5" />
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ================= ZONE 2: TRENDING IN INDIA ================= */}
        <section className="mb-8">
          <div className="sticky top-[56px] z-40 bg-gradient-to-r from-[#F5B041] to-[#e69c24] py-2 px-4 shadow-lg mb-4 flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-black" />
            <h2 className="text-base font-bold text-black uppercase tracking-wider">Trending in India</h2>
          </div>
          
          <div className="space-y-3 px-2 sm:px-4">
            {/* Trending Post 1 */}
            <article className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-white/5 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img src="https://i.pravatar.cc/150?u=z842581f4e29026704d" alt="Tech India" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm">Tech Insights India</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B041]" />
                      </div>
                      <div className="text-[11px] text-[#A1A1A1]">@techindia • 1h ago</div>
                    </div>
                  </div>
                  <div className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1 rounded-full border border-red-500/20 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> #1 TRENDING
                  </div>
                </div>
                
                <div className="text-sm mb-3 line-clamp-2 text-[#E0E0E0]">
                  India's new AI mission has just been approved by the cabinet with a massive ₹10,372 crore budget! This is a game changer for homegrown compute capacity. 🚀🇮🇳 #IndiaAI #TechNews
                </div>
                
                <div className="rounded-lg overflow-hidden border border-white/5 mb-3 h-48 relative group">
                  <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop" alt="AI Tech" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                    <span className="text-white font-bold text-lg">INDIA'S AI MISSION APPROVED</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-green-400 font-medium text-sm">
                      <Heart className="w-4 h-4 fill-current" />
                      <span>45.2K</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#F5B041] font-medium text-sm">
                      <Repeat2 className="w-4 h-4" />
                      <span>12.8K</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A1A1A1] text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>3,420 comments</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Trending Post 2 */}
            <article className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-white/5 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
              
              <div className="p-4 flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src="https://i.pravatar.cc/150?u=b242581f4e29026704d" alt="Sports Updates" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-sm">Cricket Live</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B041]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm mb-3 text-[#E0E0E0]">
                    What an unbelievable finish! 🔥 Kohli does it again in the final over. Pure masterclass in chasing under pressure. The stadium is going absolutely crazy right now!! 🏏🏆 #Cricket #IndVsAus
                  </div>
                  
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-green-400 font-medium text-sm">
                      <Heart className="w-4 h-4 fill-current" />
                      <span>89.5K</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#F5B041] font-medium text-sm">
                      <Repeat2 className="w-4 h-4" />
                      <span>24.1K</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400&auto=format&fit=crop" alt="Stadium" className="w-full h-full object-cover" />
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ================= ZONE 3: DISCOVER ================= */}
        <section className="mb-8 pt-4">
          <div className="px-4 mb-4 flex items-center justify-center gap-2 text-[#A1A1A1] border-b border-white/5 pb-4">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-sm font-medium tracking-widest uppercase">Discover</h2>
            <Sparkles className="w-4 h-4" />
          </div>
          
          <div className="px-2 sm:px-4 columns-1 sm:columns-2 gap-3 space-y-3">
            
            {/* Discover Post 1 */}
            <article className="bg-[#111111] rounded-xl p-4 border border-white/5 break-inside-avoid opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full overflow-hidden grayscale">
                  <img src="https://i.pravatar.cc/150?u=c342581f4e29026704d" alt="User" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-[#A1A1A1]">Rohan Verma</span>
              </div>
              <p className="text-sm text-[#D0D0D0] leading-relaxed mb-3">
                Mental model for developers: Don't learn the framework, learn the underlying patterns. React might change, but component-based architecture is here to stay. Invest in fundamentals. 🧠💻
              </p>
              <div className="flex items-center justify-between text-[#888888] text-xs">
                <span>1.2K Likes</span>
                <span>342 Re-ups</span>
              </div>
            </article>

            {/* Discover Post 2 */}
            <article className="bg-[#111111] rounded-xl p-4 border border-white/5 break-inside-avoid opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full overflow-hidden grayscale">
                  <img src="https://i.pravatar.cc/150?u=d442581f4e29026704d" alt="User" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-[#A1A1A1]">Neha Gupta</span>
              </div>
              <p className="text-sm text-[#D0D0D0] leading-relaxed mb-3">
                Aaj ka sunset from Marine Drive was something else entirely. No filters needed when the sky puts on a show like that. 🌅 Mumbai never ceases to amaze me.
              </p>
              <div className="flex items-center justify-between text-[#888888] text-xs">
                <span>845 Likes</span>
                <span>12 Comments</span>
              </div>
            </article>

            {/* Discover Post 3 */}
            <article className="bg-[#111111] rounded-xl p-4 border border-white/5 break-inside-avoid opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full overflow-hidden grayscale">
                  <img src="https://i.pravatar.cc/150?u=e542581f4e29026704d" alt="User" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-[#A1A1A1]">Karan Singh</span>
              </div>
              <p className="text-sm text-[#D0D0D0] leading-relaxed mb-3">
                Bootstrap vs Tailwind isn't a technical debate, it's a workflow preference. Use whatever lets you ship faster to your users. They don't care about your CSS methodology. ⚡️
              </p>
              <div className="flex items-center justify-between text-[#888888] text-xs">
                <span>3.4K Likes</span>
                <span>890 Re-ups</span>
              </div>
            </article>

          </div>
        </section>

      </main>
    </div>
  );
}

export default ProximityZones;