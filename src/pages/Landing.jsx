import { useNavigate } from "react-router";
import {
  Code2,
  Trophy,
  Users,
  Zap,
  Brain,
  Video,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Cpu,
  Target,
  Award,
  TrendingUp,
  Swords,
  Bot,
} from "lucide-react";
import axiosClient from "../utils/axiosClient";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();

  const [numberOfUsers, setNumberOfUsers] = useState(0);
  const [numberOfContests, setNumberOfContests] = useState(0);

  useEffect(() => {
    const handleNoOfUser = async () => {
      try {
        const response = await axiosClient.get("/user/getNoOfUsers");
        setNumberOfUsers(response.data.userCount);
      } catch (error) {
        console.error("Error fetching number of users:", error);
      }
    };

    const handleNoOfContest = async () => {
      try {
        const response = await axiosClient.get("/contest/getNoOfContest");
        setNumberOfContests(response.data.contestCount);
      } catch (error) {
        console.error("Error fetching number of contests:", error);
      }
    };

    handleNoOfUser();
    handleNoOfContest();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black text-white overflow-hidden relative">
      {/* Enhanced Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Main gradient orbs - enhanced with more vibrant colors */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-500/10 to-green-500/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-purple-500/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Additional floating orbs with gradients */}
        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-cyan-500/3 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-purple-500/8 to-pink-500/3 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

        {/* Floating particles with gradients */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-ping opacity-50"></div>
        <div
          className="absolute top-40 right-20 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-50"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-2 h-2 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-ping opacity-50"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-60 right-1/3 w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-ping opacity-50"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Enhanced Header/Navigation */}
      <header className="relative z-20 px-6 py-6 max-w-7xl mx-auto">
        <nav className="flex items-center justify-between backdrop-blur-md bg-gradient-to-r from-white/10 via-purple-500/5 to-blue-500/10 border border-white/20 shadow-lg shadow-purple-500/10 rounded-2xl px-6 py-3 hover:from-white/20 hover:via-purple-500/10 hover:to-blue-500/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl blur-lg opacity-50 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                CodeArena
              </h1>
              <p className="text-[10px] text-purple-300 font-bold tracking-widest">
                MASTER THE CODE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="relative group px-6 py-2.5 bg-gradient-to-r from-white/10 to-purple-500/10 hover:from-white/20 hover:to-purple-500/20 border border-white/20 hover:border-white/40 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-purple-500/20"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-purple-500/5 group-hover:from-white/15 group-hover:to-purple-500/15 rounded-xl transition-all duration-300"></div>
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-black rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-purple-500/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                Sign Up
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            </button>
          </div>
        </nav>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          {/* Floating badge with enhanced animation */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-6 py-2 mb-8 backdrop-blur-sm hover:border-white/40 hover:bg-white/10 shadow-sm transition-all duration-300 hover:scale-105 group cursor-default">
            <Sparkles className="w-4 h-4 text-gray-300 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-sm font-semibold text-gray-300">
              Level Up Your Coding Skills
            </span>
            <Sparkles className="w-4 h-4 text-gray-400 animate-pulse group-hover:-rotate-12 transition-transform duration-300" />
          </div>

          {/* Enhanced hero title */}
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="inline-block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition-transform duration-300">
              Master Coding
            </span>
            <br />
            <span
              className="inline-block bg-gradient-to-r from-purple-400 via-pink-300 to-red-300 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: "0.5s" }}
            >
              Through Practice
            </span>
          </h2>

          <p className="text-xl md:text-2xl bg-gradient-to-r from-gray-300 via-blue-200 to-purple-200 bg-clip-text text-transparent mb-12 max-w-3xl mx-auto leading-relaxed hover:text-gray-300 transition-colors duration-300">
            Solve challenging problems, compete in contests, battle friends in
            real-time challenges, and ace AI-powered video interviews
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => navigate("/signup")}
              className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-black rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 flex items-center gap-3 "
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started Free
                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="group relative px-10 py-5 bg-gradient-to-r from-white/10 to-purple-500/10 hover:from-white/20 hover:to-purple-500/20 border-2 border-purple-400/50 hover:border-purple-300 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg hover:shadow-purple-500/20 overflow-hidden"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-purple-500/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        </div>

        {/* Enhanced Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {/* Feature 1 */}
          <div className="group relative hover:-translate-y-2 transition-all duration-500">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500 animate-pulse"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/30 shadow-lg group-hover:shadow-xl rounded-2xl p-6 h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-gray-400/30 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Target className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200 transition-all duration-300">
                  1000+ Problems
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  Practice coding with curated problems from easy to hard
                  difficulty
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div
            className="group relative hover:-translate-y-2 transition-all duration-500"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400/20 to-white/20 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500 animate-pulse"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/30 shadow-lg group-hover:shadow-xl rounded-2xl p-6 h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-400/5 rounded-full blur-2xl group-hover:bg-gray-400/10 transition-all duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-400/30 to-white/30 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Trophy className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200 transition-all duration-300">
                  Live Contests
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  Compete with developers worldwide in timed coding competitions
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div
            className="group relative hover:-translate-y-2 transition-all duration-500 perspective-1000"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-500/20 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/30 rounded-2xl p-6 h-full overflow-hidden shadow-lg transform-gpu group-hover:scale-105 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 rounded-full blur-2xl group-hover:bg-white/5 transition-all duration-500 group-hover:scale-150"></div>
              <div className="relative transform-gpu group-hover:translate-z-10 transition-transform duration-500">
                <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-gray-500/30 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 transform-gpu">
                  <Swords className="w-7 h-7 text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200 transition-all duration-300">
                  1v1 Challenges
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  Battle friends in real-time coding duels and prove your skills
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div
            className="group relative hover:-translate-y-2 transition-all duration-500 perspective-1000"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400/20 to-white/20 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/30 rounded-2xl p-6 h-full overflow-hidden shadow-lg transform-gpu group-hover:scale-105 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-400/3 rounded-full blur-2xl group-hover:bg-gray-400/5 transition-all duration-500 group-hover:scale-150"></div>
              <div className="relative transform-gpu group-hover:translate-z-10 transition-transform duration-500">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-400/30 to-white/30 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 transform-gpu">
                  <Video className="w-7 h-7 text-white group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200 transition-all duration-300">
                  AI Interviews
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  Practice with AI-powered video interviews and get instant
                  feedback
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              value: numberOfUsers,
              label: "Active Users",
              gradient: "from-white/30 to-gray-400/30",
            },
            {
              icon: Code2,
              value: "1K+",
              label: "Solutions",
              gradient: "from-gray-400/30 to-white/30",
            },
            {
              icon: Trophy,
              value: numberOfContests,
              label: "Contests",
              gradient: "from-white/30 to-gray-400/30",
            },
            {
              icon: Award,
              value: "98%",
              label: "Satisfaction",
              gradient: "from-gray-400/30 to-white/30",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="group relative hover:-translate-y-2 transition-all duration-500 perspective-1000"
            >
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500 animate-pulse`}
              ></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/30 rounded-2xl p-6 text-center overflow-hidden shadow-lg transform-gpu group-hover:scale-105 transition-all duration-500">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/3 rounded-full blur-xl group-hover:bg-white/5 transition-all duration-500 group-hover:scale-150"></div>
                <stat.icon
                  className={`relative w-12 h-12 mx-auto mb-3 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 transform-gpu`}
                  strokeWidth={2}
                />
                <div
                  className={`text-5xl font-black text-white mb-1 group-hover:scale-110 transition-transform duration-300 transform-gpu`}
                >
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
            Everything You Need to Excel
          </h3>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to accelerate your coding journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature Detail 1 */}
          <div className="group relative perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-lg transform-gpu group-hover:scale-105 transition-all duration-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-gray-400/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transform-gpu group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Smart Learning Path
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    Our AI-powered system adapts to your skill level and creates
                    personalized learning paths to help you improve faster
                  </p>
                </div>
              </div>
              <ul className="space-y-3 mt-6">
                {[
                  "Adaptive difficulty",
                  "Progress tracking",
                  "Skill analytics",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Detail 2 */}
          <div className="group relative perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-400/20 to-white/20 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-lg transform-gpu group-hover:scale-105 transition-all duration-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400/30 to-white/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transform-gpu group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Real-time Code Execution
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    Write, test, and debug your code instantly with our powerful
                    online IDE supporting multiple languages
                  </p>
                </div>
              </div>
              <ul className="space-y-3 mt-6">
                {[
                  "Multiple languages",
                  "Instant feedback",
                  "Performance metrics",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Detail 3 */}
          <div className="group relative perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-gray-500/20 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-lg transform-gpu group-hover:scale-105 transition-all duration-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-gray-500/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transform-gpu group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Live Competitions
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    Join weekly contests, climb the leaderboard, and compete
                    with the best developers from around the world
                  </p>
                </div>
              </div>
              <ul className="space-y-3 mt-6">
                {[
                  "Weekly contests",
                  "Global rankings",
                  "Prizes & recognition",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Detail 4 */}
          <div className="group relative perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-500/20 to-white/20 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-lg transform-gpu group-hover:scale-105 transition-all duration-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500/30 to-white/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transform-gpu group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    AI Interview Prep
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    Practice technical interviews with our AI interviewer in
                    live video sessions with real-time feedback
                  </p>
                </div>
              </div>
              <ul className="space-y-3 mt-6">
                {[
                  "Video interviews",
                  "Speech recognition",
                  "Instant feedback",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="group relative perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-gray-400/20 to-white/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse"></div>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-xl transform-gpu group-hover:scale-105 transition-all duration-500">
            <div className="mb-6 transform-gpu group-hover:translate-z-20 transition-transform duration-500">
              <TrendingUp
                className="w-16 h-16 mx-auto text-white mb-4 transform-gpu group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"
                strokeWidth={2}
              />
              <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ready to Level Up?
              </h3>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Join thousands of developers improving their skills every day.
                Start your journey now!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 transform-gpu transition-transform duration-500">
              <button
                onClick={() => navigate("/signup")}
                className="group/cta relative overflow-hidden px-10 py-5 bg-gradient-to-r from-white to-gray-300 text-black rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-white/30 flex items-center gap-3 transform-gpu"
              >
                <span className="relative z-10">Start Free Today</span>
                <ChevronRight className="w-6 h-6 group-hover/cta:translate-x-2 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-10 py-5 bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg transform-gpu"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 max-w-7xl mx-auto border-t border-white/10 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white/30 to-gray-400/30 rounded-lg flex items-center justify-center shadow-md">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-black text-white">CodeArena</div>
              <div className="text-xs text-gray-400">Master The Code</div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm">
            © 2025 CodeArena. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <a
              href="#"
              className="hover:text-white transition-colors duration-300"
            >
              Privacy
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-white transition-colors duration-300"
            >
              Terms
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-white transition-colors duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        /* 3D Transform Styles */
        .perspective-1000 {
          perspective: 1000px;
        }

        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
        }

        .group:hover .transform-gpu {
          transform: translateZ(20px);
        }

        /* 3D Rotation Effects */
        @keyframes rotate3d {
          0% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          50% {
            transform: rotateY(5deg) rotateX(5deg);
          }
          100% {
            transform: rotateY(0deg) rotateX(0deg);
          }
        }

        .group:hover > div > div {
          animation: rotate3d 0.6s ease-in-out;
        }

        /* Enhanced floating animation with 3D effect */
        @keyframes float3d {
          0%,
          100% {
            transform: translateY(0px) translateZ(0px) rotateX(0deg);
          }
          33% {
            transform: translateY(-10px) translateZ(10px) rotateX(2deg);
          }
          66% {
            transform: translateY(-20px) translateZ(20px) rotateX(-2deg);
          }
        }

        .animate-float {
          animation: float3d 6s ease-in-out infinite;
        }

        /* Parallax depth layers */
        @keyframes parallax {
          0% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
          100% {
            transform: translateY(0px) scale(1);
          }
        }

        /* Card tilt on hover */
        .group:hover .relative {
          transform: rotateY(var(--rotate-y, 0deg))
            rotateX(var(--rotate-x, 0deg)) translateZ(30px);
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Enable 3D space for children */
        .group {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default Landing;
