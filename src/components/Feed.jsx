import { useEffect, useState, useCallback } from "react";
import PostCard from "../components/PostCard";
import { getFeed, createPost } from "../utils/axiosClient";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";

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

  const navigate = useNavigate();

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => navigate("/post/create")}
          className="px-5 py-2 bg-amber-400 text-black rounded-xl font-semibold 
                     hover:bg-amber-300 transition shadow 
                     flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Create Post
        </button>
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
