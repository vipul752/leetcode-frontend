import { useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import { Send } from "lucide-react";

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const publishPost = async () => {
    if (!title.trim()) return alert("Title is required");

    try {
      await axiosClient.post("/social/create", {
        title,
        description,
        anonymous: false,
      });

      navigate("/social"); 
    } catch (err) {
      console.error(err);
      alert("Failed to publish");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white"
        >
          Cancel
        </button>

        <button
          onClick={publishPost}
          className="px-5 py-2 bg-amber-400  rounded-lg flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Post
        </button>
      </div>

      {/* Title Input */}
      <input
        className="w-full bg-transparent text-2xl font-semibold outline-none border-b border-gray-700 pb-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Rich Editor Region */}
      <textarea
        className="w-full h-[400px] bg-transparent outline-none text-gray-200 p-4 border border-gray-700 rounded-xl"
        placeholder="Write your post..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>
  );
}
