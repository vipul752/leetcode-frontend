import { Routes, Route, Navigate } from "react-router";
import SignUp from "./pages/SignUp";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminPanelDelete from "./pages/AdminPanelDelete";
import AdminPanelUpdate from "./pages/AdminPanelUpdate";
import AdminVideo from "./pages/AdminVideo";
import Profile from "./components/Profile";
import ContestPage from "./pages/ContestPage";
import ContestProblems from "./pages/ContestProblemPage";
import Contests from "./pages/Contest";
import MyContest from "./pages/MyContest";
import ChallengePage from "./pages/Challenge";
import AiInterviewVideo from "./pages/AiInterview";
import Landing from "./pages/Landing";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeResult from "./pages/ResumeResult";

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-gray-200">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/home" /> : <SignUp />}
        />
        {/* <Route
          path="/admin"
          element={
            isAuthenticated && user.role == "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        /> */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/create" element={<AdminPanel />} />
        <Route path="/problem/:problemId" element={<ProblemPage />} />
        <Route path="/admin/delete" element={<AdminPanelDelete />} />
        <Route path="/admin/update" element={<AdminPanelUpdate />} />
        <Route path="/admin/video" element={<AdminVideo />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contest" element={<Contests />} />
        <Route path="/contest/:contestId" element={<ContestPage />} />
        <Route
          path="/contest/:contestId/problems"
          element={<ContestProblems />}
        />
        <Route path="my-contests" element={<MyContest />} />
        <Route
          path="/challenge"
          element={
            isAuthenticated ? (
              user?._id && <ChallengePage userId={user._id} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/ai-interview"
          element={
            isAuthenticated ? <AiInterviewVideo /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/resume"
          element={
            isAuthenticated ? <ResumeUpload /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/resume-result"
          element={
            isAuthenticated ? <ResumeResult /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
