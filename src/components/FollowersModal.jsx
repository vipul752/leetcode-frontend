import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import FollowButton from "./FollowButton";
import axiosClient from "../utils/axiosClient";

export default function FollowersModal({ open, onClose, users, reload }) {
  if (!open) return null;

  const removeFollower = async (id) => {
    await axiosClient.delete(`/social/delete/${id}`);
    reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 w-full max-w-md rounded-2xl p-6 border border-slate-700"
      >
        <h2 className="text-xl font-bold text-white mb-4">Followers</h2>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-3"
            >
              <img
                src={u.avatar}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1">
                <p className="text-white font-semibold">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-slate-400 text-sm">@{u.username}</p>
              </div>

              {/* Follow Back */}
              {!u.iFollowHim && (
                <FollowButton
                  userId={u._id}
                  isFollowing={false}
                  reload={reload}
                />
              )}

              {/* Remove */}
              <button
                onClick={() => removeFollower(u._id)}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
