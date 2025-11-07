import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

function Profile() {
  const [userStats, setUserStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    age: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user stats
        const { data: statsData } = await axiosClient.get("/problem/userStats");
        setUserStats(statsData);

        // Fetch user profile
        const { data: profileData } = await axiosClient.get("/user/getProfile");
        setUserProfile(profileData.profile);
        setEditForm({
          firstName: profileData.profile.firstName || "",
          lastName: profileData.profile.lastName || "",
          bio: profileData.profile.bio || "",
          location: profileData.profile.location || "",
          age: profileData.profile.age || "",
        });

        setTimeout(() => setIsLoaded(true), 100);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosClient.put("/user/updateProfile", editForm);
      setUserProfile(data.profile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Generate activity heatmap data (last 90 days)
  const generateActivityData = () => {
    const days = 90;
    const today = new Date();
    const activityData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const activity = Math.floor(Math.random() * 6); // Random 0-5 for demo
      activityData.push({
        date: date.toISOString().split("T")[0],
        count: activity,
        level: activity === 0 ? 0 : activity <= 2 ? 1 : activity <= 3 ? 2 : 3,
      });
    }
    return activityData;
  };

  // Skills data based on solved problems
  const getSkillsData = () => {
    if (!userStats) return [];

    const total = userStats.totalSolved || 1;
    return [
      {
        name: "Arrays & Strings",
        level: Math.min(95, (userStats.byDifficulty.Easy || 0) * 10),
        color: "from-blue-500 to-cyan-500",
      },
      {
        name: "Dynamic Programming",
        level: Math.min(90, (userStats.byDifficulty.Hard || 0) * 15),
        color: "from-purple-500 to-pink-500",
      },
      {
        name: "Trees & Graphs",
        level: Math.min(85, (userStats.byDifficulty.Medium || 0) * 8),
        color: "from-green-500 to-emerald-500",
      },
      {
        name: "Algorithms",
        level: Math.min(80, total * 2),
        color: "from-orange-500 to-red-500",
      },
      {
        name: "Data Structures",
        level: Math.min(88, total * 2.5),
        color: "from-indigo-500 to-purple-500",
      },
    ];
  };

  const ActivityCalendar = () => {
    const activityData = generateActivityData();
    const weeks = [];

    for (let i = 0; i < activityData.length; i += 7) {
      weeks.push(activityData.slice(i, i + 7));
    }

    const getColorClass = (level) => {
      switch (level) {
        case 0:
          return "bg-gray-200";
        case 1:
          return "bg-green-300";
        case 2:
          return "bg-green-500";
        case 3:
          return "bg-green-700";
        default:
          return "bg-gray-200";
      }
    };

    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-8 border border-gray-200 mb-8">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-green-900 bg-clip-text text-transparent flex items-center gap-2">
          📅 Activity Calendar
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${getColorClass(
                      day.level
                    )} transition-all hover:scale-125 cursor-pointer`}
                    title={`${day.date}: ${day.count} problems`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4 text-sm text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    );
  };

  const SkillsSection = () => {
    const skills = getSkillsData();

    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-8 border border-gray-200 mb-8">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent flex items-center gap-2">
          ⚡ Skills & Expertise
        </h3>
        <div className="space-y-4">
          {skills.map((skill, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">{skill.name}</span>
                <span className="text-purple-700 font-bold">
                  {skill.level}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out group-hover:opacity-90 shadow-lg`}
                  style={{
                    width: `${skill.level}%`,
                    transitionDelay: `${idx * 100}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, color, icon, delay }) => (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200 p-6 shadow-md transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:border-purple-300 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-100/40 to-pink-100/40"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-3xl">{icon}</span>
        </div>
        <p className={`text-4xl font-bold ${color} mb-2`}>{value}</p>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color
              .replace("text-", "from-")
              .replace("-600", "-500")} ${color
              .replace("text-", "to-")
              .replace(
                "-600",
                "-700"
              )} rounded-full transform origin-left transition-transform duration-1000 ease-out shadow-sm`}
            style={{
              transform: isLoaded ? "scaleX(1)" : "scaleX(0)",
              transitionDelay: `${delay + 300}ms`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  const DifficultyBar = ({ difficulty, count, total, color, delay }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <div
        className={`transform transition-all duration-700 ${
          isLoaded ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className={`font-semibold ${color} flex items-center gap-3`}>
            <div
              className={`w-4 h-4 rounded-full bg-gradient-to-r ${color
                .replace("text-", "from-")
                .replace("-600", "-500")} ${color
                .replace("text-", "to-")
                .replace("-600", "-700")} shadow-md`}
            ></div>
            {difficulty}
          </span>
          <div className="text-right">
            <span className="font-bold text-gray-900 text-lg">{count}</span>
            <span className="text-gray-600 text-sm ml-2">
              ({percentage.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden shadow-inner">
          <div
            className={`h-3 bg-gradient-to-r ${color
              .replace("text-", "from-")
              .replace("-600", "-500")} ${color
              .replace("text-", "to-")
              .replace(
                "-600",
                "-700"
              )} rounded-full transition-all duration-1000 ease-out shadow-sm`}
            style={{
              width: isLoaded ? `${percentage}%` : "0%",
              transitionDelay: `${delay + 200}ms`,
              boxShadow: `0 0 10px ${
                color.includes("green")
                  ? "#10b98180"
                  : color.includes("yellow")
                  ? "#f59e0b80"
                  : "#ef444480"
              }`,
            }}
          ></div>
        </div>
      </div>
    );
  };

  if (!userStats || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 rounded-3xl shadow-lg p-8 border border-gray-200 backdrop-blur-xl">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Loading your profile...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Profile Header */}
        <div
          className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-8 border border-gray-200 mb-8 transform transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                <img
                  src={
                    userProfile.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Profile Avatar"
                  className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              {!isEditing ? (
                <>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-2">
                    {userProfile.firstName} {userProfile.lastName || ""}
                  </h1>
                  <p className="text-purple-600 text-lg mb-3 font-medium">
                    @{userProfile.email.split("@")[0]}
                  </p>
                  {userProfile.bio && (
                    <p className="text-gray-700 text-lg mb-4 max-w-2xl bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                      {userProfile.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start text-gray-600">
                    {userProfile.location && (
                      <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                        📍 {userProfile.location}
                      </span>
                    )}
                    {userProfile.age && (
                      <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                        🎂 {userProfile.age} years old
                      </span>
                    )}
                    <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                      📅 Joined{" "}
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 px-3 py-1.5 rounded-lg text-orange-700 font-semibold">
                      🔥 {userProfile.streak} day streak
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    ✏️ Edit Profile
                  </button>
                </>
              ) : (
                <form
                  onSubmit={handleUpdateProfile}
                  className="space-y-4 text-left"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      className="bg-white text-gray-900 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      className="bg-white text-gray-900 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                  </div>
                  <textarea
                    placeholder="Bio"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    className="w-full bg-white text-gray-900 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                    rows="3"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className="w-full bg-white text-gray-900 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm({ ...editForm, age: e.target.value })
                    }
                    className="w-full bg-white text-gray-900 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  />
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      ✖️ Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 ">
          <StatCard
            title="Problems Solved"
            value={userStats.totalSolved}
            color="text-green-700"
            icon="🏆"
            delay={200}
          />
          <StatCard
            title="Total Submissions"
            value={userStats.totalSubmissions}
            color="text-blue-700"
            icon="📊"
            delay={400}
          />
          <StatCard
            title="Acceptance Rate"
            value={`${userStats.acceptanceRate}%`}
            color="text-purple-700"
            icon="⚡"
            delay={600}
          />
          <StatCard
            title="Current Streak"
            value={userProfile.streak}
            color="text-orange-700"
            icon="🔥"
            delay={800}
          />
        </div>

        {/* New Features: Activity Calendar & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ActivityCalendar />
          <SkillsSection />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Difficulty Breakdown */}
          <div
            className={`lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-8 border border-gray-200 transform transition-all duration-1000 ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "1000ms" }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                📈
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Problem Solving Progress
              </h3>
            </div>

            <div className="space-y-4">
              <DifficultyBar
                difficulty="Easy"
                count={userStats.byDifficulty.Easy || 0}
                total={userStats.totalSolved}
                color="text-green-700"
                delay={1200}
              />
              <DifficultyBar
                difficulty="Medium"
                count={userStats.byDifficulty.Medium || 0}
                total={userStats.totalSolved}
                color="text-yellow-700"
                delay={1400}
              />
              <DifficultyBar
                difficulty="Hard"
                count={userStats.byDifficulty.Hard || 0}
                total={userStats.totalSolved}
                color="text-red-700"
                delay={1600}
              />
            </div>
          </div>

          {/* Recent Activity & Achievements */}
          <div className="space-y-6">
            {/* Achievement Badge */}
            <div
              className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-gray-200 transform transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "1800ms" }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🏅 Achievement
              </h3>
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-3 ${
                    userStats.acceptanceRate >= 80
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : userStats.acceptanceRate >= 60
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gradient-to-r from-gray-400 to-gray-600"
                  } text-white px-6 py-4 rounded-2xl shadow-md`}
                >
                  <span className="text-2xl">
                    {userStats.acceptanceRate >= 80
                      ? "🥇"
                      : userStats.acceptanceRate >= 60
                      ? "🥈"
                      : "🥉"}
                  </span>
                  <div>
                    <div className="font-bold text-lg">
                      {userStats.acceptanceRate >= 80
                        ? "Elite Coder"
                        : userStats.acceptanceRate >= 60
                        ? "Skilled Programmer"
                        : "Rising Talent"}
                    </div>
                    <div className="text-sm opacity-90">
                      {userStats.acceptanceRate}% success rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div
              className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-gray-200 transform transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "2000ms" }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                📊 Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-gray-600 font-medium">
                    Problems Solved
                  </span>
                  <span className="text-green-700 font-bold text-lg">
                    {userProfile.problemSolved.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Account Age</span>
                  <span className="text-blue-700 font-bold text-lg">
                    {Math.floor(
                      (new Date() - new Date(userProfile.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Role</span>
                  <span
                    className={`font-bold px-3 py-1 rounded-lg ${
                      userProfile.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {userProfile.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
