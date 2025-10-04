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

  const StatCard = ({ title, value, color, icon, delay }) => (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-3xl hover:border-${
        color.split("-")[1]
      }-500/50 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-gradient-to-br from-gray-700/20 to-gray-600/20"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className={`text-3xl font-bold ${color} mb-2`}>{value}</p>
        <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color
              .replace("text-", "from-")
              .replace("-400", "-500")} to-${
              color.split("-")[1]
            }-600 rounded-full transform origin-left transition-transform duration-1000 ease-out`}
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
                .replace("-400", "-400")} ${color
                .replace("text-", "to-")
                .replace("-400", "-500")} shadow-lg`}
            ></div>
            {difficulty}
          </span>
          <div className="text-right">
            <span className="font-bold text-white text-lg">{count}</span>
            <span className="text-gray-400 text-sm ml-2">
              ({percentage.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className={`h-3 bg-gradient-to-r ${color
              .replace("text-", "from-")
              .replace("-400", "-400")} ${color
              .replace("text-", "to-")
              .replace(
                "-400",
                "-500"
              )} rounded-full transition-all duration-1000 ease-out`}
            style={{
              width: isLoaded ? `${percentage}%` : "0%",
              transitionDelay: `${delay + 200}ms`,
              boxShadow: `0 0 15px ${
                color.includes("green")
                  ? "#10b981"
                  : color.includes("yellow")
                  ? "#f59e0b"
                  : "#ef4444"
              }40`,
            }}
          ></div>
        </div>
      </div>
    );
  };

  if (!userStats || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Loading your profile...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div
          className={`bg-black rounded-3xl shadow-2xl p-8 border border-gray-700 mb-8 transform transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={
                    userProfile.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Profile Avatar"
                  className="w-32 h-32 rounded-full border-4 border-gray-600 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-800 shadow-lg"></div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              {!isEditing ? (
                <>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {userProfile.firstName} {userProfile.lastName || ""}
                  </h1>
                  <p className="text-blue-400 text-lg mb-3">
                    @{userProfile.email.split("@")[0]}
                  </p>
                  {userProfile.bio && (
                    <p className="text-gray-300 text-lg mb-4 max-w-2xl">
                      {userProfile.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start text-gray-400">
                    {userProfile.location && (
                      <span className="flex items-center gap-2">
                        📍 {userProfile.location}
                      </span>
                    )}
                    {userProfile.age && (
                      <span className="flex items-center gap-2">
                        🎂 {userProfile.age} years old
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      📅 Joined{" "}
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2 text-orange-400">
                      🔥 {userProfile.streak} day streak
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  >
                    Edit Profile
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
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Bio"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none h-24"
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Location"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={editForm.age}
                      onChange={(e) =>
                        setEditForm({ ...editForm, age: e.target.value })
                      }
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
                    >
                      Cancel
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
            color="text-green-400"
            icon="🏆"
            delay={200}
          />
          <StatCard
            title="Total Submissions"
            value={userStats.totalSubmissions}
            color="text-blue-400"
            icon="📊"
            delay={400}
          />
          <StatCard
            title="Acceptance Rate"
            value={`${userStats.acceptanceRate}%`}
            color="text-purple-400"
            icon="⚡"
            delay={600}
          />
          <StatCard
            title="Current Streak"
            value={userProfile.streak}
            color="text-orange-400"
            icon="🔥"
            delay={800}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Difficulty Breakdown */}
          <div
            className={`lg:col-span-2 bg-black rounded-3xl shadow-2xl p-8 border border-gray-700 transform transition-all duration-1000 ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "1000ms" }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                📈
              </div>
              <h3 className="text-2xl font-bold text-white">
                Problem Solving Progress
              </h3>
            </div>

            <div className="space-y-4">
              <DifficultyBar
                difficulty="Easy"
                count={userStats.byDifficulty.Easy || 0}
                total={userStats.totalSolved}
                color="text-green-400"
                delay={1200}
              />
              <DifficultyBar
                difficulty="Medium"
                count={userStats.byDifficulty.Medium || 0}
                total={userStats.totalSolved}
                color="text-yellow-400"
                delay={1400}
              />
              <DifficultyBar
                difficulty="Hard"
                count={userStats.byDifficulty.Hard || 0}
                total={userStats.totalSolved}
                color="text-red-400"
                delay={1600}
              />
            </div>
          </div>

          {/* Recent Activity & Achievements */}
          <div className="space-y-6">
            {/* Achievement Badge */}
            <div
              className={`bg-black rounded-3xl shadow-2xl p-6 border border-gray-700 transform transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "1800ms" }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🏅 Achievement
              </h3>
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-3 ${
                    userStats.acceptanceRate >= 80
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : userStats.acceptanceRate >= 60
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : "bg-gradient-to-r from-gray-600 to-gray-700"
                  } text-white px-6 py-4 rounded-2xl shadow-2xl`}
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
              className={`bg-black rounded-3xl shadow-2xl p-6 border border-gray-700 transform transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "2000ms" }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                📊 Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Problems Solved</span>
                  <span className="text-white font-bold">
                    {userProfile.problemSolved.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Age</span>
                  <span className="text-white font-bold">
                    {Math.floor(
                      (new Date() - new Date(userProfile.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Role</span>
                  <span
                    className={`font-bold px-2 py-1 rounded ${
                      userProfile.role === "admin"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {userProfile.role}
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
