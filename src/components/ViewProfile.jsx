// import React from "react";

// const ViewProfile = () => {
//   return <div>ViewProfile</div>;
// };

// export default ViewProfile;

import { useParams } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getPublicProfile } from "../utils/axiosClient";
import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";

export default function ViewProfile() {
  const { username } = useParams();
  const authUser = useSelector((state) => state.auth.user);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await getPublicProfile(username);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (!data) return <p className="text-white p-6">Profile not found</p>;

  const { user, isFollowing, iFollowBack, posts } = data;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* Header */}
      <div className="flex items-start gap-6">
        <img
          src={user.avatar}
          className="w-28 h-28 rounded-full border-4 border-slate-800 object-cover"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-cyan-400">@{user.username}</p>
          <p className="text-slate-400 mt-2">{user.bio}</p>

          {/* Follow Button */}
          {authUser._id !== user._id && (
            <div className="mt-4">
              <FollowButton
                userId={user._id}
                isFollowing={isFollowing}
                reload={loadProfile}
              />

              {/* follow back text */}
              {!isFollowing && iFollowBack && (
                <p className="text-amber-400 text-sm mt-1">Follows you</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-6 text-center">
        <div>
          <p className="font-bold text-xl">{posts.length}</p>
          <p className="text-slate-400 text-sm">Posts</p>
        </div>
        <div>
          <p className="font-bold text-xl">{user.followers.length}</p>
          <p className="text-slate-400 text-sm">Followers</p>
        </div>
        <div>
          <p className="font-bold text-xl">{user.following.length}</p>
          <p className="text-slate-400 text-sm">Following</p>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-10 space-y-6">
        {posts.length === 0 ? (
          <p className="text-slate-500">No posts yet</p>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
}
