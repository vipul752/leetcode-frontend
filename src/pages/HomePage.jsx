import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: "all",
    status: "all",
    tags: "all",
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblem");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/userProblem");
        setSolvedProblems(data);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    fetchProblems();

    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesDifficulty =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;
    const matchesStatus =
      filters.status === "all" ||
      solvedProblems.some((sp) => sp._id === problem._id);
    const matchesTags = filters.tags === "all" || problem.tags === filters.tags;

    return matchesDifficulty && matchesStatus && matchesTags;
  });

  return (
    <div className="min-h-screen bg-black">
      <nav className="navbar shadow-lg px-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost  text-2xl">
            Leetcode
          </NavLink>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost">
              {user?.firstName || "Guest"}
            </div>
            <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
            }}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>
          <select
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) => {
              setFilters({ ...filters, difficulty: e.target.value });
            }}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.tags}
            onChange={(e) => {
              setFilters({ ...filters, tags: e.target.value });
            }}
          >
            <option value="all">All Tags</option>
            <option value="Array">Array</option>
            <option value="String">String</option>
            <option value="LinkedList">LinkedList</option>
            <option value="Stack">Stack</option>
            <option value="Queue">Queue</option>
            <option value="Heap">Heap</option>
            <option value="Graph">Graph</option>
            <option value="DP">DP</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <div
              key={problem._id}
              className="card bg-[#111] border border-gray-800 shadow-md hover:shadow-indigo-500/20 transition rounded-xl"
            >
              <div className="card-body">
                {/* Title + Status */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-indigo-300">
                    {problem.title}
                  </h2>
                  {solvedProblems.some((sp) => sp._id === problem._id) && (
                    <div className="badge badge-success gap-2 animate-pulse">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-4 h-4 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      Solved
                    </div>
                  )}
                </div>

                {/* Difficulty + Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <div
                    className={`badge px-3 py-2 text-sm font-semibold rounded-md ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </div>

                  {Array.isArray(problem.tags) ? (
                    problem.tags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="badge badge-outline border-gray-600 text-gray-300 hover:border-indigo-400 hover:text-indigo-300 transition"
                      >
                        {tag}
                      </div>
                    ))
                  ) : (
                    <div className="badge badge-outline border-gray-600 text-gray-300 hover:border-indigo-400 hover:text-indigo-300 transition">
                      {problem.tags}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-green-500";
    case "medium":
      return "text-yellow-500";
    case "hard":
      return "text-red-500";
    default:
      return "bg-gray-600 text-white";
  }
};

export default HomePage;
