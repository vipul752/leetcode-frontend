import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";
import RecentAndPosts from "./RecentAndPosts";

function Profile() {
  const [userStats, setUserStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    age: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both in parallel
        const [statsResponse, profileResponse] = await Promise.all([
          axiosClient.get("/problem/userStats"),
          axiosClient.get("/user/dashboard"),
        ]);

        setUserStats(statsResponse.data);
        const profileData = profileResponse.data;
        setUserProfile(profileData);
        setEditForm({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          age: profileData.age || "",
        });
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

  // ---------------------------- CARD COMPONENT ----------------------------
  const Card = ({ title, value }) => (
    <div className="bg-[#111] p-6 rounded-xl shadow border border-gray-700 hover:border-amber-400 transition-all">
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h2 className="text-3xl font-bold text-amber-400 mt-2">{value}</h2>
    </div>
  );

  // ---------------------------- PROFILE CARD ----------------------------
  const ProfileCard = ({ profile, stats }) => (
    <div className="bg-[#111] p-6 rounded-2xl shadow-lg border border-gray-700 sticky top-6">
      <div className="flex flex-col items-center text-center mb-6">
        <img
          src={
            profile.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 mb-4"
        />

        {!isEditing && (
          <>
            <h2 className="text-2xl font-bold text-whit">
              {profile.firstName} {profile.lastName}
            </h2>

            {profile.bio && (
              <p className="text-gray-400 text-sm mt-3">{profile.bio}</p>
            )}

            <p className="text-gray-400 font-semibold mt-3">
              {profile.followersCount || 0} Followers
            </p>
          </>
        )}
      </div>

      <hr className="my-4 border-gray-700" />

      {/* Difficulty Stats */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase">
          Problems by Difficulty
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-500">Easy</span>
            <span className="text-amber-300 font-semibold">
              {stats.byDifficulty.Easy}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-400">Medium</span>
            <span className="text-amber-300 font-semibold">
              {stats.byDifficulty.Medium}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500">Hard</span>
            <span className="text-amber-300 font-semibold">
              {stats.byDifficulty.Hard}
            </span>
          </div>
        </div>
      </div>

      {!isEditing && (
        <>
          <hr className="my-4 border-gray-700" />

          <div className="space-y-2 text-sm text-gray-400">
            {profile.location && (
              <div className="flex justify-between">
                <span>Location</span>
                <span className="text-amber-300">{profile.location}</span>
              </div>
            )}
            {profile.age && (
              <div className="flex justify-between">
                <span>Age</span>
                <span className="text-amber-300">{profile.age}</span>
              </div>
            )}
          </div>
        </>
      )}

      <hr className="my-4 border-gray-700" />

      {/* Edit */}
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full bg-amber-500 text-black py-2 rounded-lg font-semibold hover:bg-amber-400 transition"
        >
          Edit Profile
        </button>
      ) : (
        <form onSubmit={handleUpdateProfile} className="space-y-3">
          {["firstName", "lastName", "bio", "location", "age"].map((field) => (
            <input
              key={field}
              type={field === "age" ? "number" : "text"}
              placeholder={field}
              value={editForm[field]}
              onChange={(e) =>
                setEditForm({ ...editForm, [field]: e.target.value })
              }
              className="w-full px-3 py-2 bg-black border border-gray-700 text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          ))}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-amber-500 text-black py-2 rounded-lg font-semibold hover:bg-amber-400"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (!userStats || !userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          className="mb-6 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition"
          onClick={() => navigate("/home")}
        >
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-1">
            <ProfileCard profile={userProfile} stats={userStats} />
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-3 space-y-6">
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Problems Solved" value={userStats.totalSolved} />
              <Card
                title="Total Submissions"
                value={userStats.totalSubmissions}
              />
              <Card
                title="Acceptance Rate"
                value={`${userStats.acceptanceRate.toFixed(2)}%`}
              />
            </div>

            {/* DIFFICULTY BREAKDOWN */}
            <div className="bg-[#111] p-6 rounded-xl shadow border border-gray-700">
              <h3 className="text-lg font-bold text-gray-400 mb-6">
                Difficulty Breakdown
              </h3>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="p-4 rounded-lg bg-black border border-gray-700">
                  <p className="text-green-500 font-semibold">Easy</p>
                  <p className="text-3xl font-bold text-amber-300 mt-2">
                    {userStats.byDifficulty.Easy}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-black border border-gray-700">
                  <p className="text-yellow-400 font-semibold">Medium</p>
                  <p className="text-3xl font-bold text-amber-300 mt-2">
                    {userStats.byDifficulty.Medium}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-black border border-gray-700">
                  <p className="text-red-500 font-semibold">Hard</p>
                  <p className="text-3xl font-bold text-amber-300 mt-2">
                    {userStats.byDifficulty.Hard}
                  </p>
                </div>
              </div>
            </div>

            {/* TABS (Recent + Posts) */}
            <RecentAndPosts
              recentProblems={userProfile.recentProblems}
              posts={userProfile.posts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
