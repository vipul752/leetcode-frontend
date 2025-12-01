import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import axiosClient from "../utils/axiosClient";
import { Users, X } from "lucide-react";
import { useState } from "react";

export default function FollowingModel({ open, onClose, users, reload }) {
  const [confirmUnfollow, setConfirmUnfollow] = useState(null);

  if (!open) return null;

  const unfollowUser = async (id) => {
    try {
      await axiosClient.post(`/social/unfollow/${id}`);
      setConfirmUnfollow(null);
      reload();
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  return (
    <AnimatePresence>
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
          className="bg-black w-[600px] max-w-2xl h-[600px] rounded-2xl p-8 border border-slate-700 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">
                Following ({users?.length || 0})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users && users.length > 0 ? (
              users.map((u) => (
                <motion.div
                  key={u._id}
                  layout
                  className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-3 hover:bg-slate-800/60 transition-colors"
                >
                  <img
                    src={u.avatar || "https://via.placeholder.com/40"}
                    alt={u.firstName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-slate-400 text-xs">@{u.username}</p>
                  </div>

                  {/* Unfollow Button */}
                  <button
                    onClick={() => setConfirmUnfollow(u._id)}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg transition-all flex-shrink-0"
                  >
                    Unfollow
                  </button>

                  {/* Confirmation Dialog */}
                  {confirmUnfollow === u._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmUnfollow(null);
                      }}
                    >
                      <motion.div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-800 rounded-xl p-4 border border-red-600/50 shadow-xl max-w-xs"
                      >
                        <p className="text-white font-semibold mb-4">
                          Unfollow {u.firstName}?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => unfollowUser(u._id)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Unfollow
                          </button>
                          <button
                            onClick={() => setConfirmUnfollow(null)}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Not following anyone yet</p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-40 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
