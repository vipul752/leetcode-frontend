import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const uploadResume = async () => {
    if (!file) return alert("Please upload a resume");

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axiosClient.post("resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("resumeResult", JSON.stringify(res.data));
      navigate("/resume-result");
    } catch (err) {
      alert(
        "Upload failed: " + (err.response?.data?.message || "Unknown error")
      );
    }

    setLoading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/85 backdrop-blur-xl border-b border-gray-200/70 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                  <img
                    src="/codeArenaArrow.png"
                    alt="CodeArena Logo"
                    className="h-10 w-22 rounded-md"
                  />
                </div>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/home")}
                className="px-4 py-2 cursor-pointer text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Back
              </button>
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0] || "U"}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Resume Analyzer
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume to get an ATS score, skills analysis, and
            personalized recommendations
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? "bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-500"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33A3 3 0 0 1 19.5 19.5A4.5 4.5 0 0 1 6.75 19.5Z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {file ? "File Selected ✓" : "Drop your resume here"}
            </h3>
            {file && (
              <p className="text-green-600 font-medium mb-4">{file.name}</p>
            )}
            <p className="text-gray-600 mb-6">
              or click to browse your files (PDF, DOCX)
            </p>

            <input
              type="file"
              id="resume-input"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="resume-input"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Choose File
            </label>
          </div>

          {/* File Info */}
          {file && (
            <div className="border-t border-gray-200 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Selected File</p>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors font-medium"
                >
                  Change File
                </button>
              </div>

              {/* Upload Button */}
              <button
                onClick={uploadResume}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Resume...
                  </>
                ) : (
                  <>
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
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5h-2.25A2.25 2.25 0 0 0 13.5 6.75v11.25A2.25 2.25 0 0 0 15.75 20.25z"
                      />
                    </svg>
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          )}

          {/* Help Text */}
          {!file && (
            <div className="border-t border-gray-200 bg-blue-50 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-blue-600 mt-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      ATS Score
                    </p>
                    <p className="text-xs text-gray-600">
                      Get a score out of 100
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-blue-600 mt-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25.75 2.25M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Skills Match
                    </p>
                    <p className="text-xs text-gray-600">
                      Matched & missing skills
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-blue-600 mt-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Recommendations
                    </p>
                    <p className="text-xs text-gray-600">
                      Personalized suggestions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
