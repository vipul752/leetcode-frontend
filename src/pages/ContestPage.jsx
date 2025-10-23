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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-purple-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-violet-900/30 rounded-full"></div>
            <div
              className="absolute inset-2 border-4 border-b-violet-500 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-purple-300 text-xl font-semibold mb-2">
            Loading Contest
          </p>
          <p className="text-purple-500/60 text-sm">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-purple-950/30 to-violet-950/30 p-16 rounded-3xl border border-purple-800/30 backdrop-blur-xl">
          <Trophy className="w-24 h-24 text-purple-700 mx-auto mb-6" />
          <p className="text-purple-300 text-3xl font-bold mb-3">
            Contest not found
          </p>
          <p className="text-purple-500/70 text-lg">
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
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      dot: "bg-blue-500",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
      icon: <Calendar className="w-5 h-5" />,
    },
    Live: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      dot: "bg-emerald-500 animate-pulse",
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.4)]",
      icon: <Play className="w-5 h-5" />,
    },
    Ended: {
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      dot: "bg-purple-500",
      glow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-[#0f0a15]/90 backdrop-blur-2xl border-b border-purple-900/30 shadow-[0_8px_32px_rgba(139,92,246,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <Trophy className="w-7 h-7 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent rounded-xl"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                {contest.title}
              </h1>
              <p className="text-sm text-purple-400/70 font-mono">
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
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)] backdrop-blur-xl">
                <Timer className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="font-mono text-sm text-orange-300 font-bold">
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
                    ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50"
                    : "bg-gradient-to-r from-purple-600 to-violet-600 border border-purple-500/30 text-white hover:from-purple-500 hover:to-violet-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
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
        <div className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/40 via-violet-950/40 to-fuchsia-950/40 border border-purple-800/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(139,92,246,0.2)]">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-3xl"></div>

          <div className="relative p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Description */}
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                        About Contest
                      </h2>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-purple-100/90 text-lg leading-relaxed">
                      {contest.description}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 bg-purple-950/30 rounded-xl p-4 border border-purple-800/20 backdrop-blur-sm">
                    <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-400 uppercase font-bold mb-0.5">
                        Start Time
                      </p>
                      <p className="text-sm text-purple-200 font-semibold">
                        {new Date(contest.startTime).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-purple-950/30 rounded-xl p-4 border border-purple-800/20 backdrop-blur-sm">
                    <div className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/30">
                      <Clock className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-400 uppercase font-bold mb-0.5">
                        End Time
                      </p>
                      <p className="text-sm text-purple-200 font-semibold">
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
                <div className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-700/30 shadow-[0_8px_32px_rgba(139,92,246,0.15)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.25)] transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
                      <Code className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-br from-purple-200 to-violet-200 bg-clip-text text-transparent">
                        {contest.problems.length}
                      </p>
                      <p className="text-sm text-purple-300/70 font-medium">
                        Problems
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-700/30 shadow-[0_8px_32px_rgba(139,92,246,0.15)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.25)] transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/30">
                      <Users className="w-7 h-7 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-br from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                        {participantCount}
                      </p>
                      <p className="text-sm text-violet-300/70 font-medium">
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
          <div className="mt-12 relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 rounded-3xl p-10 text-center shadow-[0_8px_40px_rgba(168,85,247,0.4)]">
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
                className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-700 to-fuchsia-600 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:from-purple-600 hover:to-fuchsia-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-200"
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
