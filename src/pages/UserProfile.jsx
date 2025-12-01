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
  const [isFollowedBy, setIsFollowedBy] = useState(false);

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

      // Check if current user is following this user
      try {
        const checkFollowResponse = await axiosClient.get(
          `/social/checkFollow/${response.data._id}`
        );
        setIsFollowing(checkFollowResponse.data.isFollowing || false);
        setIsFollowedBy(checkFollowResponse.data.isFollowedBy || false);
      } catch (err) {
        console.error("Error checking follow status:", err);
        setIsFollowing(false);
        setIsFollowedBy(false);
      }

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tabs and Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-700/50 overflow-x-auto">
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
                  Posts
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
                  Followers
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
                  Following
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
                  Problems
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.followers && user.followers.length > 0 ? (
                  user.followers.map((follower) => (
                    <div
                      key={follower._id}
                      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 hover:border-cyan-500/30 transition-all"
                    >
                      <img
                        src={
                          follower.avatar || "https://via.placeholder.com/100"
                        }
                        alt={follower.firstName}
                        className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-cyan-500/30"
                      />
                      <h3 className="font-bold text-white text-center mb-1 text-sm">
                        {follower.firstName} {follower.lastName}
                      </h3>
                      <p className="text-cyan-400 text-center text-xs mb-3">
                        @{follower.username}
                      </p>
                      <button
                        onClick={() => navigate(`/userprofile/${follower._id}`)}
                        className="w-full px-3 py-1.5 bg-slate-800/50 hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-blue-600/30 text-slate-200 hover:text-cyan-300 rounded-lg font-medium transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50 text-sm"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.following && user.following.length > 0 ? (
                  user.following.map((followedUser) => (
                    <div
                      key={followedUser._id}
                      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 p-4 hover:border-cyan-500/30 transition-all"
                    >
                      <img
                        src={
                          followedUser.avatar ||
                          "https://via.placeholder.com/100"
                        }
                        alt={followedUser.firstName}
                        className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-cyan-500/30"
                      />
                      <h3 className="font-bold text-white text-center mb-1 text-sm">
                        {followedUser.firstName} {followedUser.lastName}
                      </h3>
                      <p className="text-cyan-400 text-center text-xs mb-3">
                        @{followedUser.username}
                      </p>
                      <button
                        onClick={() =>
                          navigate(`/userprofile/${followedUser._id}`)
                        }
                        className="w-full px-3 py-1.5 bg-slate-800/50 hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-blue-600/30 text-slate-200 hover:text-cyan-300 rounded-lg font-medium transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50 text-sm"
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
              <div className="space-y-3">
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

          {/* Right Column - User Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-black rounded-3xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-xl">
              {/* Avatar */}
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                alt={user.firstName}
                className="w-24 h-24 rounded-full border-4 border-cyan-500/30 object-cover shadow-2xl mx-auto mb-4"
              />

              {/* Name and Bio */}
              <h1 className="text-2xl font-bold text-white text-center mb-2">
                {user.firstName} {user.lastName}
              </h1>

              {user.bio && (
                <p className="text-slate-300 text-sm text-center mb-4 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-center">
                  <div>
                    <p className="font-bold text-cyan-400 text-lg">
                      {user.posts?.length || 0}
                    </p>
                    <p className="text-xs text-slate-400">Posts</p>
                  </div>
                  <div>
                    <p className="font-bold text-cyan-400 text-lg">
                      {user.followers?.length || 0}
                    </p>
                    <p className="text-xs text-slate-400">Followers</p>
                  </div>
                  <div>
                    <p className="font-bold text-cyan-400 text-lg">
                      {user.following?.length || 0}
                    </p>
                    <p className="text-xs text-slate-400">Following</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-700/50">
                  <p className="font-bold text-amber-400 text-lg text-center">
                    {user.problemSolved?.length || 0}
                  </p>
                  <p className="text-xs text-slate-400 text-center">
                    Problems Solved
                  </p>
                </div>
              </div>

              {/* Social Links */}

              {/* Follow Button */}
              <FollowButton
                userId={user._id}
                isFollowing={isFollowing}
                isFollowedBy={isFollowedBy}
                reload={() => {
                  setIsFollowing(!isFollowing);
                  fetchUserProfile();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
