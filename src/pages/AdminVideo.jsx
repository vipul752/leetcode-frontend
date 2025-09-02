import { useEffect, useState } from "react";
import axios from "axios";
import axiosClient from "../utils/axiosClient";

const AdminVideo = () => {
  const [problem, setProblem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [videoUploadModal, setVideoUploadModal] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/problem/getAllProblem");
      setProblem(data);
    } catch (error) {
      setError(error.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (problemId, file) => {
    try {
      setUploadingVideo(true);
      setUploadProgress(0);
      setUploadStage("Preparing upload...");

      setUploadStage("Getting upload credentials...");
      setUploadProgress(10);

      const signatureResponse = await axiosClient.get(
        `/video/create/${problemId}`
      );

      const { signature, timestamp, public_id, api_key, upload_url } =
        signatureResponse.data;

      setUploadStage("Uploading video to cloud...");
      setUploadProgress(20);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("public_id", public_id);

      formData.append("resource_type", "video");
      formData.append("chunk_size", "6000000");
      formData.append("quality", "auto:good");

      const cloudinaryRes = await axios.post(upload_url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress =
            Math.round((progressEvent.loaded * 70) / progressEvent.total) + 20;
          setUploadProgress(progress);

          if (progress < 50) {
            setUploadStage("Uploading video... Please wait");
          } else if (progress < 80) {
            setUploadStage("Processing video...");
          } else if (progress < 100) {
            setUploadStage("Almost done...");
          } else {
            setUploadStage("Upload complete!");
          }
        },
      });

      const cloudinaryResult = cloudinaryRes.data;

      setUploadStage("Saving video metadata...");
      setUploadProgress(95);

      await axiosClient.post("/video/save", {
        problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadStage("Upload complete!");
      setUploadProgress(100);

      setTimeout(async () => {
        await fetchProblems();
        setVideoUploadModal(null);
        setError(null);
        setUploadProgress(0);
        setUploadStage("");
        alert("✅ Video uploaded successfully!");
      }, 1000);
    } catch (error) {
      setError("Failed to upload video");
      setUploadStage("Upload failed");
      setUploadProgress(0);
      console.error(error);
    } finally {
      setTimeout(() => {
        setUploadingVideo(false);
      }, 1500);
    }
  };

  const handleVideoDrop = (e, problemId) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUploadVideo(problemId, files[0]);
    }
  };

  const handleVideoFileSelect = async (e, problemId) => {
    const file = e.target.files[0];
    if (file) {
      await handleUploadVideo(problemId, file);
    }
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      await axiosClient.post("/problem/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProblems();
      setUploadModalOpen(false);
    } catch (error) {
      setError("Failed to upload file");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Hard":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusColor = (status) => {
    return status === "published"
      ? "text-green-400 bg-green-500/10 border-green-500/20"
      : "text-orange-400 bg-orange-500/10 border-orange-500/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-800/50">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-t-purple-500 border-r-pink-500"></div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Loading Problems
                </h3>
                <p className="text-gray-400">
                  Fetching data from the server...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Upload Button */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                Admin Panel For Video
              </span>
            </h1>
            <p className="text-gray-400 text-xl">
              Upload and manage your coding problems
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-red-300 font-semibold text-lg">
                  Error Occurred
                </h4>
                <p className="text-red-400/80">
                  {typeof error === "string"
                    ? error
                    : "An error occurred while fetching problems"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-gray-700/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-purple-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Total Problems
                </h2>
                <p className="text-gray-400">Active coding challenges</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {problem.length}
              </div>
              <p className="text-gray-400 text-sm mt-1">Problems available</p>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800/50 overflow-hidden">
          <div className="p-8 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-red-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Manage Video Solutions
                </h2>
                <p className="text-gray-400">
                  Upload video solution problems solution
                </p>
              </div>
            </div>
          </div>

          {problem.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-12 h-12 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-3">
                No Problems Found
              </h3>
              <p className="text-gray-500 text-lg mb-6">
                There are currently no problems in the database.
              </p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold"
              >
                Upload Your First Problem
              </button>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid gap-6">
                {problem.map((p) => (
                  <div
                    key={p._id}
                    className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-6 hover:bg-gray-800/50 hover:border-gray-600/40 transition-all duration-500 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                            {p.title}
                          </h3>
                        </div>

                        <div className="flex items-center flex-wrap gap-3">
                          <span
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border backdrop-blur-sm ${getDifficultyColor(
                              p.difficulty
                            )}`}
                          >
                            {p.difficulty}
                          </span>
                          {p.status && (
                            <span
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border backdrop-blur-sm ${getStatusColor(
                                p.status
                              )}`}
                            >
                              {p.status}
                            </span>
                          )}
                          {p.tags && (
                            <span className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded-xl text-sm border border-blue-500/20 font-semibold backdrop-blur-sm">
                              {p.tags}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setVideoUploadModal(p._id)}
                          className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-blue-300 px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group/btn font-semibold"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                          </svg>
                          <span>Upload Video</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video Upload Modal with Progress */}
        {videoUploadModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Upload Video Solution
                  </h3>
                  {!uploadingVideo && (
                    <button
                      onClick={() => setVideoUploadModal(null)}
                      className="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl flex items-center justify-center transition-colors duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {uploadingVideo ? (
                  <div className="text-center py-12">
                    <div className="relative mx-auto w-20 h-20 mb-6">
                      <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700"></div>
                      <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-t-blue-500 border-r-purple-500"></div>
                    </div>

                    <h4 className="text-xl font-semibold text-white mb-2">
                      {uploadStage || "Uploading Video..."}
                    </h4>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm">
                      Please don't close this window during upload
                    </p>
                  </div>
                ) : (
                  <div
                    onDrop={(e) => handleVideoDrop(e, videoUploadModal)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      isDragOver
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-6">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isDragOver ? "bg-blue-500/20" : "bg-gray-700/50"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className={`w-10 h-10 transition-colors duration-300 ${
                            isDragOver ? "text-blue-400" : "text-gray-400"
                          }`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                          />
                        </svg>
                      </div>

                      <div className="text-center">
                        <h4 className="text-xl font-bold text-white mb-2">
                          {isDragOver
                            ? "Drop your video here"
                            : "Upload Video Solution"}
                        </h4>
                        <p className="text-gray-400 mb-6">
                          Drag and drop your video file here, or click to browse
                        </p>

                        <label className="cursor-pointer">
                          <input
                            type="file"
                            onChange={(e) =>
                              handleVideoFileSelect(e, videoUploadModal)
                            }
                            className="hidden"
                            accept=".mp4,.avi,.mov,.mkv,.webm"
                          />
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold inline-flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                              />
                            </svg>
                            <span>Choose Video</span>
                          </span>
                        </label>
                      </div>

                      <div className="text-xs text-gray-500">
                        Supported formats: MP4, AVI, MOV, MKV, WebM
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>

              <div className="relative">
                {uploading ? (
                  <div className="text-center py-12">
                    <div className="relative mx-auto w-16 h-16 mb-6">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"></div>
                      <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-t-purple-500 border-r-pink-500"></div>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">
                      Uploading...
                    </h4>
                    <p className="text-gray-400">
                      Please wait while we process your file
                    </p>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      isDragOver
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-6">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isDragOver ? "bg-purple-500/20" : "bg-gray-700/50"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className={`w-10 h-10 transition-colors duration-300 ${
                            isDragOver ? "text-purple-400" : "text-gray-400"
                          }`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18.75 19.5H6.75Z"
                          />
                        </svg>
                      </div>

                      <div className="text-center">
                        <h4 className="text-xl font-bold text-white mb-2">
                          {isDragOver
                            ? "Drop your file here"
                            : "Upload Problem File"}
                        </h4>
                        <p className="text-gray-400 mb-6">
                          Drag and drop your file here, or click to browse
                        </p>

                        <label className="cursor-pointer">
                          <input
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".json,.txt,.md"
                          />
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold inline-flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                              />
                            </svg>
                            <span>Choose File</span>
                          </span>
                        </label>
                      </div>

                      <div className="text-xs text-gray-500">
                        Supported formats: JSON, TXT, Markdown
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideo;
