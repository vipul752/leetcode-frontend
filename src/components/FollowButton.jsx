import { followUser, unfollowUser } from "../utils/axiosClient";
import { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserMinus, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axiosClient from "../utils/axiosClient";

export default function FollowButton({
  userId,
  isFollowing,
  isFollowedBy,
  reload,
  reloadProfile,
}) {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const res = await axiosClient.get(
          `/social/isBothUserFollowEachOther/${userId}`
        );
        setFollowing(res.data.bothFollow || isFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    checkFollowStatus();
  }, [userId, isFollowing]);

  const handleFollow = async () => {
    if (following) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await followUser(userId);
      setFollowing(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      reload && reload();
      reloadProfile && reloadProfile();
    } catch (error) {
      console.error("Error following:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUnfollow = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      await unfollowUser(userId);
      setFollowing(false);
      reload && reload();
      reloadProfile && reloadProfile();
    } catch (error) {
      console.error("Error unfollowing:", error);
    } finally {
      setLoading(false);
    }
  };

  const baseStyles =
    "h-9 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-all duration-300";

  return (
    <div className="flex flex-col items-center relative">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`
          ${baseStyles}
          ${
            following
              ? "bg-[#1f1f1f] border border-slate-600 text-slate-300 hover:bg-[#2a2a2a]"
              : isFollowedBy && !following
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md hover:shadow-amber-500/30"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-blue-500/30"
          }
          ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : following ? (
          <>
            <UserCheck className="w-4 h-4" />
            Following
          </>
        ) : isFollowedBy && !following ? (
          <>
            <UserMinus className="w-4 h-4" />
            Follow Back
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Follow
          </>
        )}
      </button>

      {/* Success notification */}
      {showSuccess && (
        <div className="mt-1 text-xs text-green-400 font-medium animate-fade">
          ✓ Following
        </div>
      )}

      {/* Unfollow Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-lg p-5 border border-red-600/50 shadow-2xl max-w-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Unfollow?</h3>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-300 text-sm mb-5">
                Are you sure you want to unfollow this user?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmUnfollow}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? "Unfollowing..." : "Unfollow"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
