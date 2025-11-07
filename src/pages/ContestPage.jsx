import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import {
  Clock,
  Calendar,
  Trophy,
  Code,
  Zap,
  Users,
  Target,
  ChevronRight,
  Timer,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const ContestPage = () => {
  const { contestId } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Fetch contest data
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await axiosClient.get(`/contest/${contestId}`);
        const contestData = res.data.contest;
        setContest(contestData);

        // Fetch participant count
        const participantsRes = await axiosClient.get(
          `/contest/${contestId}/participants`
        );
        setParticipantCount(participantsRes.data.participantCount || 0);

        // Check if current user is registered
        const userRes = setIsRegistered(res.data.isRegistered);

        const currentUserId = userRes.data._id;
        setIsRegistered(contestData.participants.includes(currentUserId));
      } catch (error) {
        console.error("Failed to fetch contest:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [contestId]);

  // Countdown timer
  useEffect(() => {
    if (!contest) return;

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (now < start) {
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`Starts in ${days}d ${hours}h ${minutes}m`);
      } else if (now >= start && now <= end) {
        const diff = end - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining("Contest ended");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  // Handle registration/unregistration
  const handleRegistration = async () => {
    if (registering) return;

    setRegistering(true);
    try {
      if (isRegistered) {
        await axiosClient.delete(`/contest/unregister/${contestId}`);
        setIsRegistered(false);
        setParticipantCount((prev) => prev - 1);
      } else {
        await axiosClient.post(`/contest/register/${contestId}`);
        setIsRegistered(true);
        setParticipantCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.response?.data?.message || "Failed to update registration");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-violet-200 rounded-full"></div>
            <div
              className="absolute inset-2 border-4 border-b-violet-600 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-purple-700 text-xl font-semibold mb-2">
            Loading Contest
          </p>
          <p className="text-purple-600/60 text-sm">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white/80 p-16 rounded-3xl border border-purple-200 backdrop-blur-xl shadow-lg">
          <Trophy className="w-24 h-24 text-purple-600 mx-auto mb-6" />
          <p className="text-purple-900 text-3xl font-bold mb-3">
            Contest not found
          </p>
          <p className="text-purple-700/70 text-lg">
            The contest you're looking for doesn't exist
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  let status = "Upcoming";
  if (now >= start && now <= end) status = "Live";
  if (now > end) status = "Ended";

  const statusConfig = {
    Upcoming: {
      color: "text-blue-700",
      bg: "bg-blue-100/80",
      border: "border-blue-300/50",
      dot: "bg-blue-600",
      glow: "shadow-md shadow-blue-500/20",
      icon: <Calendar className="w-5 h-5" />,
    },
    Live: {
      color: "text-emerald-700",
      bg: "bg-emerald-100/80",
      border: "border-emerald-300/50",
      dot: "bg-emerald-600 animate-pulse",
      glow: "shadow-md shadow-emerald-500/30",
      icon: <Play className="w-5 h-5" />,
    },
    Ended: {
      color: "text-purple-700",
      bg: "bg-purple-100/80",
      border: "border-purple-300/50",
      dot: "bg-purple-600",
      glow: "shadow-md shadow-purple-500/20",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-fuchsia-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
              <Trophy className="w-7 h-7 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent rounded-xl"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {contest.title}
              </h1>
              <p className="text-sm text-gray-600 font-mono">
                #{contestId?.slice(-8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl ${statusConfig[status].bg} border ${statusConfig[status].border} ${statusConfig[status].glow} backdrop-blur-xl`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${statusConfig[status].dot}`}
              ></div>
              <span
                className={`font-semibold text-sm ${statusConfig[status].color}`}
              >
                {status}
              </span>
            </div>
            {status === "Live" && (
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-orange-100/80 border border-orange-300/50 shadow-md shadow-orange-500/20 backdrop-blur-xl">
                <Timer className="w-4 h-4 text-orange-600 animate-pulse" />
                <span className="font-mono text-sm text-orange-700 font-bold">
                  {timeRemaining}
                </span>
              </div>
            )}
            {status !== "Ended" && (
              <button
                onClick={handleRegistration}
                disabled={registering}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isRegistered
                    ? "bg-rose-100/80 border border-rose-300/50 text-rose-700 hover:bg-rose-200/80 hover:border-rose-400/60"
                    : "bg-gradient-to-r from-purple-600 to-violet-600 border border-purple-500/30 text-white hover:from-purple-500 hover:to-violet-500 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {registering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : isRegistered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Unregister</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Register Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="mb-10 relative overflow-hidden rounded-3xl bg-white/90 border border-gray-200 backdrop-blur-xl shadow-md">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-200/30 to-transparent rounded-full blur-3xl"></div>

          <div className="relative p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Description */}
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2.5 bg-purple-100/80 rounded-lg border border-purple-300/50">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-sm font-bold text-purple-700 uppercase tracking-wider">
                        About Contest
                      </h2>
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {contest.description}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 bg-gray-50/80 rounded-xl p-4 border border-gray-200 backdrop-blur-sm">
                    <div className="p-2.5 bg-emerald-100/80 rounded-lg border border-emerald-300/50">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-bold mb-0.5">
                        Start Time
                      </p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {new Date(contest.startTime).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50/80 rounded-xl p-4 border border-gray-200 backdrop-blur-sm">
                    <div className="p-2.5 bg-rose-100/80 rounded-lg border border-rose-300/50">
                      <Clock className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-bold mb-0.5">
                        End Time
                      </p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {new Date(contest.endTime).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-100/80 to-violet-100/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-200/50 rounded-xl border border-purple-300/50">
                      <Code className="w-7 h-7 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-br from-purple-700 to-violet-700 bg-clip-text text-transparent">
                        {contest.problems.length}
                      </p>
                      <p className="text-sm text-purple-700/70 font-medium">
                        Problems
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-100/80 to-fuchsia-100/80 backdrop-blur-xl rounded-2xl p-6 border border-violet-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-violet-200/50 rounded-xl border border-violet-300/50">
                      <Users className="w-7 h-7 text-violet-700" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-br from-violet-700 to-fuchsia-700 bg-clip-text text-transparent">
                        {participantCount}
                      </p>
                      <p className="text-sm text-violet-700/70 font-medium">
                        Participants
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {status === "Live" && (
          <div className="mt-12 relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 rounded-3xl p-10 text-center shadow-lg shadow-purple-500/40">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative">
              <Zap className="w-16 h-16 text-white mx-auto mb-5 animate-pulse" />
              <h3 className="text-3xl font-bold text-white mb-3">
                Contest is Live Now! 🔥
              </h3>
              <p className="text-purple-100 text-lg mb-7">
                Join {participantCount} participants and start solving problems
                to win
              </p>

              {/* 👇 New Button to Go to Contest Problems Page */}
              <a
                href={`/contest/${contestId}/problems`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-700 to-fuchsia-600 rounded-xl shadow-md shadow-purple-900/40 hover:from-purple-600 hover:to-fuchsia-500 hover:shadow-lg hover:shadow-purple-900/50 transition-all duration-200"
              >
                <Trophy className="w-5 h-5" />
                Go to Problems
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestPage;
