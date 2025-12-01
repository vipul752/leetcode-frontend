import { useState } from "react";
import { useNavigate } from "react-router";
import { Clock, FileText, MessageSquare, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

export default function RecentAndPosts({ recentProblems, posts }) {
  const [tab, setTab] = useState("recent");
  const navigate = useNavigate();

  const safeRecent = Array.isArray(recentProblems) ? recentProblems : [];
  const safePosts = Array.isArray(posts) ? posts : [];

  const recent10 = safeRecent.slice(0, 10);
  const posts10 = safePosts.slice(0, 10);

  return (
    <div className="bg-[#0d0d0d] rounded-2xl shadow-lg border border-gray-700 mt-8 overflow-hidden">
      {/* ---- TABS HEADER (SLIDER STYLE) ---- */}
      <div className="flex items-center mt-4 ml-4 bg-black p-1 rounded-xl border border-slate-700/50 w-fit mb-4">
        {/* Recent Button */}
        <button
          onClick={() => setTab("recent")}
          className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
            tab === "recent"
              ? "text-black" // active text on amber
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {tab === "recent" && (
            <motion.div
              layoutId="recentPostsSlider"
              className="absolute inset-0 bg-amber-400 rounded-lg shadow-lg shadow-amber-500/20"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">Recent</span>
        </button>

        {/* Posts Button */}
        <button
          onClick={() => setTab("posts")}
          className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
            tab === "posts"
              ? "text-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {tab === "posts" && (
            <motion.div
              layoutId="recentPostsSlider"
              className="absolute inset-0 bg-amber-400 rounded-lg shadow-lg shadow-amber-500/20"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">Posts</span>
        </button>
      </div>
      {/* ---- CONTENT BODY ---- */}
      <div className="p-6">
        {/* ================= Recent Problems ================= */}
        {tab === "recent" && (
          <div>
            {recent10.length === 0 ? (
              <EmptyState
                message="No recent problems yet"
                sub="Solve problems to see them here"
              />
            ) : (
              <div className="space-y-4">
                {recent10.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#111] rounded-xl border border-gray-700  cursor-pointer transition-all flex justify-between items-center"
                    onClick={() => navigate(`/problem/${item.problemId._id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-gray-400 font-semibold text-sm truncate flex items-center gap-2">
                        {item.problemId.title}
                      </p>
                    </div>

                    <button className="ml-4 px-3 py-1.5 bg-amber-500 text-black text-xs rounded-lg hover:bg-amber-400 transition">
                      View →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= Posts ================= */}
        {tab === "posts" && (
          <div>
            {posts10.length === 0 ? (
              <EmptyState message="No posts yet" sub="Create your first post" />
            ) : (
              <div className="space-y-4">
                {posts10.map((post, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#111] rounded-xl border border-gray-700  cursor-pointer transition-all flex justify-between"
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-gray-400 font-semibold truncate flex items-center gap-2">
                        {post.title}
                      </p>

                      <p className="text-xs text-gray-400 mt-1 flex gap-3">
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={12} /> {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} />{" "}
                          {post.comments?.length || 0}
                        </span>
                      </p>
                    </div>

                    <button className="ml-4 px-3 py-1.5 bg-amber-500 text-black text-xs rounded-lg hover:bg-amber-400 transition">
                      Open →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, sub }) {
  return (
    <div className="text-center py-14">
      <p className="text-gray-300 font-medium">{message}</p>
      <p className="text-gray-500 text-sm">{sub}</p>
    </div>
  );
}
