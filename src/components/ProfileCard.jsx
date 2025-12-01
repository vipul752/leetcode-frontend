import { useCallback } from "react";

function ProfileCard({
  profile,
  stats,
  isEditing,
  editForm,
  setEditForm,
  handleUpdateProfile,
  setIsEditing,
}) {
  const handleFormChange = useCallback(
    (field, value) => {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setEditForm]
  );

  return (
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
            <h2 className="text-2xl font-bold text-white">
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
              onChange={(e) => handleFormChange(field, e.target.value)}
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
}

export default ProfileCard;
