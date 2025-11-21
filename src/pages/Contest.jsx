import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { use } from "react";

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [contestStats, setContestStats] = useState({});
  const [userContests, setUserContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axiosClient.get(`/contest/getAllContests`);
        const contestsData = res.data.contests;
        setContests(contestsData);

        const statsPromises = contestsData.map(async (contest) => {
          try {
            const [participantsRes, problemsRes] = await Promise.all([
              axiosClient.get(`/contest/${contest._id}/participants`),
              axiosClient.get(`/contest/${contest._id}/problemCount`),
            ]);

            return {
              id: contest._id,
              participantCount: participantsRes.data.participantCount || 0,
              problemCount: problemsRes.data.problemCount || 0,
            };
          } catch (error) {
            console.error(
              `Failed to fetch stats for contest ${contest._id}:`,
              error
            );
            return {
              id: contest._id,
              participantCount: 0,
              problemCount: 0,
            };
          }
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        statsResults.forEach((stat) => {
          statsMap[stat.id] = {
            participantCount: stat.participantCount,
            problemCount: stat.problemCount,
          };
        });
        setContestStats(statsMap);
      } catch (error) {
        console.error("Failed to fetch contests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  useEffect(() => {
    const fetchUserContests = async (contestId) => {
      try {
        const res = await axiosClient.get(`/contest/${contestId}/user`);
        setUserContests(res.data.contests || []);
      } catch (error) {
        console.error("Failed to fetch user contests:", error);
      }
    };
    fetchUserContests();
  }, []);

  const filteredContests = contests.filter((contest) => {
    if (filter === "all") return true;
    return contest.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case "Live":
        return "bg-emerald-100/80 text-emerald-700 border-emerald-300/50 shadow-emerald-500/20";
      case "Upcoming":
        return "bg-blue-100/80 text-blue-700 border-blue-300/50 shadow-blue-500/20";
      default:
        return "bg-gray-100/80 text-gray-700 border-gray-300/50";
    }
  };

  const getStatusIcon = (status) => {
    if (status === "Live") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>LIVE NOW</span>
        </div>
      );
    }
    return status.toUpperCase();
  };

  // Calculate duration in hours
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      return `${diffMinutes} min`;
    }

    return `${diffHours.toFixed(1)} hours`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                <img
                  src="/src/assets/Screenshot 2025-11-21 at 1.17.46 PM.png"
                  alt="CodeArena Logo"
                  className="h-10 w-22 rounded-md"
                />
              </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CodeArena</h1>
                <p className="text-xs text-gray-600">Compete. Learn. Excel.</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100/80 border border-purple-300/40 rounded-full text-purple-700 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{contests.length} Active Competitions</span>
          </div>

          <h1 className="text-6xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Coding Contests
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sharpen your skills through competitive programming. Join thousands
            of developers solving challenging problems.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200 shadow-sm">
            {["all", "live", "upcoming", "ended"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === tab
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white/80 border border-gray-200 rounded-2xl p-6 animate-pulse shadow-sm"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contest Grid */}
        {!loading && filteredContests.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => {
              const stats = contestStats[contest._id] || {
                participantCount: 0,
                problemCount: 0,
              };

              return (
                <div
                  key={contest._id}
                  className="group relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden hover:border-purple-400/60 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100/0 via-pink-100/0 to-purple-100/0 group-hover:from-purple-100/30 group-hover:via-pink-100/30 group-hover:to-purple-100/30 transition-all duration-500" />

                  <div className="relative p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm backdrop-blur-sm ${getStatusStyles(
                          contest.status
                        )}`}
                      >
                        {getStatusIcon(contest.status)}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span className="text-xs font-medium">
                          {stats.participantCount}
                        </span>
                      </div>
                    </div>

                    {/* Contest Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 line-clamp-2">
                      {contest.title}
                    </h2>

                    {/* Time Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-100/80 border border-purple-200/50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200/60 transition-colors">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">Starts</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {new Date(contest.startTime).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-pink-100/80 border border-pink-200/50 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-200/60 transition-colors">
                          <svg
                            className="w-4 h-4 text-pink-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">Ends</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {new Date(contest.endTime).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contest Details */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-xs">
                          {stats.problemCount}{" "}
                          {stats.problemCount === 1 ? "Problem" : "Problems"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs">
                          {calculateDuration(
                            contest.startTime,
                            contest.endTime
                          )}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <a
                      href={`/contest/${contest._id}`}
                      className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl py-3.5 transition-all duration-300 transform group-hover:scale-[1.02] shadow-md shadow-purple-500/20 hover:shadow-purple-500/40"
                    >
                      {contest.status === "Live"
                        ? "Enter Now"
                        : contest.status === "Upcoming"
                        ? "Register"
                        : "View Results"}
                      <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </a>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredContests.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-300/50">
              <svg
                className="w-10 h-10 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Contests Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filter === "all"
                ? "No contests available at the moment. Check back soon for exciting challenges!"
                : `No ${filter} contests available. Try a different filter.`}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-md shadow-purple-500/20"
              >
                View All Contests
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative border-t border-gray-200 mt-20 bg-white/60">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                CodeArena
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Master competitive programming through challenging contests.
                Join our community of passionate developers.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors"
                  >
                    Practice
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors"
                  >
                    Discuss
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors"
                  >
                    Learn
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Community
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
