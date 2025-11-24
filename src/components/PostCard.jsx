import { useState, memo } from "react";
import {
  MessageCircle,
  Eye,
  Heart,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import axiosClient from "../utils/axiosClient";
import { useSelector } from "react-redux";

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (let key in intervals) {
    const val = Math.floor(seconds / intervals[key]);
    if (val >= 1) return `${val} ${key}${val > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

const PostCard = memo(function PostCard({ post }) {
  const authUser = useSelector((state) => state.auth.user);
  const [liked, setLiked] = useState(
    Array.isArray(post.likes) ? post.likes.includes(authUser?._id) : false
  );
  const [likesCount, setLikesCount] = useState(
    post.likes
      ? Array.isArray(post.likes)
        ? post.likes.length
        : post.likes
      : 0
  );

  const handleLike = async () => {
    try {
      if (liked) {
        // If already liked, unlike it
        const res = await axiosClient.post(`/social/unlike/${post._id}`);
        setLiked(false);
        setLikesCount(res.data.likes || likesCount - 1);
      } else {
        // If not liked, like it
        const res = await axiosClient.post(`/social/like/${post._id}`);
        setLiked(true);
        setLikesCount(res.data.likes || likesCount + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-black cursor-pointer backdrop-blur-md border border-slate-800 rounded-2xl p-6  relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all pointer-events-none"></div>

      {/* HEADER */}
      <div className="flex items-start gap-4 relative z-10">
        <img
          src={post.owner?.avatar || "https://via.placeholder.com/48"}
          alt="user"
          className="w-12 h-12 rounded-full object-cover border-2 border-slate-800"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-lg group-hover:text-amber-400 transition">
                {post.owner?.firstName || "Anonymous"}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                {timeAgo(post.createdAt)}
              </p>
            </div>

       
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="mt-4 pl-16">
        {post.title && (
          <h2 className="text-xl font-bold text-slate-100 mb-2 leading-tight">
            {post.title}
          </h2>
        )}

        <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
          {post.description}
        </p>
      </div>

      {/* FOOTER */}
      <div className="flex items-center gap-6 mt-6 pl-16 border-t border-slate-800/50 pt-4">
        {/* LIKE */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition font-medium ${
            liked
              ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
              : "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
          <span>{likesCount}</span>
        </button>

        {/* COMMENTS */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments}</span>
        </div>

        {/* VIEWS */}
        <div className="flex items-center gap-2 ml-auto text-slate-500">
          <Eye className="w-4 h-4" />
          <span>{post.views}</span>
        </div>

      </div>
    </div>
  );
});

export default PostCard;
