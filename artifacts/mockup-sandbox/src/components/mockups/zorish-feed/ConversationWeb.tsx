import React, { useState } from "react";
import {
  Heart,
  ThumbsDown,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  BadgeCheck,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";

const ActivityPill = ({ avatar, text }: { avatar: string; text: string }) => (
  <div className="flex items-center gap-2 bg-[#161616] border border-white/5 rounded-full pl-1 pr-4 py-1 flex-shrink-0 cursor-pointer hover:bg-[#1E1E1E] transition-colors">
    <div className="h-8 w-8 rounded-full border border-[#F5B041] p-[2px]">
      <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
    </div>
    <span className="text-[#F5F5F5] text-sm font-medium whitespace-nowrap">{text}</span>
  </div>
);

type PostActionsProps = {
  likes: number;
  dislikes: number;
  comments: number;
  reups: number;
  saved: boolean;
  liked: boolean;
  disliked: boolean;
  reupped: boolean;
};

const PostActions = ({
  likes,
  dislikes,
  comments,
  reups,
  saved,
  liked,
  disliked,
  reupped
}: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
      <button className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-green-500' : 'text-[#A1A1A1] hover:text-green-500'}`}>
        <Heart size={18} className={liked ? "fill-green-500" : ""} />
        <span>{likes}</span>
      </button>
      <button className={`flex items-center gap-1.5 text-sm transition-colors ${disliked ? 'text-red-500' : 'text-[#A1A1A1] hover:text-red-500'}`}>
        <ThumbsDown size={18} className={disliked ? "fill-red-500" : ""} />
      </button>
      <button className="flex items-center gap-1.5 text-sm text-[#F5B041] font-medium transition-colors hover:text-[#F5B041]/80">
        <MessageCircle size={18} className="fill-[#F5B041]/10" />
        <span>{comments} responses</span>
      </button>
      <button className={`flex items-center gap-1.5 text-sm transition-colors ${reupped ? 'text-[#F5B041]' : 'text-[#A1A1A1] hover:text-[#F5B041]'}`}>
        <Repeat2 size={18} />
        <span>{reups}</span>
      </button>
      <div className="flex items-center gap-3">
        <button className={`transition-colors ${saved ? 'text-[#F5B041]' : 'text-[#A1A1A1] hover:text-[#F5B041]'}`}>
          <Bookmark size={18} className={saved ? "fill-[#F5B041]" : ""} />
        </button>
        <button className="text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors">
          <Share size={18} />
        </button>
      </div>
    </div>
  );
};

export function ConversationWeb() {
  const activities = [
    { id: 1, avatar: "https://i.pravatar.cc/150?u=priya", text: "Priya liked your post" },
    { id: 2, avatar: "https://i.pravatar.cc/150?u=rohan", text: "Rohan re-upped" },
    { id: 3, avatar: "https://i.pravatar.cc/150?u=vikram", text: "Vikram replied" },
    { id: 4, avatar: "https://i.pravatar.cc/150?u=anya", text: "Anya saved your post" },
    { id: 5, avatar: "https://i.pravatar.cc/150?u=dev", text: "Dev liked your reply" },
  ];

  const threads = [
    {
      id: "t1",
      root: {
        avatar: "https://i.pravatar.cc/150?u=karan",
        displayName: "Karan Singh",
        username: "@karans",
        verified: true,
        time: "2h ago",
        content: "Just finished reading 'The Argumentative Indian'. Amartya Sen captures the essence of our pluralistic culture beautifully. We need to remember this today more than ever.",
        image: null,
        stats: { likes: 124, dislikes: 3, comments: 24, reups: 15, saved: true, liked: true, disliked: false, reupped: false }
      },
      responses: [
        {
          id: "r1",
          avatar: "https://i.pravatar.cc/150?u=neha",
          displayName: "Neha Patel",
          username: "@nehap",
          verified: false,
          time: "1h ago",
          content: "Absolutely agree. The ability to debate and disagree constructively is what makes democracy work. Great read!",
          stats: { likes: 12, dislikes: 0, comments: 2, reups: 1, saved: false, liked: false, disliked: false, reupped: false }
        },
        {
          id: "r2",
          avatar: "https://i.pravatar.cc/150?u=amit",
          displayName: "Amit Verma",
          username: "@amitv",
          verified: true,
          time: "45m ago",
          content: "Re-upped because this needs more visibility. People often mistake argument for conflict.",
          stats: { likes: 45, dislikes: 1, comments: 5, reups: 8, saved: false, liked: true, disliked: false, reupped: true },
          isReup: true
        }
      ],
      collapsedCount: 22
    },
    {
      id: "t2",
      root: {
        avatar: "https://i.pravatar.cc/150?u=aditi",
        displayName: "Aditi Rao",
        username: "@aditirao_design",
        verified: true,
        time: "5h ago",
        content: "Mumbai rains are hitting different this year. Chai, pakodas, and some fresh UI designs. Kya bolti public? 🌧️☕",
        image: "https://images.unsplash.com/photo-1536484198539-3d1fa8b8b98b?w=800&q=80",
        stats: { likes: 890, dislikes: 12, comments: 105, reups: 42, saved: false, liked: false, disliked: false, reupped: false }
      },
      responses: [
        {
          id: "r3",
          avatar: "https://i.pravatar.cc/150?u=siddharth",
          displayName: "Siddharth Desai",
          username: "@siddes",
          verified: false,
          time: "4h ago",
          content: "Bhai traffic ka bhi update de do. Stuck at Andheri for 2 hours! 😭",
          stats: { likes: 230, dislikes: 0, comments: 15, reups: 5, saved: false, liked: true, disliked: false, reupped: false }
        }
      ],
      collapsedCount: 104
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans overflow-y-auto pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#F5B041] to-white bg-clip-text text-transparent">Zorish</h1>
        <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center">
          <MoreHorizontal size={18} className="text-[#A1A1A1]" />
        </div>
      </header>

      {/* Web Activity Section */}
      <section className="py-4 border-b border-white/5 bg-[#111111]/30">
        <div className="px-4 mb-2">
          <h2 className="text-xs uppercase tracking-wider text-[#A1A1A1] font-semibold">Web Activity</h2>
        </div>
        <div className="flex overflow-x-auto gap-3 px-4 pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {activities.map(activity => (
            <ActivityPill key={activity.id} avatar={activity.avatar} text={activity.text} />
          ))}
        </div>
      </section>

      {/* Main Feed */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {threads.map((thread) => (
            <div key={thread.id} className="relative">
              
              {/* Root Post */}
              <article className="bg-[#161616] rounded-2xl p-4 border border-white/5 shadow-lg relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <img src={thread.root.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-[15px]">{thread.root.displayName}</span>
                        {thread.root.verified && <BadgeCheck size={14} className="text-[#F5B041]" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#A1A1A1]">
                        <span>{thread.root.username}</span>
                        <span>•</span>
                        <span>{thread.root.time}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-[#A1A1A1] hover:text-[#F5F5F5]">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                
                <div className="mb-3">
                  <p className="text-[15px] leading-relaxed text-[#F5F5F5]/90 whitespace-pre-line">{thread.root.content}</p>
                  {thread.root.image && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
                      <img src={thread.root.image} alt="Post media" className="w-full max-h-80 object-cover" />
                    </div>
                  )}
                </div>

                <PostActions {...thread.root.stats} />
              </article>

              {/* Thread Connections & Responses */}
              {thread.responses.length > 0 && (
                <div className="relative mt-2">
                  {/* The Golden Thread */}
                  <div className="absolute left-[20px] top-[-10px] bottom-6 w-px bg-[#F5B041]/40 z-0"></div>

                  <div className="space-y-2">
                    {thread.responses.map((response) => (
                      <article key={response.id} className="ml-10 bg-[#181818] rounded-2xl p-4 border border-white/5 relative z-10">
                        {/* Branch connecting line */}
                        <div className="absolute left-[-20px] top-6 w-5 h-px bg-[#F5B041]/40 z-0"></div>
                        
                        {response.isReup && (
                          <div className="flex items-center gap-1.5 text-xs text-[#F5B041] mb-2 font-medium">
                            <Repeat2 size={12} />
                            <span>Re-upped by {response.displayName}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <img src={response.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm">{response.displayName}</span>
                                {response.verified && <BadgeCheck size={12} className="text-[#F5B041]" />}
                                <span className="text-xs text-[#A1A1A1] ml-1">{response.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm leading-relaxed text-[#F5F5F5]/80 pl-10">{response.content}</p>
                        
                        <div className="pl-10 mt-2 flex items-center gap-4 text-xs">
                          <button className={`flex items-center gap-1 transition-colors ${response.stats.liked ? 'text-green-500' : 'text-[#A1A1A1] hover:text-green-500'}`}>
                            <Heart size={14} className={response.stats.liked ? "fill-green-500" : ""} />
                            <span>{response.stats.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 text-[#A1A1A1] hover:text-[#F5B041] transition-colors">
                            <MessageCircle size={14} />
                            <span>{response.stats.comments}</span>
                          </button>
                          <button className={`flex items-center gap-1 transition-colors ${response.stats.reupped ? 'text-[#F5B041]' : 'text-[#A1A1A1] hover:text-[#F5B041]'}`}>
                            <Repeat2 size={14} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  
                  {/* Collapsed Responses Indicator */}
                  {thread.collapsedCount > 0 && (
                    <div className="ml-10 mt-2 flex items-center gap-2 py-2 cursor-pointer group">
                      <div className="w-6 h-[1px] bg-white/10"></div>
                      <span className="text-xs font-medium text-[#F5B041] group-hover:text-[#F5B041]/80 transition-colors flex items-center gap-1">
                        <ChevronDown size={14} />
                        Show {thread.collapsedCount} more responses
                      </span>
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ConversationWeb;
