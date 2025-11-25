import { Link, useParams } from "react-router";
import { useEffect, useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import {
  ArrowLeft,
  Eye,
  Calendar,
  MessageCircle,
  Heart,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
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

export default function IndividualPost() {
  const { postId } = useParams();
  const authUser = useSelector((state) => state.auth.user);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Like state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Comment state
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Increment views when post is viewed
      await axiosClient.post(`/social/incrementView/${postId}`);

      const res = await axiosClient.get(`/social/post/${postId}`);
      console.log("Post response:", res.data);
      const postData = res.data.post || res.data;
      setPost(postData);

      // Initialize like state
      setLiked(
        Array.isArray(postData.likes)
          ? postData.likes.includes(authUser?._id)
          : false
      );
      setLikesCount(
        postData.likes
          ? Array.isArray(postData.likes)
            ? postData.likes.length
            : postData.likes
          : 0
      );

      // Initialize comments
      setComments(postData.comments || []);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err.response?.data?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [postId, authUser?._id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async (e) => {
    e.stopPropagation();
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
      console.error("Error liking post:", err);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-white bg-black">
        <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 animate-pulse">Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-white bg-black">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={fetchPost}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white bg-black">
        <p className="text-gray-400">Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 max-w-3xl mx-auto">
      {/* BACK BUTTON */}
      <div className="flex items-center gap-2 text-gray-400 mb-6">
        <Link to="/social" className="hover:text-white transition">
          <ArrowLeft size={22} />
        </Link>
      </div>

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4 leading-snug">{post.title}</h1>

      {/* USER INFO */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src={post.owner?.avatar}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-gray-300 font-medium">
            {post.anonymous ? "Anonymous User" : post.owner?.firstName}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Eye size={14} /> {post.views}
            </span>

            <span className="flex items-center gap-1">
              <Calendar size={14} /> {new Date(post.createdAt).toDateString()}
            </span>

            <span className="flex items-center gap-1">
              {Math.floor((new Date() - new Date(post.updatedAt)) / 60000)}{" "}
              minutes ago
            </span>
          </div>
        </div>

        <div className="ml-auto">
          <MoreHorizontal className="text-gray-400 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* TAGS */}
      <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs inline-block mb-4">
        Career
      </span>

      {/* DESCRIPTION */}
      <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-8">
        {post.description}
      </p>

      {/* ACTION BAR */}
      <div className="flex items-center gap-6 text-gray-400 border-t border-gray-800 pt-5">
        {/* LIKE BUTTON */}
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

        {/* COMMENT BUTTON */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition font-medium"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="mt-10">
          {/* COMMENTS HEADER */}
          <div className="mb-4 text-lg font-semibold text-gray-200">
            Comments ({comments.length})
          </div>

          {/* COMMENT INPUT */}
          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <input
              type="text"
              placeholder="Type comment here..."
              className="w-full bg-transparent outline-none text-gray-300 placeholder-gray-500"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
            />
            <div className="flex justify-end mt-3 gap-2">
              <button
                onClick={() => setComment("")}
                className="px-4 py-1 rounded-md text-gray-400 hover:text-white transition"
              >
                Clear
              </button>
              <button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="px-4 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Comment
              </button>
            </div>
          </div>

          {/* COMMENT LIST */}
          <div className="space-y-5">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No comments yet. Be the first!
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c._id}
                  className="flex items-start gap-4 bg-gray-900/50 rounded-lg p-3"
                >
                  <img
                    src={c.user?.avatar || "https://via.placeholder.com/36"}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">
                        {c.user?.firstName || "User"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {c.text || c.comment}
                    </p>
                  </div>
                  {authUser?._id === c.user?._id && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
