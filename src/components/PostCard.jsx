import { useState } from "react";
import { Heart } from "lucide-react";
import { likePost, unlikePost } from "../utils/axiosClient";
import { useSelector } from "react-redux";

export default function PostCard({ post, refreshFeed }) {
  const authUser = useSelector((state) => state.auth.user);
  const currentUserId = authUser?._id;
  const [liked, setLiked] = useState(
    Array.isArray(post.likes) ? post.likes.includes(currentUserId) : false
  );
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      if (liked) {
        await unlikePost(post._id);
        setLiked(false);
      } else {
        await likePost(post._id);
        setLiked(true);
      }
      refreshFeed();
    } catch (err) {
      console.error("Like toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-5 mb-4">
      {/* User */}
      <div className="flex items-center gap-3 text-slate-200">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm">
          {post.owner?.firstName?.[0] || "U"}
        </div>
        <h4 className="font-semibold">
          {post.owner.firstName} {post.owner.lastName}
        </h4>
      </div>

      {/* Content */}
      <p className="mt-3 text-slate-200">{post.text}</p>

      {/* Actions */}
      <div className="flex items-center gap-5 mt-4">
        <button
          onClick={handleLike}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-slate-200"
        >
          <Heart
            size={22}
            className={`${
              liked ? "text-red-500 fill-red-500" : "text-slate-300"
            }`}
          />
          <span className={`${liked ? "text-red-400" : "text-slate-300"}`}>
            {Array.isArray(post.likes) ? post.likes.length : 0}
          </span>
        </button>
      </div>
    </div>
  );
}
