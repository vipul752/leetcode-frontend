import { useNavigate } from "react-router";
import {
  Code2,
  Trophy,
  Zap,
  Brain,
  CheckCircle,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Target,
  Flame,
  ArrowRight,
  Star,
  Quote,
} from "lucide-react";
import axiosClient from "../utils/axiosClient";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();

  const [numberOfUsers, setNumberOfUsers] = useState(0);
  const [numberOfContests, setNumberOfContests] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});

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

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-aos]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getAOSClass = (id) => {
    return visibleSections[id]
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-4";
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Minimal Navbar */}
      <header className="relative z-20 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <nav className="flex items-center justify-between">
            {/* Left: Logo + Navigation Links */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                <img
                  src="src/images/codeArena.png"
                  alt="CodeArena Logo"
                  className="w-22 h-16 object-contain rounded-lg shadow-lg"
                />
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => navigate("/challenge")}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium relative group"
                >
                  Problems
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button
                  onClick={() => navigate("/contest")}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium relative group"
                >
                  Contests
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                </button>
                {/* Features Dropdown */}
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1 relative">
                    Features
                    <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl">
                    <button
                      onClick={() => navigate("/challenge")}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
                    >
                      Challenge
                    </button>
                    <button
                      onClick={() => navigate("/ai-interview")}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
                    >
                      AI Interview
                    </button>
                    <button
                      onClick={() => navigate("/resume")}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors rounded-b-lg"
                    >
                      Resume Analyzer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Auth Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-gray-300 hover:text-white text-sm font-medium hover:scale-105 transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div
            id="hero-content"
            data-aos="fade-up"
            className={`transform transition-all duration-700 ${getAOSClass(
              "hero-content"
            )}`}
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit hover:bg-white/10 transition-colors">
                <span className="text-xs font-semibold text-blue-400">
                  ✨ NEW
                </span>
                <span className="text-xs text-gray-300">
                  AI-Powered Interview Prep
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight">
                Practice. Compete. Get Hired.
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed max-w-md">
                Master coding with 1000+ problems, compete globally, and ace
                interviews with AI assistance.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center gap-2"
                >
                  Start Free Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/challenge")}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white rounded-xl font-semibold transition-all duration-300 backdrop-blur-md hover:scale-105 transform"
                >
                  Explore Problems
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-black"
                    ></div>
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  Trusted by{" "}
                  <span className="text-white font-semibold">
                    {numberOfUsers.toLocaleString()}+ developers
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: 3D Laptop Illustration */}
          <div
            id="hero-visual"
            data-aos="fade-up"
            className={`hidden lg:flex items-center justify-center transform transition-all duration-700 ${getAOSClass(
              "hero-visual"
            )}`}
          >
            <div className="relative w-full h-96">
              {/* Laptop mockup with glassmorphism */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Laptop screen - code editor mockup */}
                <div
                  className="w-80 h-56 bg-gradient-to-br from-slate-800 to-slate-900 border-8 border-slate-700 rounded-lg shadow-2xl overflow-hidden transform perspective hover:scale-105 transition-all duration-300"
                  style={{
                    boxShadow:
                      "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                    background:
                      "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  }}
                >
                  {/* Screen content - code lines */}
                  <div className="p-4 h-full flex flex-col justify-between font-mono text-xs">
                    <div className="space-y-2">
                      <div className="text-green-400">
                        {"function"}{" "}
                        <span className="text-blue-400">solve</span>()
                        {"{"}
                      </div>
                      <div className="text-gray-400 ml-4">
                        {"// Practice problems"}
                      </div>
                      <div className="text-orange-300 ml-4">
                        {"return "}
                        <span className="text-purple-400">success</span>
                      </div>
                      <div className="text-green-400">{"}"}</div>
                    </div>
                    {/* Active indicator */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-500 text-[10px]">
                        Live Problem: DSA-001
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating cards around laptop */}
                {/* Top left card */}
                <div className="absolute -top-8 -left-12 w-28 h-24 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-lg hover:scale-110 transition-transform duration-300">
                  <div className="text-green-400 text-xs font-bold mb-1">
                    Accepted
                  </div>
                  <div className="text-white text-sm font-bold">847/1000</div>
                  <div className="text-gray-500 text-xs mt-1">
                    Problems Solved
                  </div>
                </div>

                {/* Bottom right card */}
                <div className="absolute -bottom-8 -right-12 w-28 h-20 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-lg hover:scale-110 transition-transform duration-300">
                  <div className="text-blue-400 text-xs font-bold mb-1">
                    Streak
                  </div>
                  <div className="text-white text-sm font-bold">7 Days</div>
                  <div className="text-gray-500 text-xs mt-1">
                    Current Streak
                  </div>
                </div>

                {/* Top right badge */}
                <div className="absolute -top-4 -right-8 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full flex items-center justify-center backdrop-blur hover:scale-110 transition-transform duration-300">
                  <div className="text-center">
                    <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                    <div className="text-white text-xs font-bold">Expert</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Overview Bar */}
      <section className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "⚡ Fast", desc: "Instant feedback" },
            { label: "🧠 AI-Powered", desc: "Smart learning" },
            { label: "🏆 Contests", desc: "Global ranking" },
            { label: "📝 Resume", desc: "ATS analyzer" },
          ].map((item, i) => (
            <div
              key={i}
              id={`feature-bar-${i}`}
              data-aos="fade-up"
              className={`transform transition-all duration-300 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/50 text-center ${getAOSClass(
                `feature-bar-${i}`
              )}`}
            >
              <div className="text-lg font-bold text-white">{item.label}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div
          id="features-header"
          data-aos="fade-up"
          className={`transform transition-all duration-700 text-center mb-16 ${getAOSClass(
            "features-header"
          )}`}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive tools designed for every stage of your coding journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: "feature-1",
              icon: Code2,
              title: "1000+ Problems",
              desc: "Practice from easy to hard",
              color: "from-blue-500/20 to-blue-500/5",
            },
            {
              id: "feature-2",
              icon: Trophy,
              title: "Weekly Contests",
              desc: "Compete with developers",
              color: "from-amber-500/20 to-amber-500/5",
            },
            {
              id: "feature-3",
              icon: Zap,
              title: "1v1 Challenges",
              desc: "Real-time duels",
              color: "from-purple-500/20 to-purple-500/5",
            },
            {
              id: "feature-4",
              icon: Brain,
              title: "AI Interviews",
              desc: "Practice with AI",
              color: "from-green-500/20 to-green-500/5",
            },
          ].map((feature) => (
            <div
              key={feature.id}
              id={feature.id}
              data-aos="fade-up"
              className={`transform transition-all duration-700 group bg-gradient-to-br ${
                feature.color
              } border border-white/10 rounded-xl p-6 hover:border-white/30 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 ${getAOSClass(
                feature.id
              )}`}
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: numberOfUsers.toLocaleString(), label: "Active Users" },
            { value: numberOfContests, label: "Contests" },
            { value: "1000+", label: "Problems" },
            { value: "4.9/5", label: "Rating" },
          ].map((stat, i) => (
            <div
              key={i}
              id={`stat-${i}`}
              data-aos="fade-up"
              className={`transform transition-all duration-300 text-center p-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 ${getAOSClass(
                `stat-${i}`
              )}`}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div
          id="testimonials-header"
          data-aos="fade-up"
          className={`transform transition-all duration-700 text-center mb-16 ${getAOSClass(
            "testimonials-header"
          )}`}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Loved by Developers
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join thousands of developers who've transformed their coding skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: "testimonial-1",
              text: "CodeArena helped me land my dream job at a top tech company. The problems are well-curated and the AI interviews are incredibly realistic.",
              author: "Sarah Chen",
              role: "Software Engineer at Google",
              rating: 5,
            },
            {
              id: "testimonial-2",
              text: "The contest platform is amazing! I've improved my competitive programming skills significantly. The leaderboard keeps me motivated.",
              author: "Raj Patel",
              role: "Competitive Programmer",
              rating: 5,
            },
            {
              id: "testimonial-3",
              text: "As a career switcher, this platform was exactly what I needed. The learning roadmap guided me perfectly from beginner to being job-ready.",
              author: "Emily Rodriguez",
              role: "Senior Developer at Microsoft",
              rating: 5,
            },
          ].map((testimonial) => (
            <div
              key={testimonial.id}
              id={testimonial.id}
              data-aos="fade-up"
              className={`transform transition-all duration-300 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/50 hover:bg-white/10 ${getAOSClass(
                testimonial.id
              )}`}
            >
              <Quote className="w-5 h-5 text-blue-400 mb-3 opacity-50" />
              <p className="text-gray-300 mb-4 leading-relaxed">
                {testimonial.text}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who is this for? Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div
          id="who-header"
          data-aos="fade-up"
          className={`transform transition-all duration-700 text-center mb-16 ${getAOSClass(
            "who-header"
          )}`}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Who is this for?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Whether you're just starting or already a pro, CodeArena has
            something for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: "persona-1",
              icon: GraduationCap,
              title: "Students",
              desc: "Preparing for placements and campus interviews",
              color: "blue",
            },
            {
              id: "persona-2",
              icon: Briefcase,
              title: "Professionals",
              desc: "Improving DSA and staying competitive",
              color: "amber",
            },
            {
              id: "persona-3",
              icon: Target,
              title: "Job Seekers",
              desc: "Mastering mock interviews and resume reviews",
              color: "purple",
            },
            {
              id: "persona-4",
              icon: Flame,
              title: "Competitive Coders",
              desc: "Competing in contests and leaderboards",
              color: "red",
            },
          ].map((persona) => {
            const colorMap = {
              blue: {
                bg: "from-blue-500/20 to-blue-500/5",
                border: "hover:border-blue-400/50",
                text: "text-blue-400",
              },
              amber: {
                bg: "from-amber-500/20 to-amber-500/5",
                border: "hover:border-amber-400/50",
                text: "text-amber-400",
              },
              purple: {
                bg: "from-purple-500/20 to-purple-500/5",
                border: "hover:border-purple-400/50",
                text: "text-purple-400",
              },
              red: {
                bg: "from-red-500/20 to-red-500/5",
                border: "hover:border-red-400/50",
                text: "text-red-400",
              },
            };
            const colors = colorMap[persona.color];

            return (
              <div
                key={persona.id}
                id={persona.id}
                data-aos="fade-up"
                className={`transform transition-all duration-700 group bg-gradient-to-br ${
                  colors.bg
                } border border-white/10 ${
                  colors.border
                } rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105 ${getAOSClass(
                  persona.id
                )}`}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${colors.text}`}
                >
                  <persona.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {persona.title}
                </h3>
                <p className="text-gray-400 text-sm">{persona.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Learning Roadmap Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div
          id="roadmap-header"
          data-aos="fade-up"
          className={`transform transition-all duration-700 text-center mb-16 ${getAOSClass(
            "roadmap-header"
          )}`}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Learning Roadmap
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Structured pathway from beginner to industry-ready professional
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-12 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent"></div>

          {/* Roadmap steps */}
          <div className="space-y-8 md:space-y-12">
            {[
              {
                step: "1",
                title: "Beginner Fundamentals",
                desc: "Start with basic DSA problems and concepts",
              },
              {
                step: "2",
                title: "Intermediate Level",
                desc: "Solve advanced algorithms and data structures",
              },
              {
                step: "3",
                title: "Advanced Mastery",
                desc: "Tackle competitive programming challenges",
              },
              {
                step: "4",
                title: "Interview Prep",
                desc: "Practice mock interviews with AI",
              },
              {
                step: "5",
                title: "Resume Review",
                desc: "Optimize your resume with ATS analysis",
              },
              {
                step: "6",
                title: "Job Ready",
                desc: "Get matched with opportunities",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                id={`roadmap-${idx}`}
                data-aos="fade-up"
                className={`transform transition-all duration-700 md:flex items-center ${getAOSClass(
                  `roadmap-${idx}`
                )}`}
              >
                {idx % 2 === 0 ? (
                  <>
                    <div className="flex-1 md:text-right md:pr-12">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold relative z-10 mx-auto my-8 md:my-0 border-4 border-black">
                      {item.step}
                    </div>
                    <div className="flex-1 md:pl-12"></div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 md:pr-12"></div>
                    <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold relative z-10 mx-auto my-8 md:my-0 border-4 border-black">
                      {item.step}
                    </div>
                    <div className="flex-1 md:pl-12 md:text-left">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto text-center">
        <div
          id="final-cta"
          data-aos="fade-up"
          className={`transform transition-all duration-700 ${getAOSClass(
            "final-cta"
          )}`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Level Up?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who've transformed their coding skills
            and landed their dream jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center gap-2 justify-center"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/challenge")}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white rounded-xl font-semibold transition-all duration-300 backdrop-blur-md hover:scale-105 transform"
            >
              Explore Problems
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 max-w-7xl mx-auto border-t border-white/10 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">CodeArena</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <button
              onClick={() => navigate("/challenge")}
              className="hover:text-white transition-colors"
            >
              Problems
            </button>
            <button
              onClick={() => navigate("/contest")}
              className="hover:text-white transition-colors"
            >
              Contests
            </button>
            <button
              onClick={() => navigate("/ai-interview")}
              className="hover:text-white transition-colors"
            >
              AI Interview
            </button>
            <span>© 2025 CodeArena. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
