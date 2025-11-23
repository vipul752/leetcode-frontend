import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

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

      // Sorting Logic
      if (sortBy === "followers") {
        sortedUsers.sort(
          (a, b) => (b.followers?.length || 0) - (a.followers?.length || 0)
        );
      } else if (sortBy === "recent") {
        sortedUsers.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      } else {
        sortedUsers.sort(
          (a, b) => (b.posts?.length || 0) - (a.posts?.length || 0)
        );
      }

      setUsers(sortedUsers);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
              <img
                src="/codeArena.png"
                alt="CodeArena Logo"
                className="h-10 w-auto rounded-md shadow-lg"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === "feed"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Feed
                </div>
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "explore"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Users className="w-4 h-4" />
                Explore
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "feed" ? (
          // Feed Tab - two column layout: left profile card, right feed
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <aside className="md:col-span-1">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-xl">
                <div className="flex flex-col items-center text-center text-slate-200">
                  <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <img
                      src={profile?.user?.avatar}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-28 h-28 rounded-full object-cover border-2 border-cyan-500 mb-4 shadow-lg"
                    />

                   
                    {/* Bio */}
                    {authUser?.bio && (
                      <p className="text-slate-300 text-sm mt-3">
                        {authUser.bio}
                      </p>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold">
                    {authUser?.firstName} {authUser?.lastName}
                  </h2>
                  <p className="text-cyan-400">{authUser?.username}</p>
                  {authUser?.bio && (
                    <img
                      src={profile?.user?.avatar}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-full"
                    />
                  )}

                  <div className="grid grid-cols-3 gap-3 w-full mt-6">
                    <div>
                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-lg">
                        {profile?.stats?.posts}
                      </p>
                      <p className="text-xs text-slate-400">Posts</p>
                    </div>
                    <div>
                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-lg">
                        {profile?.stats?.followers}
                      </p>
                      <p className="text-xs text-slate-400">Followers</p>
                    </div>
                    <div>
                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-lg">
                        {profile?.stats?.following}
                      </p>
                      <p className="text-xs text-slate-400">Following</p>
                    </div>
                  </div>

                  <div className="w-full mt-6">
                    <button
                      onClick={() =>
                        navigate(`/userprofile/${authUser?.firstName}`)
                      }
                      className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <main className="md:col-span-2">
              <Feed />
            </main>
          </div>
        ) : (
          // Explore Tab
          <div className="space-y-6">
            {/* Search and Filter Box */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-xl hover:border-cyan-500/30 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search Input */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-cyan-400/50" />
                  <input
                    type="text"
                    placeholder="Search developers by name or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  />
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Most Recent</option>
                  <option value="followers">Most Followers</option>
                </select>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 backdrop-blur-sm overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none rounded-2xl"></div>

                    <div className="relative z-10">
                      {/* User Avatar */}
                      <div className="flex flex-col items-center mb-5">
                        <div className="relative mb-4">
                          <img
                            src={
                              user.avatar || "https://via.placeholder.com/100"
                            }
                            alt={user.firstName}
                            className="w-24 h-24 rounded-full border-2 border-cyan-500/30 object-cover shadow-lg group-hover:border-cyan-400 transition-colors"
                          />
                          {user.isFollowing && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-cyan-400/70 group-hover:text-cyan-400 transition-colors">
                          @{user.username}
                        </p>
                      </div>

                      {/* User Bio */}
                      {user.bio && (
                        <p className="text-slate-300 text-center text-sm mb-4 leading-relaxed">
                          {user.bio}
                        </p>
                      )}

                      {/* Skills Tags */}
                      {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          {user.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 3 && (
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
                              +{user.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-slate-700/50">
                        <div className="text-center">
                          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            {Array.isArray(user.followers)
                              ? user.followers.length
                              : 0}
                          </p>
                          <p className="text-xs text-slate-400">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            {Array.isArray(user.following)
                              ? user.following.length
                              : 0}
                          </p>
                          <p className="text-xs text-slate-400">Following</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            {Array.isArray(user.posts) ? user.posts.length : 0}
                          </p>
                          <p className="text-xs text-slate-400">Posts</p>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <div className="mt-4">
                        <FollowButton
                          userId={user._id}
                          isFollowing={user.isFollowing || false}
                          reload={() => {
                            handleSearch();
                          }}
                        />
                      </div>

                      {/* View Profile */}
                      <button
                        onClick={() =>
                          navigate(`/userprofile/${user.firstName}`)
                        }
                        className="w-full mt-3 px-4 py-2 bg-slate-800/50 hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-blue-600/30 text-slate-200 hover:text-cyan-300 rounded-lg font-medium transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="text-center py-16 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <Sparkles className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                <p className="text-slate-300 text-lg mb-2">Start Exploring</p>
                <p className="text-slate-400 text-sm">
                  Search for developers to discover talented coders
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
