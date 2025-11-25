import { followUser, unfollowUser } from "../utils/axiosClient";
import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

export default function FollowButton({
  userId,
  isFollowing,
  reload,
  reloadProfile,
}) {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFollow = async () => {
    setLoading(true);

    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
      } else {
        await followUser(userId);
        setFollowing(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
      if (reload) reload();
      if (reloadProfile) reloadProfile();
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`w-full px-4 py-2.5 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
          following
            ? "bg-gradient-to-r from-slate-700/50 to-slate-800/50 text-cyan-300 border border-slate-600/50 hover:border-cyan-500/50 hover:bg-slate-700/50"
            : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30"
        } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {following ? (
          <>
            <UserCheck className="w-4 h-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Follow
          </>
        )}
      </button>

      {/* Success Notification */}
      {showSuccess && (
        <div className="mt-2 text-center text-sm text-green-400 font-medium animate-pulse">
          ✓ Following
        </div>
      )}
    </>
  );
}
