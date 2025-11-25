import { X } from "lucide-react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

export default function UserListModal({ open, onClose, title, users }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.3 }}
        className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-all"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-amber-400">✦</span>
          {title}
          <span className="text-amber-400">✦</span>
        </h2>

        <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-800">
          {users && users.length > 0 ? (
            users.map((u, idx) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 bg-gradient-to-r from-slate-800/50 to-slate-800/20 p-3 rounded-xl hover:from-amber-500/10 hover:to-amber-400/5 transition-all duration-300 border border-slate-700/30 hover:border-amber-400/30 group"
              >
                <img
                  src={u.avatar || "https://via.placeholder.com/40"}
                  className="w-10 h-10 rounded-full object-cover border border-slate-600 group-hover:border-amber-400 transition-colors"
                />

                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-amber-300 transition-colors">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-slate-400 text-sm group-hover:text-amber-400/70 transition-colors">
                    {u.username}
                  </p>
                </div>

                {u.isFollowing && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full border border-amber-400/30 font-semibold">
                    Following
                  </span>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No users found</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
