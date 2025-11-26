import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Heart,
  MessageCircle,
  Code2,
  Users,
  ArrowLeft,
  MapPin,
  Award,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import axiosClient from "../utils/axiosClient";
import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts"); // posts, followers, following
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(
        `/social/publicProfile/${username}`
      );
      setUser(response.data);

      // Fetch user's posts using getUserPost endpoint
      try {
        const postsResponse = await axiosClient.get(
          `/social/getUserPost/${response.data._id}`
        );
        setPosts(Array.isArray(postsResponse.data) ? postsResponse.data : []);
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setPosts([]);
      }

      // Fetch problem details if available
      if (
        response.data.problemSolved &&
        Array.isArray(response.data.problemSolved)
      ) {
        try {
          const problemDetails = await Promise.all(
            response.data.problemSolved.map((problemId) =>
              axiosClient.get(`/problem/getProblem/${problemId}`).catch(() => ({
                data: { _id: problemId, title: "Unknown Problem" },
              }))
            )
          );
          setProblems(problemDetails.map((res) => res.data));
        } catch (err) {
          console.error("Error fetching problem details:", err);
          setProblems(
            response.data.problemSolved.map((id) => ({
              _id: id,
              title: "Unknown Problem",
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Code2 className="w-16 h-16 text-cyan-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 text-lg mb-4">User not found</p>
          <button
            onClick={() => navigate("/social")}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg"
          >
            Back to Social
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header Navigation */}
      <nav className="bg-black backdrop-blur-xl border-b border-slate-700/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/social")}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-white font-bold text-xl">User Profile</h1>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-black rounded-3xl border border-slate-700/50 p-8 backdrop-blur-sm mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                alt={user.firstName}
                className="w-32 h-32 rounded-full border-4 border-cyan-500/30 object-cover shadow-2xl"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {user.firstName} {user.lastName}
              </h1>

              {user.bio && (
                <p className="text-slate-300 text-base mb-4 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex gap-3 mb-6 flex-wrap">
                {user.email && (
                  <a
                    href={`mailto:${user.email}`}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-full text-slate-300 hover:text-white transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-xl">
                    {user.posts?.length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Posts</p>
                </div>
                <div
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setActiveTab("followers")}
                >
                  <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-xl">
                    {user.followers?.length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Followers</p>
                </div>
                <div
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setActiveTab("following")}
                >
                  <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-xl">
                    {user.following?.length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Following</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 text-xl">
                    {user.problemSolved?.length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Problems Solved</p>
                </div>
              </div>

              {/* Follow Button */}
              <div className="w-full md:w-auto max-w-xs">
                <FollowButton
                  userId={user._id}
                  isFollowing={isFollowing}
                  reload={() => {
                    setIsFollowing(!isFollowing);
                    fetchUserProfile();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
              activeTab === "posts"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Posts ({user.posts?.length || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("followers")}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
              activeTab === "followers"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Followers ({user.followers?.length || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
              activeTab === "following"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Following ({user.following?.length || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("problems")}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
              activeTab === "problems"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Problems Solved ({user.problemSolved?.length || 0})
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  reload={fetchUserProfile}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50">
                <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300">No posts yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "followers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.followers && user.followers.length > 0 ? (
              user.followers.map((follower) => (
                <div
                  key={follower._id}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/30 transition-all"
                >
                  <img
                    src={follower.avatar || "https://via.placeholder.com/100"}
                    alt={follower.firstName}
                    className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-cyan-500/30"
                  />
                  <h3 className="font-bold text-white text-center mb-1">
                    {follower.firstName} {follower.lastName}
                  </h3>
                  <p className="text-cyan-400 text-center text-sm mb-4">
                    @{follower.username}
                  </p>
                  <button
                    onClick={() => navigate(`/userprofile/${follower._id}`)}
                    className="w-full px-4 py-2 bg-slate-800/50 hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-blue-600/30 text-slate-200 hover:text-cyan-300 rounded-lg font-medium transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50"
                  >
                    View Profile
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300">No followers yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "following" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.following && user.following.length > 0 ? (
              user.following.map((followedUser) => (
                <div
                  key={followedUser._id}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/30 transition-all"
                >
                  <img
                    src={
                      followedUser.avatar || "https://via.placeholder.com/100"
                    }
                    alt={followedUser.firstName}
                    className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-cyan-500/30"
                  />
                  <h3 className="font-bold text-white text-center mb-1">
                    {followedUser.firstName} {followedUser.lastName}
                  </h3>
                  <p className="text-cyan-400 text-center text-sm mb-4">
                    @{followedUser.username}
                  </p>
                  <button
                    onClick={() => navigate(`/userprofile/${followedUser._id}`)}
                    className="w-full px-4 py-2 bg-slate-800/50 hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-blue-600/30 text-slate-200 hover:text-cyan-300 rounded-lg font-medium transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50"
                  >
                    View Profile
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300">Not following anyone yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "problems" && (
          <div className="space-y-4">
            {problems && problems.length > 0 ? (
              problems.map((problem) => (
                <div
                  key={problem._id}
                  onClick={() => navigate(`/problem/${problem._id}`)}
                  className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-amber-700/30 p-4 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-100 font-semibold group-hover:text-amber-300 transition-colors truncate">
                        {problem.title || "Unknown Problem"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        problem.difficulty === "Easy"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : problem.difficulty === "Hard"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-slate-600/20 text-slate-300 border border-slate-600/30"
                      }`}
                    >
                      {problem.difficulty || "N/A"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50">
                <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300">No problems solved yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
