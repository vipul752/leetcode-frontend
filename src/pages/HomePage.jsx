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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Enhanced Navigation - Responsive */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NavLink
                to="/"
                className="flex items-center space-x-2 sm:space-x-3 group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                    />
                  </svg>
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                  CodeArena
                </span>
              </NavLink>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 bg-white/80 hover:bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-600"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>

              <button
                onClick={() => navigate("/contest")}
                className="flex relative px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 items-center space-x-1 sm:space-x-2 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M15.75 4.5V2.25a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5V4.5m11.25 0a2.25 2.25 0 0 1 2.25 2.25v10.125a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25H15.75Z"
                  />
                </svg>
                <span className="relative z-10 hidden sm:inline">Contest</span>
                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              </button>

              <button
                onClick={() => navigate("/challenge")}
                className="hidden md:flex relative px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 items-center space-x-1 sm:space-x-2 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M15.75 4.5V2.25a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5V4.5m11.25 0a2.25 2.25 0 0 1 2.25 2.25v10.125a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25H15.75Z"
                  />
                </svg>
                <span className="relative z-10 hidden sm:inline">
                  Challenge
                </span>
                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              </button>

              <button
                onClick={() => navigate("/ai-interview")}
                className="hidden lg:flex relative px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 items-center space-x-1 sm:space-x-2 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                <span className="relative z-10 hidden sm:inline">
                  AI Interview
                </span>
                <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  NEW
                </div>
              </button>
              {/* Enhanced Quick Stats - Responsive */}
              {user && (
                <div className="hidden xl:flex items-center space-x-4 bg-white/80 rounded-xl px-4 lg:px-6 py-2 lg:py-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">
                      {solvedCount}
                    </span>
                    <span className="text-sm text-gray-600">solved</span>
                  </div>
                  <div className="w-px h-5 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-purple-600">
                      {getStreakInfo()}
                    </span>
                    <span className="text-sm text-gray-600">streak</span>
                  </div>
                  <div className="w-px h-5 bg-gray-300"></div>
                  <div className="text-sm font-medium text-blue-600">
                    {getRankInfo().icon} {getRankInfo().rank}
                  </div>
                </div>
              )}

              {/* Stats Toggle Button - Responsive */}
              {user && (
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="p-2 sm:p-3 bg-white/80 hover:bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-300 group shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-purple-600 transition-colors duration-300"
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
                  className="hidden sm:flex px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 items-center space-x-2"
                >
                  <span>Admin</span>
                </button>
              )}

              {/* User Dropdown - Responsive */}
              <div className="relative group">
                <button className="flex items-center space-x-2 sm:space-x-3 bg-white/80 hover:bg-white rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md sm:rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.charAt(0) || "G"}
                    </span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {user?.firstName || "Guest"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors duration-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2">
                    <div className="space-y-1">
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all duration-200 flex items-center space-x-3 group/item"
                      >
                        <div className="w-8 h-8 bg-gray-100 group-hover/item:bg-purple-100 rounded-lg flex items-center justify-center transition-colors duration-200">
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

                      <div className="border-t border-gray-200 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 flex items-center space-x-3 group/item"
                      >
                        <div className="w-8 h-8 bg-gray-100 group-hover/item:bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200">
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

        {/* Mobile Menu - Slide from top */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg animate-fadeIn">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  navigate("/contest");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 rounded-xl font-medium transition-all duration-300"
              >
                <span className="flex items-center gap-2">
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
                      d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M15.75 4.5V2.25a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5V4.5m11.25 0a2.25 2.25 0 0 1 2.25 2.25v10.125a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25H15.75Z"
                    />
                  </svg>
                  Contest
                </span>
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
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  navigate("/challenge");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 rounded-xl font-medium transition-all duration-300"
              >
                <span className="flex items-center gap-2">
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
                      d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M15.75 4.5V2.25a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5V4.5m11.25 0a2.25 2.25 0 0 1 2.25 2.25v10.125a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25H15.75Z"
                    />
                  </svg>
                  Challenge
                </span>
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
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  navigate("/ai-interview");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 rounded-xl font-medium transition-all duration-300"
              >
                <span className="flex items-center gap-2">
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
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                  AI Interview
                  <span className="ml-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                </span>
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
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>

              {user && user.role === "admin" && (
                <button
                  onClick={() => {
                    navigate("/admin");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-red-700 rounded-xl font-medium transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
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
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                    Admin Panel
                  </span>
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
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section - Responsive */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight px-4">
            Code Your Way Forward
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
            Master algorithms and data structures with our curated collection of
            coding challenges
          </p>

          {/* Enhanced Progress Dashboard - Responsive */}
          {user && (
            <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {/* Overall Progress Card - Responsive */}
                <div className="sm:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Overall Progress
                    </h3>
                    <div
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r ${
                        getRankInfo().color
                      } text-white shadow-md`}
                    >
                      {getRankInfo().icon}{" "}
                      <span className="hidden sm:inline">
                        {getRankInfo().rank}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-base sm:text-lg text-gray-700 font-semibold">
                      Problems Solved
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {solvedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 sm:h-5 mb-4 sm:mb-5 overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-2000 shadow-md shadow-green-500/30 relative overflow-hidden ${
                        animateProgress ? "animate-pulse" : ""
                      }`}
                      style={{
                        width: animateProgress ? `${solvedPercentage}%` : "0%",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600 font-medium">
                      {Math.round(solvedPercentage)}% complete
                    </span>
                    <span className="text-green-700 font-bold">
                      +{getStreakInfo()} day streak 🔥
                    </span>
                  </div>
                </div>

                {/* Streak Card - Responsive */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-orange-200 hover:border-orange-300 group transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/30">
                      <span className="text-2xl sm:text-3xl">🔥</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                      {getStreakInfo()}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium">
                      Day Streak
                    </div>
                  </div>
                </div>

                {/* Achievement Card - Responsive */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-purple-200 hover:border-purple-300 group transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M15.75 4.5V2.25a1.5 1.5 0 0 0-1.5-1.5h-6a1.5 1.5 0 0 0-1.5 1.5V4.5m11.25 0a2.25 2.25 0 0 1 2.25 2.25v10.125a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25H15.75Z"
                        />
                      </svg>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                      {Math.floor(solvedPercentage / 10)}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium">
                      Achievements
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats Panel (Toggleable) - Responsive */}
              {showStats && user && (
                <div className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 animate-fadeIn shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-7 h-7 mr-3 text-purple-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                      />
                    </svg>
                    Detailed Statistics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Easy Problems */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-green-700 font-bold text-lg">
                          Easy
                        </span>
                        <span className="text-gray-900 font-bold text-xl">
                          {difficultyStats.easy.solved}/
                          {difficultyStats.easy.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 shadow-sm"
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
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-amber-700 font-bold text-lg">
                          Medium
                        </span>
                        <span className="text-gray-900 font-bold text-xl">
                          {difficultyStats.medium.solved}/
                          {difficultyStats.medium.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
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
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-red-700 font-medium">Hard</span>
                        <span className="text-gray-900 font-bold">
                          {difficultyStats.hard.solved}/
                          {difficultyStats.hard.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
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

        {/* Enhanced Filters - Responsive */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                />
              </svg>
              Filter Problems
            </h3>

            <div className="text-xs sm:text-sm text-gray-600">
              Showing {filteredProblems.length} of {totalCount} problems
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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
                  placeholder="Search problems..."
                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 shadow-sm"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters({ ...filters, search: "" })}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Status
              </label>
              <select
                className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 shadow-sm"
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Difficulty
              </label>
              <select
                className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 shadow-sm"
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Tags
              </label>
              <select
                className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 shadow-sm"
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

        {/* Enhanced Problems List - Responsive */}
        <div className="space-y-3 sm:space-y-4">
          {filteredProblems.map((problem, index) => {
            const isSolved = solvedProblems.some(
              (sp) => sp._id === problem._id
            );
            return (
              <div
                key={problem._id}
                className={`group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-500 hover:scale-[1.01] hover:bg-white ${
                  hoveredCard === problem._id
                    ? "shadow-xl shadow-purple-500/20"
                    : "hover:shadow-lg hover:shadow-gray-200"
                } ${isSolved ? "bg-green-50 border-green-300" : ""}`}
                onMouseEnter={() => setHoveredCard(problem._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl"></div>
                {isSolved && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-emerald-100/30 rounded-xl sm:rounded-2xl"></div>
                )}

                <div className="relative z-10">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      {/* Enhanced Status Indicator - Responsive */}
                      {isSolved ? (
                        <div className="relative flex-shrink-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-500/40 group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 text-white"
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
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-gray-400 group-hover:border-gray-600 transition-all duration-300 relative flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors duration-300"></div>
                        </div>
                      )}

                      {/* Enhanced Problem Number - Responsive */}
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg sm:rounded-xl border border-gray-200 group-hover:bg-gray-200 group-hover:border-gray-300 transition-all duration-300 group-hover:shadow-sm flex-shrink-0">
                        <span className="text-gray-700 text-base sm:text-lg font-bold group-hover:text-gray-900 transition-colors duration-300">
                          {index + 1}
                        </span>
                      </div>

                      {/* Enhanced Problem Title - Responsive */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <h2
                          className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:bg-clip-text cursor-pointer transition-all duration-300 group-hover:scale-105 transform-gpu flex items-center truncate"
                          onClick={() => navigate(`/problem/${problem._id}`)}
                        >
                          <span className="sm:hidden text-gray-600 mr-2 flex-shrink-0">
                            #{index + 1}
                          </span>
                          <span className="truncate">{problem.title}</span>
                          {isSolved && (
                            <span className="ml-2 text-green-700 text-xs sm:text-sm flex-shrink-0">
                              ✓ <span className="hidden sm:inline">Solved</span>
                            </span>
                          )}
                        </h2>
                        <div className="flex items-center mt-1 space-x-2 text-xs text-gray-600">
                          <div className="hidden sm:flex items-center space-x-1">
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
                            <div className="flex items-center space-x-1 text-green-700">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Button - Responsive */}
                    <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:transform sm:translate-x-4 sm:group-hover:translate-x-0 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/problem/${problem._id}`)}
                        className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                      >
                        <span>{isSolved ? "Review" : "Solve"}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3 h-3 sm:w-4 sm:h-4"
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

                  {/* Enhanced Tags and Difficulty - Responsive */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                    {/* Enhanced Difficulty Badge - Responsive */}
                    <div
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm border transition-all duration-300 ${getDifficultyStyle(
                        problem.difficulty
                      )}`}
                    >
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <div
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getDifficultyDot(
                            problem.difficulty
                          )}`}
                        ></div>
                        <span>{problem.difficulty}</span>
                      </div>
                    </div>

                    {/* Enhanced Tags - Responsive */}
                    {Array.isArray(problem.tags) ? (
                      problem.tags.slice(0, 3).map((tag, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-100 border border-gray-200 rounded-md sm:rounded-lg text-gray-700 text-xs sm:text-sm font-medium hover:bg-purple-100 hover:border-purple-300 hover:text-purple-700 transition-all duration-300 cursor-default hover:scale-105 hover:shadow-sm"
                        >
                          #{tag}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-100 border border-gray-200 rounded-md sm:rounded-lg text-gray-700 text-xs sm:text-sm font-medium hover:bg-purple-100 hover:border-purple-300 hover:text-purple-700 transition-all duration-300 cursor-default hover:scale-105 hover:shadow-sm">
                        #{problem.tags}
                      </div>
                    )}
                    {Array.isArray(problem.tags) && problem.tags.length > 3 && (
                      <div className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-100 border border-gray-200 rounded-md sm:rounded-lg text-gray-600 text-xs sm:text-sm font-medium">
                        +{problem.tags.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                <div
                  className="absolute top-6 right-6 w-1 h-1 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Empty State */}
        {filteredProblems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-sm">
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
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No problems found
            </h3>
            <p className="text-gray-600 text-lg mb-6">
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
      return "bg-green-100 border-green-300 text-green-700 hover:bg-green-200 hover:border-green-400 shadow-sm";
    case "medium":
      return "bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200 hover:border-amber-400 shadow-sm";
    case "hard":
      return "bg-red-100 border-red-300 text-red-700 hover:bg-red-200 hover:border-red-400 shadow-sm";
    default:
      return "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400";
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

export default HomePage;
