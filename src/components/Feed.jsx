import { useEffect, useState, useCallback } from "react";
import PostCard from "../components/PostCard";
import { getFeed, createPost } from "../utils/axiosClient";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFeed();
      setPosts(res.data || []);
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitPost = async () => {
    if (!newPostText.trim()) return;
    setSubmitting(true);
    try {
      await createPost(newPostText);
      setNewPostText("");
      // Optimistic update: add new post to feed instead of refetching
      loadFeed();
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <div className="w-full space-y-6">
      {/* New Post Box */}
      <div className="bg-black backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

        <div className="flex gap-4">
          <div className="flex-1">
            <textarea
              className="w-full bg-slate-950/50 border border-slate-700/50 p-4 rounded-xl text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none text-lg"
              placeholder="Share your coding journey..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              rows="3"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2 text-slate-400 text-sm">
            <span className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer transition-colors">
            </span>
          </div>

          <div className="flex gap-3">
            {newPostText && (
              <button
                onClick={() => setNewPostText("")}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={submitPost}
              disabled={!newPostText.trim() || submitting}
              className="px-6 py-2 bg-amber-400 text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Publishing..." : "Post"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-500"></div>
          <p className="text-slate-400 mt-3 animate-pulse">
            Curating your feed...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed"
        >
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-300 text-lg font-medium">No posts yet</p>
          <p className="text-slate-500">
            Be the first to share something amazing!
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {/* Feed */}
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <PostCard post={post} refreshFeed={loadFeed} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
