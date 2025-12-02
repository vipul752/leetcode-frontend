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
import { useNavigate } from "react-router";

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

const truncateText = (text, wordLimit = 25) => {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const PostCard = memo(function PostCard({ post }) {
  const authUser = useSelector((state) => state.auth.user);

  console.log("authUser avatar:", authUser?.avatar);

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

  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      if (liked) {
        const res = await axiosClient.post(`/social/unlike/${post._id}`);
        setLiked(false);
        setLikesCount(res.data.likes || likesCount - 1);
      } else {
        const res = await axiosClient.post(`/social/like/${post._id}`);
        setLiked(true);
        setLikesCount(res.data.likes || likesCount + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const res = await axiosClient.post(`/social/comment/${post._id}`, {
        comment,
      });
      setComments([...comments, res.data]);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const _handleUpdateComment = async (commentId, updatedText) => {
    try {
      const res = await axiosClient.put(
        `/social/comment/${post._id}/${commentId}`,
        { comment: updatedText }
      );
      setComments(comments.map((c) => (c._id === commentId ? res.data : c)));
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosClient.delete(
        `/social/comment/delete/${post._id}/${commentId}`
      );
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleIncrementViews = async () => {
    try {
      await axiosClient.post(`/social/incrementView/${post._id}`);
    } catch (error) {
      console.log("error while increment views", error);
    }
  };

  return (
    <div
      className="bg-black cursor-pointer backdrop-blur-md border border-slate-800 rounded-2xl p-6  relative overflow-hidden"
      onClick={() => {
        handleIncrementViews();
        navigate(`/post/${post._id}`);
      }}
    >
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
          {truncateText(post.description, 50)}
        </p>
      </div>
      {/* FOOTER */}
      <div className="flex items-center gap-6 mt-6 pl-16 border-t border-slate-800/50 pt-4">
        {/* LIKE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>

        {/* VIEWS */}
        <div className="flex items-center gap-2 ml-auto text-slate-500">
          <Eye className="w-4 h-4" />
          <span>{post.views}</span>
        </div>
      </div>
      {/* COMMENTS SECTION */}
      {showComments && (
        <div
          className="mt-6 pl-16 border-t border-slate-800/50 pt-4 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Add Comment */}
          <div className="flex gap-3">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-slate-800/50 border border-slate-700/50 px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none"
              />
              <button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition"
              >
                Post
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Array.isArray(comments) && comments.length > 0 ? (
              comments.map((c) => (
                <div
                  key={c._id}
                  className="flex gap-3 bg-slate-800/30 p-3 rounded-lg"
                >
                  {/* Avatar */}
                  <img
                    src={c.user?.avatar || "https://via.placeholder.com/32"}
                    alt="user"
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Username */}
                    <p className="font-semibold text-sm text-white">
                      {c.user?.firstName || "User"}
                    </p>

                    {/* Comment Text */}
                    <p className="text-sm text-slate-300 break-words">
                      {c.text}
                    </p>

                    {/* Delete Option */}
                    {c.user?._id === authUser?._id && (
                      <div className="flex gap-2 mt-1 text-xs">
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 text-sm">
                No comments yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default PostCard;
