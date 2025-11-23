import { useEffect, useState, useCallback } from "react";
import PostCard from "../components/PostCard";
import { getFeed, createPost } from "../utils/axiosClient";
import { Send } from "lucide-react";

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
    <div className="w-full space-y-4">
      {/* New Post Box */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/60 rounded-lg p-5">
        <textarea
          className="w-full bg-slate-900/50 border border-slate-700/50 p-3 rounded-lg text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all resize-none"
          placeholder="What's on your mind?"
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          rows="3"
        />

        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={() => setNewPostText("")}
            className="px-4 py-2 text-slate-300 hover:text-white rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={submitPost}
            disabled={!newPostText.trim() || submitting}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-500"></div>
          <p className="text-slate-300 mt-3">Loading feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50">
          <p className="text-slate-300">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Feed */}
          {posts.map((post) => (
            <PostCard key={post._id} post={post} refreshFeed={loadFeed} />
          ))}
        </div>
      )}
    </div>
  );
}
