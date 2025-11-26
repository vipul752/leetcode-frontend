import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import FollowersModal from "../components/FollowersModal";
import {
  Heart,
  MessageCircle,
  Search,
  Users,
  Sparkles,
  TrendingUp,
  Code2,
  MapPin,
  Award,
} from "lucide-react";
import Feed from "../components/Feed";
import PostCard from "../components/PostCard";
import FollowButton from "../components/FollowButton";
import axiosClient from "../utils/axiosClient";

const Social = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("feed"); // feed or explore
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "followers" or "following"
  const [listData, setListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal functions
  const loadFollowers = async () => {
    try {
      const res = await axiosClient.get(`/social/followers/${authUser._id}`);
      setListData(res.data);
      setModalType("followers");
      setModalOpen(true);
    } catch (err) {
      console.error("Error loading followers:", err);
    }
  };

  const loadFollowing = async () => {
    try {
      const res = await axiosClient.get(`/social/following/${authUser._id}`);
      setListData(res.data);
      setModalType("following");
      setModalOpen(true);
    } catch (err) {
      console.error("Error loading following:", err);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser?.firstName) return;

      const res = await axiosClient.get(
        `/social/profile/${authUser.firstName}`
      );
      setProfile(res.data);
    };

    loadProfile();
  }, [authUser]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.get(`/social/search/${searchTerm}`);
      let sortedUsers = response.data;

      // Sort by popular (posts count)
      sortedUsers.sort(
        (a, b) => (b.posts?.length || 0) - (a.posts?.length || 0)
      );

      setUsers(sortedUsers);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) handleSearch();
    }, 500);
    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  if (authUser === undefined) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans ">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Navigation */}
      <nav className="bg-black backdrop-blur-xl border-b border-slate-800/60 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
            >
              <img
                src="/codeArena.png"
                alt="CodeArena Logo"
                className="h-10 w-auto rounded-md shadow-lg shadow-cyan-500/20"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-black p-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setActiveTab("feed")}
                className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "feed"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeTab === "feed" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-amber-400 rounded-lg shadow-lg shadow-cyan-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Feed
                </span>
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "explore"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {activeTab === "explore" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-amber-400 rounded-lg shadow-lg shadow-cyan-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Explore
                </span>
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300 font-medium text-sm"
            >
              Exit Social
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "feed" ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              {/* Left Sidebar - Profile */}
              <aside className="md:col-span-4 lg:col-span-3 hidden md:block">
                <div className="sticky top-24">
                  <div className="bg-black backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-xl overflow-hidden relative group">
                    {/* Decorative background */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-white"></div>

                    <div className="relative flex flex-col items-center text-center z-10 mt-8">
                      <div className="relative">
                        <div className="absolute -inset-1  rounded-full blur opacity-75 "></div>
                        <img
                          src={
                            profile?.user?.avatar ||
                            "https://via.placeholder.com/150"
                          }
                          alt="avatar"
                          referrerPolicy="no-referrer"
                          className="relative w-24 h-24 rounded-full object-cover border-4 border-slate-900 shadow-2xl"
                        />
                      </div>

                      <h2 className="text-xl font-bold mt-4 text-white">
                        {authUser?.firstName} {authUser?.lastName}
                      </h2>

                      {authUser?.bio && (
                        <p className="text-slate-400 text-sm mt-3 line-clamp-2 px-2">
                          {authUser.bio}
                        </p>
                      )}

                      <div className="grid grid-cols-3 gap-2 w-full mt-6 border-t border-slate-800 pt-6">
                        <div className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <span className="font-bold text-white text-lg">
                            {profile?.stats?.posts || 0}
                          </span>
                          <span className="text-xs mr-2 text-slate-500 uppercase tracking-wider font-semibold">
                            Posts
                          </span>
                        </div>
                        <div
                          onClick={loadFollowers}
                          className="flex flex-col items-center p-2 rounded-xl  hover:bg-amber-500/10 hover:border border-amber-400/30 transition-all cursor-pointer group"
                        >
                          <span className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors">
                            {profile?.stats?.followers || 0}
                          </span>
                          <span className="text-xs mr-4 text-slate-500 group-hover:text-amber-400 uppercase tracking-wider font-semibold transition-colors">
                            Followers
                          </span>
                        </div>
                        <div
                          onClick={loadFollowing}
                          className="flex flex-col items-center p-2 rounded-xl hover:bg-amber-500/10 hover:border border-amber-400/30 transition-all cursor-pointer group"
                        >
                          <span className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors">
                            {profile?.stats?.following || 0}
                          </span>
                          <span className="text-xs text-slate-500 group-hover:text-amber-400 uppercase tracking-wider font-semibold transition-colors">
                            Following
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/profile`)}
                        className="w-full mt-6 py-2.5 bg-amber-500 hover:bg-slate-700 text-white rounded-xl font-medium transition-all duration-300 border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-cyan-500/10"
                      >
                        <span>View Full Profile</span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Mini Footer */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-slate-600">
                      © 2025 CodeArena Social •{" "}
                      <span className="hover:text-cyan-500 cursor-pointer">
                        Privacy
                      </span>{" "}
                      •{" "}
                      <span className="hover:text-cyan-500 cursor-pointer">
                        Terms
                      </span>
                    </p>
                  </div>
                </div>
              </aside>

              {/* Main Feed Area */}
              <main className="md:col-span-8 lg:col-span-9">
                <Feed />
              </main>
            </motion.div>
          ) : (
            // Explore Tab
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Search and Filter Box */}
              <div className="bg-black backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* Search Input */}
                  <div className="md:col-span-2 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-slate-900 rounded-xl border border-slate-700 flex items-center overflow-hidden focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                      <Search className="ml-4 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search developers by name or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Grid */}
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 mb-4">
                      <Code2 className="w-16 h-16 text-cyan-400 animate-pulse absolute inset-0" />
                      <div className="animate-spin rounded-full h-16 w-16 border-2 border-cyan-500/30 border-t-cyan-500"></div>
                    </div>
                  </div>
                  <p className="text-slate-300 mt-4">
                    Searching for amazing developers...
                  </p>
                </div>
              ) : users.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  {users.map((user) => (
                    <motion.div
                      key={user._id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 },
                      }}
                      className="group relative bg-black backdrop-blur-sm rounded-2xl border border-slate-800 p-6 hover:border-amber-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/20 overflow-hidden"
                    >
                      {/* Amber accent top border */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative z-10">
                        {/* User Avatar */}
                        <div className="flex flex-col items-center mb-5">
                          <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 to-amber-500/30 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
                            <img
                              src={
                                user.avatar || "https://via.placeholder.com/100"
                              }
                              alt={user.firstName}
                              className="relative w-24 h-24 rounded-full border-2 border-slate-700 object-cover shadow-lg group-hover:border-amber-400 transition-colors"
                            />
                            {user.isFollowing && (
                              <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center z-10 shadow-lg shadow-amber-400/50">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-amber-400/60 group-hover:text-amber-400 transition-colors font-medium">
                            @{user.username}
                          </p>
                        </div>

                        {/* User Bio */}
                        {user.bio && (
                          <p className="text-slate-400 text-center text-sm mb-4 leading-relaxed line-clamp-2 h-10 group-hover:text-slate-300 transition-colors">
                            {user.bio}
                          </p>
                        )}

                        {/* Skills Tags */}
                        {user.skills && user.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-center mb-4 h-16 content-start">
                            {user.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs text-amber-300 hover:bg-amber-500/30 hover:border-amber-400/60 transition-colors"
                              >
                                {skill}
                              </span>
                            ))}
                            {user.skills.length > 3 && (
                              <span className="px-3 py-1 bg-amber-600/20 border border-amber-500/30 rounded-full text-xs text-amber-300 hover:bg-amber-600/30 transition-colors">
                                +{user.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-slate-700/50 group-hover:border-amber-400/30 transition-colors">
                          <div className="text-center hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                              {Array.isArray(user.followers)
                                ? user?.followers?.length
                                : 0}
                            </p>
                            <p className="text-xs text-slate-400">Followers</p>
                          </div>
                          <div className="text-center hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                              {Array.isArray(user.following)
                                ? user.following.length
                                : 0}
                            </p>
                            <p className="text-xs text-slate-400">Following</p>
                          </div>
                          <div className="text-center hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                              {Array.isArray(user.posts)
                                ? user.posts.length
                                : 0}
                            </p>
                            <p className="text-xs text-slate-400">Posts</p>
                          </div>
                        </div>

                        {/* Follow Button */}
                        <div className="mt-4">
                          <FollowButton
                            userId={user._id}
                            isFollowing={user.isFollowing}
                            reload={handleSearch}
                            reloadProfile={() => {
                              const loadProfile = async () => {
                                const res = await axiosClient.get(
                                  `/social/profile/${authUser.firstName}`
                                );
                                setProfile(res.data);
                              };
                              loadProfile();
                            }}
                          />
                        </div>

                        {/* View Profile */}
                        <button
                          onClick={() => navigate(`/userprofile/${user?._id}`)}
                          className="w-full mt-3 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 rounded-lg font-medium transition-all duration-300 border border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-500/10 hover:shadow-amber-400/20 group/btn"
                        >
                          <span className="flex items-center justify-center gap-2">
                            View Profile
                            <svg
                              className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : searchTerm ? (
                <div className="text-center py-16 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-300 text-lg mb-2">
                    No developers found
                  </p>
                  <p className="text-slate-400 text-sm">
                    Try searching with different keywords or skills
                  </p>
                </div>
              ) : (
                <div></div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Followers/Following Modal */}
      <FollowersModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        users={listData}
        reload={() => {
          if (modalType === "followers") loadFollowers();
          if (modalType === "following") loadFollowing();
        }}
      />
    </div>
  );
};

export default Social;
