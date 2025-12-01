import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";
import RecentAndPosts from "./RecentAndPosts";
import ProfileCard from "./ProfileCard";

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
            <ProfileCard
              profile={userProfile}
              stats={userStats}
              isEditing={isEditing}
              editForm={editForm}
              setEditForm={setEditForm}
              handleUpdateProfile={handleUpdateProfile}
              setIsEditing={setIsEditing}
            />
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
