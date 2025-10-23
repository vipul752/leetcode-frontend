import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: "all",
    status: "all",
    tags: "all",
    search: "", // Add this line
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblem");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/userProblem");
        setSolvedProblems(data);
        // Trigger progress animation after data loads
        setTimeout(() => setAnimateProgress(true), 500);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    fetchProblems();

    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesDifficulty =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "solved" &&
        solvedProblems.some((sp) => sp._id === problem._id)) ||
      (filters.status === "unsolved" &&
        !solvedProblems.some((sp) => sp._id === problem._id));
    const matchesTags = filters.tags === "all" || problem.tags === filters.tags;

    // Add search matching logic
    const matchesSearch =
      filters.search === "" ||
      problem.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (typeof problem.tags === "string" &&
        problem.tags.toLowerCase().includes(filters.search.toLowerCase())) ||
      (Array.isArray(problem.tags) &&
        problem.tags.some((tag) =>
          tag.toLowerCase().includes(filters.search.toLowerCase())
        ));

    return matchesDifficulty && matchesStatus && matchesTags && matchesSearch;
  });

  // Calculate statistics
  const totalCount = problems.length;
  const solvedCount = solvedProblems.length;
  const solvedPercentage =
    totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  const difficultyStats = {
    easy: {
      total: problems.filter((p) => p.difficulty === "Easy").length,
      solved: solvedProblems.filter((sp) =>
        problems.find((p) => p._id === sp._id && p.difficulty === "Easy")
      ).length,
    },
    medium: {
      total: problems.filter((p) => p.difficulty === "Medium").length,
      solved: solvedProblems.filter((sp) =>
        problems.find((p) => p._id === sp._id && p.difficulty === "Medium")
      ).length,
    },
    hard: {
      total: problems.filter((p) => p.difficulty === "Hard").length,
      solved: solvedProblems.filter((sp) =>
        problems.find((p) => p._id === sp._id && p.difficulty === "Hard")
      ).length,
    },
  };

  const getStreakInfo = () => {
    // Simple streak calculation (you can enhance this based on actual solve dates)
    return Math.min(solvedCount, 7); // Mock streak for demo
  };

  const getRankInfo = () => {
    if (solvedPercentage >= 80)
      return {
        rank: "Expert",
        color: "from-purple-500 to-pink-500",
        icon: "👑",
      };
    if (solvedPercentage >= 60)
      return {
        rank: "Advanced",
        color: "from-blue-500 to-cyan-500",
        icon: "🚀",
      };
    if (solvedPercentage >= 40)
      return {
        rank: "Intermediate",
        color: "from-green-500 to-emerald-500",
        icon: "⭐",
      };
    if (solvedPercentage >= 20)
      return {
        rank: "Beginner",
        color: "from-yellow-500 to-orange-500",
        icon: "🌟",
      };
    return { rank: "Newbie", color: "from-gray-500 to-gray-600", icon: "🔥" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Enhanced Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NavLink to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                    />
                  </svg>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                  LeetCode
                </span>
              </NavLink>
            </div>

            <div className="flex items-center space-x-6">

              <button
                onClick={() => navigate("/contest")}
                className="relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center space-x-2 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M15.75 4.5V2.25a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5V4.5m11.25 0a2.25 2.25 0 0 1 2.25 2.25v10.125a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25H15.75Z"
                  />
                </svg>
                <span className="relative z-10">Contest</span>
                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              </button>
              {/* Enhanced Quick Stats */}
              {user && (
                <div className="hidden lg:flex items-center space-x-4 bg-gray-800/50 rounded-xl px-6 py-3 border border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">
                      {solvedCount}
                    </span>
                    <span className="text-sm text-gray-400">solved</span>
                  </div>
                  <div className="w-px h-5 bg-gray-600"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-purple-400">
                      {getStreakInfo()}
                    </span>
                    <span className="text-sm text-gray-400">streak</span>
                  </div>
                  <div className="w-px h-5 bg-gray-600"></div>
                  <div className="text-sm font-medium text-blue-400">
                    {getRankInfo().icon} {getRankInfo().rank}
                  </div>
                </div>
              )}

              {/* Stats Toggle Button */}
              {user && (
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="p-3 bg-gray-800/50 hover:bg-gray-800/80 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                    />
                  </svg>
                </button>
              )}

              {user && user.role === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 flex items-center space-x-2"
                >
                  <span>Admin</span>
                </button>
              )}



              {/* User Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-3 bg-gray-800/50 hover:bg-gray-800/80 rounded-xl px-4 py-2 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.charAt(0) || "G"}
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    {user?.firstName || "Guest"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2">
                    <div className="space-y-1">
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 rounded-xl transition-all duration-200 flex items-center space-x-3 group/item"
                      >
                        <div className="w-8 h-8 bg-gray-700/50 group-hover/item:bg-purple-500/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                            />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Profile</span>
                          <span className="text-xs text-gray-500">
                            View and edit profile
                          </span>
                        </div>
                      </button>

                      <div className="border-t border-gray-700/50 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 flex items-center space-x-3 group/item"
                      >
                        <div className="w-8 h-8 bg-gray-700/50 group-hover/item:bg-red-500/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                            />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Logout</span>
                          <span className="text-xs text-gray-500">
                            Sign out of your account
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
            Code Your Way Forward
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Master algorithms and data structures with our curated collection of
            coding challenges
          </p>

          {/* Enhanced Progress Dashboard */}
          {user && (
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Overall Progress Card */}
                <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Overall Progress
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${
                        getRankInfo().color
                      } text-white shadow-lg`}
                    >
                      {getRankInfo().icon} {getRankInfo().rank}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 font-medium">
                      Problems Solved
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {solvedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4 overflow-hidden relative">
                    <div
                      className={`h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-2000 shadow-lg shadow-green-500/30 relative overflow-hidden ${
                        animateProgress ? "animate-pulse" : ""
                      }`}
                      style={{
                        width: animateProgress ? `${solvedPercentage}%` : "0%",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {Math.round(solvedPercentage)}% complete
                    </span>
                    <span className="text-green-400 font-medium">
                      +{getStreakInfo()} day streak 🔥
                    </span>
                  </div>
                </div>

                {/* Streak Card */}
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/30 group transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/30">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {getStreakInfo()}
                    </div>
                    <div className="text-sm text-gray-400">Day Streak</div>
                  </div>
                </div>

                {/* Achievement Card */}
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 group transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M15.75 4.5V2.25a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5V4.5m11.25 0a2.25 2.25 0 0 1 2.25 2.25v10.125a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25H15.75Z"
                        />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {Math.floor(solvedPercentage / 10)}
                    </div>
                    <div className="text-sm text-gray-400">Achievements</div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats Panel (Toggleable) */}
              {showStats && user && (
                <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 animate-fadeIn">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 mr-2 text-purple-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                      />
                    </svg>
                    Detailed Statistics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Easy Problems */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-green-400 font-medium">Easy</span>
                        <span className="text-white font-bold">
                          {difficultyStats.easy.solved}/
                          {difficultyStats.easy.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              difficultyStats.easy.total > 0
                                ? (difficultyStats.easy.solved /
                                    difficultyStats.easy.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Medium Problems */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-amber-400 font-medium">
                          Medium
                        </span>
                        <span className="text-white font-bold">
                          {difficultyStats.medium.solved}/
                          {difficultyStats.medium.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              difficultyStats.medium.total > 0
                                ? (difficultyStats.medium.solved /
                                    difficultyStats.medium.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Hard Problems */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-red-400 font-medium">Hard</span>
                        <span className="text-white font-bold">
                          {difficultyStats.hard.solved}/
                          {difficultyStats.hard.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              difficultyStats.hard.total > 0
                                ? (difficultyStats.hard.solved /
                                    difficultyStats.hard.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Filters */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 mr-2 text-purple-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                />
              </svg>
              Filter Problems
            </h3>

            <div className="text-sm text-gray-400">
              Showing {filteredProblems.length} of {totalCount} problems
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="mb-6">
              <div className="relative ">
                <div className="absolute inset-y-0 left-0 mt-4 pl-4  flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search problems by title, tags, or keywords..."
                  className="w-full mt-4 bg-gray-800/80 border border-gray-600/50 rounded-xl pl-12 pr-8 py-4 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-lg"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters({ ...filters, search: "" })}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                className="w-full bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                }}
              >
                <option value="all">All Problems</option>
                <option value="solved">Solved Problems</option>
                <option value="unsolved">Unsolved Problems</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                className="w-full bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                value={filters.difficulty}
                onChange={(e) => {
                  setFilters({ ...filters, difficulty: e.target.value });
                }}
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <select
                className="w-full bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                value={filters.tags}
                onChange={(e) => {
                  setFilters({ ...filters, tags: e.target.value });
                }}
              >
                <option value="all">All Tags</option>
                <option value="Array">Array</option>
                <option value="String">String</option>
                <option value="LinkedList">LinkedList</option>
                <option value="Stack">Stack</option>
                <option value="Queue">Queue</option>
                <option value="Heap">Heap</option>
                <option value="Graph">Graph</option>
                <option value="DP">DP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Problems List */}
        <div className="space-y-4">
          {filteredProblems.map((problem, index) => {
            const isSolved = solvedProblems.some(
              (sp) => sp._id === problem._id
            );
            return (
              <div
                key={problem._id}
                className={`group relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-500 hover:scale-[1.01] hover:bg-gray-800/60 ${
                  hoveredCard === problem._id
                    ? "shadow-2xl shadow-purple-500/20"
                    : "hover:shadow-xl hover:shadow-gray-900/50"
                } ${isSolved ? "bg-green-900/10 border-green-700/30" : ""}`}
                onMouseEnter={() => setHoveredCard(problem._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                {isSolved && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5 rounded-2xl"></div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Enhanced Status Indicator */}
                      {isSolved ? (
                        <div className="relative">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/40 group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-4 h-4 text-white"
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
                          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-gray-500/60 group-hover:border-gray-400 transition-all duration-300 relative flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-gray-600/30 group-hover:bg-gray-500/50 transition-colors duration-300"></div>
                        </div>
                      )}

                      {/* Enhanced Problem Number */}
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-700/50 rounded-xl border border-gray-600/30 group-hover:bg-gray-700/80 group-hover:border-gray-500/50 transition-all duration-300 group-hover:shadow-lg">
                        <span className="text-gray-300 text-lg font-bold group-hover:text-white transition-colors duration-300">
                          {index + 1}
                        </span>
                      </div>

                      {/* Enhanced Problem Title */}
                      <div className="flex flex-col">
                        <h2
                          className="text-xl font-semibold text-white hover:text-transparent hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-400 hover:bg-clip-text cursor-pointer transition-all duration-300 group-hover:scale-105 transform-gpu flex items-center"
                          onClick={() => navigate(`/problem/${problem._id}`)}
                        >
                          {problem.title}
                          {isSolved && (
                            <span className="ml-2 text-green-400 text-sm">
                              ✓ Solved
                            </span>
                          )}
                        </h2>
                        <div className="flex items-center mt-1 space-x-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-3 h-3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                              />
                            </svg>
                            <span>Problem #{index + 1}</span>
                          </div>
                          {isSolved && (
                            <div className="flex items-center space-x-1 text-xs text-green-400">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Button */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => navigate(`/problem/${problem._id}`)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                      >
                        <span>{isSolved ? "Review" : "Solve"}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Tags and Difficulty */}
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    {/* Enhanced Difficulty Badge */}
                    <div
                      className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all duration-300 ${getDifficultyStyle(
                        problem.difficulty
                      )}`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getDifficultyDot(
                            problem.difficulty
                          )}`}
                        ></div>
                        <span>{problem.difficulty}</span>
                      </div>
                    </div>

                    {/* Enhanced Tags */}
                    {Array.isArray(problem.tags) ? (
                      problem.tags.map((tag, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 text-sm font-medium hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-300 transition-all duration-300 cursor-default hover:scale-105 hover:shadow-lg"
                        >
                          #{tag}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-300 text-sm font-medium hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-300 transition-all duration-300 cursor-default hover:scale-105 hover:shadow-lg">
                        #{problem.tags}
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                <div
                  className="absolute top-6 right-6 w-1 h-1 bg-blue-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Empty State */}
        {filteredProblems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-300 mb-4">
              No problems found
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              Try adjusting your filters to see more results
            </p>
            <button
              onClick={() =>
                setFilters({ difficulty: "all", status: "all", tags: "all" })
              }
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

const getDifficultyStyle = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 shadow-lg shadow-green-500/10";
    case "medium":
      return "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 shadow-lg shadow-amber-500/10";
    case "hard":
      return "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 shadow-lg shadow-red-500/10";
    default:
      return "bg-gray-600/10 border-gray-600/30 text-gray-400 hover:bg-gray-600/20 hover:border-gray-600/50";
  }
};

const getDifficultyDot = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-500 animate-pulse";
    case "medium":
      return "bg-amber-500 animate-pulse";
    case "hard":
      return "bg-red-500 animate-pulse";
    default:
      return "bg-gray-500";
  }
};

const getRankInfo = () => {
  const solvedCount = 0; // This will be calculated based on actual data
  const totalCount = 100; // This will be calculated based on actual data
  const solvedPercentage =
    totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  if (solvedPercentage >= 80)
    return { rank: "Expert", color: "from-purple-500 to-pink-500", icon: "👑" };
  if (solvedPercentage >= 60)
    return { rank: "Advanced", color: "from-blue-500 to-cyan-500", icon: "🚀" };
  if (solvedPercentage >= 40)
    return {
      rank: "Intermediate",
      color: "from-green-500 to-emerald-500",
      icon: "⭐",
    };
  if (solvedPercentage >= 20)
    return {
      rank: "Beginner",
      color: "from-yellow-500 to-orange-500",
      icon: "🌟",
    };
  return { rank: "Newbie", color: "from-gray-500 to-gray-600", icon: "🔥" };
};

export default HomePage;
